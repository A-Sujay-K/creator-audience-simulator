from dotenv import load_dotenv
import os
load_dotenv(override=True)

from parallel.llm import ask_json

try:
    print(f"Testing MODEL_SMART: {os.getenv('MODEL_SMART')}")
    res = ask_json("Return JSON with key 'status' and value 'ok'", "Test", os.getenv("MODEL_SMART"))
    print("Success! Response:", res)
except Exception as e:
    print("Error:", e)
