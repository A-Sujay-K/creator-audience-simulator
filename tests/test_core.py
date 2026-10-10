"""
tests/test_core.py
------------------
Unit tests for the Creator Audience Simulator backend.

Run with:  pytest -v
"""

from pathlib import Path
import pandas as pd
import pytest

from parallel.schemas import Stimulus, Study, Persona, Rating, PanelAnswer
from parallel.society import build_society
from parallel.analysis import ratings_df, item_table, segment_view, diversity
from parallel.fidelity import spearman, rank_fidelity, fit_calibrator
from parallel.panel import load_panel

SOCIETY_PATH = Path(__file__).parent.parent / "config" / "society.yaml"


class TestSchemas:
    def test_study_renumbering(self):
        stimuli = [Stimulus(sid="custom1", text="Hook A"), Stimulus(sid="custom2", text="Hook B"), Stimulus(sid="custom3", text="Hook C")]
        study = Study(title="Test Study", platform="shorts", audience="students", stimuli=stimuli)
        assert len(study.stimuli) == 3
        assert study.stimuli[0].sid == "S1"
        assert study.stimuli[1].sid == "S2"
        assert study.stimuli[2].sid == "S3"

    def test_study_length_bounds(self):
        # Requires between 3 and 8 stimuli
        with pytest.raises(ValueError):
            Study(title="Bad", platform="shorts", audience="students", stimuli=[Stimulus(sid="S1", text="Only one")])

    def test_rating_bounds(self):
        with pytest.raises(ValueError):
            Rating(sid="S1", stop_scroll=6)  # Must be 1-5
        with pytest.raises(ValueError):
            Rating(sid="S1", stop_scroll=0)

    def test_panel_answer_clickbait_validation(self):
        ratings = [Rating(sid="S1", stop_scroll=3), Rating(sid="S2", stop_scroll=4), Rating(sid="S3", stop_scroll=2)]
        # If felt_clickbait is True, clickbait_sid must be provided
        with pytest.raises(ValueError):
            PanelAnswer(ratings=ratings, best="S2", worst="S3", felt_clickbait=True, clickbait_sid=None)

        valid = PanelAnswer(ratings=ratings, best="S2", worst="S3", felt_clickbait=True, clickbait_sid="S1")
        assert valid.felt_clickbait is True


class TestSociety:
    def test_build_society(self):
        personas = build_society(SOCIETY_PATH, n=20, seed=42)
        assert len(personas) == 20
        assert all(isinstance(p, Persona) for p in personas)
        assert personas[0].pid == "P0001"
        assert personas[0].age_band in ["18-20", "21-24", "25-30"]
        assert personas[0].city_tier in ["metro", "tier2", "tier3"]


class TestAnalysis:
    def test_ratings_aggregation(self):
        p1 = Persona(pid="P1", relationship="stranger", age_band="18-20", city_tier="metro", interest="tech", scroll_time="1-3h")
        p2 = Persona(pid="P2", relationship="superfan", age_band="21-24", city_tier="tier2", interest="comedy", scroll_time=">3h")
        
        a1 = PanelAnswer(
            ratings=[Rating(sid="S1", stop_scroll=5), Rating(sid="S2", stop_scroll=2), Rating(sid="S3", stop_scroll=3)],
            best="S1", worst="S2", felt_clickbait=False
        )
        a2 = PanelAnswer(
            ratings=[Rating(sid="S1", stop_scroll=4), Rating(sid="S2", stop_scroll=1), Rating(sid="S3", stop_scroll=3)],
            best="S1", worst="S2", felt_clickbait=True, clickbait_sid="S1"
        )

        study = Study(
            title="T", platform="shorts", audience="A",
            stimuli=[Stimulus(sid="S1", text="Hook 1"), Stimulus(sid="S2", text="Hook 2"), Stimulus(sid="S3", text="Hook 3")]
        )

        df = ratings_df([(p1, a1), (p2, a2)])
        items = item_table(df, study)

        assert len(items) == 3
        # S1 should have highest stop score (average 4.5)
        assert items.iloc[0]["sid"] == "S1"
        assert items.iloc[0]["stop"] == 4.5
        assert items.iloc[0]["clickbait"] == 0.5


class TestFidelity:
    def test_spearman(self):
        # Identical rankings -> correlation 1.0
        r = spearman([1, 2, 3, 4], [10, 20, 30, 40])
        assert pytest.approx(r, 0.01) == 1.0

        # Opposite rankings -> correlation -1.0
        r_neg = spearman([1, 2, 3, 4], [40, 30, 20, 10])
        assert pytest.approx(r_neg, 0.01) == -1.0

    def test_rank_fidelity_bootstrap(self):
        pred = pd.Series([5.0, 3.0, 1.0], index=["S1", "S2", "S3"])
        real = pd.DataFrame([
            {"S1": 5.0, "S2": 3.0, "S3": 1.0},
            {"S1": 4.0, "S2": 3.0, "S3": 2.0},
        ])
        fid = rank_fidelity(pred, real, n_boot=100)
        assert fid["top_match"] is True
        assert fid["spearman"] > 0.8
        assert fid["n_real"] == 2
