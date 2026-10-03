"""
ingest.py
---------
FastAPI micro-service that receives real Bridge answers forwarded by the
Collector agent and stores them in data/real.jsonl.

Run with:
    uvicorn parallel.ingest:app --port 8000

Two endpoints:
    POST /ingest   – Collector agent POSTs each incoming bridge here
    GET  /summary  – Streamlit app reads the latest summary text
    GET  /real     – returns the raw JSONL lines as JSON (for debugging)

After completing Test S2 (understanding bridgeData shape), add parse_bridge()
below and wire it into close_the_loop() from fidelity.py.
"""

import json
import time
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse, PlainTextResponse

app = FastAPI(title="Parallel Ingest", version="0.1.0")

_REAL_FILE = Path("data/real.jsonl")
_SUMMARY_FILE = Path("data/summary.txt")


def _ensure_data_dir() -> None:
    Path("data").mkdir(parents=True, exist_ok=True)


# ---------------------------------------------------------------------------
# Real-answer ingestion
# ---------------------------------------------------------------------------

@app.post("/ingest")
def ingest(item: dict) -> dict:
    """
    Receive a bridge payload forwarded by the Collector agent.

    Expected body (from collector_agent.py):
        {"forum": <forumID>, "flow": <flowName>, "bridge": <bridgeData>}
    """
    _ensure_data_dir()
    record = {"t": time.time(), **item}
    with _REAL_FILE.open("a") as f:
        f.write(json.dumps(record) + "\n")
    print(f"[ingest] stored record from forum={item.get('forum')} flow={item.get('flow')}")
    return {"ok": True}


# ---------------------------------------------------------------------------
# Summary read/write (used by Collector agent and Streamlit UI)
# ---------------------------------------------------------------------------

@app.get("/summary", response_class=PlainTextResponse)
def summary() -> str:
    """Return the latest prediction summary written by the Streamlit app."""
    if _SUMMARY_FILE.exists():
        return _SUMMARY_FILE.read_text(encoding="utf-8")
    return "No prediction run yet. Submit a decision in the Parallel console first."


@app.post("/summary")
def write_summary(item: dict) -> dict:
    """Allow the Streamlit app to push a summary string for the Collector to read."""
    text = item.get("text", "")
    if not text:
        raise HTTPException(status_code=400, detail="'text' field is required")
    _ensure_data_dir()
    _SUMMARY_FILE.write_text(text, encoding="utf-8")
    return {"ok": True}


# ---------------------------------------------------------------------------
# Debug endpoint
# ---------------------------------------------------------------------------

@app.get("/real")
def get_real(limit: int = 50) -> JSONResponse:
    """Return the last `limit` real-answer records (for debugging)."""
    if not _REAL_FILE.exists():
        return JSONResponse([])
    lines = _REAL_FILE.read_text(encoding="utf-8").strip().splitlines()
    return JSONResponse([json.loads(l) for l in lines[-limit:]])


# ---------------------------------------------------------------------------
# Bridge parser  (fill in after Test S2)
# ---------------------------------------------------------------------------

def parse_bridge(record: dict) -> dict | None:
    """
    Convert one stored /ingest record into a structured row for calibration.

    Field index map (learned from Test S2 bridgeData):
        _3  → Role             (Freelancer | SmallBusiness)
        _5  → CityTier         (Metro | Tier2 | Tier3)
        _7  → PriceSensitivity (Low | Medium | High)
        _9  → CurrentPlan      (Free | Pro)
        _11 → Decision         (Accept | Downgrade | Reject | Undecided)
        _13 → LikelihoodPct    (integer string)
        _15 → Comment          (free text)

    All field values are base64-encoded in the raw payload.
    Only processes Respond flow bridges; returns None for everything else.
    """
    import base64 as _b64

    bridge = record.get("bridge", {})
    flow   = bridge.get("FlowID", "")

    if "Respond" not in flow:
        return None  # RunRequest, PredictionReport, etc. — not real answers

    # The inner field dict sits under the same key as FlowID
    fields_raw = bridge.get(flow, {})
    if not fields_raw:
        return None

    # Decode all base64 values
    fields: dict[str, str] = {}
    for k, v in fields_raw.items():
        try:
            fields[k] = _b64.b64decode(v).decode("utf-8")
        except Exception:
            fields[k] = str(v)

    def get_by_index(idx: int) -> str:
        """Return the field value whose key ends with _{idx}."""
        for k, v in fields.items():
            if k.endswith(f"_{idx}"):
                return v
        return ""

    role             = get_by_index(3)   # Freelancer | SmallBusiness
    city_tier        = get_by_index(5)   # Metro | Tier2 | Tier3
    price_sensitivity = get_by_index(7)  # Low | Medium | High
    current_plan     = get_by_index(9)   # Free | Pro
    decision         = get_by_index(11)  # Accept | Downgrade | Reject | Undecided
    likelihood_str   = get_by_index(13)  # integer string
    comment          = get_by_index(15)  # free text

    if not decision:
        return None  # incomplete bridge

    segment = "small_business" if role == "SmallBusiness" else "freelancer"
    adverse = decision in {"Downgrade", "Reject"}

    try:
        likelihood_pct = int(likelihood_str)
    except ValueError:
        likelihood_pct = 0

    return {
        "segment":          segment,
        "city_tier":        city_tier.lower(),
        "price_sensitivity": price_sensitivity.lower(),
        "current_plan":     current_plan.lower(),
        "decision":         decision,
        "likelihood_pct":   likelihood_pct,
        "comment":          comment,
        "adverse":          adverse,
        "user_uuid":        bridge.get("UserUUID", ""),
    }


@app.get("/brief", response_class=PlainTextResponse)
def brief():
    p = Path("data/brief.txt")
    return p.read_text(encoding="utf-8") if p.exists() else "No study yet."
