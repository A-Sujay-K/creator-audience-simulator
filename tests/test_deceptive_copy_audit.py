import os
import re
import pytest

def test_no_deceptive_copy_or_fake_badges():
    """
    Asserts that frontend components do not contain deceptive marketing copy,
    fake PRO badges, Monte Carlo claims, or ungrounded verification claims (F17).
    """
    # 1. Sidebar.jsx: No fake PRO badge
    with open("frontend/src/components/Sidebar.jsx", "r", encoding="utf-8") as f:
        sidebar = f.read()
    assert not re.search(r'>\s*PRO\s*<', sidebar), "Fake PRO badge found in Sidebar.jsx"

    # 2. AnalyzeForm.jsx: No 'Autonomous Crawl', 'Intelligence Deck v2.4', 'Verified Benchmarks'
    with open("frontend/src/components/AnalyzeForm.jsx", "r", encoding="utf-8") as f:
        analyze = f.read()
    assert "Autonomous Crawl" not in analyze, "Deceptive copy 'Autonomous Crawl' found in AnalyzeForm.jsx"
    assert "Intelligence Deck v2.4" not in analyze, "Deceptive copy 'Intelligence Deck v2.4' found in AnalyzeForm.jsx"
    assert "Verified Benchmarks:" not in analyze, "Deceptive copy 'Verified Benchmarks:' found in AnalyzeForm.jsx"

    # 3. CreatorProfileModule.jsx: No fake 'VERIFIED UPLOADS'
    with open("frontend/src/components/CreatorProfileModule.jsx", "r", encoding="utf-8") as f:
        creator_prof = f.read()
    assert "VERIFIED UPLOADS" not in creator_prof, "Fake static badge 'VERIFIED UPLOADS' found in CreatorProfileModule.jsx"

    # 4. HookTesterModule.jsx: No 'thousands of viewers', 'Monte Carlo', or sensational placeholders
    with open("frontend/src/components/HookTesterModule.jsx", "r", encoding="utf-8") as f:
        hook_tester = f.read()
    assert "thousands of viewers" not in hook_tester.lower(), "Deceptive copy 'thousands of viewers' in HookTesterModule.jsx"
    assert "monte carlo" not in hook_tester.lower(), "Deceptive copy 'Monte Carlo' in HookTesterModule.jsx"
    assert "controversy are wild" not in hook_tester.lower(), "Sensational controversy placeholder in HookTesterModule.jsx"

    # 5. Global check: No 'Done-For-You' or 'Output Ready' across all components
    for root, dirs, files in os.walk("frontend/src/components"):
        for f in files:
            if f.endswith(".jsx"):
                p = os.path.join(root, f)
                with open(p, "r", encoding="utf-8") as fp:
                    content = fp.read()
                assert "Done-For-You" not in content, f"Deceptive copy 'Done-For-You' found in {p}"
                assert "Output Ready" not in content, f"Deceptive copy 'Output Ready' found in {p}"
