"""
parallel/auth.py
----------------
Cryptographically secure token authentication, session management, and authorization.
Uses standard HMAC-SHA256 signing with secret key and expiration validation.
"""

import os
import hmac
import hashlib
import json
import base64
import time
from pathlib import Path
from typing import Optional, Dict, Any

_SECRET_FILE = Path("data/.session_secret")
_CACHED_SECRET: Optional[bytes] = None

def _get_secret_key() -> bytes:
    """Retrieve secret key from environment or persistent server file (hex-encoded)."""
    global _CACHED_SECRET
    if _CACHED_SECRET is not None:
        return _CACHED_SECRET
        
    env_sec = os.getenv("SESSION_SECRET")
    if env_sec:
        _CACHED_SECRET = env_sec.encode("utf-8")
        return _CACHED_SECRET
    
    if _SECRET_FILE.exists():
        try:
            raw = _SECRET_FILE.read_text("utf-8").strip()
            if raw:
                _CACHED_SECRET = bytes.fromhex(raw)
                return _CACHED_SECRET
        except Exception:
            pass
            
    # Generate and persist a cryptographically strong 32-byte random key as hex
    _SECRET_FILE.parent.mkdir(parents=True, exist_ok=True)
    generated = os.urandom(32)
    try:
        _SECRET_FILE.write_text(generated.hex(), "utf-8")
    except Exception:
        pass
    _CACHED_SECRET = generated
    return _CACHED_SECRET


def create_access_token(username: str, role: Optional[str] = None, expires_in_seconds: int = 86400 * 7) -> str:
    """
    Creates a signed base64 HMAC-SHA256 session token.
    Token payload contains username, role, issued-at, and expiration.
    """
    clean_user = username.lower().strip()
    user_role = role or ("admin" if clean_user == "admin" else "creator")
    now = int(time.time())
    payload = {
        "sub": clean_user,
        "role": user_role,
        "iat": now,
        "exp": now + expires_in_seconds
    }
    
    payload_bytes = json.dumps(payload, separators=(',', ':')).encode("utf-8")
    payload_b64 = base64.urlsafe_b64encode(payload_bytes).decode("utf-8").rstrip("=")
    
    secret = _get_secret_key()
    signature = hmac.new(secret, payload_b64.encode("utf-8"), hashlib.sha256).digest()
    sig_b64 = base64.urlsafe_b64encode(signature).decode("utf-8").rstrip("=")
    
    return f"{payload_b64}.{sig_b64}"


def verify_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verifies token signature and expiration.
    Returns payload dict if valid, or None if invalid or expired.
    """
    if not token or "." not in token:
        return None
    
    parts = token.split(".")
    if len(parts) != 2:
        return None
        
    payload_b64, sig_b64 = parts
    secret = _get_secret_key()
    
    expected_sig = hmac.new(secret, payload_b64.encode("utf-8"), hashlib.sha256).digest()
    expected_sig_b64 = base64.urlsafe_b64encode(expected_sig).decode("utf-8").rstrip("=")
    
    # Constant-time comparison to prevent timing attacks
    if not hmac.compare_digest(sig_b64, expected_sig_b64):
        return None
        
    try:
        # Restore base64 padding
        padding = 4 - (len(payload_b64) % 4)
        if padding and padding < 4:
            payload_b64 += "=" * padding
        payload_json = base64.urlsafe_b64decode(payload_b64.encode("utf-8")).decode("utf-8")
        payload = json.loads(payload_json)
        
        # Check expiration
        now = int(time.time())
        if payload.get("exp", 0) < now:
            return None
            
        return payload
    except Exception:
        return None
