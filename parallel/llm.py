"""
llm.py
------
Thin wrapper around Groq API with automatic OTPM clamp and rate limit resilience.
"""

import json
import os
import re
import time
import threading

from dotenv import load_dotenv
from groq import Groq

load_dotenv()

MODEL_FAST  = os.getenv("MODEL_FAST",  "openai/gpt-oss-20b")
MODEL_SMART = os.getenv("MODEL_SMART", "openai/gpt-oss-120b")

_client = Groq(api_key=os.getenv("GROQ_API_KEY", "NOT_SET"))
MAX_RETRIES = 6

_RATE_LOCK = threading.Lock()
_last_call_ts = 0.0
_MIN_INTERVAL = 0.8

def _throttle():
    global _last_call_ts
    with _RATE_LOCK:
        wait = _MIN_INTERVAL - (time.time() - _last_call_ts)
        if wait > 0:
            time.sleep(wait)
        _last_call_ts = time.time()

def ask_json(
    system: str,
    user: str,
    model: str,
    temperature: float = 1.0,
    max_tokens: int = 250,
    no_think: bool = False,
) -> dict:
    """
    Call the Groq model and extract the first JSON object from its reply.
    Configures low reasoning effort for reasoning models to maximize speed and output budget.
    """
    cur_max_tokens = max_tokens
    extra_kwargs = {}
    if any(m in model.lower() for m in ["gpt-oss", "deepseek", "qwq"]):
        extra_kwargs["reasoning_effort"] = "low"

    for attempt in range(1, MAX_RETRIES + 1):
        _throttle()
        try:
            response = _client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user}
                ],
                temperature=temperature,
                max_tokens=cur_max_tokens,
                **extra_kwargs
            )
            raw = response.choices[0].message.content or ""
            finish_reason = getattr(response.choices[0], "finish_reason", "")

            # If response got truncated due to token limit, increase limit and retry
            if finish_reason == "length" and attempt < MAX_RETRIES:
                cur_max_tokens = min(3800, cur_max_tokens + 1000)
                print(f"[llm] Output truncated (finish_reason=length). Expanded max_tokens to {cur_max_tokens}. Retrying...")
                time.sleep(0.5)
                continue

            # Strip markdown code blocks if present
            cleaned = re.sub(r"^```(?:json)?\s*", "", raw.strip(), flags=re.IGNORECASE)
            cleaned = re.sub(r"\s*```$", "", cleaned.strip())

            match = re.search(r"\{.*\}", cleaned, re.S)
            if not match:
                raise ValueError(f"No JSON found in model output (len={len(raw)}): {raw[:200]}")
            raw_json = match.group(0)
            try:
                return json.loads(raw_json)
            except json.JSONDecodeError:
                # 1. Try auto-closing open brackets/braces if model truncated near the end
                repaired = raw_json.strip()
                repaired = re.sub(r",\s*([\]\}])", r"\1", repaired)  # strip trailing commas
                repaired = re.sub(r",\s*$", "", repaired)
                open_brackets = repaired.count("[") - repaired.count("]")
                open_braces = repaired.count("{") - repaired.count("}")
                repaired_candidate = repaired + ("]" * max(0, open_brackets)) + ("}" * max(0, open_braces))
                try:
                    return json.loads(repaired_candidate)
                except Exception:
                    pass

                # 2. Scan backwards to find the last position where outer braces are balanced
                depth = 0
                last_valid = -1
                for i, ch in enumerate(raw_json):
                    if ch == "{":
                        depth += 1
                    elif ch == "}":
                        depth -= 1
                        if depth == 0:
                            last_valid = i
                if last_valid > 0:
                    try:
                        return json.loads(raw_json[:last_valid + 1])
                    except json.JSONDecodeError:
                        pass
                raise ValueError(f"Could not parse JSON even after repair. Raw snippet: {raw_json[:300]}")

        except Exception as e:
            err_str = str(e)
            
            # Auto-handle OTPM output token limit error immediately
            if "reduce max_tokens" in err_str.lower() or "limit" in err_str.lower() and "otpm" in err_str.lower():
                m_lim = re.search(r"Limit\s+(\d+)", err_str, re.IGNORECASE)
                if m_lim:
                    cur_max_tokens = max(150, int(m_lim.group(1)) - 80)
                    print(f"[llm] Clamped max_tokens to {cur_max_tokens} due to model OTPM limit. Retrying immediately...")
                    time.sleep(1.0)
                    continue

            if "429" in err_str or "rate limit" in err_str.lower():
                m = re.search(r"try again in (?:(\d+)m)?([\d\.]+)s", err_str, re.IGNORECASE)
                if m:
                    minutes = float(m.group(1)) if m.group(1) else 0.0
                    seconds = float(m.group(2)) if m.group(2) else 5.0
                    delay = minutes * 60.0 + seconds + 0.5
                else:
                    delay = 3.0 * attempt
                
                print(f"[llm] Rate limit hit. Pausing for {delay:.1f}s to refill...")
                time.sleep(delay)
                continue
            raise

    raise RuntimeError(f"Failed after {MAX_RETRIES} retries due to rate limiting.")
