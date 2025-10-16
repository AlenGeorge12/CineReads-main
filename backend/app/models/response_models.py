from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class BookRecommendation(BaseModel):
    title: str
    author: str
    reason: str
    rating: Optional[float] = None
    cover_url: Optional[str] = None
    hardcover_url: Optional[str] = None
    # New fields for enhanced recommendations
    taste_match_score: Optional[float] = None
    primary_appeal: Optional[str] = None
    genre_tags: Optional[List[str]] = None
    complexity_level: Optional[str] = None  # "light", "medium", "complex"
    # Additional Hardcover metadata
    isbn: Optional[str] = None
    publication_year: Optional[int] = None
    page_count: Optional[int] = None
    publisher: Optional[str] = None
    hardcover_id: Optional[int] = None
    users_count: Optional[int] = None
    description: Optional[str] = None

class TasteProfile(BaseModel):
    """User's analyzed taste profile based on movie preferences"""
    themes: List[str]
    narrative_style: str
    emotional_tone: str
    genre_fusion: str
    character_preferences: str
    artistic_sensibilities: str
    confidence_score: Optional[float] = None

class RecommendationResponse(BaseModel):
    movie: str  # Now represents the unified taste summary
    books: List[BookRecommendation]
    taste_profile: Optional[TasteProfile] = None
    recommendation_type: str = "unified"  # "unified" or "individual"
    
class RecommendationInsights(BaseModel):
    """Additional insights about the recommendations"""
    total_movies_analyzed: int
    dominant_themes: List[str]
    genre_diversity_score: float
    recommendation_confidence: float
    alternative_suggestions: Optional[List[str]] = None

class EnhancedRecommendationResponse(BaseModel):
    """Complete response with recommendations and insights"""
    recommendations: List[RecommendationResponse]
    insights: RecommendationInsights
    processing_time: Optional[float] = None
    cache_hit: bool = False