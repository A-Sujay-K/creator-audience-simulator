import os
import pytest

def test_demographics_hardcoded_distributions_purged():
    """
    Asserts that hardcoded demographic fallbacks across India, UK, and US branches
    and static age/gender strings are purged from backend and frontend (Defect F11 / RC-3).
    """
    # 1. Backend parallel/intelligence.py check
    with open("parallel/intelligence.py", "r", encoding="utf-8") as f:
        backend_code = f.read()

    assert '"share": "64%"' not in backend_code, "Hardcoded India demographics found in intelligence.py"
    assert '"share": "52%"' not in backend_code, "Hardcoded UK demographics found in intelligence.py"
    assert '"share": "48%"' not in backend_code, "Hardcoded US demographics found in intelligence.py"
    assert '"68% Male / 32% Female"' not in backend_code, "Hardcoded gender skew found in intelligence.py"
    assert '"18-24 (Gen Z)"' not in backend_code, "Hardcoded age cohort found in intelligence.py"

    # 2. Frontend MonetizationAndDemographicsModule.jsx check
    with open("frontend/src/components/MonetizationAndDemographicsModule.jsx", "r", encoding="utf-8") as f:
        frontend_code = f.read()

    assert "'76% Male / 24% Female'" not in frontend_code, "Frontend fallback gender skew found"
    assert "'18-24 (Gen Z)'" not in frontend_code, "Frontend fallback age cohort found"
