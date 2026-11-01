"""
clone_intel.py
--------------
Content Creator Copying Tool — three modes:

  1. Style Replicator  → deconstructs creator's content DNA
  2. Blueprint Generator → deconstructs a specific video URL into a shooting script
  3. Niche Piracy Ideas → generates direct upgrade ideas from a competitor's top content

All calls use the existing parallel.llm infrastructure (Groq / Ollama, rate-limited).
"""

import re
import json
from .llm import ask_json, MODEL_SMART, MODEL_FAST


# ─────────────────────────────────────────────────
#  PROMPT 1: STYLE REPLICATOR
# ─────────────────────────────────────────────────

_SYS_STYLE = """You are a master content strategist who reverse-engineers viral creator formulas.
Given a creator name, their niche, and intel about their top content, return ONLY a valid JSON object:
{
  "style_dna": {
    "hook_formula": "string (exactly how they open every video, max 15 words)",
    "content_structure": "string (their repeatable 3-act structure, max 20 words)",
    "editing_rhythm": "string (pace, cuts per minute, transitions style, max 15 words)",
    "thumbnail_formula": "string (what every thumbnail has in common, max 15 words)",
    "cta_pattern": "string (how they end and retain, max 15 words)",
    "viral_trigger": "string (the ONE psychological trigger they always exploit, max 12 words)",
    "audience_contract": "string (what viewers always get when they click, max 15 words)"
  },
  "clone_roadmap": [
    {
      "step": 1,
      "action": "string (specific actionable step to replicate their style, max 20 words)",
      "why_it_works": "string (max 10 words)",
      "difficulty": "Easy | Medium | Hard"
    }
  ],
  "differentiation_angle": "string (how to clone their style but stand out, max 20 words)"
}
Rules:
- Be specific, not generic. 'High energy' is useless. 'Opens with a bet or dare in first 2 seconds' is good.
- clone_roadmap must have exactly 5 steps.
- Return ONLY valid JSON."""


def get_style_dna(creator_name: str, niche: str, creator_videos: list, niche_trending: list) -> dict:
    """Generate a creator's style DNA card for replication."""
    vids_text = "\n".join(
        f"  [{v.get('platform')}] {v.get('title')} — Hook: '{v.get('opening_hook', '')}'"
        for v in (creator_videos or [])[:4]
    )
    trend_text = "\n".join(
        f"  [{v.get('platform')}] {v.get('title')} — Why viral: '{v.get('why_it_went_viral', '')}'"
        for v in (niche_trending or [])[:3]
    )

    user_msg = (
        f"Creator: {creator_name}\n"
        f"Niche: {niche}\n\n"
        f"Their top content:\n{vids_text or 'Limited data available.'}\n\n"
        f"What is trending in their niche:\n{trend_text or 'See niche above.'}\n\n"
        "Produce the complete style DNA card and 5-step clone roadmap."
    )

    try:
        result = ask_json(_SYS_STYLE, user_msg, MODEL_SMART, max_tokens=900)
        return result if result else _fallback_style_dna(creator_name, niche)
    except Exception:
        return _fallback_style_dna(creator_name, niche)


