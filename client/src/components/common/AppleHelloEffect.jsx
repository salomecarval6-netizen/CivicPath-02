import React, { useState, useEffect, useCallback } from 'react';
import { Compass, Sparkles, X } from 'lucide-react';

const STORAGE_KEY = 'civicpath_hello_seen';

export default function AppleHelloEffect({ onComplete }) {
  const [shouldRender, setShouldRender] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const dismiss = useCallback(() => {
    setIsFadingOut(true);
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Safe fallback for private mode / localStorage errors
    }
    const timer = setTimeout(() => {
      setShouldRender(false);
      if (onComplete) onComplete();
    }, 450);
    return () => clearTimeout(timer);
  }, [onComplete]);

  useEffect(() => {
    // Check if already seen
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (seen === 'true') {
        return;
      }
    } catch {
      return;
    }

    // Check reduced motion preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        try {
          localStorage.setItem(STORAGE_KEY, 'true');
        } catch {}
        return;
      }
    }

    setShouldRender(true);

    // Auto-advance after animation completes
    const autoTimer = setTimeout(() => {
      dismiss();
    }, 2800);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        dismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(autoTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [dismiss]);

  if (!shouldRender) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to CivicPath"
      onClick={dismiss}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-500 ${
        isFadingOut
          ? 'opacity-0 scale-105 pointer-events-none'
          : 'opacity-100 scale-100'
      }`}
      style={{
        backdropFilter: 'blur(32px) saturate(180%)',
        WebkitBackdropFilter: 'blur(32px) saturate(180%)',
        backgroundColor: 'var(--apple-hello-bg, rgba(2, 6, 23, 0.88))'
      }}
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/3 -translate-y-1/3 w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg space-y-6">
        {/* Apple Hello Cursive SVG Typography */}
        <div className="relative w-72 sm:w-96 h-36 flex items-center justify-center">
          <svg
            viewBox="0 0 500 200"
            className="w-full h-full drop-shadow-[0_0_25px_rgba(99,102,241,0.5)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Fluid cursive "hello" path */}
            <path
              d="M 50 140 C 45 100, 65 30, 85 30 C 95 30, 95 90, 80 150 C 75 170, 72 175, 78 175 C 88 175, 105 125, 120 110 C 130 100, 140 100, 142 110 C 145 125, 130 150, 120 150 C 115 150, 120 140, 145 130 C 165 120, 185 110, 185 125 C 185 145, 170 155, 160 155 C 150 155, 155 140, 180 130 C 200 120, 215 30, 225 30 C 235 30, 230 90, 215 150 C 210 170, 212 175, 218 175 C 228 175, 245 125, 260 30 C 270 30, 265 90, 250 150 C 245 170, 248 175, 255 175 C 265 175, 280 135, 300 130 C 320 125, 340 135, 335 150 C 330 165, 305 165, 300 150 C 295 135, 315 125, 345 125 C 375 125, 390 145, 410 145"
              stroke="url(#helloGradient)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="apple-hello-path"
            />
            <defs>
              <linearGradient id="helloGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="50%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* CivicPath App Intro */}
        <div className="space-y-2 opacity-0 animate-fade-in-delayed">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            <span>CivicPath • Maharashtra Permitting Guide</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Statutory Clarity for Every Plot
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
            Deterministic UDCPR 2020 workflows, authority clearances, and parallel NOC intelligence.
          </p>
        </div>

        {/* Interaction Hint */}
        <div className="pt-2 text-[11px] text-slate-400 opacity-0 animate-fade-in-delayed-2 flex items-center gap-2">
          <span>Click anywhere or press any key to start</span>
          <span className="text-indigo-400 font-bold">→</span>
        </div>
      </div>
    </div>
  );
}
