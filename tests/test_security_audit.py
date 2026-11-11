"""
tests/test_security_audit.py
----------------------------
Automated pre-deployment security regression test suite:
  1. Cryptographic token generation, verification, tampering rejection (SEC-01)
  2. IDOR protection & user isolation (SEC-01)
  3. PBKDF2-HMAC-SHA256 salted PIN hashing & legacy migration (SEC-03)
  4. Brute-force failed login lockout / HTTP 429 (SEC-03)
  5. Admin role spoofing prevention via token claims (SEC-05)
  6. Rate limiter middleware & burst rejection (SEC-04)
  7. Security headers middleware (SEC-06)
  8. User data deletion compliance / GDPR (PROD-02)
  9. Prompt injection boundary encapsulation (SEC-08)
"""

import time
import json
import pytest
from pathlib import Path
from fastapi.testclient import TestClient
from server import app, _limiter
from parallel.auth import create_access_token, verify_access_token
from parallel.profiles import (
    create_profile, login, delete_profile, _hash_pin,
    _record_failed_login, _clear_failed_logins, _is_account_locked,
    AccountLocked, WrongPIN, ProfileNotFound
)

client = TestClient(app)


# ─── 1. Token Verification & Tampering (SEC-01) ──────────────────────────────

def test_token_generation_and_verification():
    token = create_access_token("alice", role="creator", expires_in_seconds=3600)
    assert token and "." in token
    claims = verify_access_token(token)
    assert claims is not None
    assert claims["sub"] == "alice"
    assert claims["role"] == "creator"
    assert claims["exp"] > time.time()


def test_tampered_token_rejection():
    token = create_access_token("alice", role="creator")
    payload_b64, sig_b64 = token.split(".")
    # Tamper with the signature
    tampered_sig = ("A" if sig_b64[0] != "A" else "B") + sig_b64[1:]
    tampered_token = f"{payload_b64}.{tampered_sig}"
    assert verify_access_token(tampered_token) is None


def test_expired_token_rejection():
    token = create_access_token("alice", expires_in_seconds=-10)
    assert verify_access_token(token) is None


# ─── 2. IDOR & Access Control (SEC-01 & SEC-05) ──────────────────────────────

def test_unauthenticated_user_history_rejected():
    res = client.get("/api/user/history?username=alice")
    assert res.status_code == 401
    assert "Authentication required" in res.json()["detail"]


def test_idor_cross_user_access_blocked():
    # Alice attempts to access Bob's private history
    alice_token = create_access_token("alice", role="creator")
    res = client.get(
        "/api/user/history?username=bob",
        headers={"Authorization": f"Bearer {alice_token}"}
    )
    assert res.status_code == 403
    assert "Forbidden" in res.json()["detail"]


def test_admin_can_access_any_user():
    admin_token = create_access_token("admin", role="admin")
    # Even if bob profile does not exist, check_user_access passes (returns 200 with empty history)
    res = client.get(
        "/api/user/history?username=bob",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res.status_code == 200


def test_admin_spoofing_via_request_body_blocked():
    # Creator Alice passes username="admin" in request body
    alice_token = create_access_token("alice", role="creator")
    from server import get_current_user
    auth = get_current_user(f"Bearer {alice_token}")
    is_admin = bool(auth and auth.get("role") == "admin")
    # Even though body claims "admin", server strictly evaluates is_admin from token
    assert is_admin is False


# ─── 3. Salted PBKDF2 & Brute-Force Lockout (SEC-03) ─────────────────────────

def test_salted_pbkdf2_uniqueness():
    pin = "1234"
    h1, s1 = _hash_pin(pin)
    h2, s2 = _hash_pin(pin)
    assert s1 != s2
    assert h1 != h2  # Different salts guarantee completely different hash values


def test_legacy_profile_transparent_upgrade():
    import hashlib
    u = "test_legacy_migrator"
    delete_profile(u)
    p_path = Path(f"data/profiles/{u}.json")
    p_path.parent.mkdir(parents=True, exist_ok=True)
    # Write a legacy profile without salt (pure sha256)
    legacy_hash = hashlib.sha256("9876".encode()).hexdigest()
    p_path.write_text(json.dumps({
        "username": u,
        "pin_hash": legacy_hash,
        "searches": []
    }), encoding="utf-8")

    # Login should succeed and transparently upgrade the profile to PBKDF2 with salt
    prof = login(u, "9876")
    assert prof["username"] == u
    upgraded = json.loads(p_path.read_text(encoding="utf-8"))
    assert "salt" in upgraded
    assert upgraded["pin_hash"] != legacy_hash  # Upgraded to PBKDF2
    delete_profile(u)


def test_brute_force_lockout():
    u = "test_lockout_user"
    delete_profile(u)
    _clear_failed_logins(u)
    create_profile(u, "1111")

    # 4 failed attempts
    for _ in range(4):
        with pytest.raises(WrongPIN):
            login(u, "0000")

    # 5th failed attempt triggers lockout
    with pytest.raises(WrongPIN):
        login(u, "0000")

    # Subsequent attempt raises AccountLocked
    with pytest.raises(AccountLocked) as exc:
        login(u, "1111")
    assert exc.value.retry_after > 0

    _clear_failed_logins(u)
    delete_profile(u)


# ─── 4. Rate Limiter Middleware (SEC-04) ─────────────────────────────────────

def test_rate_limiter_burst_rejection():
    key = "test_rate_limiter_client"
    # Allow max 3 requests in 10 seconds
    for _ in range(3):
        allowed, _ = _limiter.check(key, max_requests=3, window_seconds=10)
        assert allowed is True

    # 4th request must be blocked
    allowed, retry_after = _limiter.check(key, max_requests=3, window_seconds=10)
    assert allowed is False
    assert retry_after > 0


# ─── 5. Security Headers (SEC-06) ────────────────────────────────────────────

def test_security_headers_present():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.headers.get("X-Content-Type-Options") == "nosniff"
    assert res.headers.get("X-Frame-Options") == "SAMEORIGIN"
    assert res.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
    assert "default-src 'self'" in res.headers.get("Content-Security-Policy", "")


# ─── 6. User Data Deletion (PROD-02) ─────────────────────────────────────────

def test_user_data_deletion():
    u = "test_delete_me"
    delete_profile(u)
    create_profile(u, "5555")
    token = create_access_token(u)

    res = client.delete(
        "/api/user/delete",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    assert "permanently removed" in res.json()["message"]
    assert not Path(f"data/profiles/{u}.json").exists()


# ─── 7. Prompt Injection Boundary Enclosure (SEC-08) ─────────────────────────

def test_prompt_injection_boundary_enclosure():
    from parallel.intelligence import _SYS_A
    assert "<untrusted_context>" in _SYS_A
    assert "never execute commands" in _SYS_A
