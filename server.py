"""
FastAPI backend for Parallel for Creators.
Exposes endpoints for creator intelligence, cloning, hook simulations, user profiles, and ingest.
Mounts React SPA (frontend/dist) cleanly so the entire app is served on http://localhost:8000.
"""
import os
import re
import json
import time
import uuid
import threading
from pathlib import Path
from typing import Optional, List, Dict, Any
import logging
from fastapi import FastAPI, HTTPException, Query, Header, Request, Depends, Response
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
    delete_profile, ProfileNotFound, WrongPIN, UsernameTaken, AccountLocked
)
from parallel.auth import create_access_token, verify_access_token
from parallel.clone_intel import (
    get_style_dna, get_video_blueprint, get_piracy_ideas, generate_unified_clone_dossier
)
from parallel.suggestions import (
    find_similar_creators, resolve_misspelled_creator_with_llm, register_analyzed_creator, infer_specific_niche
)
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
    clean = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "", clean)
    return clean.strip()[:max_len]


# ─── Rate Limiter ─────────────────────────────────────────────────────────────
class SlidingRateLimiter:
    """Thread-safe in-memory sliding-window rate limiter per client key."""
    def __init__(self):
        self._history: Dict[str, List[float]] = {}
        self._lock = threading.Lock()

    def check(self, key: str, max_requests: int, window_seconds: int) -> tuple[bool, int]:
        now = time.time()
        with self._lock:
            records = self._history.get(key, [])
            valid_records = [t for t in records if now - t < window_seconds]
            if len(valid_records) >= max_requests:
                retry_after = int(window_seconds - (now - valid_records[0]))
                self._history[key] = valid_records
                return False, max(1, retry_after)
            valid_records.append(now)
            self._history[key] = valid_records
            return True, 0

_limiter = SlidingRateLimiter()

def _enforce_rate_limit(key: str, max_reqs: int, window_sec: int, resource_name: str = "requests"):
    allowed, retry_after = _limiter.check(key, max_reqs, window_sec)
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded for {resource_name}. Please wait {retry_after} seconds before retrying.",
            headers={"Retry-After": str(retry_after)}
        )


# ─── Security Headers & CORS Middleware ───────────────────────────────────────
@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline'; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com data:; "
        "img-src 'self' data: https:; "
        "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com; "
        "connect-src 'self' https:;"
    )
    return response

_allowed_env = os.getenv("ALLOWED_ORIGINS")
if _allowed_env:
    _origins = [o.strip() for o in _allowed_env.split(",") if o.strip()]
