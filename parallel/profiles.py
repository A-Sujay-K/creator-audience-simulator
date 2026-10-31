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
    """Create a new user profile. Raises UsernameTaken if username already exists."""
    _ensure_dir()
    if profile_exists(username):
        raise UsernameTaken(f"Username '{username}' is already taken.")
    profile = {
        "username": username.lower().strip(),
        "display_name": username.strip(),
        "pin_hash": _hash_pin(pin),
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
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

def save_intel(username: str, creator_name: str, niche: str, intel: dict) -> str:
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
    Push a creator analysis summary to Cosmitude Bridge via the local ingest service.
    Returns True on success, False if ingest service is not running.
    """
    try:
        import requests
        profile_summary = intel.get("creator_profile", {})
        niche = profile_summary.get("core_niche", "Unknown")
        hooks = []
        for s in intel.get("content_suggestions", [])[:3]:
            for c in s.get("candidate_hooks", [])[:2]:
                hooks.append(c.get("text", ""))

        text = (
            f"[HookLab Profile Sync] User: {username}\n"
            f"Creator: {creator_name} | Niche: {niche}\n"
            f"Top Hooks Tested:\n" +
            "\n".join(f"  • {h}" for h in hooks if h)
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
