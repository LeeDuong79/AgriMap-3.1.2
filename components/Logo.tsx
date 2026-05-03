import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6 w-auto',
    md: 'h-10 w-auto',
    lg: 'h-20 w-auto',
    xl: 'h-32 w-auto'
  };

  return (
    <svg 
      viewBox="0 0 512 512" 
      className={`${sizeClasses[size]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Map Base with stylized fields */}
      <path d="M56 380 L256 460 L456 380 L256 300 Z" fill="#15803d" />
      <path d="M56 380 L256 300 L256 460 Z" fill="#166534" />
      
      {/* Left side field segments */}
      <path d="M60 375 L150 340 L150 415 L60 375 Z" fill="#eab308" opacity="0.8" />
      <path d="M160 335 L250 305 L250 380 L160 335 Z" fill="#22c55e" opacity="0.6" />
      
      {/* Right side field segments */}
      <path d="M452 375 L362 340 L362 415 L452 375 Z" fill="#0369a1" opacity="0.7" />
      <path d="M352 335 L262 305 L262 380 L352 335 Z" fill="#ca8a04" opacity="0.8" />

      {/* Main Pin */}
      <path 
        d="M256 40 C180 40 120 100 120 180 C120 280 256 400 256 400 C256 400 392 280 392 180 C392 100 332 40 256 40 Z" 
        fill="#166534" 
        stroke="#fff" 
        strokeWidth="12"
      />
      
      {/* Inner White Circle */}
      <circle cx="256" cy="180" r="75" fill="#fff" />
      
      {/* Sun Icon inside Pin */}
      <circle cx="256" cy="150" r="25" fill="#f59e0b" />
      <g stroke="#f59e0b" strokeWidth="4" strokeLinecap="round">
        <line x1="256" y1="110" x2="256" y2="120" />
        <line x1="256" y1="180" x2="256" y2="190" />
        <line x1="216" y1="150" x2="226" y2="150" />
        <line x1="286" y1="150" x2="296" y2="150" />
        <line x1="228" y1="122" x2="235" y2="129" />
        <line x1="277" y1="171" x2="284" y2="178" />
        <line x1="228" y1="178" x2="235" y2="171" />
        <line x1="277" y1="129" x2="284" y2="122" />
      </g>

      {/* Leaf Icon inside Pin */}
      <path 
        d="M256 160 C256 160 216 190 216 230 C216 250 236 260 256 260 C276 260 296 250 296 230 C296 190 256 160 256 160 Z" 
        fill="#22c55e" 
      />
      <path d="M256 160 L256 260" stroke="#166534" strokeWidth="3" />
    </svg>
  );
};