def _fallback_style_dna(creator_name: str, niche: str) -> dict:
    return {
        "style_dna": {
            "hook_formula": f"Opens with an unexpected {niche} moment in first 2 seconds.",
            "content_structure": "Hook → Problem/Setup → Entertaining Resolution → CTA",
            "editing_rhythm": "Fast cuts every 1–2s, trending audio, dynamic zooms",
            "thumbnail_formula": "Bold face expression + high-contrast text + single focus object",
            "cta_pattern": "Comment challenge + subscribe reminder at emotional peak",
            "viral_trigger": "Curiosity gap + relatable frustration that demands resolution",
            "audience_contract": f"Entertaining, value-packed {niche} content every time"
        },
        "clone_roadmap": [
            {"step": 1, "action": "Study their last 10 videos and write down the first 5 words of each.", "why_it_works": "Reveals their hook formula pattern", "difficulty": "Easy"},
            {"step": 2, "action": "Clone their thumbnail layout with your own face and colors.", "why_it_works": "Captures click psychology without copying", "difficulty": "Easy"},
            {"step": 3, "action": "Match their average video length and edit pace for 4 weeks.", "why_it_works": "Trains your audience to the same attention rhythm", "difficulty": "Medium"},
            {"step": 4, "action": "Cover the same topics 48 hours before or after they do.", "why_it_works": "Captures search traffic while differentiated", "difficulty": "Medium"},
            {"step": 5, "action": "Introduce one unique segment they never do — make it your signature.", "why_it_works": "Clone base + original angle = viral differentiation", "difficulty": "Hard"},
        ],
        "differentiation_angle": f"Clone their {niche} formula but add a personal story angle they never use."
    }


# ─────────────────────────────────────────────────
#  PROMPT 2: BLUEPRINT GENERATOR (video deconstruct)
# ─────────────────────────────────────────────────

_SYS_BLUEPRINT = """You are a viral video director who deconstructs any video into a replicable shooting script.
Given a video title, URL, platform, and creator niche, return ONLY a valid JSON object:
{
  "video_breakdown": {
    "hook_segment": {
      "duration": "0–3 seconds",
      "what_happens": "string (exactly what you see/hear in the first 3 seconds, max 20 words)",
      "psychological_trigger": "string (curiosity/fear/desire/surprise/social proof, max 8 words)",
      "replicate_as": "string (how YOU would open a similar video, max 20 words)"
    },
    "build_segment": {
      "duration": "3–45 seconds",
      "structure": "string (how the middle builds tension or value, max 20 words)",
      "retention_technique": "string (what keeps viewers from leaving, max 15 words)",
      "replicate_as": "string (how YOU would structure your middle, max 20 words)"
    },
    "climax_segment": {
      "duration": "45s–end",
      "payoff": "string (what the viewer gets at the end, max 15 words)",
      "cta": "string (how they close and drive next action, max 15 words)",
      "replicate_as": "string (how YOU would close your version, max 20 words)"
    }
  },
  "shooting_script": [
    {
      "scene": 1,
      "shot_type": "Wide / Medium / Close / Extreme Close",
      "action": "string (what to film, max 15 words)",
      "dialogue_or_caption": "string (what to say or show on screen, max 15 words)",
      "duration_seconds": 3
    }
  ],
  "equipment_needed": ["string"],
  "estimated_production_hours": "string"
}
Rules:
- shooting_script must have 5–8 scenes covering the full video.
- Be practical and specific — a creator should be able to pick this up and film it today.
- Return ONLY valid JSON."""


def get_video_blueprint(video_title: str, video_url: str, platform: str, niche: str) -> dict:
    """Deconstruct a specific video into a replicable shooting script."""
    user_msg = (
        f"Video Title: {video_title}\n"
        f"URL: {video_url}\n"
        f"Platform: {platform}\n"
        f"Creator Niche: {niche}\n\n"
        "Produce the complete frame-by-frame breakdown and 5–8 scene shooting script."
    )
    try:
        result = ask_json(_SYS_BLUEPRINT, user_msg, MODEL_SMART, max_tokens=1000)
        return result if result else _fallback_blueprint(video_title, niche)
    except Exception:
        return _fallback_blueprint(video_title, niche)


