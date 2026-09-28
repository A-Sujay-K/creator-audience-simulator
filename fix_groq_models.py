import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv(override=True)
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Fetch all available models
models = [m.id for m in client.models.list().data]
print("Available Groq Models:")
for m in models:
    print(f" - {m}")

# Pick the best available Llama models
smart_model = next((m for m in models if "70b" in m.lower()), None)
fast_model = next((m for m in models if "8b" in m.lower()), None)

# Fallbacks if Llama isn't there
if not smart_model:
    smart_model = next((m for m in models if "mixtral" in m.lower()), models[0])
if not fast_model:
    fast_model = next((m for m in models if "gemma" in m.lower()), models[0])

print(f"\nSelected SMART: {smart_model}")
print(f"Selected FAST: {fast_model}")

# Update .env
with open(".env", "r") as f:
    content = f.read()

import re
content = re.sub(r"MODEL_FAST=.*", f"MODEL_FAST={fast_model}", content)
content = re.sub(r"MODEL_SMART=.*", f"MODEL_SMART={smart_model}", content)

with open(".env", "w") as f:
    f.write(content)

print("\nUpdated .env successfully!")
