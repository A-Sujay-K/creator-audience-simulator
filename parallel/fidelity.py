import json
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge

HIST = Path("data/history.jsonl")
META = Path("data/meta.json")
FEATS = lambda t: [len(t.split()), int(any(c.isdigit() for c in t)), int("?" in t), int(" you" in t.lower())]

def spearman(a, b):
    return float(pd.Series(list(a)).rank().corr(pd.Series(list(b)).rank()))

def rank_fidelity(pred_mean: pd.Series, real: pd.DataFrame, n_boot=2000, seed=0):
    """pred_mean: index=sid. real: rows=respondents, columns=sid (1-5 ratings)."""
    sids = [s for s in pred_mean.index if s in real.columns]
    if not sids:
        return {"spearman": 0.0, "ci": (0.0, 0.0), "top_pick_match": False, "n_real": 0}
    p = pred_mean[sids].values
    point = spearman(p, real[sids].mean().values)
    rng = np.random.default_rng(seed)
    boots = []
    for _ in range(n_boot):
        s = real.sample(len(real), replace=True, random_state=int(rng.integers(1_000_000_000)))
        boots.append(spearman(p, s[sids].mean().values))
    lo, hi = np.nanpercentile(boots, [2.5, 97.5])
    return {"spearman": point, "ci": [float(lo), float(hi)], "n_real": len(real),
            "top_match": bool(sids[int(np.argmax(p))] == real[sids].mean().idxmax())}

def load_history():
    return [json.loads(l) for l in HIST.read_text().splitlines()] if HIST.exists() else []

def add_history(study, items, real_means):
    with open(HIST, "a") as f:
        for r in items.itertuples():
            if r.sid in real_means:
                f.write(json.dumps({"study": study.title, "sid": r.sid, "text": r.text,
                                    "synth": r.stop, "real": float(real_means[r.sid])}) + "\n")

def fit_calibrator(history, min_rows=16):
    if len(history) < min_rows: return None
    X = [[r["synth"], *FEATS(r["text"])] for r in history]
    return Ridge(alpha=5.0).fit(X, [r["real"] for r in history])

def with_scores(items, cal):
    items = items.copy()
    items["score"] = items["stop"] if cal is None else cal.predict([[r.stop, *FEATS(r.text)] for r in items.itertuples()])
    return items.sort_values("score", ascending=False).reset_index(drop=True)

def loso(history):
    studies = sorted({r["study"] for r in history})
    raw, cal_s = [], []
    if len(studies) < 3: return None
    for s in studies:
        tr = [r for r in history if r["study"] != s]
        te = [r for r in history if r["study"] == s]
        cal = fit_calibrator(tr)
        if cal is None: continue
        y = [r["real"] for r in te]
        raw.append(spearman([r["synth"] for r in te], y))
        cal_s.append(spearman(cal.predict([[r["synth"], *FEATS(r["text"])] for r in te]), y))
    return {"raw": float(np.nanmean(raw)), "calibrated": float(np.nanmean(cal_s))} if raw else None

def load_meta():
    return json.loads(META.read_text()) if META.exists() else {"studies": 0}

def close_the_loop(study, items, real):
    fid = rank_fidelity(items.set_index("sid")["score"], real)
    add_history(study, items, real[[s for s in items["sid"] if s in real.columns]].mean())
    m = load_meta()
    m.update(studies=m["studies"] + 1, last=fid)
    META.write_text(json.dumps(m, indent=2))
    return fid

def confidence(div, meta):
    if div["rating_std"] < 0.6 or div["best_entropy"] < 0.35:
        return "LOW", "Personas rate almost identically (diversity collapse)."
    last = meta.get("last")
    if not last: return "UNCALIBRATED", "No panel check yet for this audience. Treat the ranking as a hypothesis."
    if last["ci"][0] <= 0: return "LOW", "The last panel check could not be told apart from a random ranking."
    if last.get("n_real", 0) < 15: return "MODERATE", "Small panel, so the accuracy estimate is itself noisy."
    return "OK", "The ranking has agreed with real panels."
