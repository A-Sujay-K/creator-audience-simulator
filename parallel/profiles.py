"""
profiles.py
-----------
Local user profile system with lightweight PIN auth and Cosmitude Bridge sync.

Profiles are stored as JSON files in data/profiles/<username>.json
Each profile stores:
  - past creator intelligence searches (with full cached intel dict)
  - past creator clone / style-copy runs
  - optional Bridge push history

Usage:
    from parallel.profiles import create_profile, login, save_intel, get_history, ProfileNotFound
"""

import hashlib
import json
import time
import uuid
from pathlib import Path
from typing import Optional

_PROFILES_DIR = Path("data/profiles")


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _ensure_dir() -> None:
    _PROFILES_DIR.mkdir(parents=True, exist_ok=True)


def _profile_path(username: str) -> Path:
    # Sanitize username to safe filename
    safe = "".join(c for c in username.lower().strip() if c.isalnum() or c in "-_")
    return _PROFILES_DIR / f"{safe}.json"


def _hash_pin(pin: str) -> str:
    return hashlib.sha256(pin.strip().encode()).hexdigest()


def _load(username: str) -> dict:
    p = _profile_path(username)
    if not p.exists():
        raise ProfileNotFound(f"No profile found for '{username}'")
    return json.loads(p.read_text(encoding="utf-8"))


def _save(profile: dict) -> None:
    _ensure_dir()
    p = _profile_path(profile["username"])
    p.write_text(json.dumps(profile, ensure_ascii=False, indent=2), encoding="utf-8")


# ─── Exceptions ───────────────────────────────────────────────────────────────

class ProfileNotFound(Exception):
    pass

class WrongPIN(Exception):
    pass

class UsernameTaken(Exception):
    pass


# ─── Core API ─────────────────────────────────────────────────────────────────

def profile_exists(username: str) -> bool:
    return _profile_path(username).exists()


def create_profile(username: str, pin: str) -> dict:
    """Create a new user profile and automatically provision an isolated Set on Cosmitude Bridge."""
    _ensure_dir()
    if profile_exists(username):
        raise UsernameTaken(f"Username '{username}' is already taken.")
    
    clean_user = username.lower().strip()
    set_name = f"Set_{clean_user}"
    
    # Automatically provision isolated Set in Cosmitude Bridge
    bridge_sync = {"set_name": set_name, "status": "pending"}
    try:
        from parallel.bridge_client import create_bridge_user_set
        res = create_bridge_user_set(clean_user)
        bridge_sync = {
            "set_name": set_name,
            "synced_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
            "status": "active" if res.get("success") else "failed",
            "details": res
        }
    except Exception as e:
        bridge_sync = {
            "set_name": set_name,
            "synced_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
            "status": "failed",
            "error": str(e)
        }

    profile = {
        "username": clean_user,
        "display_name": username.strip(),
        "pin_hash": _hash_pin(pin),
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "bridge_set": set_name,
        "bridge_sync": bridge_sync,
        "searches": [],      # list of past creator intelligence runs
        "clones_run": [],    # list of past style-copy / piracy runs
        "bridge_pushes": []  # log of Cosmitude Bridge syncs
    }
    _save(profile)
    return profile


def login(username: str, pin: str) -> dict:
    """Load profile and verify PIN. Returns profile dict on success."""
    profile = _load(username)
    if profile["pin_hash"] != _hash_pin(pin):
        raise WrongPIN("Incorrect PIN.")
    return profile


def get_all_usernames() -> list[str]:
    """Return list of all registered usernames."""
    _ensure_dir()
    return [p.stem for p in _PROFILES_DIR.glob("*.json")]


# ─── Search History ───────────────────────────────────────────────────────────

def save_intel(username: str, creator_name: str, niche: str, intel: dict, comparison_creator: str = "") -> str:
    """
    Save a creator intelligence result to the user's profile.
    Returns the search ID for reference.
    """
    profile = _load(username)
    search_id = str(uuid.uuid4())[:8]

    # Check if this creator was already searched → update, don't duplicate
    existing_idx = next(
        (i for i, s in enumerate(profile["searches"])
         if s["creator_name"].lower() == creator_name.lower()),
        None
    )

    entry = {
        "id": search_id,
        "creator_name": creator_name,
        "comparison_creator": comparison_creator,
        "niche": niche,
        "searched_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "intel": intel
    }

    if existing_idx is not None:
        # Update existing entry, preserve original search ID
        entry["id"] = profile["searches"][existing_idx]["id"]
        entry["first_searched_at"] = profile["searches"][existing_idx].get(
            "first_searched_at", profile["searches"][existing_idx]["searched_at"]
        )
        profile["searches"][existing_idx] = entry
    else:
        profile["searches"].insert(0, entry)  # newest first

    # Keep only last 50 searches per user
    profile["searches"] = profile["searches"][:50]
    _save(profile)
    return entry["id"]


