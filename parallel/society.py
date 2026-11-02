import numpy as np
import yaml
from .schemas import Persona

RELATIONSHIP_WEIGHTS = {
    "stranger": 3.0,
    "casual_follower": 1.5,
    "subscriber": 1.5,
    "superfan": 0.7,
}

def _draw(rng, dist):
    keys = list(dist)
    p = np.array([dist[k] for k in keys], float)
    return str(rng.choice(keys, p=p / p.sum()))

def build_society(path, n, seed=7):
    with open(path, 'r') as f:
        cfg = yaml.safe_load(f)["attributes"]
    rng = np.random.default_rng(seed)
    personas = []
    for i in range(n):
        attrs = {k: _draw(rng, d) for k, d in cfg.items()}
        rel = attrs.get("relationship", "stranger")
        weight = RELATIONSHIP_WEIGHTS.get(rel, 1.0)
        personas.append(Persona(pid=f"P{i+1:04d}", weight=weight, **attrs))
    return personas
