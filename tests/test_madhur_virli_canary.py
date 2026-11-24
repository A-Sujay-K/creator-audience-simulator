import re
import pytest

def test_sys_c_no_controversy_or_defamation_mandates():
    """
    Asserts that _SYS_C and related prompt templates in parallel/intelligence.py
    do not contain controversy, price, or forced proper-noun mandates that drive
    defamation/hallucination (Defect F8 / RC-1).
    """
    with open("parallel/intelligence.py", "r", encoding="utf-8") as f:
        code = f.read()

    # Extract _SYS_C
    match = re.search(r'_SYS_C\s*=\s*"""(.*?)"""', code, re.DOTALL)
    assert match is not None, "_SYS_C must be defined"
    sys_c = match.group(1)

    # 1. Assert no controversy mandates
    assert "capitalize on real niche controversies" not in sys_c, "Controversy mandate found in _SYS_C"
    assert "niche controversies" not in sys_c.lower(), "Controversy references found in _SYS_C"
    assert "exact timely controversy" not in sys_c, "Controversy field mandate found in _SYS_C"

    # 2. Assert no forced proper-noun or price mandates
    assert "Every single hook MUST contain at least one REAL proper noun" not in sys_c, "Forced proper-noun mandate found in _SYS_C"
    assert "rupee/dollar price" not in sys_c.lower(), "Price mandate found in _SYS_C"
    assert "Electoral Bonds" not in sys_c, "Sensational political/controversy examples found in _SYS_C"
    assert "₹499 subscription" not in sys_c, "Hardcoded price example found in _SYS_C"

    # 3. Assert explicit defamation/controversy guardrail exists
    assert "NEVER fabricate legal allegations" in sys_c or "Do NOT fabricate legal allegations" in sys_c, "Missing defamation guardrail in _SYS_C"
