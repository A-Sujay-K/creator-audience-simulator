import os, sys
sys.path.insert(0, r"c:\Users\asuja\Documents\antigravity\wise-darwin")
from dotenv import load_dotenv
load_dotenv(r"c:\Users\asuja\Documents\antigravity\wise-darwin\.env")

from parallel.clone_intel import get_style_dna, get_video_blueprint, get_piracy_ideas

target_creator = "Aakash Dhawan"
target_niche = "Motorcycles, Travel & Moto-vlogging"
t_creator_vids = [
    {"platform": "Instagram", "title": "Where an adventure bike belongs", "url": "https://www.instagram.com/p/DZXAo21n2y0/", "opening_hook": "Where an adventure bike belongs"},
    {"platform": "YouTube", "title": "Interceptor Bear 650 Review", "url": "https://www.youtube.com/watch?v=gBSzKqroKU0", "opening_hook": "Is this the best 650?"}
]
t_niche_vids = [
    {"platform": "YouTube", "title": "I left Afghanistan - motorcycle journey", "why_it_went_viral": "High emotion and stakes"}
]

print("1. Testing get_style_dna...")
style = get_style_dna(target_creator, target_niche, t_creator_vids, t_niche_vids)
print("Style DNA keys:", style.keys())

print("2. Testing get_video_blueprint...")
bp = get_video_blueprint(t_creator_vids[0]["title"], t_creator_vids[0]["url"], t_creator_vids[0]["platform"], target_niche)
print("Blueprint keys:", bp.keys())

print("3. Testing get_piracy_ideas...")
piracy = get_piracy_ideas(target_creator, target_niche, t_creator_vids)
print("Piracy ideas count:", len(piracy.get("piracy_ideas", [])))