def _fallback_blueprint(video_title: str, niche: str) -> dict:
    return {
        "video_breakdown": {
            "hook_segment": {
                "duration": "0–3 seconds",
                "what_happens": f"Shocking or unexpected visual from the climax of the {niche} video shown first.",
                "psychological_trigger": "Curiosity gap — shows end before beginning",
                "replicate_as": "Film your most dramatic moment first, then cut to the start."
            },
            "build_segment": {
                "duration": "3–45 seconds",
                "structure": "Setup the conflict or challenge, add mini-obstacles to delay resolution.",
                "retention_technique": "Open loops — promise the payoff but delay it with steps.",
                "replicate_as": "State the challenge clearly, then show 3 attempts before success."
            },
            "climax_segment": {
                "duration": "45s–end",
                "payoff": "The promised result is delivered with high energy and celebration.",
                "cta": "Subscribe to see what happens next + comment your result.",
                "replicate_as": "Deliver your result with reaction, then immediately tease the next video."
            }
        },
        "shooting_script": [
            {"scene": 1, "shot_type": "Extreme Close", "action": "Film the climax moment as a teaser opener.", "dialogue_or_caption": "Wait... did that actually work?", "duration_seconds": 3},
            {"scene": 2, "shot_type": "Medium", "action": "Cut to beginning — introduce yourself and the challenge.", "dialogue_or_caption": f"Today I am doing something insane in {niche}.", "duration_seconds": 5},
            {"scene": 3, "shot_type": "Wide", "action": "Show the setup / location / gear.", "dialogue_or_caption": "Here is everything I need to pull this off.", "duration_seconds": 6},
            {"scene": 4, "shot_type": "Close", "action": "Film the first attempt — show the problem.", "dialogue_or_caption": "First try did not go as planned.", "duration_seconds": 8},
            {"scene": 5, "shot_type": "Medium", "action": "Film the final successful attempt with reaction.", "dialogue_or_caption": "Let's go! That is exactly what I was talking about!", "duration_seconds": 8},
            {"scene": 6, "shot_type": "Close", "action": "Direct to camera CTA + subscribe reminder.", "dialogue_or_caption": "Comment below if you would try this.", "duration_seconds": 4},
        ],
        "equipment_needed": ["Smartphone or camera", "Tripod", "Ring light or natural light", "Lavalier mic"],
        "estimated_production_hours": "3–5 hours (shoot + edit)"
    }


# ─────────────────────────────────────────────────
#  PROMPT 3: NICHE PIRACY IDEAS
# ─────────────────────────────────────────────────

_SYS_PIRACY = """You are a viral content strategist who creates direct competitor upgrades.
Given a target creator, their niche, and their top performing content, return ONLY a valid JSON:
{
  "piracy_ideas": [
    {
      "id": 1,
      "competitor_did": "string (what the competitor made, max 12 words)",
      "your_upgrade_title": "string (your improved version title, max 12 words)",
      "why_yours_wins": "string (the specific upgrade that makes yours better, max 15 words)",
      "upgrade_angle": "More cinematic | More emotional | Faster paced | More relatable | Bigger stakes | Better data",
      "candidate_hooks": [
        {"sid": "S1", "text": "string (max 10 words)"},
        {"sid": "S2", "text": "string (max 10 words)"},
        {"sid": "S3", "text": "string (max 10 words)"},
        {"sid": "S4", "text": "string (max 10 words)"}
      ],
      "estimated_views": "string (e.g. 🔥 2M - 8M)"
    }
  ]
}
Rules:
- Generate exactly 5 piracy ideas.
- Each idea MUST be a specific, filmable upgrade — not a vague 'do it better'.
- The upgrade must be clearly differentiated from the original.
- Hooks must be punchy, scroll-stopping, under 10 words each.
- Return ONLY valid JSON."""


def get_piracy_ideas(competitor_name: str, niche: str, competitor_videos: list) -> dict:
    """Generate 5 direct content upgrade ideas from a competitor's top content."""
    vids_text = "\n".join(
        f"  [{v.get('platform')}] {v.get('title')} (Views: {v.get('views', 'Unknown')})"
        for v in (competitor_videos or [])[:5]
    )

    user_msg = (
        f"Competitor Creator: {competitor_name}\n"
        f"Their Niche: {niche}\n\n"
        f"Their top content:\n{vids_text or 'No specific videos available — use niche knowledge.'}\n\n"
        "Generate 5 direct upgrade ideas that are clearly better than what they made."
    )
    try:
        result = ask_json(_SYS_PIRACY, user_msg, MODEL_SMART, max_tokens=1100)
        if result and result.get("piracy_ideas"):
            return result
        return _fallback_piracy(competitor_name, niche)
    except Exception:
        return _fallback_piracy(competitor_name, niche)


