import pytest
from parallel.intelligence import resolve_reference_video

def test_resolve_reference_video_does_not_mark_search_urls_verified():
    """
    Asserts that search query URLs and semantic string scores are never
    falsely marked verified=True (Defect F16 / RC-4).
    """
    # 1. Fallback to search query should have verified=False
    s = {"title": "Test Camera Comparison", "trending_topic": "Sony vs Canon"}
    ref = resolve_reference_video(s, [], "Tech Reviews", "MKBHD")
    assert "search_query" in ref["url"]
    assert ref.get("verified") is False, "Search query URL was falsely marked verified=True"

    # 2. Check source code that no search_query is marked verified: True
    with open("parallel/intelligence.py", "r", encoding="utf-8") as f:
        code = f.read()

    assert '"url": f"https://www.youtube.com/results?search_query=' not in code or '"verified": True' not in code, \
        "search_query URLs must not be marked verified: True"
