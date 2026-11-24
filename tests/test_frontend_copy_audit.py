import os
import re
import pytest

def test_style_blueprint_no_default_roadmap_or_dj_copy():
    """
    Asserts that StyleBlueprintModule.jsx does not contain defaultRoadmap
    or hardcoded DJ mixer/electronic music copy (Defect F10 / F14).
    """
    path = "frontend/src/components/StyleBlueprintModule.jsx"
    assert os.path.exists(path), f"{path} must exist"

    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Assert defaultRoadmap is purged
    assert "defaultRoadmap" not in content, "defaultRoadmap fallback found in StyleBlueprintModule.jsx"

    # 2. Assert no hardcoded DJ mixer / electronic music copy
    forbidden_terms = [
        "130 bpm",
        "cue button on mixer",
        "ableton rack",
        "jersey beat",
        "unreleased edit",
        "wrong bpm disaster",
        "sub-30hz frequencies",
        "focal lengths, camera movements, and audio sync markers"
    ]
    for term in forbidden_terms:
        assert term.lower() not in content.lower(), f"Forbidden DJ/music copy term '{term}' found in StyleBlueprintModule.jsx"
