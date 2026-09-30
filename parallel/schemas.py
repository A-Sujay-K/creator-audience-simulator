from typing import Optional
from pydantic import BaseModel, Field, model_validator

class Stimulus(BaseModel):
    sid: str
    text: str

class Study(BaseModel):
    title: str
    platform: str
    audience: str
    stimuli: list[Stimulus]

    @model_validator(mode="after")
    def renumber(self):
        if not 3 <= len(self.stimuli) <= 8:
            raise ValueError("need 3 to 8 stimuli")
        self.stimuli = [Stimulus(sid=f"S{i+1}", text=s.text) for i, s in enumerate(self.stimuli)]
        return self

class Persona(BaseModel):
    pid: str
    relationship: str
    age_band: str
    city_tier: str
    interest: str
    scroll_time: str
    weight: float = 1.0

class Rating(BaseModel):
    sid: str
    stop_scroll: int = Field(ge=1, le=5)

class PanelAnswer(BaseModel):
    ratings: list[Rating]
    best: str
    worst: str
    felt_clickbait: bool = False
    clickbait_sid: Optional[str] = None
    note: str = ""

    @model_validator(mode="after")
    def clickbait_needs_item(self):
        if self.felt_clickbait and not self.clickbait_sid:
            raise ValueError("clickbait_sid required when felt_clickbait is true")
        return self