def _fallback_piracy(competitor_name: str, niche: str) -> dict:
    ideas = []
    templates = [
        {
            "competitor_did": f"Basic {niche} tutorial video",
            "your_upgrade_title": f"I tried {niche} for 30 days — here is what happened",
            "why_yours_wins": "30-day transformation arc creates emotional investment missing in one-shot tutorials.",
            "upgrade_angle": "More emotional",
            "candidate_hooks": [
                {"sid": "S1", "text": f"30 days of {niche} changed my life completely."},
                {"sid": "S2", "text": f"Day 1 vs Day 30: the {niche} difference is insane."},
                {"sid": "S3", "text": f"Nobody tells you what {niche} does after a month."},
                {"sid": "S4", "text": f"I committed to {niche} daily. Here is the result."},
            ],
            "estimated_views": "🔥 1.5M - 4M"
        },
        {
            "competitor_did": f"Standard {niche} review or comparison",
            "your_upgrade_title": f"I challenged 3 experts in {niche} — only one was right",
            "why_yours_wins": "Expert disagreement creates dramatic tension that reviews lack.",
            "upgrade_angle": "Bigger stakes",
            "candidate_hooks": [
                {"sid": "S1", "text": f"Three {niche} experts gave completely different advice."},
                {"sid": "S2", "text": f"Only one expert was right about {niche}."},
                {"sid": "S3", "text": f"I tested every {niche} expert. One was lying."},
                {"sid": "S4", "text": f"Experts disagree on {niche}. I found the truth."},
            ],
            "estimated_views": "🔥 2M - 6M"
        },
        {
            "competitor_did": f"Solo {niche} vlog",
            "your_upgrade_title": f"I made a {niche} video with zero budget vs ₹50,000 budget",
            "why_yours_wins": "Budget contrast creates relatable vs aspirational tension simultaneously.",
            "upgrade_angle": "More relatable",
            "candidate_hooks": [
                {"sid": "S1", "text": f"₹0 vs ₹50,000 {niche} setup. You decide the winner."},
                {"sid": "S2", "text": f"I made a {niche} video with just my phone."},
                {"sid": "S3", "text": f"Zero budget {niche} vs professional setup — same result?"},
                {"sid": "S4", "text": f"Does budget actually matter in {niche}? I tested it."},
            ],
            "estimated_views": "🔥 1M - 3M"
        },
        {
            "competitor_did": f"Popular {niche} tip list",
            "your_upgrade_title": f"I disproved the most popular {niche} advice on the internet",
            "why_yours_wins": "Contrarian debunking triggers curiosity gap in existing fans of that advice.",
            "upgrade_angle": "Better data",
            "candidate_hooks": [
                {"sid": "S1", "text": f"The most popular {niche} advice is actually wrong."},
                {"sid": "S2", "text": f"I spent 3 months disproving viral {niche} tips."},
                {"sid": "S3", "text": f"Stop following this {niche} advice. Here is why."},
                {"sid": "S4", "text": f"Everyone is teaching {niche} wrong. I have proof."},
            ],
            "estimated_views": "🔥 2.5M - 7M"
        },
        {
            "competitor_did": f"Scripted {niche} content",
            "your_upgrade_title": f"I went completely unscripted in {niche} for a week",
            "why_yours_wins": "Raw authenticity creates emotional intimacy that scripted content cannot match.",
            "upgrade_angle": "More cinematic",
            "candidate_hooks": [
                {"sid": "S1", "text": f"No script. No plan. Just raw {niche} for 7 days."},
                {"sid": "S2", "text": f"What happens when you go unfiltered in {niche}?"},
                {"sid": "S3", "text": f"I deleted my script and filmed {niche} naturally."},
                {"sid": "S4", "text": f"Real {niche} content. No cuts. No retakes."},
            ],
            "estimated_views": "🔥 1.5M - 5M"
        },
    ]
    for i, t in enumerate(templates, 1):
        t["id"] = i
        ideas.append(t)
    return {"piracy_ideas": ideas}


