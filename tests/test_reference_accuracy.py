import pytest
from parallel.intelligence import is_generic_or_compilation, score_reference_relevance, resolve_reference_video

def test_spam_and_saas_walkthrough_rejection():
    # These exact spam videos polluted previous test runs:
    spam_samples = [
        "ViralReelsAI - Create Viral Reels & Shorts. Walkthrough Review",
        "How I Turned Long Videos Into Shorts with WayinVideo AI (2026 Review)",
        "All-inclusive Film #review #tech #trending #reels #insta",
        "Reviews Reviews Reviews!!!! - Instagram",
        "Top 10 Indian Tech Creators 2025",
        "Best Compilation of Gadgets"
    ]
    for s in spam_samples:
        assert is_generic_or_compilation(s, "", "Tech Reviews & Consumer Gadgets") is True

    # Genuine consumer gadget videos should NOT be rejected:
    valid_samples = [
        "iPhone 16 Pro Max Battery Drain Test vs Galaxy S24 Ultra",
        "Can you trust an Indian Tech Youtuber - The Truth About Tech Reviews",
        "ASUS ROG Phone 8 Pro Review: The Thermal Beast"
    ]
    for v in valid_samples:
        assert is_generic_or_compilation(v, "", "Tech Reviews & Consumer Gadgets") is False


def test_reference_video_semantic_matching():
    concept = {
        "title": "iPhone 16 Pro Max Battery Test: Does 5,000 mAh Really Exist?",
        "trending_topic": "iPhone 16 battery capacity"
    }

    # If candidate list contains both a relevant video and an unrelated video:
    candidates = [
        {"title": "Can you trust an Indian Tech Youtuber", "url": "https://www.youtube.com/watch?v=tech_truth", "platform": "YouTube"},
        {"title": "iPhone 16 Pro Battery Drain Test vs Galaxy S24 Ultra", "url": "https://www.youtube.com/watch?v=real_drain", "platform": "YouTube", "author": "Mrwhosetheboss"}
    ]

    ref = resolve_reference_video(concept, candidates, "Tech Reviews & Consumer Gadgets", "Mrwhosetheboss")
    # Must match the battery drain test, NEVER the generic video
    assert "Battery Drain" in ref["title"]
    assert ref["url"] == "https://www.youtube.com/watch?v=real_drain"


def test_reference_video_fallback_never_attaches_unrelated_videos():
    # When no candidate matches the specific concept:
    concept = {
        "title": "Samsung Galaxy Ring 60-Day Health Tracker Reality Check",
        "trending_topic": "Galaxy Ring sleep accuracy"
    }
    # Only unrelated videos in candidates:
    candidates = [
        {"title": "KTM 390 Adventure Ladakh Road Trip", "url": "https://www.youtube.com/watch?v=moto", "platform": "YouTube"}
    ]

    ref = resolve_reference_video(concept, candidates, "Tech Reviews & Consumer Gadgets", "Mrwhosetheboss")
    # Must build an authoritative benchmark search URL, NEVER attach the KTM motorcycle video!
    assert "KTM" not in ref["title"]
    assert "search_query=" in ref["url"]
    assert "Mrwhosetheboss" in ref["title"]
