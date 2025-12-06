import React from 'react';

export const SnakeIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="8" width="4" height="4" rx="1" fill="currentColor"/>
    <rect x="8" y="8" width="4" height="4" rx="1" fill="currentColor"/>
    <rect x="12" y="8" width="4" height="4" rx="1" fill="currentColor"/>
    <rect x="12" y="12" width="4" height="4" rx="1" fill="currentColor"/>
    <rect x="16" y="12" width="4" height="4" rx="1" fill="currentColor"/>
    <circle cx="6" cy="10" r="0.5" fill="white"/>
    <circle cx="5" cy="10" r="0.5" fill="white"/>
  </svg>
);

export const FruitIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4C12 4 11 2 9 2C9 4 10 5 12 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <ellipse cx="12" cy="13" rx="7" ry="8" fill="currentColor"/>
    <path d="M7 10C7 10 9 12 12 12" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
  </svg>
);

export const RunnerIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="14" cy="6" r="2" fill="currentColor"/>
    <path d="M8 11L11 9L14 11L17 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11 9L9 14L12 16L10 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 11L16 16L19 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const PointsIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L14.5 9H22L16 13.5L18.5 21L12 16.5L5.5 21L8 13.5L2 9H9.5L12 2Z" fill="currentColor"/>
    <circle cx="12" cy="12" r="3" fill="white" opacity="0.3"/>
  </svg>
);

export const TrophyIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 21H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 17V21" stroke="currentColor" strokeWidth="2"/>
    <path d="M7 4H17V8C17 12 14.5 14 12 14C9.5 14 7 12 7 8V4Z" fill="currentColor"/>
    <path d="M17 5H19C20 5 21 6 21 7C21 9 19 10 17 10" stroke="currentColor" strokeWidth="2"/>
    <path d="M7 5H5C4 5 3 6 3 7C3 9 5 10 7 10" stroke="currentColor" strokeWidth="2"/>
    <rect x="10" y="14" width="4" height="3" fill="currentColor"/>
  </svg>
);

export const TargetIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="12" r="1" fill="currentColor"/>
  </svg>
);

export const BoltIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 2L4 14H11L10 22L19 10H12L13 2Z" fill="currentColor"/>
  </svg>
);

export const StarIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L14.5 9H22L16 13.5L18.5 21L12 16.5L5.5 21L8 13.5L2 9H9.5L12 2Z" fill="currentColor"/>
  </svg>
);

export const MedalIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 2L6 8H18L16 2H8Z" fill="currentColor" opacity="0.5"/>
    <circle cx="12" cy="15" r="6" fill="currentColor"/>
    <path d="M12 11L13 14H16L13.5 16L14.5 19L12 17L9.5 19L10.5 16L8 14H11L12 11Z" fill="white" opacity="0.3"/>
  </svg>
);

export const GamepadIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="6" width="20" height="12" rx="4" fill="currentColor"/>
    <circle cx="8" cy="12" r="2" fill="white" opacity="0.3"/>
    <circle cx="16" cy="10" r="1" fill="white" opacity="0.5"/>
    <circle cx="18" cy="12" r="1" fill="white" opacity="0.5"/>
    <circle cx="16" cy="14" r="1" fill="white" opacity="0.5"/>
    <circle cx="14" cy="12" r="1" fill="white" opacity="0.5"/>
  </svg>
);

export const WalletIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="6" width="20" height="14" rx="2" fill="currentColor"/>
    <rect x="14" y="11" width="6" height="4" rx="1" fill="white" opacity="0.3"/>
    <circle cx="17" cy="13" r="1" fill="currentColor"/>
    <path d="M4 6V5C4 3.9 4.9 3 6 3H18C19.1 3 20 3.9 20 5V6" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

export const TonIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L22 12L12 22L2 12L12 2Z" fill="currentColor"/>
    <path d="M12 6L17 12L12 18L7 12L12 6Z" fill="white" opacity="0.3"/>
  </svg>
);
