"""
tests/test_core.py
------------------
Unit tests for the Parallel backend.

These tests do NOT call the LLM. ask_json is replaced by a deterministic
fake wherever it would be called.

Run with:  pytest -v
"""

import json
from pathlib import Path
from unittest.mock import MagicMock, patch

import numpy as np
import pandas as pd
import pytest

from parallel.analysis import norm_entropy, paired_lift, wilson
from parallel.fidelity import apply_bias, close_the_loop
from parallel.schemas import Answer, Persona, Scenario
from parallel.society import build_society


# ---------------------------------------------------------------------------
# Helper fixtures
# ---------------------------------------------------------------------------

SOCIETY_PATH = Path(__file__).parent.parent / "config" / "society.yaml"


def _make_persona(pid="P0001", seg="freelancer") -> Persona:
    return Persona(
        pid=pid,
        segment=seg,
        city_tier="metro",
        income_band="25-60k",
        price_sensitivity="medium",
        tech_savvy="high",
        current_plan="pro",
    )


def _make_answer(decision="Accept", main_reason=None) -> Answer:
    return Answer(
        decision=decision,
        likelihood_pct=70,
        main_reason=main_reason,
        reason_detail="Seems fair to me.",
    )


# ---------------------------------------------------------------------------
# schemas.py
# ---------------------------------------------------------------------------

class TestAnswer:
    def test_valid_accept(self):
        a = Answer(decision="Accept", likelihood_pct=80)
        assert a.decision == "Accept"
        assert a.main_reason is None

    def test_reject_requires_reason(self):
        with pytest.raises(ValueError, match="main_reason"):
            Answer(decision="Reject", likelihood_pct=20)

    def test_downgrade_requires_reason(self):
        with pytest.raises(ValueError, match="main_reason"):
            Answer(decision="Downgrade", likelihood_pct=40)

    def test_reject_with_reason_ok(self):
        a = Answer(decision="Reject", likelihood_pct=10, main_reason="TooExpensive")
        assert a.main_reason == "TooExpensive"

    def test_likelihood_bounds(self):
        with pytest.raises(Exception):
            Answer(decision="Accept", likelihood_pct=101)
        with pytest.raises(Exception):
            Answer(decision="Accept", likelihood_pct=-1)


# ---------------------------------------------------------------------------
# society.py
# ---------------------------------------------------------------------------

class TestBuildSociety:
    def test_size_approximate(self):
        people = build_society(SOCIETY_PATH, 1000, seed=7)
        assert 950 <= len(people) <= 1050, "Society size should be near n"

    def test_segment_shares(self):
        people = build_society(SOCIETY_PATH, 1000, seed=7)
        segs = [p.segment for p in people]
        fl = segs.count("freelancer") / len(segs)
        sb = segs.count("small_business") / len(segs)
        assert abs(fl - 0.60) <= 0.03, f"Freelancer share {fl:.2f} outside ±3pp"
        assert abs(sb - 0.40) <= 0.03, f"SmallBusiness share {sb:.2f} outside ±3pp"

    def test_reproducible(self):
        p1 = build_society(SOCIETY_PATH, 100, seed=7)
        p2 = build_society(SOCIETY_PATH, 100, seed=7)
        assert [p.pid for p in p1] == [p.pid for p in p2]

    def test_different_seeds_differ(self):
        p1 = build_society(SOCIETY_PATH, 100, seed=7)
        p2 = build_society(SOCIETY_PATH, 100, seed=42)
        attrs1 = [(p.city_tier, p.income_band) for p in p1]
        attrs2 = [(p.city_tier, p.income_band) for p in p2]
        assert attrs1 != attrs2


# ---------------------------------------------------------------------------
# analysis.py
# ---------------------------------------------------------------------------

class TestNormEntropy:
    def test_uniform_is_zero(self):
        s = pd.Series(["Accept", "Accept", "Accept"])
        assert norm_entropy(s) == pytest.approx(0.0, abs=1e-6)

    def test_even_spread_near_one(self):
        s = pd.Series(["Accept", "Downgrade", "Reject", "Undecided"])
        assert norm_entropy(s) == pytest.approx(1.0, abs=0.01)

    def test_partial_spread(self):
        s = pd.Series(["Accept"] * 3 + ["Reject"] * 1)
        e = norm_entropy(s)
        assert 0 < e < 1


