import os, json, re
from dotenv import load_dotenv
from firecrawl import FirecrawlApp
load_dotenv(r"c:\Users\asuja\Documents\antigravity\wise-darwin\.env")

key = os.getenv("FIRECRAWL_API_KEY")
app = FirecrawlApp(api_key=key)

creator_name = "Aakash Dhawan the_incredigrapher"
print("Testing recon for:", creator_name)

# 1. Official presence & bio
q1 = f"{creator_name} official profile bio instagram youtube"
res1 = app.search(q1, limit=3)
snippets = []
if hasattr(res1, "web") and res1.web:
    for item in res1.web:
        snippets.append(getattr(item, "title", "") + " " + getattr(item, "description", ""))
combined_text = " ".join(snippets)
print("Snippets summary:", combined_text[:200])

# 2. Creator's OWN uploads across Instagram and YouTube
q2_ig = f"{creator_name} site:instagram.com/reel OR site:instagram.com/p"
q2_yt = f"{creator_name} site:youtube.com/watch OR site:youtube.com/shorts"

creator_vids = []
for q in [q2_ig, q2_yt]:
    res = app.search(q, limit=4)
    if hasattr(res, "web") and res.web:
        for item in res.web:
            u = getattr(item, "url", "")
            t = getattr(item, "title", "").encode("ascii", "ignore").decode()
            if "/reel/" in u or "/p/" in u:
                creator_vids.append({"platform": "Instagram", "url": u, "title": t})
            elif "youtube.com/watch" in u or "youtu.be/" in u or "youtube.com/shorts/" in u:
                creator_vids.append({"platform": "YouTube", "url": u, "title": t})

print("\nDiscovered Creator Videos:", len(creator_vids))
for v in creator_vids:
    print(f"  [{v['platform']}] {v['title'][:40]} -> {v['url']}")
