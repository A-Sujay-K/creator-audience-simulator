"""
suggestions.py
--------------
Intelligent spell-correction and fuzzy matching for creator names.

Combines:
  1. A rich catalog of top global & Indian creators across niches
  2. Dynamically loaded past searches from user profiles in data/profiles/
  3. Fuzzy substring, token similarity, and difflib matching
  4. Ultra-fast LLM spelling auto-resolver for obscure or heavily misspelled names
"""

import difflib
import re
from pathlib import Path
import json
from typing import Optional

# ─────────────────────────────────────────────────────────────────────────────
#  CURATED POPULAR CREATOR CATALOG (Name, Niche, Aliases)
# ─────────────────────────────────────────────────────────────────────────────

POPULAR_CREATORS = [
    # Moto & Travel
    {"name": "Aakash Dhawan the_incredigrapher", "niche": "Motorcycles, Travel & Moto-vlogging", "aliases": ["aakash dhawan", "incredigrapher", "the incredigrapher", "the_incredigrapher", "aakash"]},
    {"name": "Mumbiker Nikhil", "niche": "Motorcycles, Travel & Moto-vlogging", "aliases": ["nikhil", "mumbiker", "mumbaiker nikhil"]},
    {"name": "RideWithMridul", "niche": "Motorcycles, Travel & Moto-vlogging", "aliases": ["mridul madhok", "ride with mridul", "mridul"]},
    {"name": "ThrottleThings", "niche": "Motorcycles, Travel & Moto-vlogging", "aliases": ["throttle things", "rahul sharma"]},
    {"name": "Jatt Prabhjot", "niche": "Motorcycles, Travel & Moto-vlogging", "aliases": ["prabhjot", "jatt", "jattprabhjot"]},
    {"name": "Sourav Joshi Vlogs", "niche": "Travel & Daily Vlogging", "aliases": ["sourav joshi", "sourav", "joshi vlogs"]},
    {"name": "Flying Beast", "niche": "Fitness, Aviation & Family Vlogging", "aliases": ["gaurav taneja", "taneja", "flying beast 320"]},

    # Comedy, Roasts & Sketches
    {"name": "CarryMinati", "niche": "Comedy, Sketches & Roast Shorts", "aliases": ["carry", "ajey nagar", "caryminati", "carry minati", "karyminati"]},
    {"name": "Ashish Chanchlani", "niche": "Comedy, Sketches & Roast Shorts", "aliases": ["ashish", "ashis chanchlani", "ashish chanchlani vines", "acv"]},
    {"name": "Bhuvan Bam (BB Ki Vines)", "niche": "Comedy, Sketches & Roast Shorts", "aliases": ["bb ki vines", "bhuvan", "bbkivines", "bhuvan bam"]},
    {"name": "Triggered Insaan", "niche": "Comedy, Roasts & Commentary", "aliases": ["nishchay malhan", "triggered", "triggeredinsaan", "live insaan"]},
    {"name": "Fukra Insaan", "niche": "Challenges & Entertainment", "aliases": ["abhishek malhan", "fukra", "fukrainsaan"]},
    {"name": "Tanmay Bhat", "niche": "Comedy, Reactions & Finance", "aliases": ["tanmay", "bhat", "tanmay bhat reactions"]},
    {"name": "Zakir Khan", "niche": "Stand-up Comedy & Storytelling", "aliases": ["zakir", "sakht launda", "zakirkhan"]},
    {"name": "Slayy Point", "niche": "Comedy & Internet Culture Commentary", "aliases": ["slayypoint", "abhyudaya", "gautami"]},
    {"name": "Round2Hell", "niche": "Comedy & Big Budget Sketches", "aliases": ["r2h", "round 2 hell", "round two hell", "nazim", "wasim", "zayan"]},

    # Global Entertainment & Engineering
    {"name": "MrBeast", "niche": "High-Stakes Challenges & Philanthropy", "aliases": ["mr beast", "jimmy donaldson", "mrbist", "mister beast", "mrbeast6000"]},
    {"name": "Mark Rober", "niche": "Engineering & Science Spectacle", "aliases": ["mark robber", "rober", "glitterbomb"]},
    {"name": "Ryan Trahan", "niche": "Penny Survival & Travel Challenges", "aliases": ["ryan", "trahan", "trahn", "penny challenge"]},
    {"name": "Veritasium", "niche": "Science, Physics & Education", "aliases": ["derek muller", "veritasam", "veritas"]},
    {"name": "Dude Perfect", "niche": "Trick Shots & Sports Entertainment", "aliases": ["dudeperfect", "trick shots"]},
    {"name": "PewDiePie", "niche": "Gaming & Internet Culture", "aliases": ["felix", "pewdie", "pewdipie", "pewds"]},

    # Tech Reviews & Gadgets
    {"name": "Marques Brownlee (MKBHD)", "niche": "Tech Reviews & Consumer Gadgets", "aliases": ["mkbhd", "marques", "marquez", "brownlee", "marques brownley"]},
    {"name": "Technical Guruji", "niche": "Tech Reviews & Consumer Gadgets", "aliases": ["gaurav chaudhary", "technical guruji", "guruji tech"]},
    {"name": "Trakin Tech", "niche": "Smartphone Reviews & Buying Guides", "aliases": ["trakintech", "ershad", "trakin"]},
    {"name": "Geekyranjit", "niche": "Detailed Gadget Reviews", "aliases": ["ranjit", "geeky ranjit", "geeky"]},
    {"name": "Tech Burner", "niche": "Consumer Tech & Fun Unboxings", "aliases": ["shlok srivastava", "techburner", "burner"]},
    {"name": "Dave2D", "niche": "Laptop & Mobile Tech Reviews", "aliases": ["dave lee", "dave2d", "dave 2d"]},
    {"name": "Linus Tech Tips", "niche": "PC Hardware & Tech Experiments", "aliases": ["ltt", "linus", "linus sebastian"]},

    # Fitness & Bodybuilding
    {"name": "Sam Sulek", "niche": "Fitness, Health & Bodybuilding", "aliases": ["sam sulak", "sulek", "sam sulek bulk"]},
    {"name": "Andrew Huberman (Huberman Lab)", "niche": "Neuroscience, Health & Protocols", "aliases": ["huberman", "huberman lab", "dr andrew huberman"]},
    {"name": "Tarun Gill", "niche": "Bodybuilding & Fitness Supplement Reviews", "aliases": ["tarun", "gill", "tarungill"]},
    {"name": "Nikhil Fit (FitMuscle TV)", "niche": "Home Workouts & Transformations", "aliases": ["fitmuscle", "nikhil fit", "fit muscle tv"]},
    {"name": "Jeet Selal", "niche": "Natural Bodybuilding & Nutrition", "aliases": ["jeet selal aesthetics", "jeet selal"]},
    {"name": "Jeff Nippard", "niche": "Science-Based Lifting & Hypertrophy", "aliases": ["nippard", "jeff", "science based lifting"]},

    # Gaming & Esports
    {"name": "Scout (Tanmay Singh)", "niche": "Gaming & Esports Commentary", "aliases": ["scoutop", "scout op", "tanmay singh scout"]},
    {"name": "Mortal (Naman Mathur)", "niche": "Gaming, BGMI & Vlogs", "aliases": ["mortal", "naman mathur", "soul mortal"]},
    {"name": "Total Gaming (Ajju Bhai)", "niche": "Free Fire & Mobile Gaming", "aliases": ["ajjubhai", "total gaming", "ajju bhai"]},
    {"name": "Techno Gamerz", "niche": "GTA V, Minecraft & Story Gaming", "aliases": ["ujjwai chaurasia", "techno gamerz", "technogamerz"]},

    # Podcasts, Commentary & Education
    {"name": "Dhruv Rathee", "niche": "Current Affairs, Analysis & Education", "aliases": ["dhruv", "rathi", "dhruv rathi"]},
    {"name": "BeerBiceps (Ranveer Allahbadia)", "niche": "Podcasts, Self-Improvement & Spirituality", "aliases": ["ranveer", "beerbiceps", "ranveer allahbadia", "trs"]},
    {"name": "Ali Abdaal", "niche": "Productivity, Learning & Business", "aliases": ["ali abdal", "abdaal", "productivity"]},
    {"name": "Iman Gadzhi", "niche": "Agency Business & Entrepreneurship", "aliases": ["iman", "gadzhi", "iman ghadzi"]},
    {"name": "Pranjal Kamra (Finology)", "niche": "Personal Finance & Stock Market", "aliases": ["pranjal", "finology", "pranjal kamra"]},
    {"name": "CA Rachana Ranade", "niche": "Stock Market & Financial Literacy", "aliases": ["rachana ranade", "rachana"]},

    # Photography & Filmmaking
    {"name": "Peter McKinnon", "niche": "Cinematic Filmmaking & Visual Storytelling", "aliases": ["peter mackinnon", "mckinnon", "petermckinnon"]},
    {"name": "PiXimperfect (Unmesh Dinda)", "niche": "Photoshop, Editing & Retouching", "aliases": ["unmesh dinda", "piximperfect", "pix imperfect"]},
    {"name": "Casey Neistat", "niche": "Cinematic Vlogging & Storytelling", "aliases": ["casey", "neistat", "caseyneistat"]},
    {"name": "Komal Pandey", "niche": "Fashion, Styling & Grooming", "aliases": ["komal", "pandey", "komalpandey"]},
    {"name": "Trevor James (Food Ranger)", "niche": "Food Reviews & Culinary Travel", "aliases": ["food ranger", "trevor james", "the food ranger"]},
    {"name": "Nikunj Vasoya", "niche": "Street Food Reviews & Culinary Travel", "aliases": ["indian food ranger", "nikunj vasoya"]}
]


