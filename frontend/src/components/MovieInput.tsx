import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Search, Film, X, Plus, Star, TrendingUp, Calendar, Image as ImageIcon } from 'lucide-react';
import { tmdbService } from '@/service/tmdb';
import { Movie } from '@/types';

interface MovieInputProps {
  movies: Movie[];
  onMoviesChange: (movies: Movie[]) => void;
  maxMovies?: number;
}

export const MovieInput: React.FC<MovieInputProps> = ({ 
  movies, 
  onMoviesChange, 
  maxMovies = 5 
}) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const searchMovies = async () => {
      if (inputValue.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoading(true);
      try {
        console.log('Starting search for:', inputValue);
        const results = await tmdbService.searchMovies(inputValue.trim());
        console.log('Search results:', results);
        setSuggestions(results.slice(0, 10)); // Show up to 10 results
        setShowSuggestions(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Error searching movies:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(searchMovies, 150); // Faster response
    return () => clearTimeout(timeoutId);
  }, [inputValue]);

  const addMovie = (movie?: Movie) => {
    let movieToAdd: Movie | null = null;

    if (movie) {
      movieToAdd = movie;
    } else if (inputValue.trim()) {
      // Create a movie object from input value (fallback)
      movieToAdd = {
        id: Date.now(), // Temporary ID
        title: inputValue.trim(),
        poster_path: null,
        poster_url: null,
        release_date: null,
        overview: null
      };
    }

    if (movieToAdd && movies.length < maxMovies && !movies.some(m => m.title === movieToAdd!.title)) {
      onMoviesChange([...movies, movieToAdd]);
      setInputValue('');
      setShowSuggestions(false);
      setSuggestions([]);
      setSelectedIndex(-1);
      
      // Add to search history
      const newHistory = [movieToAdd.title, ...searchHistory.filter(h => h !== movieToAdd!.title)].slice(0, 5);
      setSearchHistory(newHistory);
    }
  };

  const removeMovie = (movieToRemove: Movie) => {
    onMoviesChange(movies.filter(movie => movie.id !== movieToRemove.id));
  };

  const handleSuggestionClick = (movie: Movie) => {
    addMovie(movie);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        addMovie();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          addMovie(suggestions[selectedIndex]);
        } else {
          addMovie();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isInputDisabled = movies.length >= maxMovies;

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="space-y-4">
        <div className="relative w-full">
            {/* Enhanced Search Container */}
            <motion.div 
              className={`relative transition-all duration-300 ${
                isFocused 
                  ? 'transform scale-[1.02] shadow-xl ring-2 ring-primary/20' 
                  : 'shadow-lg'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              layout
            >
              {/* Search Icon with Animation */}
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                <motion.div
                  animate={{ 
                    scale: isLoading ? [1, 1.2, 1] : 1,
                    rotate: isLoading ? 360 : 0
                  }}
                  transition={{ 
                    duration: isLoading ? 1 : 0.3, 
                    repeat: isLoading ? Infinity : 0,
                    ease: isLoading ? "linear" : "easeOut"
                  }}
                >
                  <Search className={`w-5 h-5 transition-colors duration-200 ${
                    isFocused ? 'text-primary' : 'text-medium-contrast'
                  }`} />
                </motion.div>
              </div>

              {/* Enhanced Input Field - Mobile Optimized */}
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  setIsFocused(true);
                  if (inputValue.trim().length >= 2) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => {
                  setIsFocused(false);
                  // Delay hiding suggestions to allow clicks
                  setTimeout(() => setShowSuggestions(false), 150);
                }}
                placeholder={isInputDisabled ? "Maximum movies reached" : "Search for movies..."}
                className={`w-full pl-10 sm:pl-12 pr-20 sm:pr-24 py-3 sm:py-4 text-base sm:text-lg rounded-xl transition-all duration-300 glass-panel border ${
                  isFocused 
                    ? 'border-primary shadow-lg' 
                    : 'border-input-border hover:border-primary/50'
                } ${
                  isLoading ? 'bg-background-secondary' : 'bg-input-background'
                } ${
                  isInputDisabled ? 'opacity-60 cursor-not-allowed' : ''
                } text-high-contrast placeholder:text-medium-contrast`}
                disabled={isInputDisabled}
                maxLength={50}
                autoComplete="off"
                spellCheck="false"
              />

              {/* Clear Button - Mobile Optimized */}
              <AnimatePresence>
                {inputValue && !isInputDisabled && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => {
                      setInputValue('');
                      setShowSuggestions(false);
                      inputRef.current?.focus();
                    }}
                    className="absolute right-10 sm:right-12 top-1/2 transform -translate-y-1/2 p-2 rounded-full hover:bg-background-secondary transition-colors duration-200 text-medium-contrast hover:text-high-contrast focusable"
                    type="button"
                    title="Clear search"
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Loading Indicator - Mobile Optimized */}
              {isLoading && (
                <motion.div
                  className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-primary border-t-transparent rounded-full" />
                </motion.div>
              )}

              {/* Search Status Indicator */}
              {!isLoading && inputValue.length >= 2 && (
                <motion.div
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  {suggestions.length > 0 ? (
                    <div className="flex items-center gap-1 text-xs text-primary font-medium">
                      <TrendingUp className="w-3 h-3" />
                      <span>{suggestions.length}</span>
                    </div>
                  ) : (
                    <div className="text-xs text-medium-contrast">
                      No results
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>

            {/* Enhanced Movie Suggestions Dropdown */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  ref={suggestionsRef}
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 right-0 mt-3 glass-panel rounded-xl shadow-2xl z-50 border border-card-border overflow-hidden"
                >
                  {/* Suggestions Header */}
                  <div className="px-4 py-3 border-b border-card-border bg-background-secondary/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-medium-contrast">
                        <Film className="w-4 h-4" />
                        <span>Found {suggestions.length} movies</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-low-contrast">
                        <span>↑↓ Navigate</span>
                        <span>•</span>
                        <span>⏎ Select</span>
                      </div>
                    </div>
                  </div>

                  {/* Suggestions List */}
                  <div className="max-h-80 overflow-y-auto suggestions-scrollbar">
                    {suggestions.map((movie, index) => (
                      <motion.div
                        key={movie.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => handleSuggestionClick(movie)}
                        className={`flex items-center gap-4 p-4 cursor-pointer transition-all duration-200 border-b border-card-border/30 last:border-b-0 ${
                          selectedIndex === index
                            ? 'bg-primary text-primary-foreground shadow-lg'
                            : 'hover:bg-background-secondary'
                        }`}
                        onMouseEnter={() => setSelectedIndex(index)}
                        whileHover={{ x: 2 }}
                      >
                        {/* Enhanced Movie Poster */}
                        <div className="flex-shrink-0">
                          {movie.poster_path ? (
                            <div className="w-14 h-20 rounded-lg overflow-hidden shadow-md border border-card-border movie-poster-glow relative group">
                              <Image
                                src={`https://image.tmdb.org/t/p/w154${movie.poster_path}`}
                                alt={movie.title}
                                width={56}
                                height={80}
                                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                              <div className="w-full h-full bg-gradient-to-br from-card-border to-background-secondary flex items-center justify-center hidden">
                                <Film className="w-6 h-6 text-medium-contrast" />
                              </div>
                              {/* Hover overlay */}
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg" />
                            </div>
                          ) : (
                            <div className="w-14 h-20 bg-gradient-to-br from-card-border to-background-secondary rounded-lg flex items-center justify-center border border-card-border">
                              <Film className="w-6 h-6 text-medium-contrast" />
                            </div>
                          )}
                        </div>

                        {/* Enhanced Movie Details */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <h4 className="font-bold text-base truncate scholarly-heading">
                            {movie.title}
                          </h4>
                          <div className="flex items-center gap-3 text-sm">
                            {movie.release_date && (
                              <div className="flex items-center gap-1 opacity-75">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(movie.release_date).getFullYear()}</span>
                              </div>
                            )}
                            {movie.vote_average && movie.vote_average > 0 && (
                              <div className="flex items-center gap-1 opacity-75">
                                <Star className="w-3 h-3 text-primary fill-current" />
                                <span className="font-medium">{movie.vote_average.toFixed(1)}</span>
                              </div>
                            )}
                            {movie.popularity && movie.popularity > 0 && (
                              <div className="flex items-center gap-1 opacity-60">
                                <TrendingUp className="w-3 h-3" />
                                <span className="text-xs">{Math.round(movie.popularity)}</span>
                              </div>
                            )}
                          </div>
                          {movie.overview && (
                            <p className="text-xs opacity-75 line-clamp-2 leading-relaxed">
                              {movie.overview}
                            </p>
                          )}
                        </div>

                        {/* Selection Indicator */}
                        {selectedIndex === index && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="flex-shrink-0"
                          >
                            <div className="w-6 h-6 rounded-full bg-primary-foreground text-primary flex items-center justify-center">
                              <Plus className="w-3 h-3" />
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Suggestions Footer */}
                  <div className="px-4 py-2 border-t border-card-border bg-background-secondary/30">
                    <div className="text-xs text-low-contrast text-center">
                      Powered by The Movie Database (TMDB)
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      {/* Selected Movies with Posters */}
      {movies.length > 0 && (
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-sm font-semibold text-high-contrast scholarly-heading mb-3">
            Selected Movies ({movies.length}/{maxMovies})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {movies.map((movie, index) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.1 }}
                className="glass-panel p-3 rounded-lg border border-card-border hover:border-primary/30 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  {/* Movie Poster - Mobile Optimized */}
                  <div className="relative w-10 h-14 sm:w-12 sm:h-16 rounded overflow-hidden bg-card-bg border border-card-border flex-shrink-0">
                    {movie.poster_url ? (
                      <Image
                        src={movie.poster_url}
                        alt={`${movie.title} poster`}
                        width={48}
                        height={64}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling!.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`absolute inset-0 flex items-center justify-center ${movie.poster_url ? 'hidden' : ''}`}>
                      <ImageIcon className="w-4 h-4 sm:w-6 sm:h-6 text-medium-contrast" />
                    </div>
                  </div>
                  
                  {/* Movie Info - Mobile Optimized */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-medium text-high-contrast truncate scholarly-heading">
                      {movie.title}
                    </h4>
                    {movie.release_date && (
                      <p className="text-xs text-medium-contrast mt-1">
                        {new Date(movie.release_date).getFullYear()}
                      </p>
                    )}
                    {movie.vote_average && movie.vote_average > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-xs text-medium-contrast">
                          {movie.vote_average.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Remove Button */}
                  <motion.button
                    onClick={() => removeMovie(movie)}
                    className="text-medium-contrast hover:text-error transition-colors p-1 rounded opacity-0 group-hover:opacity-100 focusable"
                    aria-label={`Remove ${movie.title}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.p 
        className="text-sm text-medium-contrast manuscript-text"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {movies.length}/{maxMovies} movies added
        {movies.length === maxMovies && (
          <span className="text-warning ml-2 font-medium">
            Maximum reached
          </span>
        )}
      </motion.p>
    </div>
  );
};
