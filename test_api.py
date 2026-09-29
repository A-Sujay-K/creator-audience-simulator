# test_api.py  – run with: .venv\Scripts\python test_api.py
from dotenv import load_dotenv
import os

load_dotenv()

key = os.getenv("GOOGLE_API_KEY", "NOT FOUND")
print(f"Key starts with: {key[:8]} | Length: {len(key)}")

if not key.startswith("AIzaSy"):
    print("\nKEY WRONG. Google AI Studio keys always start with 'AIzaSy'.")
    print("   Go to: https://aistudio.google.com/apikey and create a new key.")
else:
    from google import genai
    client = genai.Client(api_key=key)
    response = client.models.generate_content(
        model="gemini-3.8-flash",
        contents="Say exactly: API works"
    )
    print("\nSUCCESS - API response:", response.text)
