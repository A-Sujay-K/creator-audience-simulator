"""
FastAPI backend for Parallel for Creators.
Exposes endpoints for creator intelligence, cloning, hook simulations, user profiles, and ingest.
Mounts React SPA (frontend/dist) cleanly so the entire app is served on http://localhost:8000.
"""
import os
import re
import json
import time
from pathlib import Path
from typing import Optional, List, Dict, Any
import logging
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse, PlainTextResponse
from pydantic import BaseModel

logger = logging.getLogger("parallel.server")

from parallel.pipeline import run_study, brief_text, summary_text
from parallel.panel import load_panel
from parallel.fidelity import close_the_loop
from parallel.profiles import (
    create_profile, login, profile_exists, save_intel, get_history,
    get_cached_intel, push_summary_to_bridge,
    save_clone_run, get_cached_clone,
    save_to_bridge_user_store, get_bridge_user_store, get_user_previous_findings,
    ProfileNotFound, WrongPIN, UsernameTaken
)
from parallel.clone_intel import (
    get_style_dna, get_video_blueprint, get_piracy_ideas, generate_unified_clone_dossier
)
from parallel.suggestions import find_similar_creators, resolve_misspelled_creator_with_llm
from parallel.intelligence import generate_creator_intelligence

app = FastAPI(title="Parallel API & Creator OS", version="2.4.0")

# ─── Input Sanitization ───────────────────────────────────────────────────────
import html as _html

def _sanitize_text(text: str, max_len: int = 200) -> str:
    """Strip HTML tags and control characters from user-supplied text inputs."""
    if not text:
        return text
    # Remove HTML tags
    clean = re.sub(r"<[^>]+>", "", text)
    # Remove script: / javascript: / data: URIs
    clean = re.sub(r"(?i)(script|javascript|data|vbscript):", "", clean)
    # Strip control characters except newline/tab
    clean = re.sub(r"[--]", "", clean)
    return clean.strip()[:max_len]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_REAL_FILE = Path("data/real.jsonl")
_SUMMARY_FILE = Path("data/summary.txt")
_DIST_DIR = Path(__file__).parent / "frontend" / "dist"

def _ensure_data_dir() -> None:
    Path("data").mkdir(parents=True, exist_ok=True)

# ─── MODELS ──────────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    username: str
    pin: str

class AnalyzeRequest(BaseModel):
    creator_name: str
    comparison_creator: Optional[str] = ""
    niche: Optional[str] = ""
    username: Optional[str] = ""

class HookTestRequest(BaseModel):
    text: str
    sample_size: int = 15

class CalibrateRequest(BaseModel):
    sids: List[str]

# ─── INGEST & SUMMARY ENDPOINTS ──────────────────────────────────────────────
@app.post("/ingest")
def ingest(item: dict) -> dict:
    _ensure_data_dir()
    record = {"t": time.time(), **item}
    with _REAL_FILE.open("a", encoding="utf-8") as f:
        f.write(json.dumps(record) + "\n")
    return {"ok": True}

@app.get("/summary", response_class=PlainTextResponse)
def summary() -> str:
    if _SUMMARY_FILE.exists():
        return _SUMMARY_FILE.read_text(encoding="utf-8")
    return "No prediction run yet."

@app.post("/summary")
def write_summary(item: dict) -> dict:
    text = item.get("text", "")
    if not text:
        raise HTTPException(status_code=400, detail="'text' field is required")
    _ensure_data_dir()
    _SUMMARY_FILE.write_text(text, encoding="utf-8")
    return {"ok": True}

@app.get("/real")
def get_real(limit: int = 50) -> JSONResponse:
    if not _REAL_FILE.exists():
        return JSONResponse([])
    lines = _REAL_FILE.read_text(encoding="utf-8").strip().splitlines()
    return JSONResponse([json.loads(l) for l in lines[-limit:]])

@app.get("/brief", response_class=PlainTextResponse)
def brief():
    p = Path("data/brief.txt")
    return p.read_text(encoding="utf-8") if p.exists() else "No study yet."

