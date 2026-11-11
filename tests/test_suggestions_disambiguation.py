"""
tests/test_suggestions_disambiguation.py
----------------------------------------
Tests for the creator spell-checking, fuzzy similarity, and disambiguation system.
"""

from parallel.suggestions import find_similar_creators, resolve_misspelled_creator_with_llm


def test_fuzzy_misspelled_creator_suggestions():
    # Test 1: technicl guruji -> Technical Guruji
    sugs1 = find_similar_creators("technicl guruji")
    assert len(sugs1) > 0
    top1 = sugs1[0]
    assert "technical guruji" in top1["name"].lower()
    assert top1["is_exact"] is False
    assert top1["score"] >= 0.70

    # Test 2: mrbist -> MrBeast
    sugs2 = find_similar_creators("mrbist")
    assert len(sugs2) > 0
    top2 = sugs2[0]
    assert "mrbeast" in top2["name"].lower()
    assert top2["is_exact"] is False
    assert top2["score"] >= 0.85

    # Test 3: exact match flag
    sugs3 = find_similar_creators("Technical Guruji")
    assert len(sugs3) > 0
    assert sugs3[0]["is_exact"] is True


def test_llm_spellfix_fallback():
    # Heavily misspelled or phonetic query
    res = resolve_misspelled_creator_with_llm("veratasium")
    assert len(res) > 0
    assert "veritasium" in res[0]["name"].lower()
