import os
import pytest
from parallel.suggestions import infer_specific_niche

def test_niche_defaults_to_unclassified_and_autocomplete_purged():
    """
    Asserts that infer_specific_niche returns 'Unclassified' and that unofficial
    suggestqueries.google.com autocomplete calls are completely removed (F13 / F17 / RC-6).
    """
    # 1. infer_specific_niche should return 'Unclassified'
    assert infer_specific_niche("Samay Raina") == "Unclassified"
    assert infer_specific_niche("Marques Brownlee") == "Unclassified"
    assert infer_specific_niche("Unknown Creator") == "Unclassified"

    # 2. Check that suggestqueries.google.com is purged from suggestions.py
    with open("parallel/suggestions.py", "r", encoding="utf-8") as f:
        code = f.read()
    assert "suggestqueries.google.com" not in code, "Unofficial autocomplete scraper found in suggestions.py"
