import random
from concurrent.futures import ThreadPoolExecutor
from .llm import ask_json, MODEL_FAST
from .schemas import PanelAnswer

SYSTEM = """You role-play ONE real viewer scrolling short videos. Stay in character.
Most openings get scrolled past; rate 4-5 only when this person would genuinely stop. Use the full 1-5 range.
Return ONLY JSON in the format the user message gives."""

def prompt(p, study):
    order = study.stimuli[:]
    random.Random(p.pid).shuffle(order) # kills position bias
    lines = "\n".join(f"{s.sid}: {s.text}" for s in order)
    return (f"You are {p.age_band}, from a {p.city_tier} city, into {p.interest}, scrolling about "
            f"{p.scroll_time} a day, and you are a {p.relationship.replace('_', ' ')} of this creator.\n"
            f"You see these {len(order)} {study.platform} openings:\n{lines}\n"
            'Return ONLY JSON: {"ratings":[{"sid":"S1","stop_scroll":1-5}, ...], "best":"S?", "worst":"S?", '
            '"felt_clickbait":true|false, "clickbait_sid":"S?" or null, "note":"one sentence"}')

def check(a, study):
    ids = {s.sid for s in study.stimuli}
    if {r.sid for r in a.ratings} != ids or a.best not in ids or a.worst not in ids:
        raise ValueError("answer does not match the stimuli")
    if a.felt_clickbait and a.clickbait_sid not in ids:
        raise ValueError("bad clickbait_sid")

def answer(p, study, tries=3):
    for _ in range(tries):
        try:
            a = PanelAnswer(**ask_json(SYSTEM, prompt(p, study), MODEL_FAST, max_tokens=700))
            check(a, study)
            return a
        except Exception:
            continue
    return None

def run_round(personas, study, workers=6):
    with ThreadPoolExecutor(workers) as ex:
        out = list(ex.map(lambda p: answer(p, study), personas))
    return [(p, a) for p, a in zip(personas, out) if a is not None]