# ─────────────────────────────────────────────────────────────────────────────
#  DYNAMIC CREATOR POOL LOADER
# ─────────────────────────────────────────────────────────────────────────────

def get_all_candidate_creators() -> list[dict]:
    """Combines curated creators with past searched creators across profiles."""
    candidates = list(POPULAR_CREATORS)
    seen_names = {c["name"].lower() for c in candidates}

    # Load from saved profiles
    p_dir = Path("data/profiles")
    if p_dir.exists():
        for f in p_dir.glob("*.json"):
            try:
                data = json.loads(f.read_text(encoding="utf-8"))
                for s in data.get("searches", []):
                    c_name = s.get("creator_name", "").strip()
                    if c_name and c_name.lower() not in seen_names:
                        seen_names.add(c_name.lower())
                        candidates.append({
                            "name": c_name,
                            "niche": s.get("niche", "Digital Content"),
                            "aliases": [c_name.lower()]
                        })
            except Exception:
                pass

    return candidates


# ─────────────────────────────────────────────────────────────────────────────
#  FUZZY SIMILARITY SCORER
# ─────────────────────────────────────────────────────────────────────────────

def _calculate_match_score(query: str, item: dict) -> float:
    """Computes a match score from 0.0 to 1.0 based on name and aliases."""
    q = query.lower().strip()
    name = item["name"].lower()

    # Exact match gets maximum score
    if q == name:
        return 1.0

    # Prefix match
    if name.startswith(q) or q.startswith(name):
        return 0.95

    # Substring in name
    if q in name:
        return 0.90

    # Alias check
    for a in item.get("aliases", []):
        al = a.lower()
        if q == al:
            return 0.98
        if q in al or al in q:
            return 0.88

    # Word-by-word token overlap
    q_words = set(re.findall(r"\w+", q))
    name_words = set(re.findall(r"\w+", name))
    if q_words and q_words.intersection(name_words):
        overlap = len(q_words.intersection(name_words)) / max(len(q_words), 1)
        if overlap >= 0.5:
            return 0.75 + (overlap * 0.15)

    # SequenceMatcher difflib ratio against name
    ratio_name = difflib.SequenceMatcher(None, q, name).ratio()

    # Best ratio against any alias
    max_alias_ratio = 0.0
    for a in item.get("aliases", []):
        r = difflib.SequenceMatcher(None, q, a.lower()).ratio()
        if r > max_alias_ratio:
            max_alias_ratio = r

    return max(ratio_name, max_alias_ratio)


