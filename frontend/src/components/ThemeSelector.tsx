import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Check, ChevronDown } from 'lucide-react';

const themes = [
  {
    name: 'Venetian Study',
    value: 'venetian',
    preview: 'linear-gradient(135deg, #1a0f0a 0%, #2d1a12 50%, #3d2518 100%)',
    description: 'Rich mahogany and bronze',
    accent: '#d4af37',
    icon: '🏛️'
  },
  {
    name: 'Midnight Scholar',
    value: 'midnight',
    preview: 'linear-gradient(135deg, #0c0c14 0%, #1a1a2e 50%, #16213e 100%)',
    description: 'Deep indigo with silver',
    accent: '#c9d1d9',
    icon: '🌙'
  },
  {
    name: 'Emerald Library',
    value: 'emerald',
    preview: 'linear-gradient(135deg, #0a1a0f 0%, #1a2d1f 50%, #2a3d2f 100%)',
    description: 'Forest depths with gold',
    accent: '#d4af37',
    icon: '🌲'
  },
  {
    name: 'Obsidian Vault',
    value: 'obsidian',
    preview: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #2a2a2a 100%)',
    description: 'Pure darkness with copper',
    accent: '#cd7f32',
    icon: '⚫'
  },
  {
    name: 'Crimson Archive',
    value: 'crimson',
    preview: 'linear-gradient(135deg, #1a0a0a 0%, #2d1212 50%, #3d1f1f 100%)',
    description: 'Dark burgundy with gold',
    accent: '#ffd700',
    icon: '🍷'
  },
  {
    name: 'Sage Codex',
    value: 'sage',
    preview: 'linear-gradient(135deg, #14180f 0%, #252d1f 50%, #363d2f 100%)',
    description: 'Muted sage with brass',
    accent: '#b5a642',
    icon: '📚'
  },
  {
    name: 'Royal Scriptorium',
    value: 'royal',
    preview: 'linear-gradient(135deg, #0a0d1a 0%, #1e2a3a 50%, #2c4156 100%)',
    description: 'Deep navy with platinum',
    accent: '#c9a96e',
    icon: '👑'
  },
  {
    name: 'Sepia Manuscript',
    value: 'sepia',
    preview: 'linear-gradient(135deg, #1a1408 0%, #2d2415 50%, #3d3220 100%)',
    description: 'Aged parchment warmth',
    accent: '#d4c48a',
    icon: '📜'
  }
];

