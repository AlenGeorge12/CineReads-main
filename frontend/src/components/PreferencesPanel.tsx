import { motion } from 'framer-motion';
import { Settings, X, Smile, Frown, Heart, Skull, Clock, Zap } from 'lucide-react';
import { UserPreferences, MoodOption, PaceOption } from '@/types';
import { GlassPanel } from './cinematic/GlassPanel';

interface PreferencesPanelProps {
  preferences: UserPreferences;
  onPreferencesChange: (preferences: UserPreferences) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const moodOptions: MoodOption[] = [
  { value: 'light', label: 'Light & Fun', icon: Smile },
  { value: 'serious', label: 'Serious & Deep', icon: Frown },
  { value: 'romantic', label: 'Romantic', icon: Heart },
  { value: 'dark', label: 'Dark & Intense', icon: Skull }
];

const paceOptions: PaceOption[] = [
  { value: 'slow', label: 'Slow & Contemplative', icon: Clock },
  { value: 'fast', label: 'Fast & Thrilling', icon: Zap }
];

const genreBlocklist = [
  'Horror', 'Romance', 'Fantasy', 'Sci-Fi', 'Mystery', 'Historical Fiction', 
  'Young Adult', 'Biography', 'Self-Help', 'Poetry'
];

export const PreferencesPanel: React.FC<PreferencesPanelProps> = ({
  preferences,
  onPreferencesChange,
  isOpen,
  onToggle
}) => {
  const updatePreferences = (key: keyof UserPreferences, value: string | string[] | null) => {
    onPreferencesChange({
      ...preferences,
      [key]: value
    });
  };

  const toggleGenreBlock = (genre: string) => {
    const current = preferences.genre_blocklist || [];
    const updated = current.includes(genre)
      ? current.filter(g => g !== genre)
      : [...current, genre];
    
    updatePreferences('genre_blocklist', updated);
  };

  if (!isOpen) {
    return (
      <motion.button
        onClick={onToggle}
        className="btn-secondary px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 focusable text-sm sm:text-base"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="font-medium">Customize Preferences</span>
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <GlassPanel className="p-4 sm:p-6 space-y-4 sm:space-y-6" hover={false}>
        {/* Header - Mobile Optimized */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-1 h-5 sm:h-6 bg-primary rounded-full" />
            <h3 className="text-base sm:text-lg font-semibold text-high-contrast scholarly-heading">
              Reading Preferences
            </h3>
          </div>
          
          <button
            onClick={onToggle}
            className="text-medium-contrast hover:text-high-contrast transition-colors p-1 rounded focusable"
            aria-label="Close preferences"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Mood Preference - Mobile Optimized */}
        <div>
          <label className="block text-sm font-semibold text-high-contrast mb-2 sm:mb-3 scholarly-heading">
            Mood Preference
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {moodOptions.map(({ value, label, icon: Icon }) => (
              <motion.button
                key={value}
                onClick={() => updatePreferences('mood', preferences.mood === value ? null : value)}
                className={`preference-option p-2.5 sm:p-3 rounded-lg flex items-center gap-2 text-sm font-medium focusable ${
                  preferences.mood === value ? 'selected' : ''
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">{label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Pacing Preference - Mobile Optimized */}
        <div>
          <label className="block text-sm font-semibold text-high-contrast mb-2 sm:mb-3 scholarly-heading">
            Pacing Preference
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {paceOptions.map(({ value, label, icon: Icon }) => (
              <motion.button
                key={value}
                onClick={() => updatePreferences('pace', preferences.pace === value ? null : value)}
                className={`preference-option p-2.5 sm:p-3 rounded-lg flex items-center gap-2 text-sm font-medium focusable ${
                  preferences.pace === value ? 'selected' : ''
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">{label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Genres to Avoid - Mobile Optimized */}
        <div>
          <label className="block text-sm font-semibold text-high-contrast mb-2 sm:mb-3 scholarly-heading">
            Genres to Avoid
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {genreBlocklist.map((genre) => (
              <motion.button
                key={genre}
                onClick={() => toggleGenreBlock(genre)}
                className={`preference-option p-2 sm:p-2.5 rounded-lg text-xs font-medium text-center focusable ${
                  (preferences.genre_blocklist || []).includes(genre) ? 'selected' : ''
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-xs">{genre}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </GlassPanel>
    </motion.div>
  );
};