class TestWilson:
    def test_wide_interval_small_sample(self):
        lo, hi = wilson(3, 6)
        assert lo < 0.25, f"Expected lo < 0.25, got {lo:.3f}"
        assert hi > 0.75, f"Expected hi > 0.75, got {hi:.3f}"

    def test_zero_n_returns_full_interval(self):
        lo, hi = wilson(0, 0)
        assert lo == 0.0 and hi == 1.0

    def test_interval_valid_range(self):
        lo, hi = wilson(10, 20)
        assert 0 <= lo <= hi <= 1


class TestPairedLift:
    def _pairs(self, decisions, seg="freelancer"):
        pairs = []
        for i, d in enumerate(decisions):
            p = _make_persona(pid=f"P{i:04d}", seg=seg)
            reason = "TooExpensive" if d in {"Downgrade", "Reject"} else None
            a = Answer(decision=d, likelihood_pct=50, main_reason=reason)
            pairs.append((p, a))
        return pairs

    def test_no_diff_zero_lift(self):
        decs = ["Accept", "Reject", "Undecided", "Accept", "Accept"]
        lift, ci = paired_lift(self._pairs(decs), self._pairs(decs))
        assert lift == pytest.approx(0.0)

    def test_b_worse_positive_lift(self):
        a_decs = ["Accept"] * 10
        b_decs = ["Reject"] * 5 + ["Accept"] * 5
        # Ensure B has same pids as A
        pairs_a = self._pairs(a_decs)
        pairs_b = []
        for (p, _), d in zip(pairs_a, b_decs):
            reason = "TooExpensive" if d in {"Downgrade", "Reject"} else None
            pairs_b.append((p, Answer(decision=d, likelihood_pct=50, main_reason=reason)))
        lift, ci = paired_lift(pairs_a, pairs_b)
        assert lift > 0, "B is worse, lift should be positive"

    def test_ci_contains_point_estimate(self):
        decs = ["Accept", "Reject", "Undecided", "Accept", "Accept"] * 4
        pairs = self._pairs(decs)
        lift, (lo, hi) = paired_lift(pairs, pairs)
        assert lo <= lift <= hi


# ---------------------------------------------------------------------------
# ingest.py — parse_bridge (uses real S2 bridgeData)
# ---------------------------------------------------------------------------

class TestParseBridge:
    # Real bridgeData captured during Test S2
    _S2_BRIDGE = {
        "ForumID": "dfc19f73-00e0-47c2-8a8e-7014f5a149e5",
        "TemplateID": "4280c752-e170-4fa6-4c47-12d93114cd22",
        "BridgeID": "bab89b7d-a3a9-4cd6-8ff0-95ec24944fd5",
        "ReplyBridgeID": "",
        "FlowID": "ParallelDecision_Respond",
        "FID": "66773ff2-f8ec-91b6-b418-54e68cd97234",
        "ParallelDecision_Respond": {
            "ParallelDecision_Respond_Main-66773ff2-f8ec-91b6-b418-54e68cd97234_3":  "RnJlZWxhbmNlcg==",  # Freelancer
            "ParallelDecision_Respond_Main-66773ff2-f8ec-91b6-b418-54e68cd97234_5":  "TWV0cm8=",          # Metro
            "ParallelDecision_Respond_Main-66773ff2-f8ec-91b6-b418-54e68cd97234_7":  "TG93",              # Low
            "ParallelDecision_Respond_Main-66773ff2-f8ec-91b6-b418-54e68cd97234_9":  "RnJlZQ==",          # Free
            "ParallelDecision_Respond_Main-66773ff2-f8ec-91b6-b418-54e68cd97234_11": "QWNjZXB0",          # Accept
            "ParallelDecision_Respond_Main-66773ff2-f8ec-91b6-b418-54e68cd97234_13": "MQ==",              # 1
            "ParallelDecision_Respond_Main-66773ff2-f8ec-91b6-b418-54e68cd97234_15": "YXM=",              # as
        },
        "MobileNumber": "2743437326124061599535601",
        "UserUUID": "1ef1ea71-368d-46b6-9445-a4806a0b8eef",
        "UserName": "@users1amsvhwo2",
        "MediaID": [],
        "Time": "1791138629",
        "User": True,
        "SentTo": "1",
    }

    def _record(self, bridge=None):
        return {"t": 1234567890.0, "forum": "dfc19f73", "flow": "ParallelDecision_Respond",
                "bridge": bridge or self._S2_BRIDGE}

    def test_decodes_real_s2_payload(self):
        from parallel.ingest import parse_bridge
        result = parse_bridge(self._record())
        assert result is not None
        assert result["segment"] == "freelancer"
        assert result["city_tier"] == "metro"
        assert result["price_sensitivity"] == "low"
        assert result["current_plan"] == "free"
        assert result["decision"] == "Accept"
        assert result["likelihood_pct"] == 1
        assert result["adverse"] is False

    def test_reject_is_adverse(self):
        import base64, copy
        from parallel.ingest import parse_bridge
        bridge = copy.deepcopy(self._S2_BRIDGE)
        # Replace Decision field (index 11) with "Reject"
        for k in bridge["ParallelDecision_Respond"]:
            if k.endswith("_11"):
                bridge["ParallelDecision_Respond"][k] = base64.b64encode(b"Reject").decode()
        result = parse_bridge(self._record(bridge))
        assert result["adverse"] is True
        assert result["decision"] == "Reject"

    def test_small_business_segment(self):
        import base64, copy
        from parallel.ingest import parse_bridge
        bridge = copy.deepcopy(self._S2_BRIDGE)
        for k in bridge["ParallelDecision_Respond"]:
            if k.endswith("_3"):
                bridge["ParallelDecision_Respond"][k] = base64.b64encode(b"SmallBusiness").decode()
        result = parse_bridge(self._record(bridge))
        assert result["segment"] == "small_business"

    def test_non_respond_flow_returns_none(self):
        from parallel.ingest import parse_bridge
        record = {"bridge": {"FlowID": "ParallelDecision_RunRequest"}}
        assert parse_bridge(record) is None

    def test_missing_bridge_returns_none(self):
        from parallel.ingest import parse_bridge
        assert parse_bridge({}) is None



