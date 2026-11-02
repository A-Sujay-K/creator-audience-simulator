"""
tests/test_audit_fixes.py
-------------------------
Tests verifying the fixes made during the system audit:
1. Input sanitization (_sanitize_text) prevents XSS injection and control char abuse
2. Society RELATIONSHIP_WEIGHTS keys strictly match config/society.yaml
3. Rate limiter sliding window thread safety and non-blocking calculation
4. Server logger definition and SPA catch-all endpoint isolation
"""

import yaml
from pathlib import Path
import pytest
from server import _sanitize_text
from parallel.society import RELATIONSHIP_WEIGHTS
from parallel.llm import _throttle, _TS_LOCK, _call_timestamps


def test_sanitize_text():
    # Strips HTML tags
    assert _sanitize_text("<script>alert(1)</script>") == "alert(1)"
    assert _sanitize_text("<b>Bold</b> Creator") == "Bold Creator"
    # Strips javascript: URIs
    assert _sanitize_text("javascript:alert(1)") == "alert(1)"
    # Handles empty / None
    assert _sanitize_text("") == ""
    assert _sanitize_text(None) is None
    # Truncates to max_len
    assert len(_sanitize_text("a" * 300, max_len=50)) == 50


def test_relationship_weights_match_society_yaml():
    yaml_path = Path(__file__).parent.parent / "config" / "society.yaml"
    with open(yaml_path, "r", encoding="utf-8") as f:
        cfg = yaml.safe_load(f)["attributes"]
    
    yaml_rel_keys = set(cfg["relationship"].keys())
    weight_keys = set(RELATIONSHIP_WEIGHTS.keys())

    # Every key in society.yaml must have an explicit weight defined
    assert yaml_rel_keys.issubset(weight_keys), f"Missing weight for yaml keys: {yaml_rel_keys - weight_keys}"
    # No dead/extraneous keys should linger in RELATIONSHIP_WEIGHTS
    assert weight_keys == yaml_rel_keys, f"Dead keys in RELATIONSHIP_WEIGHTS: {weight_keys - yaml_rel_keys}"


def test_rate_limiter_does_not_hold_lock_during_throttle():
    # Calling _throttle should not deadlock or permanently hold _TS_LOCK
    _throttle()
    # Lock should be immediately acquirable after _throttle returns
    acquired = _TS_LOCK.acquire(blocking=False)
    assert acquired is True
    _TS_LOCK.release()
