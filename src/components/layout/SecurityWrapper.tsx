import React, { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';

interface SecurityWrapperProps {
  children: React.ReactNode;
}

const SecurityWrapper: React.FC<SecurityWrapperProps> = ({ children }) => {
  const [isBlurred, setIsBlurred] = useState(false);

  useEffect(() => {
    // Blur on Visibility Change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsBlurred(true);
      } else {
        setIsBlurred(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className={cn(
      "min-h-screen transition-all duration-300",
      isBlurred && "blur-[20px] pointer-events-none select-none"
    )}>
      {children}
    </div>
  );
};

export default SecurityWrapper;
