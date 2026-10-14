"""
intelligence.py
---------------
Creator Intelligence Engine — Improvised with CreatorDB analytics,
live Firecrawl video & social discovery, cross-platform metrics (YouTube & Instagram),
unlocked brand sponsorship rate cards, and on-screen playable video references.

Given a creator's name + optional niche:
  1. Searches their entire digital footprint using Firecrawl:
     - Official social presence (YouTube, Instagram, X)
     - Trending topics & niche competitors
     - Real YouTube videos (site:youtube.com/watch)
     - Real Instagram Reels (site:instagram.com/reel)
  2. Synthesises an actionable intelligence report via 3 lean Groq calls:
     - Call A: Profile + Cross-Platform Metrics (YouTube & IG) + Demographics + Rate Card
     - Call B: Top Trending Content (with Playable Video/Reel links & hook breakdown) + Competitors
     - Call C: Content Suggestions with estimated views + 4 candidate hooks each
"""

import os
import json
import re
from dotenv import load_dotenv
from firecrawl import FirecrawlApp
from .llm import ask_json, MODEL_SMART

load_dotenv()

# ─────────────────────────────────────────────────
#  SYSTEM PROMPTS  (3 lean calls to avoid free-tier token limits)
# ─────────────────────────────────────────────────

_SYS_A = """You are a senior social media strategist and influencer analytics expert (like CreatorDB).
Given the creator name, niche, and live web research snippets, return ONLY a valid JSON object matching this schema:
{
  "creator_profile": {
    "name": "string",
    "core_niche": "string",
    "tier": "Mega (10M+) | Macro (1M-10M) | Mid (100K-1M) | Micro (<100K)",
    "tone_and_style": "string (max 10 words)",
    "audience_vibe": "string (max 8 words)",
    "location": "string",
    "discovered_accounts": [
      {"platform": "YouTube | Instagram | X | Website | Other", "title": "string", "url": "string"}
    ]
  },
  "platform_metrics": {
    "youtube_subscribers": "string (e.g. 45.8M)",
    "instagram_followers": "string (e.g. 21.3M)",
    "total_reach": "string (e.g. 68.4M)",
    "engagement_rate": "string (e.g. 8.5%)",
    "category_median_engagement": "string (e.g. 3.2%)",
    "youtube_cadence": "string (e.g. 1-2 videos/month)",
    "instagram_cadence": "string (e.g. Daily Reels/Stories)"
  },
  "audience_demographics": {
    "top_countries": [
      {"country": "India", "share": "42%"},
      {"country": "United States", "share": "21%"},
      {"country": "United Kingdom", "share": "6%"}
    ],
    "primary_age": "string (e.g. 18-24)",
    "gender_skew": "string (e.g. 78% Male / 22% Female)"
  },
  "rate_card_and_sponsors": {
    "est_youtube_rate": "string (e.g. $25,000 - $50,000 / ₹20L - ₹40L)",
    "est_instagram_reel_rate": "string (e.g. $7,000 - $15,000 / ₹6L - ₹12L)",
    "est_story_rate": "string (e.g. $2,500 - $5,000 / ₹2L - ₹4L)",
    "brand_affinity_niches": ["Fintech/Trading", "Mobile Gaming", "Consumer Electronics"],
    "past_or_likely_sponsors": ["Winzo", "Binomo"],
    "why_brands_partner": "string (max 15 words)"
  },
  "competitor_benchmarking": [
    {
      "competitor_name": "string",
      "recent_content_focus": "string (max 8 words)",
      "their_strength": "string (max 8 words)",
      "their_gap": "string (max 8 words)",
      "how_to_beat_them": "string (max 12 words)"
    }
  ]
}
Rules:
- Include 2-3 real competitors in competitor_benchmarking.
- Keep ALL descriptions strictly under the specified word counts.
- Return ONLY valid JSON. No preamble, no markdown fences."""