def get_history(username: str) -> list[dict]:
    """Return list of past searches (newest first), without the full intel dict for speed."""
    try:
        profile = _load(username)
    except ProfileNotFound:
        return []
    return [
        {
            "id": s["id"],
            "creator_name": s["creator_name"],
            "niche": s.get("niche", ""),
            "comparison_creator": s.get("comparison_creator", ""),
            "searched_at": s["searched_at"],
            "avatar_url": s["intel"].get("creator_profile", {}).get("avatar_url", ""),
        }
        for s in profile.get("searches", [])
    ]


def get_cached_intel(username: str, creator_name: str) -> Optional[dict]:
    """Return full cached intel dict for a creator, or None if not cached."""
    try:
        profile = _load(username)
    except ProfileNotFound:
        return None
    for s in profile.get("searches", []):
        if s["creator_name"].lower() == creator_name.lower():
            return s["intel"]
    return None


def get_cached_by_id(username: str, search_id: str) -> Optional[dict]:
    """Return full cached intel dict by search ID."""
    try:
        profile = _load(username)
    except ProfileNotFound:
        return None
    for s in profile.get("searches", []):
        if s["id"] == search_id:
            return s
    return None


# ─── Clone History ────────────────────────────────────────────────────────────



# ─── Per-User Bridge Store & Historical Continuity ───────────────────────────

def get_user_previous_findings(username: str, creator_name: str) -> dict:
    """
    Returns a structured summary of the user's PREVIOUS findings for a creator.
    Used to inject into the LLM prompt so new suggestions build upon past data without repeating.
    """
    try:
        profile = _load(username)
    except ProfileNotFound:
        return {"previous_content_ideas": [], "previous_hooks": [], "previous_competitors": [], "previous_niches_explored": [], "total_past_runs": 0}

    result = {
        "previous_content_ideas": [],
        "previous_hooks": [],
        "previous_competitors": [],
        "previous_niches_explored": [],
        "total_past_runs": 0,
        "past_sessions": []
    }

    # Check search history
    for s in profile.get("searches", []):
        if s.get("creator_name", "").lower() != creator_name.lower():
            continue
        result["total_past_runs"] += 1
        intel = s.get("intel", {})

        # Collect past content idea titles
        for sugg in intel.get("content_suggestions", []):
            t = sugg.get("title", "").strip()
            if t and t not in result["previous_content_ideas"]:
                result["previous_content_ideas"].append(t)
            for hk in sugg.get("candidate_hooks", []):
                h = hk.get("text", "").strip()
                if h and h not in result["previous_hooks"]:
                    result["previous_hooks"].append(h)
            tt = sugg.get("trending_topic", "").strip()
            if tt and tt not in result["previous_niches_explored"]:
                result["previous_niches_explored"].append(tt)

        # Collect past competitor names
        for cb in intel.get("competitor_benchmarking", []):
            cn = cb.get("competitor_name", "").strip()
            if cn and cn not in result["previous_competitors"]:
                result["previous_competitors"].append(cn)

    # Also check bridge_store if present
    creator_key = creator_name.lower().strip().replace(" ", "_")
    b_sessions = profile.get("bridge_store", {}).get(creator_key, [])
    for b in b_sessions:
        result["past_sessions"].append({
            "session_id": b.get("session_id"),
            "stored_at": b.get("stored_at"),
            "ideas_count": b.get("content_ideas_count", 0),
        })

    return result


def save_to_bridge_user_store(username: str, creator_name: str, intel: dict, clone_data: dict = None, notes: str = "", comparison_creator: str = "") -> bool:
    """
    Saves full analysis data (intel + clone dossier + negative reviews) into the user's profile Bridge store.
    Each user's data is completely isolated under their username namespace.
    """
    try:
        profile = _load(username)

        if "bridge_store" not in profile:
            profile["bridge_store"] = {}

        creator_key = creator_name.lower().strip().replace(" ", "_")

        session_entry = {
            "session_id": str(uuid.uuid4())[:8],
            "stored_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
            "creator_name": creator_name,
            "comparison_creator": comparison_creator,
            "niche": intel.get("creator_profile", {}).get("core_niche", ""),
            "content_ideas_count": len(intel.get("content_suggestions", [])),
            "hooks_generated": sum(
                len(s.get("candidate_hooks", []))
                for s in intel.get("content_suggestions", [])
            ),
            "negative_reviews_count": len(intel.get("negative_reviews", [])),
            "intel_snapshot": {
                "creator_profile": intel.get("creator_profile", {}),
                "content_suggestions": intel.get("content_suggestions", []),
                "competitor_benchmarking": intel.get("competitor_benchmarking", []),
                "negative_reviews": intel.get("negative_reviews", []),
                "improvement_suggestions": intel.get("improvement_suggestions", []),
            },
            "notes": notes
        }

        if clone_data:
            session_entry["clone_snapshot"] = {
                "style_card": clone_data.get("style_card", {}),
                "piracy_ideas": clone_data.get("piracy_ideas", []),
            }

        if creator_key not in profile["bridge_store"]:
            profile["bridge_store"][creator_key] = []

        profile["bridge_store"][creator_key].insert(0, session_entry)
        profile["bridge_store"][creator_key] = profile["bridge_store"][creator_key][:10]

        _save(profile)
        return True
    except Exception as e:
        print(f"[profiles] bridge_store save failed: {e}")
        return False


