import { Film, BookOpen, Sparkles } from 'lucide-react';
import { BookCard } from './BookCard';
import { RecommendationResponse } from '@/types';

interface RecommendationResultsProps {
  recommendations: RecommendationResponse[];
  loading: boolean;
  onRegenerate: () => void;
}

export const RecommendationResults: React.FC<RecommendationResultsProps> = ({
  recommendations,
  loading,
  onRegenerate
}) => {
  console.log('RecommendationResults component received:', {
    recommendations,
    loading,
    recommendationsLength: recommendations?.length,
    firstRecommendation: recommendations?.[0]
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-medium-contrast scholarly-heading">Finding perfect book matches...</p>
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 text-medium-contrast mx-auto mb-4" />
        <p className="text-medium-contrast scholarly-heading">No recommendations yet. Add some movies to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-high-contrast scholarly-heading flex items-center gap-2 text-center sm:text-left">
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          <span>Your Book Recommendations</span>
        </h2>
        <button
          onClick={onRegenerate}
          className="btn-secondary px-4 sm:px-6 py-2 sm:py-3 rounded-xl flex items-center gap-2 focusable text-sm sm:text-base"
        >
          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>Regenerate</span>
        </button>
      </div>

      {recommendations.map((recommendation, index) => (
        <div key={index} className="space-y-4 sm:space-y-6">
          <div className="flex items-center gap-2 sm:gap-3 pb-3 sm:pb-4 border-b border-card-border">
            <Film className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
            <h3 className="text-lg sm:text-xl font-semibold text-high-contrast scholarly-heading text-center sm:text-left">
              Based on your taste for {recommendation.movie}
            </h3>
          </div>
          
          <div className="grid gap-3 sm:gap-4">
            {recommendation.books.map((book, bookIndex) => (
              <BookCard key={bookIndex} book={book} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};