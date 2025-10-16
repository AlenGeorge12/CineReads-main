from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class UserPreferences(BaseModel):
    mood: Optional[str] = None
    pace: Optional[str] = None
    genre_preferences: Optional[List[str]] = None
    genre_blocklist: Optional[List[str]] = None

class RecommendationRequest(BaseModel):
    movies: List[str]
    preferences: Optional[UserPreferences] = None