import os
import pytest

def test_brand_map_is_purged():
    """
    Asserts that _brand_map hardcoded sponsor dictionary is removed from
    parallel/intelligence.py (Defect F8 / F15 / RC-2).
    """
    path = "parallel/intelligence.py"
    assert os.path.exists(path), f"{path} must exist"

    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "_brand_map" not in content, "_brand_map dictionary found in parallel/intelligence.py"
    # Ensure hardcoded sponsor fallback lists are purged
    assert "Groww, Zerodha, INDmoney" not in content
    assert "Heads Up For Tails" not in content