# ─────────────────────────────────────────────────
#  FAST UNIFIED CLONE GENERATOR (Under 15 Seconds)
# ─────────────────────────────────────────────────

_SYS_UNIFIED_CLONE = """You are a viral creator cloning engineer.
Given a creator name, niche, and top uploads, return a single valid JSON object:
{
  "style_dna": {
    "hook_formula": "string (how they open videos, max 15 words)",
    "content_structure": "string (their 3-act flow, max 20 words)",
    "editing_rhythm": "string (cut frequency, audio, max 15 words)",
    "thumbnail_formula": "string (composition, face, text, max 15 words)",
    "cta_pattern": "string (retention CTA, max 15 words)",
    "viral_trigger": "string (core psychology trigger, max 12 words)",
    "audience_contract": "string (what viewers expect, max 15 words)"
  },
  "clone_roadmap": [
    {"step": 1, "action": "string (max 18 words)", "why_it_works": "string (max 10 words)", "difficulty": "Easy|Medium|Hard"},
    {"step": 2, "action": "string (max 18 words)", "why_it_works": "string (max 10 words)", "difficulty": "Easy|Medium|Hard"},
    {"step": 3, "action": "string (max 18 words)", "why_it_works": "string (max 10 words)", "difficulty": "Easy|Medium|Hard"},
    {"step": 4, "action": "string (max 18 words)", "why_it_works": "string (max 10 words)", "difficulty": "Easy|Medium|Hard"},
    {"step": 5, "action": "string (max 18 words)", "why_it_works": "string (max 10 words)", "difficulty": "Easy|Medium|Hard"}
  ],
  "differentiation_angle": "string (how to stand out from them, max 20 words)",
  "blueprint": {
    "title": "string (concept title)",
    "hook_segment": {"duration": "0-3s", "what_happens": "string", "trigger": "string", "your_version": "string"},
    "build_segment": {"duration": "3-45s", "structure": "string", "retention": "string", "your_version": "string"},
    "climax_segment": {"duration": "45s+", "payoff": "string", "cta": "string", "your_version": "string"},
    "shooting_script": [
      {"scene": 1, "shot_type": "Close", "action": "string", "dialogue": "string", "duration_seconds": 3},
      {"scene": 2, "shot_type": "Medium", "action": "string", "dialogue": "string", "duration_seconds": 5},
      {"scene": 3, "shot_type": "Wide", "action": "string", "dialogue": "string", "duration_seconds": 7},
      {"scene": 4, "shot_type": "Medium", "action": "string", "dialogue": "string", "duration_seconds": 8},
      {"scene": 5, "shot_type": "Close", "action": "string", "dialogue": "string", "duration_seconds": 4}
    ],
    "equipment": ["Camera/Phone", "Mic", "Tripod"],
    "production_time": "2-4 hours"
  },
  "piracy_ideas": [
    {
      "id": 1,
      "competitor_did": "string",
      "your_upgrade_title": "string",
      "why_yours_wins": "string",
      "upgrade_angle": "More cinematic | More emotional | Faster paced | More relatable | Bigger stakes",
      "candidate_hooks": [
        {"sid": "S1", "text": "string"},
        {"sid": "S2", "text": "string"}
      ],
      "estimated_views": "🔥 2M - 5M"
    },
    {
      "id": 2,
      "competitor_did": "string",
      "your_upgrade_title": "string",
      "why_yours_wins": "string",
      "upgrade_angle": "More relatable",
      "candidate_hooks": [
        {"sid": "S1", "text": "string"},
        {"sid": "S2", "text": "string"}
      ],
      "estimated_views": "🔥 3M - 8M"
    },
    {
      "id": 3,
      "competitor_did": "string",
      "your_upgrade_title": "string",
      "why_yours_wins": "string",
      "upgrade_angle": "Bigger stakes",
      "candidate_hooks": [
        {"sid": "S1", "text": "string"},
        {"sid": "S2", "text": "string"}
      ],
      "estimated_views": "🔥 1.5M - 4M"
    }
  ],
  "head_to_head": {
    "target_creator": "string (Creator A to copy)",
    "benchmark_creator": "string (Creator B to compare against)",
    "target_style_edge": "string (why Creator A holds audience retention better, max 15 words)",
    "benchmark_weakness": "string (where Creator B loses viewers or drops pacing, max 15 words)",
    "cloning_conversion_rule": "string (the exact rule to clone Creator A's mechanics to surpass Creator B, max 20 words)",
    "hook_contrast": {
      "creator_a_hook": "string (how Creator A opens this topic, max 12 words)",
      "creator_b_hook": "string (how Creator B opens this topic, max 12 words)",
      "winning_hybrid_hook": "string (the ultimate hook combining Creator A retention with Creator B topic, max 12 words)"
    }
  }
}
Return ONLY valid JSON."""



