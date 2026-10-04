import numpy as np
import pandas as pd

def ratings_df(pairs):
    rows = []
    for p, a in pairs:
        for r in a.ratings:
            rows.append({**p.model_dump(), "sid": r.sid, "stop": r.stop_scroll,
                         "best": float(a.best == r.sid), "worst": float(a.worst == r.sid),
                         "clickbait": float(a.felt_clickbait and a.clickbait_sid == r.sid)})
    return pd.DataFrame(rows)

def item_table(df, study):
    text = {s.sid: s.text for s in study.stimuli}
    rows = []
    for sid, g in df.groupby("sid"):
        rows.append({"sid": sid, "text": text[sid],
                     **{c: float(np.average(g[c], weights=g["weight"])) for c in ["stop", "best", "worst", "clickbait"]}})
    return pd.DataFrame(rows).sort_values("stop", ascending=False).reset_index(drop=True)

def segment_view(df, by="relationship"):
    m = df.groupby([by, "sid"])["stop"].mean().unstack()
    return {"matrix": m.round(2), "top_item": m.idxmax(axis=1).to_dict(), "n": df.groupby(by)["pid"].nunique().to_dict()}

def diversity(df, n_items):
    best = df[df["best"] == 1].groupby("sid").size()
    p = (best / best.sum()).values
    ent = float(-(p * np.log(p)).sum() / np.log(n_items)) if len(p) > 1 else 0.0
    return {"best_entropy": ent, "rating_std": float(df.groupby("sid")["stop"].std().mean()),
            "modal_best_share": float(p.max())}

def bias_flags(df, min_n=20, gap=0.8):
    overall = df.groupby("sid")["stop"].mean()
    flags = []
    for col in ["relationship", "age_band", "city_tier", "interest", "scroll_time"]:
        for val, g in df.groupby(col):
            if g["pid"].nunique() < min_n: continue
            diff = (g.groupby("sid")["stop"].mean() - overall).abs()
            if diff.max() >= gap:
                flags.append(f"{col}={val}: {diff.idxmax()} differs by {diff.max():.1f} points from everyone")
    return flags