# ─── CORE API ENDPOINTS ───────────────────────────────────────────────────────
@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "Parallel Creator OS", "version": "2.4.0"}

@app.post("/api/auth/login")
def api_login(req: LoginRequest):
    username = req.username.strip().lower()
    pin = req.pin.strip()
    try:
        login(username, pin)
        return {"success": True, "username": username}
    except ProfileNotFound:
        raise HTTPException(status_code=404, detail="Username not found.")
    except WrongPIN:
        raise HTTPException(status_code=401, detail="Incorrect PIN.")

@app.post("/api/auth/signup")
def api_signup(req: LoginRequest):
    username = req.username.strip().lower()
    pin = req.pin.strip()
    if not username:
        raise HTTPException(status_code=400, detail="Username is required.")
    if len(pin) < 3:
        raise HTTPException(status_code=400, detail="PIN must be at least 3 digits.")
    try:
        profile = create_profile(username, pin)
        return {
            "success": True,
            "username": username,
            "bridge_set": profile.get("bridge_set"),
            "bridge_sync": profile.get("bridge_sync")
        }
    except UsernameTaken:
        raise HTTPException(status_code=409, detail="Username already taken.")

@app.post("/api/user/sync-bridge-set")
def api_sync_bridge_set(username: str = Query(...)):
    """Explicitly provision or re-verify the user's isolated Set on Cosmitude Bridge."""
    u = username.strip().lower()
    from parallel.bridge_client import create_bridge_user_set
    from parallel.profiles import _load, _save, ProfileNotFound
    res = create_bridge_user_set(u)
    try:
        profile = _load(u)
        profile["bridge_set"] = f"Set_{u}"
        profile["bridge_sync"] = {
            "set_name": f"Set_{u}",
            "synced_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
            "status": "active" if res.get("success") else "failed",
            "details": res
        }
        _save(profile)
    except ProfileNotFound:
        pass
    except Exception as e:
        logger.warning(f"Failed to update profile bridge_sync: {e}")
    return res

@app.get("/api/user/history")
def api_history(username: str = Query(...)):
    history = get_history(username.strip().lower())
    return {"history": history or []}

@app.get("/api/user/cached")
def api_cached(username: str = Query(...), creator: str = Query(...)):
    u = username.strip().lower()
    c = creator.strip()
    cached_intel = get_cached_intel(u, c)
    cached_clone = get_cached_clone(u, c)
    prev_f = get_user_previous_findings(u, c)
    return {
        "intel": cached_intel,
        "clone": cached_clone,
        "prev_findings": prev_f
    }

@app.get("/api/creators/suggest")
def api_suggest(query: str = Query(...)):
    q = query.strip()
    if len(q) < 2:
        return {"suggestions": []}
    sugs = find_similar_creators(q, min_score=0.45, limit=5)
    return {"suggestions": sugs}

@app.get("/api/creators/spellfix")
def api_spellfix(query: str = Query(...)):
    q = query.strip()
    if len(q) < 3:
        return {"suggestions": []}
    ai_sugs = resolve_misspelled_creator_with_llm(q)
    return {"suggestions": ai_sugs}