def _fallback_head_to_head(creator_a: str, creator_b: str, niche: str) -> dict:
    """Provides high-quality comparative cloning benchmarks when comparison creator is given."""
    return {
        "target_creator": creator_a,
        "benchmark_creator": creator_b,
        "target_style_edge": f"{creator_a} uses instant pattern interrupts and aggressive 0.8s micro-cuts that eliminate early drop-off.",
        "benchmark_weakness": f"{creator_b} tends to have a 5-10s conversational setup before delivering the core payoff.",
        "cloning_conversion_rule": f"Take {creator_b}'s relatable audience topics, but film and edit them using {creator_a}'s relentless high-velocity hook pacing.",
        "hook_contrast": {
            "creator_a_hook": f"Stop scrolling — what happens in the next 10 seconds will change how you view {niche}.",
            "creator_b_hook": f"Hey guys, today we are going to look into an interesting problem in {niche}.",
            "winning_hybrid_hook": f"Everyone watching {creator_b} gets this wrong. Here is {creator_a}'s formula tested."
        }
    }


def generate_unified_clone_dossier(creator_name: str, niche: str, creator_vids: list = None, niche_vids: list = None, comparison_creator: str = "") -> dict:
    """
    Produces complete Style DNA, Video Blueprint, and Piracy Ideas in a single lean fast call.
    Guarantees non-empty robust results via automatic fallback merge.
    """
    vids_text = "\n".join(
        f"  - [{v.get('platform', 'Video')}] {v.get('title', '')} (Hook: {v.get('opening_hook', '')})"
        for v in (creator_vids or [])[:4]
    )

    comp_prompt = ""
    if comparison_creator and comparison_creator.strip():
        comp_prompt = (
            f"\n\nHEAD-TO-HEAD COMPARISON TASK:\n"
            f"Target Creator to Clone (Creator A): {creator_name}\n"
            f"Benchmark / Comparison Creator (Creator B): {comparison_creator.strip()}\n"
            f"Compare {creator_name} directly against {comparison_creator.strip()}. Detail why Creator A wins on retention, "
            f"where Creator B loses audience, and produce a side-by-side hook contrast and winning hybrid hook.\n"
            f"You MUST include the 'head_to_head' object in your JSON response."
        )

    user_msg = (
        f"Creator Name: {creator_name}\n"
        f"Niche / Category: {niche}\n"
        f"Top Content Sample:\n{vids_text or 'Popular viral uploads in this niche.'}\n"
        f"{comp_prompt}\n"
        "Generate the complete cloning dossier now."
    )

    parsed = None
    try:
        # Lean token allocation for fast response
        parsed = ask_json(_SYS_UNIFIED_CLONE, user_msg, MODEL_SMART, max_tokens=1100)
    except Exception as e:
        print(f"[clone_intel] Fast unified call note: {e}")

    # Fallback baselines
    fb_style = _fallback_style_dna(creator_name, niche)
    first_title = creator_vids[0]["title"] if creator_vids else f"Top {niche} Video"
    fb_bp = _fallback_blueprint(first_title, niche)
    fb_piracy = _fallback_piracy(creator_name, niche)

    if not parsed or not isinstance(parsed, dict):
        return {
            "style_card": fb_style,
            "blueprints": [fb_bp],
            "piracy_ideas": fb_piracy.get("piracy_ideas", [])
        }

    # Style card
    style_dna = parsed.get("style_dna") or fb_style["style_dna"]
    clone_roadmap = parsed.get("clone_roadmap") or fb_style["clone_roadmap"]
    diff_angle = parsed.get("differentiation_angle") or fb_style["differentiation_angle"]

    style_card = {
        "style_dna": style_dna,
        "clone_roadmap": clone_roadmap,
        "differentiation_angle": diff_angle
    }

    # Blueprint
    raw_bp = parsed.get("blueprint") or {}
    source_v = creator_vids[0] if creator_vids else {"title": raw_bp.get("title", f"Signature {niche} Concept"), "url": "", "platform": "YouTube"}
    
    # Format blueprint so it matches what app.py expects
    blueprint_item = {
        "source_video": source_v,
        "video_breakdown": {
            "hook_segment": {
                "duration": raw_bp.get("hook_segment", {}).get("duration", "0–3s"),
                "what_happens": raw_bp.get("hook_segment", {}).get("what_happens", "High-energy pattern interrupt"),
                "psychological_trigger": raw_bp.get("hook_segment", {}).get("trigger", "Curiosity loop"),
                "replicate_as": raw_bp.get("hook_segment", {}).get("your_version", "Film unexpected climax first")
            },
            "build_segment": {
                "duration": raw_bp.get("build_segment", {}).get("duration", "3–45s"),
                "structure": raw_bp.get("build_segment", {}).get("structure", "Escalating stakes with mini obstacles"),
                "retention_technique": raw_bp.get("build_segment", {}).get("retention", "Open loop storytelling"),
                "replicate_as": raw_bp.get("build_segment", {}).get("your_version", "Add 3 attempts before success")
            },
            "climax_segment": {
                "duration": raw_bp.get("climax_segment", {}).get("duration", "45s+"),
                "payoff": raw_bp.get("climax_segment", {}).get("payoff", "High emotional payoff"),
                "cta": raw_bp.get("climax_segment", {}).get("cta", "Call to comment and follow"),
                "replicate_as": raw_bp.get("climax_segment", {}).get("your_version", "Deliver payoff then tease next video")
            }
        },
        "shooting_script": raw_bp.get("shooting_script") or fb_bp["shooting_script"],
        "equipment_needed": raw_bp.get("equipment") or fb_bp["equipment_needed"],
        "estimated_production_hours": raw_bp.get("production_time") or fb_bp["estimated_production_hours"]
    }

    # Piracy ideas
    piracy_ideas = parsed.get("piracy_ideas")
    if not piracy_ideas or len(piracy_ideas) < 2:
        piracy_ideas = fb_piracy.get("piracy_ideas", [])

    # Head to head comparison extraction
    h2h_data = None
    if comparison_creator and comparison_creator.strip():
        if parsed and isinstance(parsed, dict) and parsed.get("head_to_head"):
            h2h_data = parsed["head_to_head"]
        else:
            h2h_data = _fallback_head_to_head(creator_name, comparison_creator.strip(), niche)

    return {
        "style_card": style_card,
        "blueprints": [blueprint_item],
        "piracy_ideas": piracy_ideas,
        "head_to_head": h2h_data
    }

