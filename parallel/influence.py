"""
influence.py
------------
Measures the shift between private (round-1) and public (round-2) answers.

make_digest  – builds the "social signal" that round-2 sees
herding      – quantifies conformity, polarisation and likelihood shift

Interpretation guide
--------------------
switch_rate          : fraction who changed their decision at all
toward_majority      : fraction who switched *toward* the round-1 majority
                       (high → herding / conformity)
mean_likelihood_shift: average change in likelihood_pct
                       (positive → more confident after seeing peers)
spread_change        : Δ std-dev of likelihood_pct
                       (positive → polarisation, negative → convergence)
"""

import random
from collections import Counter

import numpy as np

from .schemas import Answer, Persona


def make_digest(
    pairs: list[tuple[Persona, Answer]],
    n_quotes: int = 3,
    seed: int = 0,
) -> str:
    """
    Summarise round-1 results into a short paragraph that round-2 personas see.

    Args:
        pairs:    (Persona, Answer) pairs from round 1.
        n_quotes: How many verbatim reason_detail snippets to include.
        seed:     Controls which quotes are sampled.

    Returns:
        A plain-English digest string.
    """
    n = len(pairs)
    if n == 0:
        return "No responses recorded yet."

    dec_counts = Counter(a.decision for _, a in pairs)
    reason_counts = Counter(a.main_reason for _, a in pairs if a.main_reason)

    shares = ", ".join(
        f"{k} {100 * v / n:.0f}%" for k, v in dec_counts.most_common()
    )
    top_reason = reason_counts.most_common(1)[0][0] if reason_counts else "none"

    quotes = [a.reason_detail for _, a in pairs if a.reason_detail.strip()]
    quotes = random.Random(seed).sample(quotes, min(n_quotes, len(quotes)))
    quote_str = " ".join(f'One person said: "{q}"' for q in quotes)

    return (
        f"Of {n} people posting so far: {shares}. "
        f"Top concern mentioned: {top_reason}. {quote_str}"
    )


def herding(
    r1: list[tuple[Persona, Answer]],
    r2: list[tuple[Persona, Answer]],
) -> dict:
    """
    Compare private (r1) and public (r2) answers for the same personas.

    Returns a dict with four metrics (see module docstring).
    """
    first = {p.pid: a for p, a in r1}
    both = [(first[p.pid], a) for p, a in r2 if p.pid in first]

    if not both:
        return {
            "switch_rate": None,
            "toward_majority": None,
            "mean_likelihood_shift": None,
            "spread_change": None,
            "n_paired": 0,
        }

    pre, post = zip(*both)
    majority = Counter(x.decision for x in pre).most_common(1)[0][0]

    switched = [x.decision != y.decision for x, y in both]
    toward = [
        x.decision != majority and y.decision == majority for x, y in both
    ]
    lshift = [y.likelihood_pct - x.likelihood_pct for x, y in both]

    return {
        "switch_rate": float(np.mean(switched)),
        "toward_majority": float(np.mean(toward)),
        "mean_likelihood_shift": float(np.mean(lshift)),
        "spread_change": float(
            np.std([y.likelihood_pct for y in post])
            - np.std([x.likelihood_pct for x in pre])
        ),
        "n_paired": len(both),
    }
