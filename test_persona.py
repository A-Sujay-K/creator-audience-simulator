import os
from dotenv import load_dotenv
load_dotenv(override=True)
from parallel.personas import _build_prompt, _SYSTEM
from parallel.schemas import Scenario, Persona
from groq import Groq

scenario = Scenario(
    title="Test",
    decision_text="Price goes up",
    audience="indian_freelancers",
    scenario_type="pricing",
    what_changes=["Price goes up"],
    variant="A"
)

persona = Persona(
    pid="P001",
    segment="freelancer",
    city_tier="metro",
    income_band="low",
    price_sensitivity="high",
    tech_savvy="high",
    current_plan="free"
)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
prompt = _build_prompt(persona, scenario)

try:
    print("Calling Groq manually...")
    response = client.chat.completions.create(
        model=os.getenv("MODEL_FAST"),
        messages=[
            {"role": "system", "content": _SYSTEM},
            {"role": "user", "content": prompt}
        ],
        temperature=1.0,
        max_tokens=250,
    )
    raw = response.choices[0].message.content
    print("RAW OUTPUT:")
    print(repr(raw))
except Exception as e:
    print("Error:", e)
