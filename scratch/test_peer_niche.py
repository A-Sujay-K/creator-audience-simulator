import os, json, re
from dotenv import load_dotenv
from firecrawl import FirecrawlApp
load_dotenv(r"c:\Users\asuja\Documents\antigravity\wise-darwin\.env")

key = os.getenv("FIRECRAWL_API_KEY")
app = FirecrawlApp(api_key=key)

niche_term = "motorcycles travel bike touring reels"
q_peer_ig = f"{niche_term} site:instagram.com/reel"
q_peer_yt = f"{niche_term} site:youtube.com/watch OR site:youtube.com/shorts"

peer_vids = []
for q in [q_peer_ig, q_peer_yt]:
    res = app.search(q, limit=4)
    if hasattr(res, "web") and res.web:
        for item in res.web:
            u = getattr(item, "url", "")
            t = getattr(item, "title", "").encode("ascii", "ignore").decode()
            if "/reel/" in u or "/p/" in u:
                peer_vids.append({"platform": "Instagram", "url": u, "title": t})
            elif "youtube.com/watch" in u or "youtu.be/" in u or "youtube.com/shorts/" in u:
                peer_vids.append({"platform": "YouTube", "url": u, "title": t})

print("Discovered Peer Videos:", len(peer_vids))
for v in peer_vids:
    print(f"  [{v['platform']}] {v['title'][:45]} -> {v['url']}")
