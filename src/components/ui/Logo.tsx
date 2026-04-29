import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Logo: React.FC<LogoProps> = ({ className, size = 'md' }) => {
  const sizes = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-32 h-32',
    xl: 'w-64 h-64'
  };

  return (
    <div className={cn(
      "relative rounded-full rounded-full flex items-center justify-center overflow-hidden bg-black p-1",
      sizes[size],
      className
    )}>
      <div className="absolute inset-0 rounded-full border-2 border-primary-gold/50 shadow-[0_0_15px_rgba(212,175,55,0.3)]"></div>
      <img 
        src="/logo.png" 
        alt="Team Kavyati Logo" 
        className="w-full h-full object-cover"
        // Fallback for when the image isn't found yet
        onError={(e) => {
          e.currentTarget.src = "https://placehold.co/400x400/000000/C8960C?text=TK";
        }}
      />
    </div>
  );
};

export default Logo;
