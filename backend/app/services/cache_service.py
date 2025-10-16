import json
import hashlib
import os
from pathlib import Path
from datetime import datetime, timedelta
from typing import Any, Optional
import asyncio
import aiofiles
from threading import Lock

class CacheService:
    def __init__(self, cache_dir: str = "cache"):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(exist_ok=True)
        self._lock = Lock()
        self._cleanup_started = False
        
        # Create subdirectories for organization
        (self.cache_dir / "recommendations").mkdir(exist_ok=True)
        (self.cache_dir / "books").mkdir(exist_ok=True)
        (self.cache_dir / "taste_profiles").mkdir(exist_ok=True)
        
        # Note: Cleanup will be started on first cache operation
    
    def _json_serializer(self, obj):
        """Custom JSON serializer for Pydantic models and other objects"""
        if hasattr(obj, 'model_dump'):
            # Pydantic v2 model
            return obj.model_dump()
        elif hasattr(obj, 'dict'):
            # Pydantic v1 model (fallback)
            return obj.dict()
        elif hasattr(obj, '__dict__'):
            # Generic object with attributes
            return obj.__dict__
        else:
            # Fallback to string representation
            return str(obj)
    
    def _generate_cache_key(self, key: str) -> str:
        """Generate a safe filename from cache key"""
        return hashlib.md5(key.encode()).hexdigest()
    
    def _get_cache_file_path(self, key: str, cache_type: str = "recommendations") -> Path:
        """Get the full path for a cache file"""
        safe_key = self._generate_cache_key(key)
        return self.cache_dir / cache_type / f"{safe_key}.json"
    
    async def _ensure_cleanup_started(self):
        """Start cleanup task if not already started"""
        if not self._cleanup_started:
            self._cleanup_started = True
            try:
                asyncio.create_task(self._cleanup_expired_cache())
            except RuntimeError:
                # No event loop running, cleanup will happen later
                pass

    async def get(self, key: str, cache_type: str = "recommendations") -> Optional[Any]:
        """Get cached value if it exists and hasn't expired"""
        await self._ensure_cleanup_started()
        cache_file = self._get_cache_file_path(key, cache_type)
        
        try:
            if not cache_file.exists():
                return None
            
            async with aiofiles.open(cache_file, 'r') as f:
                content = await f.read()
                cache_data = json.loads(content)
            
            # Check if cache has expired
            expired_at = datetime.fromisoformat(cache_data['expired_at'])
            if datetime.now() > expired_at:
                # Remove expired cache file
                await self._remove_cache_file(cache_file)
                return None
            
            return cache_data['value']
            
        except (json.JSONDecodeError, KeyError, ValueError, OSError):
            # If cache file is corrupted, remove it
            await self._remove_cache_file(cache_file)
            return None
    
    async def set(self, key: str, value: Any, expire: int = 3600, cache_type: str = "recommendations"):
        """Set cached value with expiration"""
        await self._ensure_cleanup_started()
        cache_file = self._get_cache_file_path(key, cache_type)
        
        try:
            # Calculate expiration time
            expired_at = datetime.now() + timedelta(seconds=expire)
            
            cache_data = {
                'value': value,
                'created_at': datetime.now().isoformat(),
                'expired_at': expired_at.isoformat(),
                'key': key,  # Store original key for debugging
                'cache_type': cache_type,
                'version': '2.0'  # Version for cache format
            }
            
            # Write to cache file atomically
            temp_file = cache_file.with_suffix('.tmp')
            async with aiofiles.open(temp_file, 'w') as f:
                await f.write(json.dumps(cache_data, default=self._json_serializer, indent=2))
            
            # Atomic rename
            temp_file.rename(cache_file)
            
        except (OSError, TypeError, ValueError) as e:
            # Log error but don't fail the request
            print(f"Cache write error for key '{key}': {e}")
    
    async def delete(self, key: str, cache_type: str = "recommendations"):
        """Delete a specific cache entry"""
        cache_file = self._get_cache_file_path(key, cache_type)
        await self._remove_cache_file(cache_file)
    
    async def clear_all(self, cache_type: Optional[str] = None):
        """Clear all cache entries, optionally filtered by type"""
        if cache_type:
            cache_dir = self.cache_dir / cache_type
            if cache_dir.exists():
                for cache_file in cache_dir.glob("*.json"):
                    await self._remove_cache_file(cache_file)
        else:
            # Clear all cache types
            for cache_file in self.cache_dir.rglob("*.json"):
                await self._remove_cache_file(cache_file)
    
    async def _remove_cache_file(self, cache_file: Path):
        """Safely remove a cache file"""
        try:
            if cache_file.exists():
                cache_file.unlink()
        except OSError:
            pass  # File might have been removed by another process
    
    async def _cleanup_expired_cache(self):
        """Background task to clean up expired cache files"""
        try:
            current_time = datetime.now()
            
            for cache_file in self.cache_dir.rglob("*.json"):
                try:
                    async with aiofiles.open(cache_file, 'r') as f:
                        content = await f.read()
                        cache_data = json.loads(content)
                    
                    expired_at = datetime.fromisoformat(cache_data['expired_at'])
                    if current_time > expired_at:
                        await self._remove_cache_file(cache_file)
                        
                except (json.JSONDecodeError, KeyError, ValueError, OSError):
                    # Remove corrupted cache files
                    await self._remove_cache_file(cache_file)
                    
        except Exception as e:
            print(f"Cache cleanup error: {e}")
    
    async def get_cache_stats(self) -> dict:
        """Get cache statistics for monitoring"""
        try:
            stats = {
                'total_files': 0,
                'total_size_bytes': 0,
                'by_type': {},
                'version_info': {}
            }
            
            for cache_file in self.cache_dir.rglob("*.json"):
                stats['total_files'] += 1
                file_size = cache_file.stat().st_size
                stats['total_size_bytes'] += file_size
                
                # Categorize by parent directory
                cache_type = cache_file.parent.name
                if cache_type not in stats['by_type']:
                    stats['by_type'][cache_type] = {'files': 0, 'size_bytes': 0}
                
                stats['by_type'][cache_type]['files'] += 1
                stats['by_type'][cache_type]['size_bytes'] += file_size
                
                # Check cache version
                try:
                    async with aiofiles.open(cache_file, 'r') as f:
                        content = await f.read()
                        cache_data = json.loads(content)
                        version = cache_data.get('version', '1.0')
                        stats['version_info'][version] = stats['version_info'].get(version, 0) + 1
                except:
                    stats['version_info']['unknown'] = stats['version_info'].get('unknown', 0) + 1
            
            return stats
            
        except Exception as e:
            return {'error': str(e)}

    async def get_cache_metadata(self, key: str, cache_type: str = "recommendations") -> Optional[dict]:
        """Get metadata about a cached item without loading the full value"""
        cache_file = self._get_cache_file_path(key, cache_type)
        
        try:
            if not cache_file.exists():
                return None
            
            async with aiofiles.open(cache_file, 'r') as f:
                content = await f.read()
                cache_data = json.loads(content)
            
            return {
                'key': cache_data.get('key'),
                'created_at': cache_data.get('created_at'),
                'expired_at': cache_data.get('expired_at'),
                'cache_type': cache_data.get('cache_type'),
                'version': cache_data.get('version', '1.0'),
                'file_size': cache_file.stat().st_size,
                'is_expired': datetime.now() > datetime.fromisoformat(cache_data['expired_at'])
            }
            
        except (json.JSONDecodeError, KeyError, ValueError, OSError):
            return None

