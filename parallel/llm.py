"""
llm.py
------
Thin wrapper around Groq API.

Two model tiers (set in .env):
  MODEL_FAST  – bulk persona simulation  (default: llama-3.1-8b-instant)
  MODEL_SMART – scenario compilation     (default: llama-3.3-70b-versatile)

Groq free tier: 30 requests/minute.
The function auto-retries on 429 (Rate Limit) errors with an exponential backoff.

Get your free API key at: https://console.groq.com/keys
"""

import json
import os
import re
import time
import threading

from dotenv import load_dotenv
from groq import Groq

load_dotenv()

MODEL_FAST  = os.getenv("MODEL_FAST",  "qwen/qwen3.8-27b")
MODEL_SMART = os.getenv("MODEL_SMART", "qwen/qwen3.8-27b")

_client = Groq(api_key=os.getenv("GROQ_API_KEY", "NOT_SET"))
MAX_RETRIES = 8

_RATE_LOCK = threading.Lock()
_last_call_ts = 0.0
_MIN_INTERVAL = 3.0  # Safe pacing to respect Groq free tier TPM & RPM

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
    max_tokens: int = 250,  # Lowered so Groq TPM limits aren't quickly exhausted
    no_think: bool = False,  # Reserved for future use; currently a no-op
) -> dict:
    """
    Call the Groq model and extract the first JSON object from its reply.
    """
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
                max_tokens=max_tokens,
            )
            raw = response.choices[0].message.content
            match = re.search(r"\{.*\}", raw, re.S)
            if not match:
                raise ValueError(f"No JSON found in model output: {raw[:200]}")
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
            if "429" in err_str or "rate limit" in err_str.lower():
                # Check if Groq tells us exactly how long to wait (e.g. 'try again in 12.5s' or 'try again in 1m2.5s')
                m = re.search(r"try again in (?:(\d+)m)?([\d\.]+)s", err_str, re.IGNORECASE)
                if m:
                    minutes = float(m.group(1)) if m.group(1) else 0.0
                    seconds = float(m.group(2)) if m.group(2) else 5.0
                    delay = minutes * 60.0 + seconds + 1.0  # add 1.0s buffer
                else:
                    delay = 6.0 * attempt
                
                print(f"[llm] Rate limit hit. Pausing perfectly for {delay:.1f}s to allow tokens to refill...")
                time.sleep(delay)
                continue
            raise  # other errors

    raise RuntimeError(f"Failed after {MAX_RETRIES} retries due to rate limiting.")
