from .llm import ask_json, MODEL_SMART
from .schemas import Study

SYSTEM = """From the creator's description return ONLY JSON:
{"title": str, "platform": "reels|shorts|youtube_title|product_pitch", "audience": str,
 "stimuli": [{"sid": "S1", "text": "..."}, ...]}
Use the creator's own candidate lines verbatim, in order. If they gave none, write 8 varied candidates
(question, number, story, contrarian, how-to, curiosity gap, direct address, plain statement)."""

def compile_study(text: str) -> Study:
    return Study(**ask_json(SYSTEM, text, MODEL_SMART, temperature=0.4, max_tokens=900))