# Helper function to create cache key for recommendations
def create_recommendation_cache_key(movies: list, preferences: dict = None, recommendation_type: str = "unified") -> str:
    """Create a consistent cache key for movie recommendations"""
    # Sort movies for consistent hashing
    sorted_movies = sorted([movie.lower().strip() for movie in movies])
    
    # Create a deterministic representation
    cache_data = {
        'movies': sorted_movies,
        'preferences': preferences or {},
        'type': recommendation_type,
        'version': '2.0'  # Include version in cache key
    }
    
    # Create hash-friendly string
    cache_string = json.dumps(cache_data, sort_keys=True)
    return f"movies_v2:{hashlib.md5(cache_string.encode()).hexdigest()}"

# Helper function to create cache key for book metadata
def create_book_cache_key(title: str, author: str = "") -> str:
    """Create a consistent cache key for book metadata"""
    book_key = f"{title.lower().strip()}:{author.lower().strip()}"
    return f"book_v2:{hashlib.md5(book_key.encode()).hexdigest()}"

# Helper function to create cache key for taste profiles
def create_taste_profile_cache_key(movies: list, preferences: dict = None) -> str:
    """Create a consistent cache key for taste profiles"""
    sorted_movies = sorted([movie.lower().strip() for movie in movies])
    
    cache_data = {
        'movies': sorted_movies,
        'preferences': preferences or {},
        'type': 'taste_profile',
        'version': '2.0'
    }
    
    cache_string = json.dumps(cache_data, sort_keys=True)
    return f"taste_profile_v2:{hashlib.md5(cache_string.encode()).hexdigest()}"