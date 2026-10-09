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
        flow_key = item.get("flow", "")
        # In Bridge, the field values are nested inside bridge[flow_key]
        nested = raw.get(flow_key, {})
        merged = dict(raw)
        if isinstance(nested, dict):
            merged.update(nested)
        fields = {k: _b64(v) if isinstance(v, str) else v for k, v in merged.items()}

        vals = {}
        SUFFIX_MAP = {
            "S1": "_11", "S2": "_13", "S3": "_15", "S4": "_17",
            "S5": "_19", "S6": "_21", "S7": "_23", "S8": "_25",
        }
        for s in sids:
            suf = SUFFIX_MAP.get(s, "")
            found = False
            for k, v in fields.items():
                if (suf and k.endswith(suf)) or f"_{s}_" in k or k.endswith(f"_{s}") or k == s:
                    try:
                        val_num = float(v)
                        # Clamp between 1.0 and 5.0 to handle out-of-range user inputs gracefully
                        vals[s] = min(max(val_num, 1.0), 5.0)
                        found = True
                        break
                    except Exception:
                        pass
        if len(vals) == len(sids):
            # Key by respondent MobileNumber or BridgeID
            user_key = raw.get("MobileNumber") or raw.get("UserUUID") or item.get("t")
            rows[user_key] = vals
            
    return pd.DataFrame.from_dict(rows, orient="index") if rows else pd.DataFrame(columns=sids)
