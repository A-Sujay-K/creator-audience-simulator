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
MAX_RETRIES = 6

_RATE_LOCK = threading.Lock()
_last_call_ts = 0.0
_MIN_INTERVAL = 2.5  # Enforce ~24 RPM to stay safely under Groq's 30 RPM limit

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
            return json.loads(match.group(0))

        except Exception as e:
            err_str = str(e)
            if "429" in err_str or "rate limit" in err_str.lower():
                # Check if Groq tells us exactly how long to wait
                m = re.search(r"try again in ([\d\.]+)s", err_str)
                if m:
                    delay = float(m.group(1)) + 0.5  # add 0.5s buffer
                else:
                    delay = 5 * attempt
                
                print(f"[llm] Rate limit hit. Pausing perfectly for {delay:.1f}s to allow tokens to refill...")
                time.sleep(delay)
                continue
            raise  # other errors

    raise RuntimeError(f"Failed after {MAX_RETRIES} retries due to rate limiting.")
