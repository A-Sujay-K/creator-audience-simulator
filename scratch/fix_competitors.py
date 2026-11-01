"""Patch script: replace generic competitor fallback with niche-aware table."""
import re

filepath = r"c:\Users\asuja\Documents\antigravity\wise-darwin\parallel\intelligence.py"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Identify the block to replace by line numbers from recon above:
# Lines 794-810 (0-indexed 793-809) contain the else + Triggered Insaan block
lines = content.splitlines(keepends=True)

# Find the exact start & end lines
start_idx = None
end_idx = None
for i, line in enumerate(lines):
    if start_idx is None and '        else:' in line and i > 780:
        # Make sure the next line is intel["competitor_benchmarking"]
        if i + 1 < len(lines) and 'intel["competitor_benchmarking"]' in lines[i + 1]:
            start_idx = i
    if start_idx is not None and end_idx is None:
        if i > start_idx + 2 and line.strip() == ']' and lines[i+1].strip() == '':
            end_idx = i + 1
            break

print(f"Replacing lines {start_idx+1} to {end_idx+1}")
print("BEFORE:")
print("".join(lines[start_idx:end_idx]))

replacement = '''        else:
            # ── Niche-aware competitor fallback ──────────────────────────────
            niche_key = (detected_niche or profile.get("core_niche", "")).lower()

            if any(k in niche_key for k in ["motovlog", "motorcycle", "moto", "bike", "royal enfield", "ktm", "touring"]):
                intel["competitor_benchmarking"] = [
                    {
                        "competitor_name": "Mridul Madhok (RideWithMridul)",
                        "recent_content_focus": "Long-distance Himalayan motorcycle tours",
                        "their_strength": "Loyal touring community with scenic cinematography",
                        "their_gap": "Infrequent uploads and limited gear deep-dives",
                        "how_to_beat_them": "Combine cinematic touring footage with weekly gear breakdowns."
                    },
                    {
                        "competitor_name": "ThrottleThings",
                        "recent_content_focus": "Royal Enfield reviews and off-road tests",
                        "their_strength": "Strong technical review credibility",
                        "their_gap": "Limited storytelling and lifestyle integration",
                        "how_to_beat_them": "Blend technical depth with compelling personal travel narratives."
                    }
                ]
            elif any(k in niche_key for k in ["fitness", "gym", "workout", "bodybuilding", "trainer", "health"]):
                intel["competitor_benchmarking"] = [
                    {
                        "competitor_name": "Nikhil Fit (FitMuscle TV)",
                        "recent_content_focus": "Home workouts and transformation challenges",
                        "their_strength": "High consistency and motivational energy",
                        "their_gap": "Generic advice without personalization",
                        "how_to_beat_them": "Offer personalized programs with measurable transformation proof."
                    },
                    {
                        "competitor_name": "Tarun Gill",
                        "recent_content_focus": "Supplement reviews and bodybuilding science",
                        "their_strength": "Deep technical credibility in Indian fitness space",
                        "their_gap": "Dense jargon that alienates beginners",
                        "how_to_beat_them": "Break complex fitness science into engaging short-form videos."
                    }
                ]
            elif any(k in niche_key for k in ["tech", "gadget", "smartphone", "unboxing", "review", "consumer"]):
                intel["competitor_benchmarking"] = [
                    {
                        "competitor_name": "Trakin Tech",
                        "recent_content_focus": "Budget smartphone comparisons and buying guides",
                        "their_strength": "Mass-market reach with clear value propositions",
                        "their_gap": "Shallow depth on flagship and premium segments",
                        "how_to_beat_them": "Dominate flagship in-depth teardowns with better production quality."
                    },
                    {
                        "competitor_name": "Geekyranjit",
                        "recent_content_focus": "Detailed gadget reviews with benchmark tests",
                        "their_strength": "Trusted detailed review methodology",
                        "their_gap": "Lower entertainment value and dry presentation style",
                        "how_to_beat_them": "Match technical depth with cinematic storytelling and humor hooks."
                    }
                ]
            elif any(k in niche_key for k in ["food", "street food", "recipe", "cooking", "restaurant", "culinary"]):
                intel["competitor_benchmarking"] = [
                    {
                        "competitor_name": "Food Ranger (Trevor James)",
                        "recent_content_focus": "Authentic street food tours across Asia",
                        "their_strength": "Strong emotional connection with raw food experiences",
                        "their_gap": "Limited local language engagement with Indian audience",
                        "how_to_beat_them": "Cover hyper-local Indian street food with cultural storytelling."
                    },
                    {
                        "competitor_name": "Indian Food Ranger (Nikunj Vasoya)",
                        "recent_content_focus": "Indian street food vlogs and restaurant hunts",
                        "their_strength": "Strong Hindi-speaking local audience rapport",
                        "their_gap": "Production quality lags behind international creators",
                        "how_to_beat_them": "Elevate cinematic quality while retaining authentic street-level energy."
                    }
                ]
            elif any(k in niche_key for k in ["gaming", "gameplay", "esports", "minecraft", "bgmi", "pubg", "valorant"]):
                intel["competitor_benchmarking"] = [
                    {
                        "competitor_name": "Scout (Tanmay Singh)",
                        "recent_content_focus": "BGMI competitive gameplay and live tournaments",
                        "their_strength": "Top-tier mechanical skill with massive esports fanbase",
                        "their_gap": "Content mainly appeals to hardcore gamers only",
                        "how_to_beat_them": "Create beginner-friendly challenge content alongside high-skill clips."
                    },
                    {
                        "competitor_name": "Mortal (Naman Mathur)",
                        "recent_content_focus": "BGMI highlights, vlogs, and collaboration content",
                        "their_strength": "Strong personal brand beyond gaming",
                        "their_gap": "Reduced upload frequency since going semi-professional",
                        "how_to_beat_them": "Fill the consistency gap with daily engaging gameplay plus personality content."
                    }
                ]
            elif any(k in niche_key for k in ["finance", "crypto", "stock", "investing", "money", "business"]):
                intel["competitor_benchmarking"] = [
                    {
                        "competitor_name": "Pranjal Kamra (Finology)",
                        "recent_content_focus": "Stock market fundamentals and personal finance",
                        "their_strength": "High trust authority in Indian retail investing",
                        "their_gap": "Conservative pace; avoids trending market events",
                        "how_to_beat_them": "React to live market events faster with clear data visualizations."
                    },
                    {
                        "competitor_name": "CA Rachana Ranade",
                        "recent_content_focus": "Beginner-friendly stock market and IPO education",
                        "their_strength": "Professional credibility with approachable teaching style",
                        "their_gap": "Limited short-form content for Gen Z mobile-first audience",
                        "how_to_beat_them": "Translate complex finance into 60-second reels without oversimplifying."
                    }
                ]
            elif any(k in niche_key for k in ["photography", "filmmaker", "camera", "drone", "visual", "cinematic"]):
                intel["competitor_benchmarking"] = [
                    {
                        "competitor_name": "Peter McKinnon",
                        "recent_content_focus": "Cinematic travel photography and camera tutorials",
                        "their_strength": "Best-in-class production quality and tutorial clarity",
                        "their_gap": "Mainly targets Western audience; limited Indian context",
                        "how_to_beat_them": "Apply Hollywood-grade cinematic techniques to Indian landscapes."
                    },
                    {
                        "competitor_name": "Unmesh Dinda (PiXimperfect)",
                        "recent_content_focus": "Advanced Photoshop and photo editing tutorials",
                        "their_strength": "Global reach with deep technical editing expertise",
                        "their_gap": "Purely editing-focused; no field or outdoor shooting content",
                        "how_to_beat_them": "Combine on-location shooting storytelling with deep post-production breakdowns."
                    }
                ]
            elif any(k in niche_key for k in ["fashion", "beauty", "makeup", "skincare", "outfit", "style", "grooming"]):
                intel["competitor_benchmarking"] = [
                    {
                        "competitor_name": "Komal Pandey",
                        "recent_content_focus": "Bold experimental fashion and styling lookbooks",
                        "their_strength": "Strong aspirational identity and brand collaborations",
                        "their_gap": "Limited coverage of budget-friendly fashion for Tier 2 cities",
                        "how_to_beat_them": "Bridge aspirational styling with accessible affordable fashion alternatives."
                    },
                    {
                        "competitor_name": "Mumbiker Nikhil",
                        "recent_content_focus": "Lifestyle, fashion, and travel crossover content",
                        "their_strength": "Strong male lifestyle audience with high engagement",
                        "their_gap": "Fashion content secondary to travel; not deeply styled",
                        "how_to_beat_them": "Establish dedicated fashion-first identity while leveraging lifestyle crossover."
                    }
                ]
            elif any(k in niche_key for k in ["comedy", "roast", "parody", "satire", "sketch", "entertainment", "vines"]):
                intel["competitor_benchmarking"] = [
                    {
                        "competitor_name": "Triggered Insaan",
                        "recent_content_focus": "Daily reaction and gaming commentary",
                        "their_strength": "High posting frequency and strong Gen Z connection",
                        "their_gap": "Predictable formula and repetitive pacing",
                        "how_to_beat_them": "Produce higher cinematic quality parody sketches with unpredictable twists."
                    },
                    {
                        "competitor_name": "Ashish Chanchlani",
                        "recent_content_focus": "High-production situational comedy",
                        "their_strength": "Iconic ensemble cast chemistry",
                        "their_gap": "Very infrequent uploads",
                        "how_to_beat_them": "Capture real-time internet trends within 48 hours while topic is hot."
                    }
                ]
            elif any(k in niche_key for k in ["travel", "vlog", "adventure", "explore", "backpack"]):
                intel["competitor_benchmarking"] = [
                    {
                        "competitor_name": "Mumbiker Nikhil",
                        "recent_content_focus": "Luxury travel vlogs and lifestyle content",
                        "their_strength": "Premium aspirational lifestyle brand with high engagement",
                        "their_gap": "Expensive production limits relatable budget travel content",
                        "how_to_beat_them": "Offer raw, authentic adventure travel with cinematic storytelling."
                    },
                    {
                        "competitor_name": "Sourav Joshi Vlogs",
                        "recent_content_focus": "Daily life and family travel vlogs",
                        "their_strength": "Massive daily-upload consistency with family-friendly appeal",
                        "their_gap": "Production quality sacrificed for upload speed",
                        "how_to_beat_them": "Produce fewer but cinematic travel episodes that reward dedicated watching."
                    }
                ]
            else:
                intel["competitor_benchmarking"] = [
                    {
                        "competitor_name": f"Top {profile.get('core_niche', 'Niche')} Creator",
                        "recent_content_focus": f"High-frequency {profile.get('core_niche', 'niche')} content",
                        "their_strength": "Established audience trust and consistent posting",
                        "their_gap": "Formulaic content lacking creative differentiation",
                        "how_to_beat_them": "Introduce a unique creative angle with superior production value."
                    },
                    {
                        "competitor_name": f"Emerging {profile.get('core_niche', 'Niche')} Creator",
                        "recent_content_focus": f"Trend-reactive {profile.get('core_niche', 'niche')} shorts",
                        "their_strength": "High-velocity trend adaptation and short-form virality",
                        "their_gap": "Lacks depth and long-form storytelling capability",
                        "how_to_beat_them": "Combine short-form trend hooks with deeper long-form series payoff."
                    }
                ]
'''

new_lines = lines[:start_idx] + [replacement] + lines[end_idx:]
new_content = "".join(new_lines)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(new_content)

print("PATCH APPLIED SUCCESSFULLY")

# Verify
with open(filepath, "r", encoding="utf-8") as f:
    verify = f.read()
print("Triggered Insaan only in comedy section?", "comedy" in verify[verify.find("Triggered Insaan") - 200:verify.find("Triggered Insaan")])
print("niche_key present?", "niche_key" in verify)
