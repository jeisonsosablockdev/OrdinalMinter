import React from "react";

interface FoxIconProps {
  size?: number;
  className?: string;
}

const FoxIcon: React.FC<FoxIconProps> = ({ size = 24, className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="100" height="100" rx="20" fill="currentColor" className="text-primary" />
      <path 
        d="M30 25L50 25L60 35L70 35L70 75L40 75L30 65L30 25Z" 
        fill="currentColor" 
        className="text-gray-800" 
      />
      <path 
        d="M30 25L50 25L50 35L40 35L40 65L30 65L30 25Z" 
        fill="currentColor" 
        className="text-white" 
      />
      <circle cx="45" cy="45" r="5" fill="currentColor" className="text-gray-800" />
    </svg>
  );
};

export default FoxIcon;
