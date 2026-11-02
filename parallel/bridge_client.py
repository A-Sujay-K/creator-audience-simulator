"""
bridge_client.py
----------------
Cosmitude Bridge programmatic integration client for Parallel.

Handles:
  1. Device authentication with session caching
  2. Automatic Forum Set creation on user signup (forumSetCreation)
  3. Isolated per-user bridge dispatch (SentTo = Set_<username>)
"""

import os
import time
import json
import base64
import uuid
import logging
from typing import Optional, Dict, Any, Tuple
import requests

logger = logging.getLogger("parallel.bridge_client")

# ─── Configuration ────────────────────────────────────────────────────────────

BRIDGE_BASE_URL = os.getenv("BRIDGE_URL", "https://ca.cosmitude.com").rstrip("/")
BRIDGE_SERVER_ID = os.getenv(
    "BRIDGE_SERVER_ID",
    "c9b6722d-5dbf-4b4f-a28e-692b4d26c1cf-7870eb8e-2f45-458a-9a70-d6b2d71ee871"
)
BRIDGE_FORUM_ID = os.getenv(
    "BRIDGE_FORUM_ID",
    "6cb2364b-d36a-4598-aa44-37218fd4688b"
)
BRIDGE_DEVICE_USER = os.getenv(
    "BRIDGE_DEVICE_USER",
    "@uuidbfe6cd30b6394766b18026c407a7be6e"
)
BRIDGE_DEVICE_PW = os.getenv(
    "BRIDGE_DEVICE_PW",
    "CosmitudeBridgeDevice"
)
BRIDGE_ADMIN_USER_ID = os.getenv(
    "BRIDGE_ADMIN_USER_ID",
    "2743437326124061599535601"
)
BRIDGE_MAC = os.getenv("BRIDGE_MAC", "Bridge-Web")

# Cached active session: {"session_id": str, "owner_mobile": str, "timestamp": float}
_SESSION_CACHE: Dict[str, Any] = {
    "session_id": None,
    "owner_mobile": None,
    "timestamp": 0.0
}
_SESSION_TTL = 3600  # 1 hour TTL before refreshing session


# ─── Session Management ───────────────────────────────────────────────────────