_SYS_B = """You are a viral media analyst and content strategist.
Given the creator name, discovered video links from live web research, and niche, return ONLY a valid JSON object matching this schema:
{
  "trending_videos": [
    {
      "id": 1,
      "platform": "YouTube | Instagram",
      "title": "string",
      "views": "string (e.g. 106M or 64M or 44M)",
      "url": "string (valid youtube watch or instagram reel url from the research links)",
      "opening_hook": "string (exact opening hook used in first 3 seconds)",
      "why_it_went_viral": "string (why viewers did not swipe away)",
      "adapt_hook_template": "string (actionable template for creators to copy)"
    }
  ]
}
Rules:
- Provide 3-4 trending videos/reels. Include at least 1 YouTube video and at least 1 Instagram Reel from the links!
- Keep each text field concise (1-2 punchy sentences).
- Return ONLY valid JSON. No preamble, no markdown fences."""

_SYS_C = """You are a senior YouTube/Shorts growth engineer.
Given the creator name and niche, return ONLY a valid JSON object matching this schema:
{
  "content_suggestions": [
    {
      "id": 1,
      "title": "string",
      "trending_topic": "string",
      "why_it_works": "string",
      "estimated_views": "string (e.g. 🔥 3.5M - 6.0M (Viral Breakout))",
      "candidate_hooks": [
        {"sid": "S1", "text": "string"},
        {"sid": "S2", "text": "string"},
        {"sid": "S3", "text": "string"},
        {"sid": "S4", "text": "string"}
      ]
    }
  ]
}
Rules:
- Provide exactly 4 content suggestions (id: 1 to 4) with 4 punchy candidate hooks each (S1 to S4).
- candidate_hooks: 4 punchy 3-second short-form hooks tailored for Indian 18-24 audience.
- Keep each why_it_works concise (1-2 sentences).
- Return ONLY valid JSON. No preamble, no markdown fences."""


# ─────────────────────────────────────────────────
#  FIRECRAWL SEARCH RECON
# ─────────────────────────────────────────────────

def search_creator_footprint(creator_name: str, niche: str = "") -> tuple[list[dict], list[dict]]:
    """
    Uses Firecrawl to search the creator's online presence:
    1. Official accounts & social handles (YouTube, Instagram)
    2. Niche trends & competitors
    3. Trending YouTube videos
    4. Trending Instagram Reels

    Returns (web_results, discovered_videos).
    """
    key = os.getenv("FIRECRAWL_API_KEY")
    web_results = []
    discovered_videos = []

    if not (key and key.strip() and not key.startswith("paste")):
        return web_results, discovered_videos

    try:
        app = FirecrawlApp(api_key=key)

        # Query 1: Social accounts & platform presence
        q1 = f"{creator_name} content creator official social accounts youtube instagram"
        res1 = app.search(q1, limit=4)
        if hasattr(res1, "web") and res1.web:
            for item in res1.web:
                u = getattr(item, "url", "")
                t = getattr(item, "title", "")
                s = getattr(item, "description", "")
                web_results.append({"query": "accounts", "title": t, "url": u, "snippet": s})

        # Query 2: Trends and competitors in the niche
        niche_term = niche if niche else "content creation"
        q2 = f"{creator_name} {niche_term} viral topics trending competitors alternatives"
        res2 = app.search(q2, limit=4)
        if hasattr(res2, "web") and res2.web:
            for item in res2.web:
                u = getattr(item, "url", "")
                t = getattr(item, "title", "")
                s = getattr(item, "description", "")
                web_results.append({"query": "trends", "title": t, "url": u, "snippet": s})

        # Query 3: Real YouTube videos
        q3 = f"{creator_name} popular viral videos site:youtube.com/watch"
        res3 = app.search(q3, limit=4)
        if hasattr(res3, "web") and res3.web:
            for item in res3.web:
                u = getattr(item, "url", "")
                t = getattr(item, "title", "")
                s = getattr(item, "description", "")
                web_results.append({"query": "youtube_videos", "title": t, "url": u, "snippet": s})
                if "youtube.com/watch" in u or "youtu.be/" in u:
                    discovered_videos.append({"platform": "YouTube", "url": u, "title": t})

        # Query 4: Real Instagram Reels & Posts
        q4 = f"{creator_name} instagram reels site:instagram.com/reel"
        res4 = app.search(q4, limit=3)
        if hasattr(res4, "web") and res4.web:
            for item in res4.web:
                u = getattr(item, "url", "")
                t = getattr(item, "title", "")
                s = getattr(item, "description", "")
                web_results.append({"query": "instagram_reels", "title": t, "url": u, "snippet": s})
                if "instagram.com/reel" in u or "instagram.com/p/" in u:
                    discovered_videos.append({"platform": "Instagram", "url": u, "title": t})

    except Exception as e:
        print(f"[intelligence] Firecrawl search notice: {e}")

    return web_results, discovered_videos


