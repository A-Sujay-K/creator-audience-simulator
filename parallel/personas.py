import random
from concurrent.futures import ThreadPoolExecutor
from .llm import ask_json, MODEL_FAST
from .schemas import PanelAnswer

ANCHOR_SID = "S_ANCHOR"
ANCHOR_TEXT = "Hey guys, welcome back to the channel, make sure to like and subscribe before we begin."

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

BATCH_SYSTEM = """You are an audience simulator evaluating how a panel of diverse short-form video viewers react to candidate openings.
Each viewer evaluates the candidate openings independently based on their age, city tier, attention span, and interests.
BE BRUTALLY REALISTIC AND SKEPTICAL:
- Real viewers swipe past 80%+ of hooks within 1.5 seconds.
- 1 (Instant Scroll): Boring, predictable, cliché, slow, or cringe.
- 2 (Likely Scroll): Mild curiosity but easily skippable.
- 3 (Average / Neutral): Passable, might give it 2-3 seconds before swiping.
- 4 (Strong Hook): Compelling stakes, genuine pattern interrupt.
- 5 (Elite Viral Hook): Irresistible scroll-stopper; impossible to swipe past.
DISTRIBUTION RULE: For any single persona, at most ONE opening can score 4 or 5. Most openings must score 1-3.
Return ONLY valid JSON matching this schema:
{
  "evaluations": [
    {
      "pid": "P0001",
      "ratings": [{"sid": "S1", "stop_scroll": 1-5}, ...],
      "best": "S?",
      "worst": "S?",
      "felt_clickbait": true|false,
      "clickbait_sid": "S?" or null,
      "note": "one brutal sentence"
    }
  ]
}"""

def _clean_anchor_evaluation(ev: dict, valid_sids: set[str]) -> dict:
    """Strips the calibration anchor and debiases ratings to ground purely on candidates."""
    ratings = ev.get("ratings", [])
    clean_ratings = [r for r in ratings if r.get("sid") in valid_sids]
    if clean_ratings:
        ev["ratings"] = clean_ratings
    
    if ev.get("best") not in valid_sids and clean_ratings:
        best_r = max(clean_ratings, key=lambda r: r.get("stop_scroll", 1))
        ev["best"] = best_r.get("sid")
        
    if ev.get("worst") not in valid_sids and clean_ratings:
        worst_r = min(clean_ratings, key=lambda r: r.get("stop_scroll", 5))
        ev["worst"] = worst_r.get("sid")
        
    if ev.get("felt_clickbait") and ev.get("clickbait_sid") not in valid_sids:
        ev["felt_clickbait"] = False
        ev["clickbait_sid"] = None
        
    return ev

def prompt(p, study):
    order = study.stimuli[:]
    random.Random(p.pid).shuffle(order) # kills position bias
    lines = "\n".join(f"{s.sid}: \"{s.text}\"" for s in order)
    lines += f"\n{ANCHOR_SID}: \"{ANCHOR_TEXT}\""
    return (
        f"VIEWER PROFILE:\n"
        f"You are {p.age_band} years old, living in a {p.city_tier} city, interested in {p.interest}, "
        f"scrolling about {p.scroll_time} a day on your phone while distracted.\n"
        f"Your relationship to this creator: {p.relationship.replace('_', ' ')}.\n\n"
        f"You are rapidly scrolling through your {study.platform} feed and see candidate openings:\n"
        f"{lines}\n\n"
        f"CALIBRATION ANCHOR:\n"
        f"{ANCHOR_SID} is a generic cliché filler opening. Real viewers swipe past it in 0.5s (MUST score 1).\n"
        f"Use {ANCHOR_SID} as your bottom floor baseline. Score all candidate openings relative to this.\n\n"
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
    valid_sids = {s.sid for s in study.stimuli}
    for _ in range(tries):
        try:
            raw = ask_json(SYSTEM, prompt(p, study), MODEL_FAST, max_tokens=250)
            cleaned = _clean_anchor_evaluation(raw, valid_sids)
            a = PanelAnswer(**cleaned)
            check(a, study)
            return a
        except Exception:
            continue
    return None

def answer_batch(persona_chunk: list, study, tries=2) -> dict[str, PanelAnswer]:
    """Evaluates a batch of personas in a single high-throughput LLM call with negative anchor debiasing."""
    if not persona_chunk:
        return {}

    valid_sids = {s.sid for s in study.stimuli}
    stim_lines = "\n".join(f"{s.sid}: \"{s.text}\"" for s in study.stimuli)
    stim_lines += f"\n{ANCHOR_SID}: \"{ANCHOR_TEXT}\""
    p_lines = [
        f"- [PID: {p.pid}] {p.age_band}yo, {p.city_tier} city, into {p.interest}, scrolls {p.scroll_time}/day, {p.relationship.replace('_', ' ')}."
        for p in persona_chunk
    ]
    user_prompt = (
        f"CANDIDATE OPENINGS ({study.platform}):\n{stim_lines}\n\n"
        f"CALIBRATION ANCHOR:\n"
        f"{ANCHOR_SID} is a generic filler opening. Real viewers swipe past it in 0.5s (MUST score 1).\n"
        f"Anchor your scoring floor at {ANCHOR_SID}. Score candidate openings relative to it.\n\n"
        f"AUDIENCE PANEL ({len(persona_chunk)} viewers):\n" + "\n".join(p_lines) + "\n\n"
        f"Provide independent, ruthless evaluations for ALL {len(persona_chunk)} viewers. Return ONLY valid JSON."
    )

    token_budget = min(4000, max(600, len(persona_chunk) * 190 + 350))

    for _ in range(tries):
        try:
            res = ask_json(BATCH_SYSTEM, user_prompt, MODEL_FAST, max_tokens=token_budget)
            evals = res.get("evaluations") or res.get("answers") or []
            results = {}
            for ev in evals:
                pid = ev.get("pid")
                if pid:
                    try:
                        clean_ev = _clean_anchor_evaluation(ev, valid_sids)
                        ans = PanelAnswer(**clean_ev)
                        check(ans, study)
                        results[pid] = ans
                    except Exception:
                        pass
            if len(results) >= len(persona_chunk) * 0.7:
                return results
        except Exception:
            continue
    return {}

def run_round(personas, study, workers=4):
    """
    High-throughput hybrid batch simulator:
    Batches personas into chunks of up to 15, evaluating all in 1-2 calls instead of N calls.
    Failsafe fallback evaluates any missing persona individually.
    """
    chunk_size = 15
    chunks = [personas[i:i + chunk_size] for i in range(0, len(personas), chunk_size)]

    all_answers: dict[str, PanelAnswer] = {}

    if len(chunks) == 1:
        # Fast path: 1 single LLM call for the entire audience
        all_answers.update(answer_batch(chunks[0], study))
    else:
        # Multi-chunk parallel execution
        with ThreadPoolExecutor(min(workers, len(chunks))) as ex:
            chunk_results = list(ex.map(lambda c: answer_batch(c, study), chunks))
        for cr in chunk_results:
            all_answers.update(cr)

    # Failsafe: identify any dropped personas and resolve individually
    missing_personas = [p for p in personas if p.pid not in all_answers]
    if missing_personas:
        with ThreadPoolExecutor(workers) as ex:
            fallback_answers = list(ex.map(lambda p: answer(p, study), missing_personas))
        for p, fa in zip(missing_personas, fallback_answers):
            if fa is not None:
                all_answers[p.pid] = fa

    return [(p, all_answers[p.pid]) for p in personas if p.pid in all_answers]
