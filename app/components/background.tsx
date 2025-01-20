// src/components/Background.tsx
import React from 'react';

interface BackgroundProps {
  children: React.ReactNode;
  className?: string;
}

const Background: React.FC<BackgroundProps> = ({ children, className }) => {
  return (
    <div className={`bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 min-h-screen ${className}`}>
      {children}
    </div>
  );
};

export default Background;
