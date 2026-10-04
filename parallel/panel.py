import base64
import json
from pathlib import Path
import pandas as pd

def _b64(v):
    try: return base64.b64decode(v, validate=True).decode("utf-8")
    except Exception: return v

def load_panel(sids, path="data/real.jsonl"):
    rows = {}
    if not Path(path).exists():
        return pd.DataFrame(columns=sids)
        
    for line in Path(path).read_text(encoding="utf-8").splitlines():
        if not line.strip(): continue
        item = json.loads(line)
        if not item.get("flow", "").endswith("Rate"): continue
        
        raw = item.get("bridge", {})
        # Note: the exact structure of S1..S8 in Bridge data will be parsed properly after Test S2.
        # This is a naive fetch assuming the raw keys might match the labels for now.
        fields = {k: _b64(v) if isinstance(v, str) else v for k, v in raw.items()}
        
        # We need to map the fields dynamically or extract the S1-S8 values. 
        # Until we know the real schema, we look for them.
        vals = {}
        for s in sids:
            # Check if any key contains the SID (since Bridge keys have UUIDs)
            found = False
            for k, v in fields.items():
                if f"_{s}_" in k or k.endswith(f"_{s}"):
                    try:
                        vals[s] = float(v)
                        found = True
                        break
                    except: pass
            if not found and s in fields:
                try: vals[s] = float(fields[s])
                except: pass
                
        if all(1 <= v <= 5 for v in vals.values()) and vals:
            rows[raw.get("MobileNumber", "unknown")] = vals
            
    return pd.DataFrame.from_dict(rows, orient="index") if rows else pd.DataFrame(columns=sids)
