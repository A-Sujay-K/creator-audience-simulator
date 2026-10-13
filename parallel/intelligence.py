"""
intelligence.py
---------------
Creator Intelligence Engine — the MAIN feature of Parallel for Creators.

Given a creator's name + optional niche:
  1. Searches their entire digital footprint using Firecrawl (social, YouTube, competitors)
  2. Synthesises a structured intelligence report via two Groq calls (to stay under token limit)
     - Call A: creator profile + trending landscape + competitor benchmarking
     - Call B: content suggestions with view estimates + 4 candidate hooks each

The two dicts are merged and returned as a single intelligence report.
"""

import os
import json
from dotenv import load_dotenv
from firecrawl import FirecrawlApp
from .llm import ask_json, MODEL_SMART

load_dotenv()

# ─────────────────────────────────────────────────
#  SYSTEM PROMPTS  (split so each fits ~1000 tokens)
# ─────────────────────────────────────────────────

_SYS_A = """You are a senior social media strategist.
Given a creator name, niche, and live web research snippets, return ONLY a valid JSON object with exactly these three keys:

{
  "creator_profile": {
    "name": "string",
    "core_niche": "string",
    "tone_and_style": "string",
    "audience_vibe": "string",
    "discovered_accounts": [
      {"platform": "YouTube|Instagram|X|Website|Other", "title": "string", "url": "string"}
    ]
  },
  "trending_landscape": {
    "current_trends_in_niche": ["trend1", "trend2", "trend3"],
    "what_audience_wants_now": "string"
  },
  "competitor_benchmarking": [
    {
      "competitor_name": "string",
      "recent_content_focus": "string",
      "their_strength": "string",
      "their_gap": "string",
      "how_to_beat_them": "string"
    }
  ]
}

Rules:
- discovered_accounts: list every platform link found in the research. Include 2-5 entries.
- competitor_benchmarking: list 2-3 real competitors in the creator's niche.
- Return ONLY valid JSON. No preamble, no markdown fences."""

_SYS_B = """You are a senior YouTube/Shorts growth engineer.
Given a creator name, niche, and live web research snippets, return ONLY a valid JSON object with exactly this key:

{
  "content_suggestions": [
    {
      "id": 1,
      "title": "string",
      "trending_topic": "string",
      "why_it_works": "string",
      "estimated_views": "string",
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
- Provide exactly 4 content suggestions (id: 1 to 4).
- estimated_views: realistic tier with emoji and range. Example: "🔥 1.2M - 2.5M (Viral Breakout)" or "📈 300K - 600K (Strong Core)".
- candidate_hooks: 4 punchy 3-second short-form hooks per suggestion, tailored for Indian 18-24 audience.
- Return ONLY valid JSON. No preamble, no markdown fences."""


# ─────────────────────────────────────────────────
#  FIRECRAWL SEARCH
# ─────────────────────────────────────────────────

def search_creator_footprint(creator_name: str, niche: str = "") -> list[dict]:
    """
    Uses Firecrawl to search the creator's online presence,
    social profiles, and competitor ecosystem. Returns a flat list
    of result snippets.
    """
    key = os.getenv("FIRECRAWL_API_KEY")
    web_results = []

    if not (key and key.strip() and not key.startswith("paste")):
        return web_results

    try:
        app = FirecrawlApp(api_key=key)

        # Query 1: Social accounts & platform presence
        q1 = f"{creator_name} content creator official social accounts youtube instagram"
        res1 = app.search(q1, limit=4)
        if hasattr(res1, "web") and res1.web:
            for item in res1.web:
                web_results.append({
                    "query": "accounts",
                    "title": getattr(item, "title", ""),
                    "url": getattr(item, "url", ""),
                    "snippet": getattr(item, "description", "")
                })

        # Query 2: Trends and competitors in the niche
        niche_term = niche if niche else "content creation"
        q2 = f"{creator_name} {niche_term} viral topics trending competitors alternatives"
        res2 = app.search(q2, limit=4)
        if hasattr(res2, "web") and res2.web:
            for item in res2.web:
                web_results.append({
                    "query": "trends_and_competitors",
                    "title": getattr(item, "title", ""),
                    "url": getattr(item, "url", ""),
                    "snippet": getattr(item, "description", "")
                })

    except Exception as e:
        print(f"[intelligence] Firecrawl search notice: {e}")

    return web_results


def _format_research(raw_results: list[dict]) -> str:
    """Formats Firecrawl snippets into a compact string for the LLM prompt."""
    if not raw_results:
        return "No direct web results found. Use general knowledge about this creator."
    lines = []
    for r in raw_results:
        lines.append(f"- [{r.get('title', '')}]({r.get('url', '')}): {r.get('snippet', '')}")
    return "\n".join(lines)


# ─────────────────────────────────────────────────
#  MAIN INTELLIGENCE FUNCTION
# ─────────────────────────────────────────────────

def generate_creator_intelligence(creator_name: str, niche: str = "") -> dict:
    """
    Full pipeline:
      1. Firecrawl web recon → structured snippets
      2. Groq Call A → creator_profile + trending_landscape + competitor_benchmarking
      3. Groq Call B → content_suggestions (with view estimates + 4 candidate hooks each)
      4. Merge and return as one dict

    Splitting into 2 calls keeps each under ~1000 output tokens,
    which fits comfortably within Groq's free-tier 8K TPM budget.
    """
    # Step 1 — Web recon
    raw_results = search_creator_footprint(creator_name, niche)
    research_text = _format_research(raw_results)

    base_context = (
        f"Creator Name: {creator_name}\n"
        f"Niche/Focus: {niche if niche else 'auto-detect from research'}\n\n"
        f"Live Web Research:\n{research_text}"
    )

    # Qwen3 has a hidden chain-of-thought phase that eats into max_tokens before
    # the actual JSON output. Appending '/no_think' to the user prompt tells the
    # model to skip thinking and go straight to the answer — freeing all tokens
    # for JSON output. This is an official Qwen3 instruction token.
    base_context_no_think = base_context + "\n\n/no_think"

    # Step 2 — Call A: Profile + Trends + Competitors
    part_a = ask_json(_SYS_A, base_context_no_think, MODEL_SMART, temperature=0.4, max_tokens=1500)

    # Step 3 — Call B: Content Suggestions + Hooks
    part_b = ask_json(_SYS_B, base_context_no_think, MODEL_SMART, temperature=0.6, max_tokens=1600)

    # Step 4 — Merge
    result = {}
    result.update(part_a)
    result.update(part_b)
    return result
