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


def test_vast_catalog_and_dynamic_expansion():
    from parallel.suggestions import get_all_candidate_creators, register_analyzed_creator
    candidates = get_all_candidate_creators()
    # Ensure catalog is vast (over 150 verified creators)
    assert len(candidates) >= 150

    # Ensure 1-letter dynamic prefix works accurately
    m_matches = find_similar_creators("m")
    assert len(m_matches) > 0
    assert all(m["name"].lower().startswith("m") for m in m_matches)

    # Test dynamic registration of a new creator
    initial_count = len(get_all_candidate_creators())
    register_analyzed_creator("TestNewCreatorXYZ", "Gaming & AI")
    new_candidates = get_all_candidate_creators()
    assert len(new_candidates) >= initial_count
    found = [c for c in new_candidates if c["name"] == "TestNewCreatorXYZ"]
    assert len(found) == 1
    assert found[0]["niche"] == "Gaming & AI"


def test_obscure_creator_and_specific_niche_resolution():
    # User query: 'bulletstrins' (lesser-known / obscure creator)
    sugs = find_similar_creators("bulletstrins")
    assert len(sugs) > 0
    top = sugs[0]

    # Universal Creator Recognition: The entered creator is directly recognized
    assert top["name"] == "Bulletstrins"
    assert top["is_exact"] is True

    # Specific Niche: NEVER generic 'YouTube / Digital Content' or 'youtube'
    # NOTE: "bulletstrins" is an obscure/unknown creator. The old behavior wrongly mapped it
    # to "High-Speed Rail" via a substring false-positive ("bullet" contains "train" as substring
    # via "bulletstrins" → "trains"). The correct behavior is to return any SPECIFIC niche
    # (not a generic placeholder), since YouTube suggestions for "bulletstrins" do not
    # confidently identify the creator's real domain.
    assert "digital content" not in top["niche"].lower(), f"Got generic niche: {top['niche']}"
    assert "youtube" not in top["niche"].lower(), f"Got generic youtube placeholder: {top['niche']}"
    # Must be some real, human-readable specific category (not an empty string)
    assert len(top["niche"]) > 5

    # Similar alternatives also have specific niches
    for s in sugs:
        assert "digital content" not in s["niche"].lower()
        assert "youtube" not in s["niche"].lower()


