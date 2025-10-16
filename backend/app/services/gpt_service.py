import openai
from typing import List, Dict, Any
from app.config import settings
from app.models.request_models import UserPreferences
from app.models.response_models import RecommendationResponse, BookRecommendation, TasteProfile
import json
import asyncio
import logging

logger = logging.getLogger(__name__)

class GPTService:
    def __init__(self):
        if not settings.openai_api_key:
            raise ValueError("OpenAI API key is required")
        self.client = openai.AsyncOpenAI(api_key=settings.openai_api_key)  # Use AsyncOpenAI
    
    async def generate_recommendations(self, movies: List[str], preferences: UserPreferences = None) -> List[RecommendationResponse]:
        """
        Generate unified book recommendations based on user's overall taste profile
        derived from their movie preferences
        """
        prompt = self._build_unified_prompt(movies, preferences)
        
        try:
            response = await self.client.chat.completions.create(  # Add await
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": self._get_system_prompt()},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1500,  # Increased for better responses
                temperature=0.7
            )
            
            content = response.choices[0].message.content
            return self._parse_unified_response(content, movies)
            
        except Exception as e:
            logger.error(f"GPT API error: {str(e)}")
            # Return fallback instead of raising
            return self._create_fallback_response(movies)
    
    def _get_system_prompt(self) -> str:
        """Optimized system prompt for unified recommendations"""
        return """You are a literary taste analyst specializing in cross-media pattern recognition.

CORE TASK: Analyze movie preferences → Extract unified aesthetic patterns → Recommend books matching that profile

ANALYSIS PRINCIPLES:
- Identify narrative DNA (themes, tone, complexity) across ALL movies
- Focus on overarching patterns, not individual movie matches
- Extract emotional resonance and artistic sensibilities
- Handle genre conflicts by finding deeper connective tissue

SCORING CALIBRATION:
- confidence_score: 0.9+ = clear patterns, 0.7-0.8 = moderate patterns, <0.7 = conflicting signals
- taste_match_score: 0.9+ = exceptional thematic alignment, 0.8+ = strong match, 0.7+ = good fit

QUALITY STANDARDS:
- Each book reason: 75+ words explaining taste profile connection
- Avoid obvious/surface-level matches
- Prioritize literary quality and thematic depth
- Return exactly the JSON format specified (no extra text)

EDGE CASE HANDLING:
- Single movie: Focus on directorial style, themes, narrative approach
- Conflicting genres: Find deeper aesthetic commonalities
- Obscure films: Analyze based on available thematic elements"""

    def _get_json_schema(self) -> str:
        """Returns the expected JSON response schema"""
        return """{
  "taste_profile": {
    "themes": ["theme1", "theme2", "theme3"],
    "narrative_style": "concise description of storytelling preferences",
    "emotional_tone": "preferred emotional register",
    "genre_fusion": "genre preferences and blending patterns",
    "character_preferences": "preferred character archetypes and development",
    "artistic_sensibilities": "aesthetic and stylistic preferences",
    "confidence_score": 0.85
  },
  "unified_recommendations": [
    {
      "title": "Book Title",
      "author": "Author Name", 
      "reason": "75+ word explanation connecting to unified taste profile",
      "taste_match_score": 0.95,
      "primary_appeal": "core aspect of taste this book satisfies"
    }
  ]
}"""

    def _build_unified_prompt(self, movies: List[str], preferences: UserPreferences = None) -> str:
        """Build an optimized prompt for unified recommendations"""
        movies_str = ", ".join(movies)
        books_count = getattr(settings, 'books_per_recommendation', 3)
        
        # Handle single vs multiple movie scenarios
        if len(movies) == 1:
            analysis_instruction = f"Analyze {movies[0]} to extract the viewer's aesthetic preferences:"
        else:
            analysis_instruction = f"Find the unified taste pattern across: {movies_str}"
        
        prompt = f"""{analysis_instruction}

STEP 1 - TASTE ANALYSIS:
Extract the aesthetic DNA by identifying:
• Recurring themes and emotional territories
• Narrative complexity preferences (linear/non-linear, character vs. plot-driven)
• Tonal signatures (dark/light, realistic/fantastical, introspective/action-oriented)
• Character archetype preferences and relationship dynamics
• Visual/atmospheric sensibilities that translate to literary mood

STEP 2 - BOOK RECOMMENDATIONS:
Select {books_count} books that share this aesthetic DNA. Prioritize:
• Thematic resonance over genre matching
• Narrative sophistication level alignment
• Emotional and tonal consistency
• Character depth matching viewer preferences"""

        # Add user preferences if provided
        if preferences:
            constraint_list = []
            if preferences.mood:
                constraint_list.append(f"Mood alignment: {preferences.mood}")
            if preferences.pace:
                constraint_list.append(f"Pacing: {preferences.pace}")
            if preferences.genre_preferences:
                constraint_list.append(f"Favor: {', '.join(preferences.genre_preferences)}")
            if preferences.genre_blocklist:
                constraint_list.append(f"Avoid: {', '.join(preferences.genre_blocklist)}")
            
            if constraint_list:
                prompt += f"\n\nCONSTRAINTS:\n• " + "\n• ".join(constraint_list)

        prompt += f"\n\nReturn response as valid JSON matching this exact structure:\n{self._get_json_schema()}"
        
        return prompt
    
    def _parse_unified_response(self, content: str, movies: List[str]) -> List[RecommendationResponse]:
        """Parse the unified response into the expected format"""
        try:
            # Clean up the response to extract JSON
            content = content.strip()
            
            # Find JSON boundaries
            json_start = content.find('{')
            json_end = content.rfind('}') + 1
            
            if json_start == -1 or json_end <= json_start:
                logger.error("No valid JSON found in GPT response")
                return self._create_fallback_response(movies)
            
            json_str = content[json_start:json_end]
            data = json.loads(json_str)
            
            # Validate required fields
            if 'unified_recommendations' not in data:
                logger.error("Missing unified_recommendations in response")
                return self._create_fallback_response(movies)
            
            # Extract unified recommendations
            unified_books = []
            for book_data in data.get('unified_recommendations', []):
                if not book_data.get('title') or not book_data.get('author'):
                    continue
                    
                book = BookRecommendation(
                    title=book_data['title'],
                    author=book_data['author'],
                    reason=book_data.get('reason', ''),
                    taste_match_score=book_data.get('taste_match_score'),
                    primary_appeal=book_data.get('primary_appeal')
                )
                unified_books.append(book)
            
            if not unified_books:
                logger.error("No valid book recommendations found")
                return self._create_fallback_response(movies)
            
            # Create taste profile
            taste_profile_data = data.get('taste_profile', {})
            taste_profile = TasteProfile(
                themes=taste_profile_data.get('themes', []),
                narrative_style=taste_profile_data.get('narrative_style', ''),
                emotional_tone=taste_profile_data.get('emotional_tone', ''),
                genre_fusion=taste_profile_data.get('genre_fusion', ''),
                character_preferences=taste_profile_data.get('character_preferences', ''),
                artistic_sensibilities=taste_profile_data.get('artistic_sensibilities', ''),
                confidence_score=taste_profile_data.get('confidence_score', 0.7)
            )
            
            # Return as a single recommendation response for the unified taste
            movie_summary = self._create_movie_summary(movies, taste_profile_data)
            
            return [RecommendationResponse(
                movie=movie_summary,
                books=unified_books,
                taste_profile=taste_profile
            )]
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {e}")
            logger.error(f"Content: {content}")
            return self._create_fallback_response(movies)
        except Exception as e:
            logger.error(f"Error parsing unified response: {e}")
            return self._create_fallback_response(movies)
    
    def _create_movie_summary(self, movies: List[str], taste_profile: Dict) -> str:
        """Create a summary of the user's movie selection and taste profile"""
        if len(movies) == 1:
            return f"Based on your interest in {movies[0]}"
        elif len(movies) == 2:
            return f"Based on your taste for {movies[0]} and {movies[1]}"
        else:
            return f"Based on your taste profile from {', '.join(movies[:-1])}, and {movies[-1]}"
    
    def _create_fallback_response(self, movies: List[str]) -> List[RecommendationResponse]:
        """Fallback response in case of parsing errors"""
        logger.warning("Using fallback response due to GPT parsing error")
        
        # Create a simple unified recommendation
        fallback_books = [
            BookRecommendation(
                title="The Seven Husbands of Evelyn Hugo",
                author="Taylor Jenkins Reid",
                reason="A compelling narrative that combines character depth with emotional complexity, appealing to viewers who appreciate sophisticated storytelling.",
                taste_match_score=0.8,
                primary_appeal="Character-driven storytelling"
            ),
            BookRecommendation(
                title="Klara and the Sun",
                author="Kazuo Ishiguro",
                reason="Masterful blend of speculative elements with profound human themes, perfect for those who enjoy thoughtful, emotionally resonant narratives.",
                taste_match_score=0.85,
                primary_appeal="Thoughtful speculative fiction"
            ),
            BookRecommendation(
                title="The Midnight Library",
                author="Matt Haig",
                reason="Philosophical exploration of life choices and possibilities, combining accessibility with deeper existential themes.",
                taste_match_score=0.75,
                primary_appeal="Philosophical exploration"
            )
        ]
        
        fallback_taste_profile = TasteProfile(
            themes=["character development", "emotional depth", "existential themes"],
            narrative_style="Layered, character-driven storytelling",
            emotional_tone="Thoughtful and introspective",
            genre_fusion="Literary fiction with speculative elements",
            character_preferences="Complex, well-developed characters",
            artistic_sensibilities="Appreciation for literary craftsmanship",
            confidence_score=0.6
        )
        
        movie_summary = self._create_movie_summary(movies, {})
        
        return [RecommendationResponse(
            movie=movie_summary,
            books=fallback_books,
            taste_profile=fallback_taste_profile
        )]

    async def analyze_taste_profile(self, movies: List[str], preferences: UserPreferences = None) -> Dict[str, Any]:
        """
        Optimized method to analyze and return taste profile
        Useful for frontend display or further processing
        """
        movies_str = ", ".join(movies)
        
        prompt = f"""Extract the unified aesthetic profile from: {movies_str}

ANALYSIS FRAMEWORK:
• Thematic territories: Core emotional/philosophical themes
• Narrative DNA: Structural and storytelling preferences  
• Tonal signature: Emotional register and atmospheric preferences
• Character archetypes: Relationship dynamics and development patterns
• Artistic sensibilities: Visual/stylistic elements that translate to literary mood

SCORING: Rate confidence (0.5-1.0) based on pattern clarity across films.

RESPONSE FORMAT:
{{
  "themes": ["specific thematic elements"],
  "narrative_style": "storytelling approach preferences",
  "emotional_tone": "tonal and atmospheric preferences", 
  "genre_fusion": "genre blending and boundary preferences",
  "character_preferences": "character type and development preferences",
  "artistic_sensibilities": "aesthetic and stylistic preferences",
  "confidence_score": 0.85
}}"""
        
        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are an expert in cross-media aesthetic analysis. Extract unified patterns from film preferences. Always respond with valid JSON only."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=600,  # Reduced for efficiency
                temperature=0.6  # Slightly lower for more consistent analysis
            )
            
            content = response.choices[0].message.content
            json_start = content.find('{')
            json_end = content.rfind('}') + 1
            json_str = content[json_start:json_end]
            
            return json.loads(json_str)
            
        except Exception as e:
            logger.error(f"Error analyzing taste profile: {e}")
            return {
                "themes": ["character-driven narratives", "emotional complexity"],
                "narrative_style": "Layered, sophisticated storytelling",
                "emotional_tone": "Thoughtful and emotionally resonant",
                "genre_fusion": "Cross-genre sensibilities", 
                "character_preferences": "Complex, well-developed characters",
                "artistic_sensibilities": "Appreciation for narrative craftsmanship",
                "confidence_score": 0.5
            }