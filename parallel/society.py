import numpy as np
import yaml
from .schemas import Persona

def _draw(rng, dist):
    keys = list(dist)
    p = np.array([dist[k] for k in keys], float)
    return str(rng.choice(keys, p=p / p.sum()))

def build_society(path, n, seed=7):
    with open(path, 'r') as f:
        cfg = yaml.safe_load(f)["attributes"]
    rng = np.random.default_rng(seed)
    return [Persona(pid=f"P{i+1:04d}", **{k: _draw(rng, d) for k, d in cfg.items()}) for i in range(n)]
