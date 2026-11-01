import sys, json, time
sys.path.insert(0, r"c:\Users\asuja\Documents\antigravity\wise-darwin")
from dotenv import load_dotenv
load_dotenv(r"c:\Users\asuja\Documents\antigravity\wise-darwin\.env")
from parallel.llm import ask_json, MODEL_SMART

_SYS_UNIFIED_CLONE = """You are a master viral video strategist and creator cloning engineer.
Given a creator's name, their niche, and their top uploads, return a single complete JSON dossier to copy and beat them.
Schema:
{
  "style_dna": {
    "hook_formula": "string (how they open videos, max 15 words)",
    "content_structure": "string (their 3-act flow, max 20 words)",
    "editing_rhythm": "string (cut frequency, sound design, max 15 words)",
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
    "title": "string (title of concept to film)",
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
      "competitor_did": "string (their content)",
      "your_upgrade_title": "string (your improved title)",
      "why_yours_wins": "string (why yours gets more views)",
      "upgrade_angle": "More cinematic | More emotional | Faster paced | More relatable | Bigger stakes",
      "candidate_hooks": [
        {"sid": "S1", "text": "string"},
        {"sid": "S2", "text": "string"},
        {"sid": "S3", "text": "string"},
        {"sid": "S4", "text": "string"}
      ],
      "estimated_views": "🔥 2M - 5M"
    },
    {
      "id": 2,
      "competitor_did": "string (their content)",
      "your_upgrade_title": "string (your improved title)",
      "why_yours_wins": "string (why yours gets more views)",
      "upgrade_angle": "More relatable",
      "candidate_hooks": [
        {"sid": "S1", "text": "string"},
        {"sid": "S2", "text": "string"}
      ],
      "estimated_views": "🔥 3M - 8M"
    },
    {
      "id": 3,
      "competitor_did": "string (their content)",
      "your_upgrade_title": "string (your improved title)",
      "why_yours_wins": "string (why yours gets more views)",
      "upgrade_angle": "Bigger stakes",
      "candidate_hooks": [
        {"sid": "S1", "text": "string"},
        {"sid": "S2", "text": "string"}
      ],
      "estimated_views": "🔥 1.5M - 4M"
    }
  ]
}
Return ONLY valid JSON."""

t0 = time.time()
print("Starting unified clone call...")
res = ask_json(_SYS_UNIFIED_CLONE, "Creator: Aakash Dhawan\nNiche: Motorcycles & Moto-vlogging", MODEL_SMART, max_tokens=1400)
elapsed = time.time() - t0
print(f"Finished in {elapsed:.2f}s!")
print("Keys:", list(res.keys()))
print("Style DNA:", res.get("style_dna", {}).get("hook_formula"))
print("Blueprint script scenes:", len(res.get("blueprint", {}).get("shooting_script", [])))
print("Piracy ideas:", len(res.get("piracy_ideas", [])))
