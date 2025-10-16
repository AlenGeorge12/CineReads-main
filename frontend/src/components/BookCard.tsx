import { motion } from 'framer-motion';
import Image from 'next/image';
import { BookOpen, Star, ExternalLink, Quote } from 'lucide-react';
import { BookRecommendation } from '@/types';

interface BookCardProps {
  book: BookRecommendation;
  index?: number;
}

export const BookCard: React.FC<BookCardProps> = ({ book, index = 0 }) => {
  return (
    <motion.div 
      className="card-enhanced p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ y: -4 }}
    >
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-8">
        {/* Book Cover - Mobile Optimized */}
        <div className="flex-shrink-0 self-center sm:self-start">
          <motion.div 
            className="relative overflow-hidden rounded-xl shadow-lg group/cover book-spine"
            whileHover={{ scale: 1.05, rotateY: 5 }}
            transition={{ duration: 0.3 }}
          >
            {book.cover_url ? (
              <Image
                src={book.cover_url}
                alt={`Cover of ${book.title}`}
                width={112}
                height={168}
                className="w-28 h-42 sm:w-32 sm:h-48 object-cover transition-all duration-300 group-hover/cover:brightness-110"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : (
              <div className="w-28 h-42 sm:w-32 sm:h-48 bg-gradient-to-br from-card-border via-background-secondary to-card rounded-xl flex items-center justify-center border border-card-border">
                <div className="text-center">
                  <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-medium-contrast mx-auto mb-2" />
                  <span className="text-xs text-low-contrast font-medium">No Cover</span>
                </div>
              </div>
            )}
            
            {/* Fallback placeholder */}
            <div className={`absolute inset-0 bg-gradient-to-br from-card-border via-background-secondary to-card rounded-xl flex items-center justify-center border border-card-border ${book.cover_url ? 'hidden' : ''}`}>
              <div className="text-center">
                <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-medium-contrast mx-auto mb-2" />
                <span className="text-xs text-low-contrast font-medium">No Cover</span>
              </div>
            </div>
            
            {/* Enhanced hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
            
            {/* Subtle glow effect */}
            <div className="absolute inset-0 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
              boxShadow: `0 0 20px ${book.cover_url ? 'rgba(212, 175, 55, 0.3)' : 'rgba(132, 129, 121, 0.2)'}`
            }} />
          </motion.div>
        </div>
        
        {/* Book Details - Mobile Optimized */}
        <div className="flex-1 min-w-0 space-y-3 sm:space-y-4 text-center sm:text-left">
          {/* Header with title and rating */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-2 sm:gap-3">
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <motion.h3 
                  className="text-base sm:text-lg font-bold text-high-contrast scholarly-heading line-clamp-2 leading-tight"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {book.title}
                </motion.h3>
                <motion.p 
                  className="text-sm sm:text-base text-medium-contrast font-medium manuscript-text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  by {book.author}
                </motion.p>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                {book.rating && (
                  <motion.div 
                    className="flex items-center gap-1 glass-panel px-2 py-1 rounded-lg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                  >
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 text-primary fill-current" />
                    <span className="text-xs sm:text-sm font-semibold text-high-contrast">
                      {book.rating.toFixed(1)}
                    </span>
                  </motion.div>
                )}
                
                {book.hardcover_url && (
                  <motion.a
                    href={book.hardcover_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-panel p-2 rounded-lg text-primary hover:text-primary-hover transition-colors focusable group/link"
                    title="View on Hardcover"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 group-hover/link:rotate-12 transition-transform" />
                  </motion.a>
                )}
              </div>
            </div>
          </div>
          
          {/* Recommendation reason - Mobile Optimized */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3 mt-2">
              <Quote className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-1 mx-auto sm:mx-0" />
              <p className="text-sm sm:text-base text-high-contrast leading-relaxed manuscript-text text-center sm:text-left">
                {book.reason}
              </p>
            </div>
            
            {/* Decorative bottom line */}
            <motion.div 
              className="absolute bottom-0 left-1/2 sm:left-0 transform -translate-x-1/2 sm:translate-x-0 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "30%" }}
              transition={{ delay: 0.6, duration: 0.8 }}
            />
          </motion.div>
        </div>
      </div>
      
      {/* Subtle hover effect background */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        initial={false}
      />
    </motion.div>
  );
};