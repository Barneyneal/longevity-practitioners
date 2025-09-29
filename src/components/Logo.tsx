import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <img
      alt="Logo"
      className={`h-20 w-auto ${className}`}
      src="/brand/Longevity Direct.png"
    />
  );
};

export default Logo; 