# ─────────────────────────────────────────────────────────────────────────────
#  PUBLIC API: FIND SIMILAR CREATORS
# ─────────────────────────────────────────────────────────────────────────────

def find_similar_creators(query: str, min_score: float = 0.45, limit: int = 5) -> list[dict]:
    """
    Given a user's search query (potentially misspelled), returns the top
    closest matching creators along with their match confidence.
    """
    q = query.strip()
    if not q or len(q) < 2:
        return []

    candidates = get_all_candidate_creators()
    scored = []

    for item in candidates:
        score = _calculate_match_score(q, item)
        if score >= min_score:
            scored.append({
                "name": item["name"],
                "niche": item["niche"],
                "score": round(score, 3),
                "is_exact": (q.lower() == item["name"].lower())
            })

    # Sort by descending score
    scored.sort(key=lambda x: x["score"], reverse=True)

    # Deduplicate by creator name
    seen = set()
    dedup = []
    for item in scored:
        if item["name"] not in seen:
            seen.add(item["name"])
            dedup.append(item)
            if len(dedup) >= limit:
                break

    return dedup


# ─────────────────────────────────────────────────────────────────────────────
#  OPTIONAL LLM SPELL-CORRECTION FOR RARE / UNCATALOGED CREATORS
# ─────────────────────────────────────────────────────────────────────────────

def resolve_misspelled_creator_with_llm(query: str) -> list[dict]:
    """
    If local catalog gives low confidence (<0.65), calls fast LLM to identify
    who the user most likely meant.
    """
    q = query.strip()
    if not q or len(q) < 3:
        return []

    from .llm import ask_json, MODEL_FAST

    sys_prompt = """You are a global social media encyclopedia.
The user typed a creator or channel name that might be misspelled or phonetically written.
Identify up to 3 most likely real content creators, YouTubers, or Instagrammers they are referring to.
Return ONLY valid JSON in this schema:
{
  "suggestions": [
    {"name": "Correct Creator Name", "niche": "Their primary niche / content topic"}
  ]
}
If the query is completely unintelligible or not a person/creator, return {"suggestions": []}."""

    user_prompt = f"User typed: '{q}'\nWho did they most likely mean?"

    try:
        res = ask_json(sys_prompt, user_prompt, MODEL_FAST, max_tokens=180)
        suggs = res.get("suggestions", [])
        return [{"name": s.get("name"), "niche": s.get("niche", "Digital Content"), "score": 0.85, "is_exact": False} for s in suggs if s.get("name")]
    except Exception:
        return []
