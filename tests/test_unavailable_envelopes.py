import os
import pytest
from parallel.intelligence import _normalize_intel, _make_unavailable_envelope

def test_unavailable_envelopes_with_api_key():
    """
    Asserts that all 10 ungrounded quantitative fields return structured envelopes
    with status UNAVAILABLE and appropriate reasons when YOUTUBE_API_KEY is present
    (collector not implemented yet, Defect F1/F4/F6/F7/F9/F11/F12).
    """
    os.environ["YOUTUBE_API_KEY"] = "AIzaSyTestKeyForAuditOnly123456789"

    raw_intel = {
        "creator_profile": {"name": "Test Creator"},
        "platform_metrics": {
            "youtube_subscribers": "10M",
            "engagement_rate": "5.4%"
        },
        "rate_card_and_sponsors": {
            "est_youtube_rate": "$10,000 - $20,000"
        }
    }

    normalized = _normalize_intel(
        intel=raw_intel,
        creator_name="Test Creator",
        avatar_url="",
        creator_vids=[],
        niche_vids=[],
        detected_niche="Tech"
    )

    metrics = normalized["platform_metrics"]
    rc = normalized["rate_card_and_sponsors"]
    demo = normalized["audience_demographics"]

    # 1. youtube_subscribers
    assert isinstance(metrics["youtube_subscribers"], dict)
    assert metrics["youtube_subscribers"]["status"] == "UNAVAILABLE"
    assert metrics["youtube_subscribers"]["value"] is None
    assert metrics["youtube_subscribers"]["reason"] == "Collector not implemented yet"

    # 2. instagram_followers
    assert isinstance(metrics["instagram_followers"], dict)
    assert metrics["instagram_followers"]["status"] == "UNAVAILABLE"
    assert metrics["instagram_followers"]["value"] is None
    assert metrics["instagram_followers"]["reason"] == "Meta Graph API credentials unconfigured"

    # 3. total_reach
    assert isinstance(metrics["total_reach"], dict)
    assert metrics["total_reach"]["status"] == "UNAVAILABLE"
    assert metrics["total_reach"]["value"] is None
    assert metrics["total_reach"]["reason"] == "Collector not implemented yet"

    # 4. engagement_rate
    assert isinstance(metrics["engagement_rate"], dict)
    assert metrics["engagement_rate"]["status"] == "UNAVAILABLE"
    assert metrics["engagement_rate"]["value"] is None
    assert metrics["engagement_rate"]["reason"] == "Collector not implemented yet"

    # 5. category_median_engagement
    assert isinstance(metrics["category_median_engagement"], dict)
    assert metrics["category_median_engagement"]["status"] == "UNAVAILABLE"
    assert metrics["category_median_engagement"]["value"] is None
    assert metrics["category_median_engagement"]["reason"] == "Collector not implemented yet"

    # 6. est_youtube_rate
    assert isinstance(rc["est_youtube_rate"], dict)
    assert rc["est_youtube_rate"]["status"] == "UNAVAILABLE"
    assert rc["est_youtube_rate"]["value"] is None
    assert rc["est_youtube_rate"]["reason"] == "Requires verified ad revenue telemetry (ad rates ungrounded)"

    # 7. est_instagram_reel_rate
    assert isinstance(rc["est_instagram_reel_rate"], dict)
    assert rc["est_instagram_reel_rate"]["status"] == "UNAVAILABLE"
    assert rc["est_instagram_reel_rate"]["value"] is None
    assert rc["est_instagram_reel_rate"]["reason"] == "Requires verified ad revenue telemetry (ad rates ungrounded)"

    # 8. est_story_rate
    assert isinstance(rc["est_story_rate"], dict)
    assert rc["est_story_rate"]["status"] == "UNAVAILABLE"
    assert rc["est_story_rate"]["value"] is None
    assert rc["est_story_rate"]["reason"] == "Requires verified ad revenue telemetry (ad rates ungrounded)"

    # 9. audience_demographics.top_countries
    assert demo["status"] == "UNAVAILABLE"
    assert isinstance(demo["top_countries"], dict)
    assert demo["top_countries"]["status"] == "UNAVAILABLE"
    assert demo["top_countries"]["value"] is None
    assert demo["top_countries"]["reason"] == "Requires channel owner OAuth (private analytics data)"

    # 10. audience_demographics.gender_skew
    assert isinstance(demo["gender_skew"], dict)
    assert demo["gender_skew"]["status"] == "UNAVAILABLE"
    assert demo["gender_skew"]["value"] is None
    assert demo["gender_skew"]["reason"] == "Requires channel owner OAuth (private analytics data)"

def test_unavailable_envelopes_without_api_key():
    """
    Asserts that when YOUTUBE_API_KEY is unset, the reason states 'API key not configured'
    for endpoints requiring the key.
    """
    if "YOUTUBE_API_KEY" in os.environ:
        del os.environ["YOUTUBE_API_KEY"]

    env = _make_unavailable_envelope("youtube_subscribers")
    assert env["status"] == "UNAVAILABLE"
    assert env["value"] is None
    assert env["reason"] == "API key not configured"

    env_reach = _make_unavailable_envelope("total_reach")
    assert env_reach["reason"] == "API key not configured"

    # Private data reason remains unchanged
    env_private = _make_unavailable_envelope("audience_demographics.gender_skew", is_private=True)
    assert env_private["reason"] == "Requires channel owner OAuth (private analytics data)"
