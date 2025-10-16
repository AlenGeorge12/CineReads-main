export interface UserPreferences {
  mood?: string | null;
  pace?: string | null;
  genre_preferences?: string[] | null;
  genre_blocklist?: string[] | null;
}

export interface Movie {
  id: number;
  title: string;
  poster_path?: string | null;
  poster_url?: string | null;
  release_date?: string | null;
  overview?: string | null;
  vote_average?: number;
  popularity?: number;
}

export interface BookRecommendation {
  title: string;
  author: string;
  reason: string;
  rating?: number | null;
  cover_url?: string | null;
  hardcover_url?: string | null;
  taste_match_score?: number | null;
  primary_appeal?: string | null;
  genre_tags?: string[] | null;
  complexity_level?: string | null;
}

export interface RecommendationResponse {
  movie: string;
  books: BookRecommendation[];
}

export interface RecommendationRequest {
  movies: string[];
  preferences?: UserPreferences | null;
}

export interface EnhancedRecommendationRequest {
  movies: Movie[];
  preferences?: UserPreferences | null;
}

export interface MoodOption {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface PaceOption {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface TasteProfile {
  themes: string[];
  narrative_style: string;
  emotional_tone: string;
  genre_fusion: string;
  character_preferences: string;
  artistic_sensibilities: string;
  confidence_score?: number | null;
}

export interface RecommendationInsights {
  total_movies_analyzed: number;
  dominant_themes: string[];
  genre_diversity_score: number;
  recommendation_confidence: number;
  alternative_suggestions?: string[] | null;
}

export interface EnhancedRecommendationResponse {
  recommendations: RecommendationResponse[];
  insights: RecommendationInsights;
  processing_time?: number | null;
  cache_hit: boolean;
}

export interface CacheStats {
  total_files: number;
  total_size_bytes: number;
  by_type: Record<string, {
    files: number;
    size_bytes: number;
  }>;
}