# Parallel

> **Test the future on a parallel society first.**

Parallel runs hundreds of synthetic personas through a two-round private-then-public
simulation, compares variants, measures social influence (herding / polarisation), and
calibrates predictions against real Cosmitude Bridge answers.

---

## Quick-start

```bash
# 1. Clone and set up
git clone <your-repo>
cd parallel
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install anthropic pydantic pyyaml numpy pandas scikit-learn \
            requests fastapi uvicorn streamlit python-dotenv pytest

# 2. Credentials
cp .env.example .env            # fill in ANTHROPIC_API_KEY

# 3. Three terminals
streamlit run app.py            # terminal 1 → http://localhost:8501
uvicorn parallel.ingest:app --port 8000   # terminal 2
python collector_agent.py       # terminal 3 (after Part 4 / 6.6)
```

---

## Project layout

```
parallel/
├── schemas.py        Typed data models (mirrors Bridge template)
├── llm.py            Anthropic wrapper (fast + smart tier)
├── compiler.py       Free-text → Scenario
├── society.py        Sample reproducible synthetic personas
├── personas.py       LLM persona runner (threaded)
├── influence.py      Herding / polarisation metrics
├── analysis.py       Adversity rate, entropy, segments, clusters, lift
├── fidelity.py       Calibration profile, confidence gate
├── pipeline.py       Full variant orchestrator
├── ingest.py         FastAPI micro-service (real Bridge answers)
└── bridge_client.py  Optional: mirror persona answers into Bridge _Sim forums

config/
└── society.yaml      Population distributions (replace with real data)

data/                 Created at runtime (gitignored)
├── real.jsonl        Incoming real answers from Collector agent
├── summary.txt       Latest prediction text for Collector to post
└── calibration.json  Learned per-segment logit shifts

tests/
└── test_core.py      Unit tests (no LLM calls)

app.py                Streamlit console
collector_agent.py    Bridge agent (download from Bridge UI, edit custom area)
.env.example          Credential template
```

---

## Week-by-week plan

| Week | Goal |
|------|------|
| 1 | Part 4 toy + Tests S1–S7 (notes file) |
| 2 | Template, forums, bots, Collector agent |
| 3 | schemas → personas, command-line run |
| 4 | influence, analysis, variants, tests |
| 5 | ingest, fidelity, calibration |
| 6 | Streamlit console, confidence gate, approval step |
| 7 | Real data collection (20+ people), rehearsal |
| 8 | Buffer, write-up, README |

---

## Tests

```bash
pytest -v
```

Tests mock the LLM — no API calls, no cost.

---

## Key design choices

| Choice | Reason |
|--------|--------|
| Same persona list for all variants | Paired comparison → much lower variance than independent crowds |
| Logit-space calibration | Preserves valid [0, 1] range after additive correction |
| Wilson CI on real answers | Honest intervals for small n (avoids false precision) |
| Confidence gate hides numbers when LOW | Forces honest communication about model quality |
| Bridge mirroring is optional | Keeps quota usage low; console shows the live feed |

---

## Mentor questions (send after week-1 tests)

1. Server URL and IDs for dev account; can the bot session call `saveForumBridges2`?
2. Internal way to create templates programmatically?
3. Dev quotas for bridges and bots; do whispers and reports count?
4. Can a user whisper to an admin from the mobile app? Do users see each other's bridges?
5. MCP Orchestrator API for registering custom agents?
6. Allowed LLM provider and data-in-prompt policy?
7. Real customer data for society distributions?