def _format_research(raw_results: list[dict], discovered_videos: list[dict]) -> tuple[str, str]:
    """Formats Firecrawl snippets and discovered video links for LLM prompts."""
    snippets = []
    for r in raw_results:
        snippets.append(f"- [{r.get('title', '')}]({r.get('url', '')}): {r.get('snippet', '')}")
    research_text = "\n".join(snippets) if snippets else "No direct web results found."

    vid_lines = []
    for v in discovered_videos:
        vid_lines.append(f"- [{v.get('platform')}] {v.get('title')}: {v.get('url')}")
    videos_text = "\n".join(vid_lines) if vid_lines else "No specific video links discovered."

    return research_text, videos_text


# ─────────────────────────────────────────────────
#  MAIN INTELLIGENCE FUNCTION
# ─────────────────────────────────────────────────

def generate_creator_intelligence(creator_name: str, niche: str = "") -> dict:
    """
    Full intelligence pipeline with CreatorDB feature improvisation:
      1. Firecrawl web recon across accounts, trends, YouTube videos, and Instagram Reels
      2. Groq Call A → Profile, Cross-Platform Metrics (YouTube & IG), Demographics, Rate Card
      3. Groq Call B → Top Trending Reference Videos (Playable on screen) + Competitor Benchmarking
      4. Groq Call C → Content Suggestions (4 ideas x 4 hooks)
      5. Merge and return as single comprehensive intelligence suite
    """
    # Step 1 — Web recon
    raw_results, discovered_videos = search_creator_footprint(creator_name, niche)
    research_text, videos_text = _format_research(raw_results, discovered_videos)

    import time

    base_context = (
        f"Creator Name: {creator_name}\n"
        f"Niche/Focus: {niche if niche else 'auto-detect from research'}\n\n"
        f"Live Web Research:\n{research_text[:800]}"
    )

    # Use /no_think token to prevent Qwen3 hidden CoT overhead
    prompt_a = f"{base_context}\n\n/no_think"

    prompt_b = (
        f"Creator Name: {creator_name}\n"
        f"Niche/Focus: {niche if niche else 'auto-detect'}\n\n"
        f"Discovered Video Links:\n{videos_text}\n\n"
        f"/no_think"
    )

    prompt_c = (
        f"Creator Name: {creator_name}\n"
        f"Niche/Focus: {niche if niche else 'auto-detect'}\n\n"
        f"/no_think"
    )

    # Step 2 — Call A: Profile, Platform Metrics, Audience, Rate Card, Competitors
    part_a = ask_json(_SYS_A, prompt_a, MODEL_SMART, temperature=0.3, max_tokens=1100)
    time.sleep(2.0)

    # Step 3 — Call B: Trending Videos (Playable links & hooks)
    part_b = ask_json(_SYS_B, prompt_b, MODEL_SMART, temperature=0.4, max_tokens=1000)
    time.sleep(2.0)

    # Step 4 — Call C: Content Suggestions + Hooks
    part_c = ask_json(_SYS_C, prompt_c, MODEL_SMART, temperature=0.5, max_tokens=1000)

    # Step 5 — Merge all 3 modules
    result = {}
    result.update(part_a)
    result.update(part_b)
    result.update(part_c)

    # Ensure discovered video links are preserved as fallback if LLM omitted them
    if not result.get("trending_videos") and discovered_videos:
        fallback_vids = []
        for i, v in enumerate(discovered_videos[:4], start=1):
            fallback_vids.append({
                "id": i,
                "platform": v.get("platform", "YouTube"),
                "title": v.get("title", f"Video {i}"),
                "views": "Popular",
                "url": v.get("url", ""),
                "opening_hook": "High-energy introductory hook",
                "why_it_went_viral": "Strong curiosity gap and high retention pacing",
                "adapt_hook_template": "Use rapid-fire delivery in first 3 seconds"
            })
        result["trending_videos"] = fallback_vids

    return result
