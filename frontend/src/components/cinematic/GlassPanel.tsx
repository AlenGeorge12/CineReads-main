import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  className,
  hover = true
}) => {
  return (
    <div
      className={cn(
        'glass-panel',
        hover && 'transition-all duration-300',
        className
      )}
    >
      {children}
    </div>
  );
};