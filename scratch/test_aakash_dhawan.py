import os, sys
sys.path.insert(0, r"c:\Users\asuja\Documents\antigravity\wise-darwin")
from dotenv import load_dotenv
load_dotenv(r"c:\Users\asuja\Documents\antigravity\wise-darwin\.env")
from parallel.intelligence import generate_creator_intelligence

creator = "Aakash Dhawan the_incredigrapher"
print(f"Generating intelligence for: {creator}...")
res = generate_creator_intelligence(creator)

prof = res.get("creator_profile", {})
print("\n--- Profile ---")
print("Name:", prof.get("name"))
print("Niche:", prof.get("core_niche"))
print("Avatar:", prof.get("avatar_url"))

print("\n--- Creator's OWN Videos (Tab 3) ---")
for v in res.get("creator_videos", []):
    t = v.get("title", "").encode("ascii", "ignore").decode()
    print(f"  [{v.get('platform')}] {t} -> {v.get('url')} (verified={v.get('verified')})")

print("\n--- Niche Trending Videos from OTHER Creators (Tab 1) ---")
for v in res.get("niche_trending_videos", []):
    t = v.get("title", "").encode("ascii", "ignore").decode()
    print(f"  [{v.get('platform')}] {t} -> {v.get('url')} (verified={v.get('verified')})")

print("\n--- Content Suggestions (Tab 1) ---")
for s in res.get("content_suggestions", []):
    stitle = s.get("title", "").encode("ascii", "ignore").decode()
    ref = s.get("reference_video", {})
    rtitle = ref.get("title", "").encode("ascii", "ignore").decode()
    print(f"  Idea #{s.get('id')}: {stitle}")
    print(f"    Ref: [{ref.get('platform')}] {rtitle} -> {ref.get('url')} (verified={ref.get('verified')})")
