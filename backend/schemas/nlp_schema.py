from datetime import datetime, timezone
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


class CrisisHelplineResource(BaseModel):
    name: str
    contact: str
    availability: str
    description: str


class SupportRequest(BaseModel):
    text: str = Field(
        ...,
        min_length=3,
        max_length=2000,
        description="Student's personal description of their current feelings, situation, or challenges."
    )

    @field_validator("text")
    @classmethod
    def validate_non_empty(cls, value: str) -> str:
        stripped = value.strip()
        if len(stripped) < 3:
            raise ValueError("Please provide a description with at least 3 characters.")
        return stripped


class SupportResponse(BaseModel):
    supportive_message: str
    is_crisis: bool = False
    crisis_guidance: Optional[str] = None
    crisis_resources: List[CrisisHelplineResource] = []
    source: str = "offline_synthesizer"
    disclaimer: str = (
        "This supportive message is an automated peer-encouragement tool designed for "
        "self-reflection and emotional support. It does not provide medical advice, "
        "psychiatric diagnosis, prescription, or clinical treatment plans. If you are experiencing "
        "persistent distress, please consult university counseling services or a qualified healthcare professional."
    )
    timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
