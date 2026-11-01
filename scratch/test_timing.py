import os, sys, time
sys.path.insert(0, r"c:\Users\asuja\Documents\antigravity\wise-darwin")
from dotenv import load_dotenv
load_dotenv(r"c:\Users\asuja\Documents\antigravity\wise-darwin\.env")
from parallel.llm import ask_json, MODEL_SMART

print("1. Testing ask_json with small tokens...", flush=True)
t0 = time.time()
res = ask_json("Return json only", "Return JSON: {'val': 123}", MODEL_SMART, max_tokens=100)
print(f"Done in {time.time()-t0:.2f}s: {res}")

print("2. Testing ask_json with 600 tokens...", flush=True)
t0 = time.time()
res2 = ask_json("Return json only", "Generate a list of 5 video hooks in JSON: {'hooks': ['h1', 'h2', 'h3', 'h4', 'h5']}", MODEL_SMART, max_tokens=600)
print(f"Done in {time.time()-t0:.2f}s: {res2}")
