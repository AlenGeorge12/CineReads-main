import httpx
import asyncio
from typing import Optional, Dict, Any, List
from app.config import settings
import logging

logger = logging.getLogger(__name__)

class HardcoverService:
    def __init__(self):
        self.api_url = "https://api.hardcover.app/v1/graphql"
        self.api_key = settings.hardcover_api_key
        self.timeout = settings.hardcover_timeout_seconds
        self.retry_attempts = settings.hardcover_retry_attempts

    def _get_auth_header(self) -> str:
        """Get properly formatted authorization header"""
        # Hardcover API expects "Bearer" prefix with capital Authorization header
        return f"Bearer {self.api_key}"

    def _clean_search_query(self, query: str) -> str:
        """Clean up search query to improve results"""
        if not query:
            return ""
            
        cleaned = query.lower().strip()
        
        # Remove common articles and prepositions that might hurt search
        stop_words = {"the", "a", "an", "of", "in", "on", "at", "to", "for", "with"}
        words = cleaned.split()
        
        # Only remove stop words if we have enough words left
        if len(words) > 2:
            filtered_words = [word for word in words if word not in stop_words]
            if filtered_words:  # Make sure we don't return empty
                cleaned = " ".join(filtered_words)
        
        return cleaned

    async def get_book_metadata(self, title: str, author: str = "") -> Optional[Dict[str, Any]]:
        """
        Get comprehensive book metadata from Hardcover API using GraphQL search
        """
        if not settings.enable_hardcover_integration:
            logger.info("Hardcover integration is disabled")
            return None
            
        # Check if API key is properly configured
        if not self.api_key or self.api_key.endswith("..."):
            logger.warning("Hardcover API key is missing or truncated. Please check your .env file.")
            return None
            
        try:
            # Try multiple search strategies
            search_strategies = []
            
            # Strategy 1: Title + Author
            if author:
                search_strategies.append(f"{title} {author}")
            
            # Strategy 2: Just title
            search_strategies.append(title)
            
            # Strategy 3: Title without common words
            title_cleaned = self._clean_search_query(title)
            if title_cleaned and title_cleaned != title:
                search_strategies.append(title_cleaned)
                
            # Strategy 4: Author + Title (sometimes works better)
            if author:
                search_strategies.append(f"{author} {title}")
            
            logger.info(f"Searching for book: '{title}' by '{author}' using {len(search_strategies)} strategies")
            
            for attempt in range(self.retry_attempts):
                try:
                    # Try each search strategy
                    for i, search_query in enumerate(search_strategies):
                        logger.info(f"Attempt {attempt + 1}, Strategy {i + 1}: Searching with query '{search_query}'")
                        metadata = await self._search_books(search_query)
                        if metadata:
                            logger.info(f"Successfully found metadata for '{title}' using strategy {i + 1}")
                            return metadata
                    
                    # If no strategies worked on this attempt, log and continue
                    logger.warning(f"No results found on attempt {attempt + 1} for '{title}'")
                    
                except httpx.TimeoutException:
                    logger.warning(f"Timeout on attempt {attempt + 1} for book: {title}")
                    if attempt < self.retry_attempts - 1:
                        await asyncio.sleep(1 * (attempt + 1))  # Exponential backoff
                    continue
                except httpx.HTTPStatusError as e:
                    if e.response.status_code == 401:
                        logger.error("Hardcover API authentication failed. Please check your API key.")
                        return None  # Don't retry on auth errors
                    elif e.response.status_code == 429:  # Rate limited
                        logger.warning(f"Rate limited on attempt {attempt + 1}")
                        await asyncio.sleep(5 * (attempt + 1))  # Longer wait for rate limits
                        continue
                    else:
                        logger.error(f"HTTP error {e.response.status_code} for book: {title}")
                        break
                except Exception as e:
                    logger.error(f"Unexpected error on attempt {attempt + 1} for book {title}: {e}")
                    break
            
            logger.warning(f"No metadata found for book: {title} by {author}")
            return None
            
        except Exception as e:
            logger.error(f"Hardcover API error for '{title}': {e}")
            return None

    async def _search_books(self, query: str) -> Optional[Dict[str, Any]]:
        """Search for books using Hardcover's search GraphQL query"""
        headers = {
            "Authorization": self._get_auth_header(),
            "Content-Type": "application/json",
            "User-Agent": "BookRecommendationService/1.0"
        }
        
        # Updated search query - results is a jsonb scalar, not an object
        graphql_query = {
            "query": """
            query SearchBooks($searchQuery: String!, $perPage: Int!, $page: Int!) {
                search(query: $searchQuery, query_type: "books", per_page: $perPage, page: $page, sort: "activities_count:desc") {
                    results
                    page
                    per_page
                    query
                    error
                }
            }
            """,
            "variables": {
                "searchQuery": query,
                "perPage": 10,  # Increased from 5 to get more options
                "page": 1
            }
        }
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(self.api_url, headers=headers, json=graphql_query)
                response.raise_for_status()
                data = response.json()
                
                # Debug: Log the full response for debugging
                logger.debug(f"Full API response for query '{query}': {data}")

                if data and "data" in data and "search" in data["data"]:
                    search_data = data["data"]["search"]
                    
                    # Check for errors first
                    if search_data.get("error"):
                        logger.error(f"Search API error: {search_data['error']}")
                        return None
                    
                    # Results is a jsonb scalar containing search results structure
                    results_json = search_data.get("results")
                    if results_json:
                        try:
                            # Parse the JSON results if it's a string
                            import json
                            if isinstance(results_json, str):
                                results_data = json.loads(results_json)
                            else:
                                results_data = results_json  # Already parsed
                            
                            # Extract hits from the search results structure
                            if isinstance(results_data, dict) and "hits" in results_data:
                                hits = results_data["hits"]
                                if hits:
                                    # Extract documents from hits
                                    results = []
                                    for hit in hits:
                                        if "document" in hit:
                                            results.append(hit["document"])
                                    
                                    logger.info(f"Search for '{query}' returned {len(results)} results")
                                    
                                    # Log the first few results for debugging
                                    for i, book in enumerate(results[:3]):
                                        title = book.get('title', 'Unknown Title')
                                        author_names = book.get('author_names', [])
                                        logger.info(f"Result {i+1}: '{title}' by {author_names}")
                                    
                                    # Find the best match from search results
                                    best_match = self._find_best_search_match(results, query)
                                    if best_match:
                                        logger.info(f"Best match selected: '{best_match.get('title')}'")
                                        # Extract metadata directly from search results
                                        return self._extract_metadata_from_search_result(best_match)
                                    else:
                                        logger.warning(f"No suitable match found in {len(results)} results for query: '{query}'")
                                else:
                                    logger.warning(f"No hits in search results for '{query}'")
                            else:
                                logger.warning(f"Unexpected results structure for '{query}': {type(results_data)}")
                                
                        except json.JSONDecodeError as e:
                            logger.error(f"Failed to parse search results JSON: {e}")
                        except Exception as e:
                            logger.error(f"Error processing search results: {e}")
                    else:
                        logger.warning(f"No results in search response for '{query}'")
                else:
                    logger.warning(f"No search data in API response for '{query}'. Response structure: {list(data.keys()) if data else 'None'}")
                    if data and "errors" in data:
                        logger.error(f"GraphQL errors: {data['errors']}")
                        
        except Exception as e:
            logger.error(f"Error in _search_books: {e}")
            
        return None

    async def _get_book_details_by_id(self, book_id: str) -> Optional[Dict[str, Any]]:
        """
        Get detailed book information using the book ID
        This method is kept for potential future use or for getting additional details
        not available in search results
        """
        if not book_id:
            return None
            
        headers = {
            "Authorization": self._get_auth_header(),
            "Content-Type": "application/json",
            "User-Agent": "BookRecommendationService/1.0"
        }
        
        # Use exact match query by ID (this should work since we're not using ilike)
        graphql_query = {
            "query": """
            query GetBookDetails($bookId: Int!) {
                books(where: {id: {_eq: $bookId}}, limit: 1) {
                    id
                    title
                    subtitle
                    description
                    rating
                    pages
                    release_date
                    release_year
                    genres
                    slug
                    users_count
                    ratings_count
                    image {
                        url
                    }
                    contributions {
                        author {
                            name
                        }
                        contribution_type
                    }
                }
            }
            """,
            "variables": {"bookId": int(book_id)}
        }
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(self.api_url, headers=headers, json=graphql_query)
                response.raise_for_status()
                data = response.json()

                if data and "data" in data and "books" in data["data"] and data["data"]["books"]:
                    book_data = data["data"]["books"][0]
                    return self._extract_metadata_from_book(book_data)
                    
        except Exception as e:
            logger.error(f"Error getting book details for ID {book_id}: {e}")
        
        return None

    def _find_best_search_match(self, results: List[Dict], query: str) -> Optional[Dict]:
        """Find the best matching book from search results"""
        if not results:
            return None
            
        query_lower = query.lower().strip()
        logger.info(f"Matching query '{query_lower}' against {len(results)} results")
        
        # Extract title and author from query
        title_part = query_lower
        author_part = ""
        
        if " by " in query_lower:
            parts = query_lower.split(" by ")
            title_part = parts[0].strip()
            author_part = parts[1].strip() if len(parts) > 1 else ""
        elif len(query_lower.split()) > 3:  # Likely "title author" format
            words = query_lower.split()
            # Assume last 1-2 words are author
            title_part = " ".join(words[:-2])
            author_part = " ".join(words[-2:])
        
        logger.info(f"Extracted - Title: '{title_part}', Author: '{author_part}'")
        
        # Score each result
        scored_results = []
        
        for book in results:
            if not book or not book.get("title"):
                continue
                
            book_title = book.get("title", "").lower().strip()
            score = 0
            
            # Title matching with multiple strategies
            if book_title == title_part:
                score = 100
            elif title_part in book_title:
                score = 90
            elif book_title in title_part:
                score = 85
            else:
                # Word overlap scoring
                title_words = set(title_part.split())
                book_words = set(book_title.split())
                
                # Remove common words that don't help with matching
                stop_words = {"the", "a", "an", "of", "in", "on", "at", "to", "for", "with", "by"}
                title_words = title_words - stop_words
                book_words = book_words - stop_words
                
                if title_words and book_words:
                    overlap = len(title_words & book_words)
                    union = len(title_words | book_words)
                    if overlap > 0:
                        # Jaccard similarity
                        similarity = overlap / union
                        score = similarity * 80
            
            # Author matching if we have author info
            if author_part and score > 0:
                book_authors = book.get("author_names", [])
                
                author_match = False
                for book_author in book_authors:
                    book_author_lower = book_author.lower()
                    # Check if author matches
                    if author_part in book_author_lower or book_author_lower in author_part:
                        author_match = True
                        break
                    
                    # Check word overlap for author
                    author_words = set(author_part.split())
                    book_author_words = set(book_author_lower.split())
                    if len(author_words & book_author_words) > 0:
                        author_match = True
                        break
                
                if author_match:
                    score += 20  # Bonus for author match
                else:
                    score *= 0.7  # Penalty for author mismatch
            
            # Popularity bonuses (smaller impact)
            if book.get("rating") and book["rating"] > 0:
                score += min(5, book["rating"])
            if book.get("users_count") and book["users_count"] > 100:
                score += min(3, book["users_count"] / 1000)
            
            if score > 0:
                scored_results.append((score, book))
                logger.debug(f"  - '{book_title}' scored {score:.1f}")
        
        # Sort by score and return best match
        if scored_results:
            scored_results.sort(key=lambda x: x[0], reverse=True)
            best_score, best_book = scored_results[0]
            
            # Much lower threshold since search endpoint should return relevant results
            if best_score > 10:  # Reduced from 20
                logger.info(f"Selected best match: '{best_book.get('title')}' (score: {best_score:.1f})")
                return best_book
            else:
                logger.warning(f"Best match has too low score: {best_score:.1f}")
        
        logger.warning(f"No suitable match found for query: '{query_lower}'")
        return None

    def _extract_metadata_from_search_result(self, book_data: Dict) -> Dict[str, Any]:
        """Extract and normalize metadata from Hardcover search result document"""
        # Extract author information - search results have author_names array
        authors = book_data.get("author_names", [])
        main_author = authors[0] if authors else None
        
        # Extract image URL from search results structure
        cover_url = None
        if book_data.get("image") and book_data["image"].get("url"):
            cover_url = book_data["image"]["url"]
        
        # Create Hardcover URL using slug
        hardcover_url = None
        if book_data.get("slug"):
            hardcover_url = f"https://hardcover.app/books/{book_data['slug']}"
        
        # Map search result fields to our standard format
        return {
            "title": book_data.get("title"),
            "author": main_author,
            "authors": authors,  # All authors
            "cover_url": cover_url,
            "rating": book_data.get("rating"),
            "rating_count": book_data.get("ratings_count"),
            "users_count": book_data.get("users_count"),
            "url": hardcover_url,
            "publication_year": book_data.get("release_year"),
            "release_date": book_data.get("release_date"),
            "page_count": book_data.get("pages"),
            "description": book_data.get("description"),
            "genres": book_data.get("genres", []),
            "subtitle": book_data.get("subtitle"),
            "hardcover_id": book_data.get("id"),
            "slug": book_data.get("slug")
        }

    def _extract_metadata_from_book(self, book_data: Dict) -> Dict[str, Any]:
        """Extract and normalize metadata from Hardcover book response (for direct book queries)"""
        # This method is kept for compatibility and potential future use
        return self._extract_metadata_from_search_result(book_data)

    async def get_multiple_books_metadata(self, books: List[tuple]) -> List[Optional[Dict[str, Any]]]:
        """
        Get metadata for multiple books concurrently
        
        Args:
            books: List of (title, author) tuples
        """
        if not settings.enable_hardcover_integration:
            return [None] * len(books)
        
        # Limit concurrent requests to respect rate limits (60/min according to docs)
        semaphore = asyncio.Semaphore(min(5, settings.max_concurrent_book_requests))
        
        async def fetch_with_semaphore(title: str, author: str = ""):
            async with semaphore:
                # Add delay between requests to respect rate limits
                await asyncio.sleep(1.1)  # ~55 requests per minute to be safe
                return await self.get_book_metadata(title, author)
        
        # Create tasks for all books
        tasks = [fetch_with_semaphore(title, author) for title, author in books]
        
        # Execute all tasks concurrently
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Handle exceptions
        processed_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(f"Error fetching metadata for book {books[i]}: {result}")
                processed_results.append(None)
            else:
                processed_results.append(result)
        
        return processed_results

    async def health_check(self) -> Dict[str, Any]:
        """Check if the Hardcover API is accessible"""
        try:
            headers = {
                "Authorization": self._get_auth_header(),
                "Content-Type": "application/json",
                "User-Agent": "BookRecommendationService/1.0"
            }
            
            # Simple GraphQL query to test connection using search
            # This avoids potential issues with the me query
            test_query = {
                "query": """
                query TestConnection {
                    search(query: "test", query_type: "books", per_page: 1, page: 1) {
                        results {
                            id
                            title
                        }
                    }
                }
                """
            }
            
            async with httpx.AsyncClient(timeout=5) as client:
                response = await client.post(self.api_url, headers=headers, json=test_query)
                response.raise_for_status()
                data = response.json()
                
                if data and "data" in data and "search" in data["data"]:
                    return {
                        "status": "healthy",
                        "api_accessible": True,
                        "response_time": response.elapsed.total_seconds()
                    }
                else:
                    return {
                        "status": "unhealthy",
                        "api_accessible": False,
                        "error": "Invalid response format"
                    }
                    
        except httpx.HTTPStatusError as e:
            return {
                "status": "unhealthy",
                "api_accessible": False,
                "error": f"HTTP {e.response.status_code}: {e.response.text}"
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "api_accessible": False,
                "error": str(e)
            }

    async def search_books_by_themes(self, themes: List[str], limit: int = 10) -> List[Dict[str, Any]]:
        """
        Search for books by themes/genres using the search endpoint
        """
        if not settings.enable_hardcover_integration:
            return []
            
        try:
            # Create search query from themes
            search_query = " ".join(themes)
            
            headers = {
                "Authorization": self._get_auth_header(),
                "Content-Type": "application/json",
                "User-Agent": "BookRecommendationService/1.0"
            }
            
            graphql_query = {
                "query": """
                query SearchBooksByThemes($searchQuery: String!, $perPage: Int!) {
                    search(query: $searchQuery, query_type: "books", per_page: $perPage, page: 1, sort: "rating:desc") {
                        results
                        error
                    }
                }
                """,
                "variables": {
                    "searchQuery": search_query,
                    "perPage": min(limit, 20)  # API might have limits
                }
            }
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(self.api_url, headers=headers, json=graphql_query)
                response.raise_for_status()
                data = response.json()

                if data and "data" in data and "search" in data["data"]:
                    search_data = data["data"]["search"]
                    
                    # Check for errors first
                    if search_data.get("error"):
                        logger.error(f"Search API error: {search_data['error']}")
                        return []
                    
                    # Parse results similar to _search_books method
                    results_json = search_data.get("results")
                    if results_json:
                        try:
                            import json
                            if isinstance(results_json, str):
                                results_data = json.loads(results_json)
                            else:
                                results_data = results_json
                            
                            if isinstance(results_data, dict) and "hits" in results_data:
                                hits = results_data["hits"]
                                results = []
                                for hit in hits:
                                    if "document" in hit:
                                        book_details = self._extract_metadata_from_search_result(hit["document"])
                                        if book_details:
                                            results.append(book_details)
                                            if len(results) >= limit:
                                                break
                                return results
                        except Exception as e:
                            logger.error(f"Error processing theme search results: {e}")
                    
        except Exception as e:
            logger.error(f"Error searching books by themes {themes}: {e}")
        
        return []