def get_bridge_user_store(username: str, creator_name: str = None) -> list | dict:
    """
    Retrieve stored sessions from the user's isolated Bridge store.
    If creator_name is given, returns list of sessions for that creator.
    If None, returns full bridge_store dict.
    """
    try:
        profile = _load(username)
        bs = profile.get("bridge_store", {})
        if creator_name:
            creator_key = creator_name.lower().strip().replace(" ", "_")
            return bs.get(creator_key, [])
        return bs
    except ProfileNotFound:
        return [] if creator_name else {}


def save_clone_run(username: str, target_creator: str, style_card: dict,
                   blueprints: list, piracy_ideas: list) -> str:
    """Save a style-copy / piracy run to the user's profile."""
    profile = _load(username)
    run_id = str(uuid.uuid4())[:8]
    entry = {
        "id": run_id,
        "target_creator": target_creator,
        "style_card": style_card,
        "blueprints": blueprints,
        "piracy_ideas": piracy_ideas,
        "run_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
    }
    profile["clones_run"].insert(0, entry)
    profile["clones_run"] = profile["clones_run"][:20]
    _save(profile)
    return run_id


def get_clone_history(username: str) -> list[dict]:
    """Return list of past clone runs (summary only)."""
    try:
        profile = _load(username)
    except ProfileNotFound:
        return []
    return [
        {"id": r["id"], "target_creator": r["target_creator"], "run_at": r["run_at"]}
        for r in profile.get("clones_run", [])
    ]


def get_cached_clone(username: str, target_creator: str) -> Optional[dict]:
    """Return most recent cached clone run for a target creator, or None."""
    try:
        profile = _load(username)
    except ProfileNotFound:
        return None
    for r in profile.get("clones_run", []):
        if r["target_creator"].lower() == target_creator.lower():
            return r
    return None


# ─── Bridge Sync ──────────────────────────────────────────────────────────────

def push_summary_to_bridge(username: str, creator_name: str, intel: dict) -> bool:
    """
    Push a warm follower-facing teaser message to Cosmitude Bridge via the local ingest service.
    Sends a human, conversational idea teaser — not a dry data dump.
    Returns True on success, False if ingest service is not running.
    """
    try:
        import requests
        profile_summary = intel.get("creator_profile", {})
        niche = profile_summary.get("core_niche", "Unknown")

        # Pick the single best content idea and its top hook
        suggestions = intel.get("content_suggestions", [])
        best_idea_title = ""
        best_hook = ""
        best_trending_topic = ""
        if suggestions:
            best = suggestions[0]
            best_idea_title = best.get("title", "")
            best_trending_topic = best.get("trending_topic", "")
            hooks = best.get("candidate_hooks", [])
            if hooks:
                best_hook = hooks[0].get("text", "")

        # Craft a warm, engaging teaser for followers (not a sync log)
        if best_idea_title and best_hook:
            teaser_body = (
                f"🎬 New content idea dropping soon in {niche}!\n\n"
                f"Concept: *{best_idea_title}*\n"
                f"Trend tapped: {best_trending_topic}\n\n"
                f"Opening hook we're testing:\n"
                f"\U0001f449 {chr(34)}{best_hook}{chr(34)}\n\n"
                f"Drop a 🔥 if you want to see this video first!"
            )
        else:
            teaser_body = (
                f"🎬 We're cooking up something new in {niche}! "
                f"Stay tuned — big content coming from {creator_name}. Drop a 🔥 to be the first to know!"
            )

        text = (
            f"[Parallel Creator Intelligence — {creator_name}]\n\n"
            f"{teaser_body}\n\n"
            f"— Powered by Parallel for Creators (@{username})"
        )

        resp = requests.post(
            "http://localhost:8000/summary",
            json={"text": text},
            timeout=3
        )
        if resp.ok:
            # Log push in profile
            profile = _load(username)
            profile["bridge_pushes"].insert(0, {
                "creator_name": creator_name,
                "pushed_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
                "summary_preview": text[:200]
            })
            profile["bridge_pushes"] = profile["bridge_pushes"][:20]
            _save(profile)
            return True
    except Exception as e:
        print(f"[profiles] Bridge push failed: {e}")
    return False
