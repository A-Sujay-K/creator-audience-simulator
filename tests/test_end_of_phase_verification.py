import os
import pytest
from parallel.intelligence import _normalize_intel

def test_grep_style_no_hardcoded_strings():
    """
    Asserts that no hardcoded demographic, price, sponsor, controversy, or deceptive marketing
    strings exist anywhere in prompts, backend intelligence, or frontend components.
    """
    forbidden_patterns = [
        # Demographic strings
        '"share": "64%"',
        '"share": "52%"',
        '"share": "48%"',
        '"68% Male / 32% Female"',
        '"78% Male / 22% Female"',
        '"76% Male / 24% Female"',
        '"18-24 (Gen Z)"',
        # Price strings & mandates
        "₹499",
        "₹50,000",
        "₹1,00,000",
        "$40,000 - $80,000",
        "$12,000 - $25,000",
        "$3,000 - $6,000",
        "₹30L - ₹65L",
        "₹10L - ₹20L",
        "₹2.5L - ₹5L",
        # Controversy mandates
        "Electoral Bonds",
        "capitalize on real niche controversies",
        "include at least one REAL proper noun",
        # Deceptive marketing copy & fake badges
        "Monte Carlo neural simulation across thousands of viewers",
        "Autonomous Crawl",
        "Intelligence Deck v2.4",
        "Verified Benchmarks / Uploads",
        "defaultRoadmap",
        "_brand_map",
    ]

    target_dirs = ["parallel", "frontend/src"]
    violations = []

    for target in target_dirs:
        for root, dirs, files in os.walk(target):
            if any(skip in root for skip in ["node_modules", ".git", "__pycache__"]):
                continue
            for fname in files:
                if not fname.endswith((".py", ".js", ".jsx", ".ts", ".tsx")):
                    continue
                fpath = os.path.join(root, fname)
                with open(fpath, "r", encoding="utf-8") as f:
                    content = f.read()
                for pat in forbidden_patterns:
                    if pat.lower() in content.lower():
                        violations.append(f"{fpath}: contains forbidden pattern '{pat}'")

    assert not violations, "Forbidden strings found in codebase:\n" + "\n".join(violations)

def test_all_10_quantitative_fields_unavailable():
    """
    Asserts that all 10 ungrounded quantitative fields return structured envelopes
    with status UNAVAILABLE.
    """
    intel = _normalize_intel(
        intel={},
        creator_name="Test Creator",
        avatar_url="",
        creator_vids=[],
        niche_vids=[]
    )

    metrics = intel["platform_metrics"]
    rc = intel["rate_card_and_sponsors"]
    demo = intel["audience_demographics"]

    # 1. youtube_subscribers
    assert metrics["youtube_subscribers"]["status"] == "UNAVAILABLE"
    assert metrics["youtube_subscribers"]["value"] is None

    # 2. instagram_followers
    assert metrics["instagram_followers"]["status"] == "UNAVAILABLE"
    assert metrics["instagram_followers"]["value"] is None

    # 3. total_reach
    assert metrics["total_reach"]["status"] == "UNAVAILABLE"
    assert metrics["total_reach"]["value"] is None

    # 4. engagement_rate
    assert metrics["engagement_rate"]["status"] == "UNAVAILABLE"
    assert metrics["engagement_rate"]["value"] is None

    # 5. category_median_engagement
    assert metrics["category_median_engagement"]["status"] == "UNAVAILABLE"
    assert metrics["category_median_engagement"]["value"] is None

    # 6. est_youtube_rate
    assert rc["est_youtube_rate"]["status"] == "UNAVAILABLE"
    assert rc["est_youtube_rate"]["value"] is None

    # 7. est_instagram_reel_rate
    assert rc["est_instagram_reel_rate"]["status"] == "UNAVAILABLE"
    assert rc["est_instagram_reel_rate"]["value"] is None

    # 8. est_story_rate
    assert rc["est_story_rate"]["status"] == "UNAVAILABLE"
    assert rc["est_story_rate"]["value"] is None

    # 9. audience_demographics.top_countries
    assert demo["top_countries"]["status"] == "UNAVAILABLE"
    assert demo["top_countries"]["value"] is None

    # 10. audience_demographics.gender_skew
    assert demo["gender_skew"]["status"] == "UNAVAILABLE"
    assert demo["gender_skew"]["value"] is None
