import os
import pytest

def test_firecrawl_criticism_and_peer_queries_purged():
    """
    Asserts that Firecrawl criticism queries and ungrounded peer competitor
    queries are purged from parallel/intelligence.py (Defect F8 / F13 / RC-7).
    """
    path = "parallel/intelligence.py"
    assert os.path.exists(path), f"{path} must exist"

    with open(path, "r", encoding="utf-8") as f:
        code = f.read()

    assert "criticism complaints review feedback reddit" not in code, \
        "Firecrawl criticism query found in parallel/intelligence.py"
    assert "competitor OR similar" not in code, \
        "Firecrawl competitor/peer query found in parallel/intelligence.py"
