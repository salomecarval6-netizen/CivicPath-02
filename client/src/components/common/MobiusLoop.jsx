import React from 'react';
import clsx from 'clsx';

export default function MobiusLoop({
  size = 64,
  className = '',
  color = '#6366f1'
}) {
  return (
    <div
      className={clsx(
        'relative flex items-center justify-center select-none',
        className
      )}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full animate-mobius drop-shadow-[0_0_18px_rgba(99,102,241,0.6)]"
      >
        <defs>
          <linearGradient id="mobiusGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="50%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <linearGradient id="mobiusGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>

        {/* 3D Infinity / Mobius Loop Path 1 */}
        <path
          d="M 50 50 C 35 25, 10 25, 10 50 C 10 75, 35 75, 50 50 C 65 25, 90 25, 90 50 C 90 75, 65 75, 50 50 Z"
          stroke="url(#mobiusGradient1)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Inner Counter-ribbon loop */}
        <path
          d="M 50 50 C 40 32, 20 32, 20 50 C 20 68, 40 68, 50 50 C 60 32, 80 32, 80 50 C 80 68, 60 68, 50 50 Z"
          stroke="url(#mobiusGradient2)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="8 6"
        />
      </svg>
    </div>
  );
}
