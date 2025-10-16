const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface BookRecommendation {
  title: string;
  author: string;
  reason: string;
  rating?: number;
  cover_url?: string;
  hardcover_url?: string;
}

export interface RecommendationResponse {
  movie: string;
  books: BookRecommendation[];
}

export interface RecommendationRequest {
  movies: string[];
  preferences?: {
    mood?: string;
    pace?: string;
    genre_preferences?: string[];
    genre_blocklist?: string[];
  };
}

export async function getRecommendations(request: RecommendationRequest): Promise<RecommendationResponse[]> {
  const response = await fetch(`${API_BASE_URL}/api/recommend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}