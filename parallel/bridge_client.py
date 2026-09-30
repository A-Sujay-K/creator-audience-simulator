"""
bridge_client.py
----------------
Optional: mirror a sample of persona answers into the Bridge _Sim forums.

Key facts learned from the downloaded collector agent:
  - Server:         https://ca.cosmitude.com/
  - MAC:            Bridge-Web  (literal string, not a hardware MAC)
  - Send endpoint:  bridgeSendingToForum  (NOT saveForumBridges2)
  - Field values:   base64-encoded strings
  - FIDs:           read from the saved template JSON (AdminFlow[flow]["FID"])
  - User bridges:   User=True,  SentTo='1'
  - Admin bridges:  User=False, SentTo='0'

After Test S1, confirm whether the ParallelPersona user bot can post to
the Respond (User) flow. If blocked, skip this file entirely — Bridge
receives only summary bridges via the Collector agent.

Quota rule: post at most 20-30 sampled persona answers per variant.
"""

import base64
import json
import os
import time
import uuid

import requests
from dotenv import load_dotenv

load_dotenv()

# ── Credentials (auto-filled from .env using values in downloaded agent) ───
_URL          = os.getenv("BRIDGE_URL", "https://ca.cosmitude.com/")
_SERVER_ID    = os.getenv("BRIDGE_SERVER_ID", "")
_MAC          = os.getenv("BRIDGE_MAC", "Bridge-Web")
_FORUM_ID     = os.getenv("BRIDGE_FORUM_ID", "")
_PERSONA_USER = os.getenv("BRIDGE_PERSONA_USER", "")
_PERSONA_PW   = os.getenv("BRIDGE_PERSONA_PW", "")


class BridgeClient:
    """
    Minimal Bridge API client for posting persona answers to a _Sim forum.

    Usage:
        client = BridgeClient()
        client.login()
        client.post_answer(
            forum_id="...",
            template_id="...",
            template="ParallelDecision",
            flow="Respond",
            flow_fid="...",
            fields={...},   # match captured request shape
        )
    """

    def __init__(
        self,
        url: str = _URL,
        server_id: str = _SERVER_ID,
        mac: str = _MAC,
        username: str = _PERSONA_USER,
        password: str = _PERSONA_PW,
    ):
        self.url = url.rstrip("/") + "/"
        self.server_id = server_id
        self.mac = mac
        self.username = username
        self.password = password
        self.session: str = ""

    def login(self) -> None:
        """Authenticate using the agent-style device login endpoint."""
        r = requests.post(
            self.url + "loginForDevice",
            json={
                "MACAddress": self.mac,
                "UserName": self.username,
                "Password": self.password,
                "ServerID": self.server_id,
            },
            timeout=60,
        )
        r.raise_for_status()
        body = r.json()
        self.session = body["ErrorMessage"]["SessionID"]
        print(f"[BridgeClient] logged in, session={self.session[:8]}…")

    def _post_form(self, endpoint: str, payload: dict) -> dict:
        """POST multipart/form-data with a single 'Data' JSON field."""
        r = requests.post(
            self.url + endpoint,
            files={"Data": (None, json.dumps(payload))},
            timeout=60,
        )
        r.raise_for_status()
        return r.json()

    def post_answer(
        self,
        forum_id: str,
        template_id: str,
        template: str,
        flow: str,
        flow_fid: str,
        fields: dict,
    ) -> dict:
        """
        Post one persona answer to Bridge.

        Args:
            forum_id:    The _Sim forum's ID.
            template_id: The ParallelDecision template ID.
            template:    Template name string (e.g. "ParallelDecision").
            flow:        Flow name (e.g. "Respond").
            flow_fid:    Flow FID from the downloaded agent code.
            fields:      The field-values dict — match shape from captured request.

        Returns:
            Raw JSON response from Bridge.

        TODO: verify the exact shape of `fields` using Test S1's captured payload.
        """
        if not self.session:
            raise RuntimeError("Call login() before post_answer()")

        now = str(int(time.time() * 1000))
        flow_key = f"{template}_{flow}"

        payload = {
            "ForumID": forum_id,
            "SessionID": self.session,
            "UserName": self.username,
            "MACAddress": self.mac,
            "Time": now,
            "ScheduledDateTime": "now",
            "ScheduledBoolean": 0,
            "FlowID": flow_key,
            "EnableChat": 1,
            "FlowType": "Custom",
            "BridgeForward": 0,
            "TemplateID": template_id,
            "TextCount": 0,
            "ImageCount": 0,
            "InvoiceID": "",
            "DocumentCount": 0,
            "VideoCount": 0,
            "User": True,
            "ReplyBridgeID": "",
            "HiddenFlow": False,
            "BilledForum": forum_id,
            "TempBridgeId": str(uuid.uuid4()),
            "FlowName": flow,
            "datetime": now,
            "FID": flow_fid,
            "ServerID": self.server_id,
            "SentTo": "1",              # "1" = user bridge (sent to admins)
            flow_key: json.dumps(fields),  # TODO: match exact shape from captured request
        }

        return self._post_form("saveForumBridges2", payload)


def mirror_sample(
    pairs: list,
    forum_id: str,
    template_id: str,
    flow_fid: str,
    sample_n: int = 25,
    template: str = "ParallelDecision",
    flow: str = "Respond",
) -> None:
    """
    Post a random sample of persona answers to a _Sim forum.

    Args:
        pairs:       (Persona, Answer) list from run_round().
        forum_id:    The _Sim forum ID.
        template_id: ParallelDecision template ID.
        flow_fid:    FID for the Respond flow.
        sample_n:    Max personas to mirror (stay within quota).

    Skips silently if BRIDGE_URL is not configured.
    """
    if not _URL:
        print("[bridge_client] BRIDGE_URL not set — skipping mirror")
        return

    import random

    sample = random.sample(pairs, min(sample_n, len(pairs)))
    client = BridgeClient()
    client.login()

    for p, a in sample:
        # Prefix Comment with persona ID for traceability
        comment = f"[{p.pid}] {a.reason_detail}".strip()

        # TODO: replace this fields dict with the exact shape from Test S1
        fields = {
            "Role": "SmallBusiness" if p.segment == "small_business" else "Freelancer",
            "CityTier": p.city_tier.capitalize(),
            "PriceSensitivity": p.price_sensitivity.capitalize(),
            "CurrentPlan": p.current_plan.capitalize(),
            "Decision": a.decision,
            "LikelihoodPct": str(a.likelihood_pct),
            "Comment": comment,
            # Conditional follow-up (only present for Downgrade/Reject)
            **({"MainReason": a.main_reason, "ReasonDetail": a.reason_detail}
               if a.main_reason else {}),
        }

        try:
            resp = client.post_answer(
                forum_id=forum_id,
                template_id=template_id,
                template=template,
                flow=flow,
                flow_fid=flow_fid,
                fields=fields,
            )
            print(f"[mirror] {p.pid} → {a.decision}: {resp}")
        except Exception as e:
            print(f"[mirror] {p.pid} failed: {e}")

        time.sleep(0.5)  # gentle rate-limiting
