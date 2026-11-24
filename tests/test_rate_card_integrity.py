import os
import pytest

def test_rate_card_hardcoded_fallbacks_purged():
    """
    Asserts that _usd_to_inr = 83 and hardcoded tier/niche rate multiplier
    fallbacks are purged from parallel/intelligence.py (Defect F7 / RC-5).
    """
    path = "parallel/intelligence.py"
    assert os.path.exists(path), f"{path} must exist"

    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "_usd_to_inr" not in content, "Static _usd_to_inr multiplier found in intelligence.py"
    assert "_niche_mult" not in content, "Hardcoded niche multiplier dictionary found in intelligence.py"
    assert "yt_base = (50_000, 150_000)" not in content, "Hardcoded tier rate brackets found in intelligence.py"
