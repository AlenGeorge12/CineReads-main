'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Film, BookOpen, Sparkles } from 'lucide-react';
import { MovieInput } from '@/components/MovieInput';
import { PreferencesPanel } from '@/components/PreferencesPanel';
import { RecommendationResults } from '@/components/RecommendationResult';
import { ErrorMessage } from '@/components/ErrorMessage';
import { ThemeSelector } from '@/components/ThemeSelector';
import { GlassPanel } from '@/components/cinematic/GlassPanel';
import { CineReadsAPI } from '@/service/api';
import { UserPreferences, RecommendationResponse, Movie } from '@/types';

export default function HomePage() {
  const [api] = useState(new CineReadsAPI());
  const [movies, setMovies] = useState<Movie[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [recommendations, setRecommendations] = useState<RecommendationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreferences, setShowPreferences] = useState(false);

  const getRecommendations = async (regenerate = false) => {
    if (movies.length === 0) {
      setError('Please add at least one movie');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Convert Movie objects to strings for the API
      const movieTitles = movies.map(movie => movie.title);
      const results = regenerate 
        ? await api.regenerateRecommendations(movieTitles, preferences)
        : await api.getRecommendations(movieTitles, preferences);
      
      console.log('API Response:', results);
      setRecommendations(results);
    } catch (err) {
      console.error('API Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    getRecommendations(true);
  };

  return (
    <div className="cinematic-background min-h-screen">
      {/* Top Navigation - Mobile Optimized */}
      <motion.div 
        className="fixed top-0 right-0 z-50 p-2 sm:p-4"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <ThemeSelector />
      </motion.div>

      <div className="container-responsive py-4 sm:py-8 space-y-6 sm:space-y-8">
        {/* Header - Mobile Optimized */}
        <motion.div 
          className="text-center space-y-3 sm:space-y-4 pt-12 sm:pt-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1 className="text-3xl sm:text-4xl md:text-6xl font-bold scholarly-heading flex items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6 flex-wrap">
            <motion.div
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <Film className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 text-primary drop-shadow-lg" />
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  background: 'radial-gradient(circle, rgba(212, 175, 55, 0.2) 0%, transparent 70%)',
                  filter: 'blur(8px)'
                }}
              />
            </motion.div>
            <span className="bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              CineReads
            </span>
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <BookOpen className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 text-accent drop-shadow-lg" />
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  background: 'radial-gradient(circle, rgba(184, 134, 11, 0.2) 0%, transparent 70%)',
                  filter: 'blur(8px)'
                }}
              />
            </motion.div>
          </motion.h1>
          
          <motion.div 
            className="space-y-3 sm:space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <p className="text-lg sm:text-xl md:text-2xl text-medium-contrast manuscript-text max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
              Transform your favorite <span className="text-primary font-semibold">cinematic tales</span> into 
              <span className="text-accent font-semibold"> literary journeys</span> through the wisdom of AI
            </p>
            <motion.div 
              className="flex items-center justify-center gap-2 text-low-contrast"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium tracking-wide">DISCOVER • EXPLORE • READ</span>
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Main Content - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <GlassPanel className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
            {/* Movie Input */}
            <div>
              <motion.label 
                className="block text-base sm:text-lg font-semibold text-high-contrast mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3 scholarly-heading"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="w-1 h-5 sm:h-6 bg-primary rounded-full" />
                <span className="text-sm sm:text-base">Your Cinematic Inspirations</span>
              </motion.label>
              <MovieInput
                movies={movies}
                onMoviesChange={setMovies}
                maxMovies={5}
              />
            </div>

            {/* Preferences */}
            <PreferencesPanel
              preferences={preferences}
              onPreferencesChange={setPreferences}
              isOpen={showPreferences}
              onToggle={() => setShowPreferences(!showPreferences)}
            />

            {/* Action Button - Mobile Optimized */}
            <motion.div 
              className="flex gap-2 sm:gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <motion.button
                onClick={() => getRecommendations(false)}
                disabled={movies.length === 0 || loading}
                className="btn-primary flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-lg flex items-center justify-center gap-2 scholarly-heading focusable text-sm sm:text-base"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  animate={{ 
                    rotate: loading ? 360 : 0,
                    scale: loading ? [1, 1.1, 1] : 1
                  }}
                  transition={{ 
                    duration: loading ? 2 : 0.3, 
                    repeat: loading ? Infinity : 0, 
                    ease: "linear" 
                  }}
                >
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.div>
                <span className="hidden sm:inline">
                  {loading ? 'Consulting the Literary Oracle...' : 'Discover Literary Treasures'}
                </span>
                <span className="sm:hidden">
                  {loading ? 'Searching...' : 'Discover Books'}
                </span>
              </motion.button>
            </motion.div>
          </GlassPanel>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
            className="px-4 sm:px-0"
          >
            <ErrorMessage message={error} />
          </motion.div>
        )}

        {/* Results Section - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <GlassPanel className="p-4 sm:p-6 md:p-8">
            <RecommendationResults
              recommendations={recommendations}
              loading={loading}
              onRegenerate={handleRegenerate}
            />
          </GlassPanel>
        </motion.div>

        {/* Enhanced Footer - Mobile Optimized */}
        <motion.footer
          className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-card-border px-4 sm:px-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <div className="text-center space-y-3 sm:space-y-4">
            <motion.div 
              className="flex items-center justify-center gap-4 sm:gap-6 text-medium-contrast flex-wrap"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-2">
                <Film className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                <span className="text-xs sm:text-sm font-medium">Powered by TMDB</span>
              </div>
              <div className="w-px h-3 sm:h-4 bg-card-border" />
              <div className="flex items-center gap-2">
                <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-accent" />
                <span className="text-xs sm:text-sm font-medium">& Hardcover</span>
              </div>
            </motion.div>
            <p className="text-xs text-low-contrast manuscript-text px-4">
              Bridging the worlds of cinema and literature with artificial intelligence
            </p>
            <motion.div 
              className="flex items-center justify-center gap-1 text-xs text-low-contrast"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <span>Made with</span>
              <motion.span 
                className="text-primary"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                ♦
              </motion.span>
              <span>for book lovers</span>
            </motion.div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}