def login_device(force_refresh: bool = False) -> Tuple[Optional[str], Optional[str]]:
    """
    Authenticate bot/device credentials against Cosmitude Bridge.
    Returns (session_id, owner_mobile_number).
    """
    global _SESSION_CACHE
    now = time.time()
    if not force_refresh and _SESSION_CACHE["session_id"] and (now - _SESSION_CACHE["timestamp"] < _SESSION_TTL):
        return _SESSION_CACHE["session_id"], _SESSION_CACHE["owner_mobile"]

    try:
        pw = BRIDGE_DEVICE_PW
        # Decode if base64 encoded
        try:
            if pw.endswith("==") or pw.startswith("Q29zb"):
                pw = base64.b64decode(pw).decode("utf-8")
        except Exception:
            pass

        login_payload = {
            "MACAddress": BRIDGE_MAC,
            "UserName": BRIDGE_DEVICE_USER,
            "Password": pw,
            "ServerID": BRIDGE_SERVER_ID
        }
        res = requests.post(
            f"{BRIDGE_BASE_URL}/loginForDevice",
            json=login_payload,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        if res.status_code == 200:
            data = res.json()
            err_msg = data.get("ErrorMessage")
            if isinstance(err_msg, dict) and "SessionID" in err_msg:
                session_id = err_msg["SessionID"]
                country_code = err_msg.get("CountryCode", "")
                mobile = err_msg.get("MobileNumber", "")
                owner_mobile = country_code + mobile
                _SESSION_CACHE = {
                    "session_id": session_id,
                    "owner_mobile": owner_mobile,
                    "timestamp": now
                }
                logger.info("[Bridge] Device login successful. Session established.")
                return session_id, owner_mobile
            else:
                logger.warning(f"[Bridge] Login response missing SessionID: {data}")
        else:
            logger.warning(f"[Bridge] Login HTTP status {res.status_code}: {res.text[:200]}")
    except Exception as e:
        logger.error(f"[Bridge] Login exception: {e}")

    return None, None


# ─── Programmatic Set Creation ────────────────────────────────────────────────

def create_bridge_user_set(username: str, forum_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Programmatically creates a dedicated user Set on Cosmitude Bridge (e.g. Set_<username>).
    
    API Endpoint: POST https://ca.cosmitude.com/forumSetCreation
    
    Response codes handled:
      - 1026: Set successfully created
      - 1025: Set already exists (idempotent success)
      - others: error reported gracefully without crashing caller
    """
    clean_user = "".join(c for c in username.lower().strip() if c.isalnum() or c in "-_")
    set_name = f"Set_{clean_user}"
    target_forum = forum_id or BRIDGE_FORUM_ID

    session_id, owner_mobile = login_device()
    if not session_id:
        # Retry with fresh login
        session_id, owner_mobile = login_device(force_refresh=True)

    if not session_id:
        return {
            "success": False,
            "set_name": set_name,
            "error": "Could not authenticate device session with Cosmitude Bridge."
        }

    payload = {
        "ServerID": BRIDGE_SERVER_ID,
        "SessionID": session_id,
        "MACAddress": BRIDGE_MAC,
        "ForumID": target_forum,
        "SetName": set_name,
        "SetUsers": [BRIDGE_ADMIN_USER_ID],
        "OwnerMobileNumber": owner_mobile or "0"
    }

    try:
        res = requests.post(
            f"{BRIDGE_BASE_URL}/forumSetCreation",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        if res.status_code == 200:
            data = res.json()
            err_code = data.get("ErrorCode")
            err_msg = data.get("ErrorMessage")

            # ErrorCode 1026 = Created successfully
            if err_code == 1026:
                logger.info(f"[Bridge] Set '{set_name}' created successfully on Forum {target_forum}.")
                return {
                    "success": True,
                    "created": True,
                    "set_name": set_name,
                    "forum_id": target_forum,
                    "message": f"Set '{set_name}' created on Cosmitude Bridge."
                }
            # ErrorCode 1025 = Already exists (idempotent success)
            elif err_code == 1025:
                logger.info(f"[Bridge] Set '{set_name}' already exists on Forum {target_forum}.")
                return {
                    "success": True,
                    "created": False,
                    "already_existed": True,
                    "set_name": set_name,
                    "forum_id": target_forum,
                    "message": f"Set '{set_name}' is active on Cosmitude Bridge."
                }
            # Session expired? Try once more
            elif err_code == 2000 and "Session" in str(err_msg):
                session_id, owner_mobile = login_device(force_refresh=True)
                if session_id:
                    payload["SessionID"] = session_id
                    res2 = requests.post(f"{BRIDGE_BASE_URL}/forumSetCreation", json=payload, timeout=10)
                    if res2.status_code == 200 and res2.json().get("ErrorCode") in [1026, 1025]:
                        return {
                            "success": True,
                            "set_name": set_name,
                            "forum_id": target_forum,
                            "message": f"Set '{set_name}' created after session refresh."
                        }

            logger.warning(f"[Bridge] forumSetCreation returned code {err_code}: {err_msg}")
            return {
                "success": False,
                "set_name": set_name,
                "error_code": err_code,
                "error": str(err_msg)
            }
        else:
            logger.warning(f"[Bridge] forumSetCreation HTTP {res.status_code}: {res.text[:200]}")
            return {
                "success": False,
                "set_name": set_name,
                "error": f"HTTP {res.status_code}"
            }
    except Exception as e:
        logger.error(f"[Bridge] Error creating user set on Bridge: {e}")
        return {
            "success": False,
            "set_name": set_name,
            "error": str(e)
        }


# ─── Isolated Bridge Dispatch ─────────────────────────────────────────────────

def send_bridge_to_user_set(
    username: str,
    flow_name: str,
    reply_data_base64: Dict[str, str],
    fid: str,
    template_id: str = "1cb23b30-2ecf-5bab-fb40-bde82a3335b9",
    forum_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Send a bridge message strictly targeted to the user's isolated Set (SentTo = Set_<username>).
    """
    clean_user = "".join(c for c in username.lower().strip() if c.isalnum() or c in "-_")
    set_name = f"Set_{clean_user}"
    target_forum = forum_id or BRIDGE_FORUM_ID

    session_id, _ = login_device()
    if not session_id:
        session_id, _ = login_device(force_refresh=True)

    if not session_id:
        return {"success": False, "error": "No Bridge session"}

    payload = {
        "ForumID": target_forum,
        "SessionID": session_id,
        "MACAddress": BRIDGE_MAC,
        "Time": str(int(time.time() * 1000)),
        "ScheduledDateTime": "now",
        "ScheduledBoolean": 0,
        "FlowID": flow_name,
        "EnableChat": 1,
        "FlowType": "Custom",
        "BridgeForward": 0,
        "TemplateID": template_id,
        "TextCount": 1,
        "ImageCount": 0,
        "InvoiceID": "",
        "DocumentCount": 0,
        "User": False,
        "VideoCount": 0,
        "ReplyBridgeID": "",
        "HiddenFlow": False,
        "TempBridgeId": str(uuid.uuid4()),
        flow_name: reply_data_base64,
        "FID": fid,
        "ServerID": BRIDGE_SERVER_ID,
        # Strictly addressed to the user's isolated set:
        "SentTo": set_name
    }

    try:
        r = requests.post(
            f"{BRIDGE_BASE_URL}/bridgeSendingToForum",
            files={},
            data={"Data": json.dumps(payload)},
            timeout=15
        )
        return {"success": r.status_code == 200, "status_code": r.status_code, "text": r.text[:200]}
    except Exception as e:
        logger.error(f"[Bridge] send_bridge_to_user_set failed: {e}")
        return {"success": False, "error": str(e)}