export const ThemeSelector: React.FC = () => {
  const [selectedTheme, setSelectedTheme] = useState('classic');
  const [isOpen, setIsOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('cinereads-theme') || 'venetian';
    setSelectedTheme(savedTheme);
  }, []);

  const applyTheme = (themeValue: string) => {
    const root = document.documentElement;
    
    switch (themeValue) {
      case 'midnight':
        root.style.setProperty('--background', '#0c0c14');
        root.style.setProperty('--background-secondary', '#1a1a2e');
        root.style.setProperty('--foreground', '#f8f9fa');
        root.style.setProperty('--foreground-secondary', '#e9ecef');
        root.style.setProperty('--foreground-muted', '#ced4da');
        root.style.setProperty('--primary', '#c9d1d9');
        root.style.setProperty('--primary-hover', '#d7dee5');
        root.style.setProperty('--accent', '#8b9dc3');
        root.style.setProperty('--card', '#16213e');
        root.style.setProperty('--card-border', '#2c3e50');
        root.style.setProperty('--input-background', '#1a1a2e');
        root.style.setProperty('--input-border', '#2c3e50');
        root.style.setProperty('--glass-background', 'rgba(22, 33, 62, 0.85)');
        root.style.setProperty('--glass-border', 'rgba(201, 209, 217, 0.3)');
        break;
      case 'emerald':
        root.style.setProperty('--background', '#0a1a0f');
        root.style.setProperty('--background-secondary', '#1a2d1f');
        root.style.setProperty('--foreground', '#f0f8f4');
        root.style.setProperty('--foreground-secondary', '#e6f4ea');
        root.style.setProperty('--foreground-muted', '#c1d4c7');
        root.style.setProperty('--primary', '#d4af37');
        root.style.setProperty('--primary-hover', '#e6c547');
        root.style.setProperty('--accent', '#7ba862');
        root.style.setProperty('--card', '#2a3d2f');
        root.style.setProperty('--card-border', '#4a5d4f');
        root.style.setProperty('--input-background', '#1a2d1f');
        root.style.setProperty('--input-border', '#4a5d4f');
        root.style.setProperty('--glass-background', 'rgba(42, 61, 47, 0.85)');
        root.style.setProperty('--glass-border', 'rgba(212, 175, 55, 0.3)');
        break;
      case 'obsidian':
        root.style.setProperty('--background', '#0f0f0f');
        root.style.setProperty('--background-secondary', '#1a1a1a');
        root.style.setProperty('--foreground', '#f5f5f5');
        root.style.setProperty('--foreground-secondary', '#e8e8e8');
        root.style.setProperty('--foreground-muted', '#cccccc');
        root.style.setProperty('--primary', '#cd7f32');
        root.style.setProperty('--primary-hover', '#e0924a');
        root.style.setProperty('--accent', '#a0662a');
        root.style.setProperty('--card', '#2a2a2a');
        root.style.setProperty('--card-border', '#404040');
        root.style.setProperty('--input-background', '#1a1a1a');
        root.style.setProperty('--input-border', '#404040');
        root.style.setProperty('--glass-background', 'rgba(42, 42, 42, 0.85)');
        root.style.setProperty('--glass-border', 'rgba(205, 127, 50, 0.3)');
        break;
      case 'crimson':
        root.style.setProperty('--background', '#1a0a0a');
        root.style.setProperty('--background-secondary', '#2d1212');
        root.style.setProperty('--foreground', '#faf8f8');
        root.style.setProperty('--foreground-secondary', '#f0e8e8');
        root.style.setProperty('--foreground-muted', '#d4c4c4');
        root.style.setProperty('--primary', '#ffd700');
        root.style.setProperty('--primary-hover', '#ffe55c');
        root.style.setProperty('--accent', '#dc7272');
        root.style.setProperty('--card', '#3d1f1f');
        root.style.setProperty('--card-border', '#5d2f2f');
        root.style.setProperty('--input-background', '#2d1212');
        root.style.setProperty('--input-border', '#5d2f2f');
        root.style.setProperty('--glass-background', 'rgba(61, 31, 31, 0.85)');
        root.style.setProperty('--glass-border', 'rgba(255, 215, 0, 0.3)');
        break;
      case 'sage':
        root.style.setProperty('--background', '#14180f');
        root.style.setProperty('--background-secondary', '#252d1f');
        root.style.setProperty('--foreground', '#f4f6f0');
        root.style.setProperty('--foreground-secondary', '#eaf0e4');
        root.style.setProperty('--foreground-muted', '#d0d8c4');
        root.style.setProperty('--primary', '#b5a642');
        root.style.setProperty('--primary-hover', '#c9ba54');
        root.style.setProperty('--accent', '#8b9562');
        root.style.setProperty('--card', '#363d2f');
        root.style.setProperty('--card-border', '#4d543f');
        root.style.setProperty('--input-background', '#252d1f');
        root.style.setProperty('--input-border', '#4d543f');
        root.style.setProperty('--glass-background', 'rgba(54, 61, 47, 0.85)');
        root.style.setProperty('--glass-border', 'rgba(181, 166, 66, 0.3)');
        break;
      case 'royal':
        root.style.setProperty('--background', '#0a0d1a');
        root.style.setProperty('--background-secondary', '#1e2a3a');
        root.style.setProperty('--foreground', '#f0f4f8');
        root.style.setProperty('--foreground-secondary', '#e2e8ee');
        root.style.setProperty('--foreground-muted', '#c4d0dc');
        root.style.setProperty('--primary', '#c9a96e');
        root.style.setProperty('--primary-hover', '#dbb980');
        root.style.setProperty('--accent', '#8fa2b7');
        root.style.setProperty('--card', '#152028');
        root.style.setProperty('--card-border', '#2c4156');
        root.style.setProperty('--input-background', '#1e2a3a');
        root.style.setProperty('--input-border', '#2c4156');
        root.style.setProperty('--glass-background', 'rgba(21, 32, 40, 0.85)');
        root.style.setProperty('--glass-border', 'rgba(201, 169, 110, 0.3)');
        break;
      case 'sepia':
        root.style.setProperty('--background', '#1a1408');
        root.style.setProperty('--background-secondary', '#2d2415');
        root.style.setProperty('--foreground', '#f4f0e0');
        root.style.setProperty('--foreground-secondary', '#e8e0d0');
        root.style.setProperty('--foreground-muted', '#d0c4a8');
        root.style.setProperty('--primary', '#d4c48a');
        root.style.setProperty('--primary-hover', '#e0d09c');
        root.style.setProperty('--accent', '#b8a870');
        root.style.setProperty('--card', '#252018');
        root.style.setProperty('--card-border', '#3d3220');
        root.style.setProperty('--input-background', '#2d2415');
        root.style.setProperty('--input-border', '#3d3220');
        root.style.setProperty('--glass-background', 'rgba(37, 32, 24, 0.85)');
        root.style.setProperty('--glass-border', 'rgba(212, 196, 138, 0.3)');
        break;
      case 'venetian':
      default:
        root.style.setProperty('--background', '#1a0f0a');
        root.style.setProperty('--background-secondary', '#2d1a12');
        root.style.setProperty('--foreground', '#f8f2e8');
        root.style.setProperty('--foreground-secondary', '#ede4d8');
        root.style.setProperty('--foreground-muted', '#d4c4b0');
        root.style.setProperty('--primary', '#d4af37');
        root.style.setProperty('--primary-hover', '#e6c547');
        root.style.setProperty('--accent', '#b8860b');
        root.style.setProperty('--card', '#251810');
        root.style.setProperty('--card-border', '#3d2518');
        root.style.setProperty('--input-background', '#2d1a12');
        root.style.setProperty('--input-border', '#3d2518');
        root.style.setProperty('--glass-background', 'rgba(37, 24, 16, 0.85)');
        root.style.setProperty('--glass-border', 'rgba(212, 175, 55, 0.3)');
    }
  };

  useEffect(() => {
    applyTheme(selectedTheme);
    
    // Keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        setIsOpen(false);
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const currentIndex = themes.findIndex(t => t.value === selectedTheme);
        const nextIndex = e.key === 'ArrowDown' 
          ? (currentIndex + 1) % themes.length
          : (currentIndex - 1 + themes.length) % themes.length;
        setSelectedTheme(themes[nextIndex].value);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedTheme, isOpen]);

  const handleThemeChange = (themeValue: string) => {
    setSelectedTheme(themeValue);
    setIsOpen(false);
    
    // Save theme preference
    localStorage.setItem('cinereads-theme', themeValue);
    
    // Show notification
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
    
    // Add sparkle effect
    createSparkleEffect();
  };

  const createSparkleEffect = () => {
    const sparkles = ['✨', '⭐', '💫', '🌟'];
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        const sparkle = document.createElement('div');
        sparkle.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
        sparkle.className = 'theme-change-sparkle';
        sparkle.style.left = Math.random() * window.innerWidth + 'px';
        sparkle.style.top = Math.random() * window.innerHeight + 'px';
        sparkle.style.fontSize = (Math.random() * 10 + 15) + 'px';
        document.body.appendChild(sparkle);
        
        setTimeout(() => {
          document.body.removeChild(sparkle);
        }, 800);
      }, i * 100);
    }
  };

  const selectedThemeData = themes.find(t => t.value === selectedTheme);

  return (
    <div className="relative">
      {/* Theme Change Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: -60, scale: 1 }}
            exit={{ opacity: 0, y: -80, scale: 0.8 }}
            className="absolute top-0 right-0 glass-panel px-3 py-2 rounded-lg z-60 whitespace-nowrap"
          >
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Palette className="w-4 h-4 text-primary" />
              </motion.div>
              <span className="text-sm font-medium text-high-contrast">
                Theme applied!
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 glass-panel rounded-lg hover:bg-background-secondary transition-all duration-300 focusable group"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div 
          className="w-5 h-5 rounded-full border-2 border-foreground-muted shadow-inner"
          style={{ background: selectedThemeData?.preview }}
        />
        <div className="flex flex-col items-start">
          <span className="text-high-contrast font-medium text-sm scholarly-heading">
            {selectedThemeData?.name}
          </span>
          <span className="text-low-contrast text-xs manuscript-text">
            {selectedThemeData?.description}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-medium-contrast group-hover:text-high-contrast transition-colors" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full right-0 mt-2 w-72 glass-panel rounded-xl p-2 z-50 shadow-xl"
            >
              <div className="space-y-1">
                {themes.map((theme, index) => (
                  <motion.button
                    key={theme.value}
                    onClick={() => handleThemeChange(theme.value)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                      selectedTheme === theme.value
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-background-secondary'
                    }`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ x: 2 }}
                  >
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-current shadow-inner"
                        style={{ background: theme.preview }}
                      />
                      <span className="text-lg">{theme.icon}</span>
                    </div>
                    <div className="flex flex-col items-start flex-1">
                      <span className="font-medium text-sm scholarly-heading">
                        {theme.name}
                      </span>
                      <span className="text-xs opacity-75 manuscript-text">
                        {theme.description}
                      </span>
                    </div>
                    {selectedTheme === theme.value && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        <Check className="w-4 h-4" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
              
              <div className="mt-3 pt-3 border-t border-card-border">
                <div className="flex items-center gap-2 px-3 py-2">
                  <Palette className="w-4 h-4 text-medium-contrast" />
                  <span className="text-xs text-medium-contrast manuscript-text">
                    Choose your scholarly atmosphere
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};