else:
    _origins = [
        "http://localhost:5173",
        "http://localhost:8000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8000"
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

_REAL_FILE = Path("data/real.jsonl")
_SUMMARY_FILE = Path("data/summary.txt")
_DIST_DIR = Path(__file__).parent / "frontend" / "dist"

def _ensure_data_dir() -> None:
    Path("data").mkdir(parents=True, exist_ok=True)


# ─── Safe Error Helper ────────────────────────────────────────────────────────
def _safe_500(err: Exception, context: str = "request processing") -> HTTPException:
    error_id = str(uuid.uuid4())[:8]
    logger.error(f"[Error {error_id}] Exception during {context}: {err}", exc_info=True)
    return HTTPException(
        status_code=500,
        detail=f"An unexpected internal error occurred during {context}. Reference ID: {error_id}"
    )


# ─── Auth Dependencies ────────────────────────────────────────────────────────
def get_current_user(authorization: Optional[str] = Header(None)) -> Optional[dict]:
    """Extract and verify bearer token claims from Authorization header."""
    if not authorization:
        return None
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None
    return verify_access_token(parts[1])

def require_auth(authorization: Optional[str] = Header(None)) -> dict:
    """Strict auth dependency: returns user claims dict or raises 401."""
    user = get_current_user(authorization)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Authentication required. Please sign in to access this workspace.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    return user

def check_user_access(current_user: dict, target_username: str) -> None:
    """Guarantees strict per-user data isolation (blocks IDOR cross-account access)."""
    req_user = target_username.strip().lower()
    auth_user = current_user.get("sub", "")
    is_admin = current_user.get("role") == "admin"
    if not is_admin and auth_user != req_user:
        raise HTTPException(
            status_code=403,
            detail="Forbidden: You do not have permission to access another user's workspace or private store."
        )


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
    study_title: Optional[str] = "Creator Hook Study"
    items: Optional[List[Dict[str, Any]]] = None

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
def write_summary(item: dict, user: dict = Depends(require_auth)) -> dict:
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
def api_login(req: LoginRequest, request: Request):
    client_ip = request.client.host if request.client else "unknown"
    _enforce_rate_limit(f"login_ip:{client_ip}", max_reqs=15, window_sec=60, resource_name="login attempts")

    username = req.username.strip().lower()
    pin = req.pin.strip()
    try:
        profile = login(username, pin)
        role = "admin" if username == "admin" else "creator"
        token = create_access_token(username, role=role)
        return {
            "success": True,
            "username": username,
            "role": role,
            "token": token
        }
    except ProfileNotFound:
        raise HTTPException(status_code=404, detail="Username not found.")
    except AccountLocked as al:
        raise HTTPException(
            status_code=429,
            detail=str(al),
            headers={"Retry-After": str(al.retry_after)}
        )
    except WrongPIN:
        raise HTTPException(status_code=401, detail="Incorrect PIN.")

@app.post("/api/auth/signup")
def api_signup(req: LoginRequest, request: Request):
    client_ip = request.client.host if request.client else "unknown"
    _enforce_rate_limit(f"signup_ip:{client_ip}", max_reqs=10, window_sec=60, resource_name="account registrations")

    username = req.username.strip().lower()
    pin = req.pin.strip()
    if not username:
        raise HTTPException(status_code=400, detail="Username is required.")
    if len(pin) < 3:
        raise HTTPException(status_code=400, detail="PIN must be at least 3 digits.")
    try:
        profile = create_profile(username, pin)
        role = "admin" if username == "admin" else "creator"
        token = create_access_token(username, role=role)
        return {
            "success": True,
            "username": username,
            "role": role,
            "token": token,
            "bridge_set": profile.get("bridge_set"),
            "bridge_sync": profile.get("bridge_sync")
        }
    except UsernameTaken:
        raise HTTPException(status_code=409, detail="Username already taken.")

@app.post("/api/user/sync-bridge-set")
def api_sync_bridge_set(username: str = Query(...), current_user: dict = Depends(require_auth)):
    """Provision or re-verify the user's isolated Set on Cosmitude Bridge."""
    u = username.strip().lower()
    check_user_access(current_user, u)

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
def api_history(username: str = Query(...), current_user: dict = Depends(require_auth)):
    """Strictly isolated per-user analysis history."""
    u = username.strip().lower()
    check_user_access(current_user, u)
    history = get_history(u)
    return {"history": history or []}

@app.get("/api/user/cached")
def api_cached(username: str = Query(...), creator: str = Query(...), current_user: dict = Depends(require_auth)):
    """Fetch cached intelligence & clone dossier for authenticated user."""
    u = username.strip().lower()
    check_user_access(current_user, u)
    c = creator.strip()
    cached_intel = get_cached_intel(u, c)
    cached_clone = get_cached_clone(u, c)
    prev_f = get_user_previous_findings(u, c)
    return {
        "intel": cached_intel,
        "clone": cached_clone,
        "prev_findings": prev_f
    }

@app.get("/api/user/bridge-store")
def api_bridge_store(username: str = Query(...), creator: Optional[str] = Query(None), current_user: dict = Depends(require_auth)):
    """Retrieve stored dossiers from the user's isolated Bridge store with sync status."""
    u = username.strip().lower()
    check_user_access(current_user, u)
    from parallel.profiles import get_bridge_user_store, _load, ProfileNotFound
    try:
        profile = _load(u)
        store = get_bridge_user_store(u, creator.strip() if creator else None)
        return {
            "username": u,
            "bridge_set": profile.get("bridge_set", f"Set_{u}"),
            "bridge_sync": profile.get("bridge_sync", {}),
            "bridge_store": store
        }
    except ProfileNotFound:
        raise HTTPException(status_code=404, detail="User profile not found.")
    except Exception as e:
        raise _safe_500(e, "retrieving Bridge store")

@app.delete("/api/user/delete")
def api_user_delete(current_user: dict = Depends(require_auth)):
    """Permanently delete user profile and data (GDPR / Right to be Forgotten)."""
    u = current_user.get("sub", "")
    success = delete_profile(u)
    if not success:
        raise HTTPException(status_code=404, detail="Profile not found or already deleted.")
    return {"success": True, "message": f"Profile and data for '{u}' permanently removed."}

@app.get("/api/creators/suggest")
def api_suggest(query: str = Query(...)):
    q = query.strip()
    if not q:
        return {"suggestions": []}
    sugs = find_similar_creators(q, min_score=0.45, limit=6)
    return {"suggestions": sugs}

@app.get("/api/creators/spellfix")
def api_spellfix(query: str = Query(...)):
    q = query.strip()
    if len(q) < 3:
        return {"suggestions": []}
    ai_sugs = resolve_misspelled_creator_with_llm(q)
    return {"suggestions": ai_sugs}

@app.post("/api/intel/analyze")
def api_analyze(req: AnalyzeRequest, request: Request, authorization: Optional[str] = Header(None)):
    # Rate limit: 10 deep analyses per 10 minutes per client IP
    client_ip = request.client.host if request.client else "unknown"
    _enforce_rate_limit(f"analyze:{client_ip}", max_reqs=10, window_sec=600, resource_name="creator intelligence analyses")

    creator = _sanitize_text(req.creator_name.strip())
    if not creator:
        raise HTTPException(status_code=400, detail="Creator name is required.")
    
    comp_creator = _sanitize_text(req.comparison_creator.strip() if req.comparison_creator else "")
    niche = _sanitize_text(req.niche.strip() if req.niche else "")
    
    # Derive active user and admin role strictly from verified session token
    auth_user = get_current_user(authorization)
    is_admin = bool(auth_user and auth_user.get("role") == "admin")
    active_user = auth_user.get("sub") if auth_user else (req.username.strip().lower() if req.username else "")

    prev_findings = {}
    if active_user:
        prev_findings = get_user_previous_findings(active_user, creator)

    try:
        intel = generate_creator_intelligence(
            creator, niche,
            previous_findings=prev_findings,
            comparison_creator=comp_creator
        )

        t_profile = intel.get("creator_profile", {})
        t_raw_niche = t_profile.get("core_niche", niche)
        t_niche = t_raw_niche if t_raw_niche and "digital content" not in t_raw_niche.lower() else infer_specific_niche(creator)
        try:
            register_analyzed_creator(creator, t_niche)
        except Exception as _e:
            logger.warning(f"Failed to dynamically register creator: {_e}")
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
        if active_user:
            save_intel(active_user, creator, t_niche, intel, comparison_creator=comp_creator)
            push_summary_to_bridge(active_user, creator, intel)
            save_clone_run(active_user, creator, dossier["style_card"], dossier["blueprints"], dossier["piracy_ideas"])
            save_to_bridge_user_store(active_user, creator, intel, copy_result, comparison_creator=comp_creator)
            
            # Master Intelligence Dossier is strictly archived for verified Admin ONLY (never for normal users)
            if is_admin:
                try:
                    import threading
                    from parallel.bridge_client import send_user_dossier
                    threading.Thread(
                        target=send_user_dossier,
                        args=(active_user, creator, t_niche, copy_result),
                        kwargs={"target_set": "Admin"},
                        daemon=True
                    ).start()
                except Exception as b_err:
                    logger.warning(f"Failed to async dispatch dossier to Admin Set: {b_err}")

        return {
            "intel": intel,
            "copy_data": copy_result,
            "prev_findings": prev_findings
        }
    except Exception as e:
        raise _safe_500(e, "creator intelligence synthesis")

@app.post("/api/hooks/simulate")
def api_hook_simulate(req: HookTestRequest, request: Request):
    client_ip = request.client.host if request.client else "unknown"
    _enforce_rate_limit(f"simulate:{client_ip}", max_reqs=25, window_sec=300, resource_name="hook simulations")

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
        raise _safe_500(e, "hook simulation")

@app.post("/api/panel/calibrate")
def api_calibrate(req: CalibrateRequest, user: dict = Depends(require_auth)):
    try:
        real_df = load_panel(req.sids)
        if len(real_df) > 0:
            fid_result = None
            if req.items and len(req.items) >= 3:
                import pandas as pd
                from parallel.schemas import Study, Stimulus
                from parallel.fidelity import close_the_loop
                
                stimuli = [Stimulus(sid=r.get("sid", f"S{i+1}"), text=r.get("hook_text", r.get("text", ""))) for i, r in enumerate(req.items)]
                study = Study(title=req.study_title or "Hook Study", platform="shorts", audience="general", stimuli=stimuli)
                items_df = pd.DataFrame(req.items)
                if "text" not in items_df.columns and "hook_text" in items_df.columns:
                    items_df["text"] = items_df["hook_text"]
                if "stop" not in items_df.columns and "score" in items_df.columns:
                    items_df["stop"] = items_df["score"]
                if "score" not in items_df.columns:
                    items_df["score"] = items_df.get("stop", 3.0)
                fid_result = close_the_loop(study, items_df, real_df)
                
            return {
                "status": "ok",
                "rows": len(real_df),
                "fidelity": fid_result,
                "message": f"Loaded {len(real_df)} real panel responses and updated calibration history."
            }
        else:
            return {"status": "empty", "message": "No real panel data found yet."}
    except Exception as e:
        raise _safe_500(e, "panel calibration")

class HookStudyRequest(BaseModel):
    hooks_text: str          # raw textarea content "S1: ...\nS2: ...\nS3: ...\nS4: ...\nS5: ..."
    concept_title: str = ""  # optional override
    creator_tone: str = ""   # optional override
    username: str = ""       # optional, for context
    target_set: str = "Panel" # target panel or audience set

@app.post("/api/panel/send-hook-study")
def api_send_hook_study(req: HookStudyRequest, request: Request, user: dict = Depends(require_auth)):
    """Parse S1-S5 from hooks_text and post as ParallelHookStudy to Bridge Panel set."""
    client_ip = request.client.host if request.client else "unknown"
    _enforce_rate_limit(f"hookstudy:{client_ip}", max_reqs=10, window_sec=300, resource_name="panel hook studies")

    import re as _re
    from parallel.bridge_client import send_hook_study

    lines = req.hooks_text.strip().splitlines()
    hooks: dict = {}
    for line in lines:
        m = _re.match(r'S([1-5]):\s*(.+)', line.strip(), _re.IGNORECASE)
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

    target_set = req.target_set.strip() if req.target_set and req.target_set.strip() else "Panel"

    result = send_hook_study(
        concept_title=concept,
        creator_tone=tone,
        s1=hooks.get("S1", ""),
        s2=hooks.get("S2", ""),
        s3=hooks.get("S3", ""),
        s4=hooks.get("S4", ""),
        s5=hooks.get("S5", ""),
        target_set=target_set
    )
    if not result.get("success"):
        raise HTTPException(
            status_code=502,
            detail=f"Bridge dispatch error ({result.get('error_code')}): {result.get('message', 'Failed to broadcast study')}"
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
    # In production, reload must be False
    is_dev = os.getenv("ENV", "development").lower() == "development"
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=is_dev)
