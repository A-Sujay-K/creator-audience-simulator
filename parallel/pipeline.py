from .compiler import compile_study
from .society import build_society
from .personas import run_round
from .analysis import ratings_df, item_table, segment_view, diversity, bias_flags
from .fidelity import load_history, fit_calibrator, with_scores, load_meta, confidence

def run_study(text, n=150, seed=7):
    study = compile_study(text)
    pairs = run_round(build_society("config/society.yaml", n, seed), study)
    df = ratings_df(pairs)
    items = with_scores(item_table(df, study), fit_calibrator(load_history()))
    div = diversity(df, len(study.stimuli))
    return {"study": study, "df": df, "items": items, "segments": segment_view(df), "diversity": div,
            "bias": bias_flags(df), "dropped": n - len(pairs), "confidence": confidence(div, load_meta())}

def brief_text(study):
    return ("Rate each opening 1-5 (1 = scroll past, 5 = definitely stop). Then pick your Best and Worst.\n"
            + "\n".join(f"{s.sid}: {s.text}" for s in study.stimuli))

def summary_text(res):
    label, why = res["confidence"]
    if label == "LOW": return f"Confidence: LOW. {why} No ranking published."
    return "\n".join([f"Confidence: {label}. {why}"] +
        [f"{r.sid} score {r.score:.2f}, clickbait flagged by {r.clickbait:.0%}: {r.text}" for r in res["items"].head(3).itertuples()])