# ---------------------------------------------------------------------------
# fidelity.py
# ---------------------------------------------------------------------------

class TestApplyBias:
    def _make_df(self, n=20, adverse_frac=0.4) -> pd.DataFrame:
        rows = []
        for i in range(n):
            adverse = i < int(n * adverse_frac)
            rows.append({
                "segment": "freelancer",
                "adverse": adverse,
                "weight": 1.0,
                "decision": "Reject" if adverse else "Accept",
                "likelihood_pct": 30 if adverse else 70,
            })
        return pd.DataFrame(rows)

    def test_positive_shift_raises_adverse_rate(self):
        df = self._make_df(n=20, adverse_frac=0.4)
        profile = {"test_aud|pricing|freelancer": 1.0}  # positive logit shift
        df_out = apply_bias(df, profile, "test_aud", "pricing")
        original = df["adverse"].mean()
        corrected = (df_out["adverse"] * df_out["weight"]).sum() / df_out["weight"].sum()
        assert corrected > original, "Positive shift should increase weighted adverse rate"

    def test_zero_shift_no_change(self):
        df = self._make_df(n=20, adverse_frac=0.4)
        df_out = apply_bias(df, {}, "test_aud", "pricing")
        assert (df_out["weight"] == df["weight"]).all()


class TestCloseTheLoop:
    def test_writes_calibration_file(self, tmp_path, monkeypatch):
        import parallel.fidelity as fid_mod

        monkeypatch.setattr(fid_mod, "PROFILE_PATH", tmp_path / "calibration.json")

        sim_df = pd.DataFrame([
            {"segment": "freelancer", "adverse": True, "weight": 1.0},
            {"segment": "freelancer", "adverse": False, "weight": 1.0},
        ])
        real_df = pd.DataFrame([
            {"segment": "freelancer", "adverse": True},
            {"segment": "freelancer", "adverse": False},
        ])

        score, rows = close_the_loop(sim_df, real_df, "test_aud", "pricing")
        assert (tmp_path / "calibration.json").exists()
        profile = json.loads((tmp_path / "calibration.json").read_text())
        assert "_meta" in profile
        assert profile["_meta"]["rounds"] == 1
        assert 0.0 <= score <= 1.0


# ---------------------------------------------------------------------------
# personas.py (LLM mocked)
# ---------------------------------------------------------------------------

class TestRunRound:
    def test_run_round_with_mock_llm(self):
        """run_round should return (Persona, Answer) pairs without hitting the LLM."""
        people = [_make_persona(f"P{i:04d}") for i in range(5)]
        scenario = Scenario(
            title="Test",
            decision_text="Raise price from ₹499 to ₹699.",
            audience="freelancers",
            scenario_type="pricing",
        )

        _canned = {
            "decision": "Accept",
            "likelihood_pct": 75,
            "main_reason": None,
            "reason_detail": "Fine with me.",
        }

        with patch("parallel.personas.ask_json", return_value=_canned):
            from parallel.personas import run_round
            pairs = run_round(people, scenario, workers=2)

        assert len(pairs) == 5
        for p, a in pairs:
            assert isinstance(a, Answer)
            assert a.decision == "Accept"
