import random
from concurrent.futures import ThreadPoolExecutor
from .llm import ask_json, MODEL_FAST
from .schemas import PanelAnswer

SYSTEM = """You role-play ONE real, impatient viewer scrolling short-form video feeds (Reels/Shorts/TikTok).
Stay strictly in character based on your age, city tier, and interests.
BE BRUTALLY REALISTIC AND SKEPTICAL:
- Real humans swipe past 80%+ of hooks within 1.5 seconds.
- 1 (Instant Scroll): Boring, predictable, cringe, cliché, or slow.
- 2 (Likely Scroll): Mild curiosity but not enough to stay; seen it before.
- 3 (Average / Neutral): Passable, might give it 2-3 seconds before swiping.
- 4 (Strong Hook): Genuinely pattern-interrupting; compelling stakes or curiosity.
- 5 (Elite Viral Hook): Irresistible scroll-stopper; impossible to swipe past.
STRICT SCORING DISTRIBUTION (ANTI-SYCOPHANCY):
- Never rate everything 3 or 4. Avoid polite inflation.
- At most ONE opening can receive a score of 4 or 5 across all stimuli. If none are truly compelling, your highest rating MUST be 3 or below.
- Flag clickbait ruthlessly if the hook feels manipulative without genuine substance.
Return ONLY valid JSON matching the user schema."""

def prompt(p, study):
    order = study.stimuli[:]
    random.Random(p.pid).shuffle(order) # kills position bias
    lines = "\n".join(f"{s.sid}: \"{s.text}\"" for s in order)
    return (
        f"VIEWER PROFILE:\n"
        f"You are {p.age_band} years old, living in a {p.city_tier} city, interested in {p.interest}, "
        f"scrolling about {p.scroll_time} a day on your phone while distracted.\n"
        f"Your relationship to this creator: {p.relationship.replace('_', ' ')}.\n\n"
        f"You are rapidly scrolling through your {study.platform} feed and see these {len(order)} candidate openings:\n"
        f"{lines}\n\n"
        f"Rate each opening ruthlessly. Would you actually stop scrolling for this?\n"
        'Return ONLY JSON: {"ratings":[{"sid":"S1","stop_scroll":1-5}, ...], "best":"S?", "worst":"S?", '
        '"felt_clickbait":true|false, "clickbait_sid":"S?" or null, "note":"one brutal, honest sentence on why"}'
    )

def check(a, study):
    ids = {s.sid for s in study.stimuli}
    if {r.sid for r in a.ratings} != ids or a.best not in ids or a.worst not in ids:
        raise ValueError("answer does not match the stimuli")
    if a.felt_clickbait and a.clickbait_sid not in ids:
        raise ValueError("bad clickbait_sid")

def answer(p, study, tries=3):
    for _ in range(tries):
        try:
            a = PanelAnswer(**ask_json(SYSTEM, prompt(p, study), MODEL_FAST, max_tokens=250))
            check(a, study)
            return a
        except Exception:
            continue
    return None

def run_round(personas, study, workers=4):
    with ThreadPoolExecutor(workers) as ex:
        out = list(ex.map(lambda p: answer(p, study), personas))
    return [(p, a) for p, a in zip(personas, out) if a is not None]