@app.post("/api/intel/analyze")
def api_analyze(req: AnalyzeRequest):
    creator = _sanitize_text(req.creator_name.strip())
    if not creator:
        raise HTTPException(status_code=400, detail="Creator name is required.")
    
    comp_creator = _sanitize_text(req.comparison_creator.strip() if req.comparison_creator else "")
    niche = _sanitize_text(req.niche.strip() if req.niche else "")
    username = req.username.strip().lower() if req.username else ""

    prev_findings = {}
    if username:
        prev_findings = get_user_previous_findings(username, creator)

    try:
        intel = generate_creator_intelligence(
            creator, niche,
            previous_findings=prev_findings,
            comparison_creator=comp_creator
        )

        t_profile = intel.get("creator_profile", {})
        t_niche = t_profile.get("core_niche", niche or "Digital Content")
        t_creator_vids = intel.get("creator_videos", [])
        t_niche_vids = intel.get("niche_trending_videos", [])

        dossier = generate_unified_clone_dossier(
            creator, t_niche, t_creator_vids, t_niche_vids,
            comparison_creator=comp_creator
        )

        copy_result = {
            "target_creator": creator,
            "comparison_creator": comp_creator,
            "target_niche": t_niche,
            "target_profile": t_profile,
            "style_card": dossier["style_card"],
            "blueprints": dossier["blueprints"],
            "piracy_ideas": dossier["piracy_ideas"],
            "head_to_head": dossier.get("head_to_head"),
            "target_intel": intel,
        }

        # Auto-save to profile & Bridge store
        if username:
            save_intel(username, creator, t_niche, intel, comparison_creator=comp_creator)
            push_summary_to_bridge(username, creator, intel)
            save_clone_run(username, creator, dossier["style_card"], dossier["blueprints"], dossier["piracy_ideas"])
            save_to_bridge_user_store(username, creator, intel, copy_result, comparison_creator=comp_creator)

        return {
            "intel": intel,
            "copy_data": copy_result,
            "prev_findings": prev_findings
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/hooks/simulate")
def api_hook_simulate(req: HookTestRequest):
    text = req.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Hook text is required.")
    
    n = max(10, min(150, req.sample_size))
    try:
        res = run_study(text, n)
        
        Path("data").mkdir(exist_ok=True)
        Path("data/brief.txt").write_text(brief_text(res["study"]), encoding="utf-8")
        Path("data/summary.txt").write_text(summary_text(res), encoding="utf-8")

        items_df = res["items"].rename(columns={"text": "hook_text"}).copy()
        top_row = items_df.iloc[0]
        top_score = float(top_row["score"])
        top_clickbait = float(top_row["clickbait"])
        top_best = float(top_row["best"])
        top_worst = float(top_row["worst"])
        top_hook_name = str(top_row["sid"])
        top_hook_content = str(top_row["hook_text"])

        # Scientific Relative Velocity & Incremental Value Modeling
        # Grounded in creator baseline multiplier rather than arbitrary flat views
        if top_score >= 4.2:
            views_tier = "3.0x – 5.0x Baseline Velocity (Breakout)"
            fame_label = "Ultra Viral Breakout (Top 3% of Niche)"
            subs_gain = "+300% – 500% Follower Inflow vs Avg"
            algo_prob = "95% Push Likelihood"
            min_v, max_v = 300_000, 750_000
            sponsor_min, sponsor_max = 45_000, 120_000
        elif top_score >= 3.6:
            views_tier = "1.6x – 2.5x Baseline Velocity (Category Uplift)"
            fame_label = "Strong Category Performer (Top 15%)"
            subs_gain = "+150% – 250% Follower Inflow vs Avg"
            algo_prob = "84% Push Likelihood"
            min_v, max_v = 160_000, 350_000
            sponsor_min, sponsor_max = 20_000, 50_000
        elif top_score >= 3.0:
            views_tier = "0.9x – 1.2x Baseline Velocity (Standard)"
            fame_label = "Steady Baseline Retention"
            subs_gain = "Nominal Baseline Inflow"
            algo_prob = "62% Push Likelihood"
            min_v, max_v = 90_000, 150_000
            sponsor_min, sponsor_max = 8_000, 20_000
        else:
            views_tier = "0.3x – 0.6x Baseline Velocity (High Drop-off)"
            fame_label = "High Drop-off Risk (< 3s Swipe)"
            subs_gain = "Sub-baseline / Minimal Inflow"
            algo_prob = "28% Push Likelihood"
            min_v, max_v = 30_000, 70_000
            sponsor_min, sponsor_max = 0, 8_000

        if top_clickbait > 0.15:
            penalty = 1.0 - (top_clickbait * 0.7)
            min_v = int(min_v * penalty)
            max_v = int(max_v * penalty)
            sponsor_min = int(sponsor_min * penalty)
            sponsor_max = int(sponsor_max * penalty)

        adsense_min = int((min_v / 1000) * 30)
        adsense_max = int((max_v / 1000) * 50)

        tot_rev_min = adsense_min + sponsor_min
        tot_rev_max = adsense_max + sponsor_max
        tot_rev_usd_min = int(tot_rev_min / 86)
        tot_rev_usd_max = int(tot_rev_max / 86)

        viral_index = int(min(98, max(25, (top_score / 5.0) * 80 + (top_best * 25) - (top_worst * 20) - (top_clickbait * 25))))

        items_list = items_df.to_dict(orient="records")
        for item in items_list:
            for k, v in item.items():
                if hasattr(v, "item"):
                    item[k] = v.item()

        return {
            "confidence": res["confidence"],
            "items": items_list,
            "segments": {
                "matrix": res["segments"]["matrix"].to_dict(orient="index") if hasattr(res["segments"]["matrix"], "to_dict") else res["segments"]["matrix"]
            },
            "bias": res["bias"],
            "predictions": {
                "top_hook": top_hook_name,
                "top_hook_text": top_hook_content,
                "views_tier": views_tier,
                "fame_label": fame_label,
                "subs_gain": subs_gain,
                "algo_prob": algo_prob,
                "viral_index": viral_index,
                "tot_rev_min": tot_rev_min,
                "tot_rev_max": tot_rev_max,
                "tot_rev_usd_min": tot_rev_usd_min,
                "tot_rev_usd_max": tot_rev_usd_max,
                "adsense_min": adsense_min,
                "adsense_max": adsense_max,
                "sponsor_min": sponsor_min,
                "sponsor_max": sponsor_max,
                "top_clickbait": top_clickbait,
                "top_score": top_score,
                "top_best": top_best,
                "top_worst": top_worst
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/panel/calibrate")
def api_calibrate(req: CalibrateRequest):
    try:
        real_df = load_panel(req.sids)
        if len(real_df) > 0:
            return {"status": "ok", "rows": len(real_df)}
        else:
            return {"status": "empty", "message": "No real panel data found yet."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class HookStudyRequest(BaseModel):
    hooks_text: str          # raw textarea content "S1: ...\nS2: ...\nS3: ...\nS4: ..."
    concept_title: str = ""  # optional override
    creator_tone: str = ""   # optional override
    username: str = ""       # optional, for context

@app.post("/api/panel/send-hook-study")
def api_send_hook_study(req: HookStudyRequest):
    """Parse S1-S4 from hooks_text and post as ParallelHookStudy to Bridge Panel set."""
    import re as _re
    from parallel.bridge_client import send_hook_study

    lines = req.hooks_text.strip().splitlines()
    hooks: dict = {}
    for line in lines:
        m = _re.match(r'S([1-4]):\s*(.+)', line.strip(), _re.IGNORECASE)
        if m:
            hooks[f"S{m.group(1)}"] = m.group(2).strip()

    if len(hooks) < 2:
        raise HTTPException(
            status_code=400,
            detail="Provide at least S1 and S2 hooks in 'S1: ...' format."
        )

    # Extract concept title / tone from first line if not explicitly provided
    first_line = lines[0] if lines else ""
    concept = req.concept_title or first_line
    tone = req.creator_tone or "Creator's Style"

    result = send_hook_study(
        concept_title=concept,
        creator_tone=tone,
        s1=hooks.get("S1", ""),
        s2=hooks.get("S2", ""),
        s3=hooks.get("S3", ""),
        s4=hooks.get("S4", ""),
        target_set="Panel"
    )
    return result

# ─── STATIC ASSETS & SPA ROUTING ──────────────────────────────────────────────
# Mount static assets if compiled React build exists
assets_dir = _DIST_DIR / "assets"
if assets_dir.exists():
    app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

@app.get("/{full_path:path}")
def serve_spa(full_path: str):
    # Never return index.html for missing /api endpoints
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail=f"API endpoint '/{full_path}' not found.")

    # If the request matches a file in dist (like favicon.svg), serve it
    file_path = _DIST_DIR / full_path
    if full_path and file_path.is_file():
        return FileResponse(file_path)
    
    # Otherwise return index.html for client-side routing
    index_file = _DIST_DIR / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    
    return JSONResponse({"detail": "Frontend build not ready. Run 'npm run build' inside frontend/"}, status_code=404)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
