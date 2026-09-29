import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Compass } from 'lucide-react';

const SESSION_KEY = 'civicpath_intro_seen';
const PARTICLE_COLORS = ['#38bdf8', '#60a5fa', '#818cf8'];
const PARTICLE_COUNT = 70;

export default function CivicIntroScreen({ onFinish }) {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  const completeIntro = useCallback(() => {
    setIsFadingOut(true);
    try {
      sessionStorage.setItem(SESSION_KEY, 'true');
    } catch {
      // Safe fallback for restricted/private browser environments
    }

    // After fade-out duration (700ms), unmount from DOM
    const unmountTimer = setTimeout(() => {
      setShouldRender(false);
      if (onFinish) {
        onFinish();
      }
    }, 700);

    return () => clearTimeout(unmountTimer);
  }, [onFinish]);

  useEffect(() => {
    // Check if user prefers reduced motion
    if (typeof window !== 'undefined' && window.matchMedia) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        try {
          sessionStorage.setItem(SESSION_KEY, 'true');
        } catch {}
        if (onFinish) onFinish();
        setShouldRender(false);
        return;
      }
    }

    // Auto-advance lifecycle:
    // 0.0s - 2.0s: Cursive handwriting animation & glow fill
    // 8.0s: Start smooth fade out and complete
    const autoDismissTimer = setTimeout(() => {
      completeIntro();
    }, 8000);

    const handleKeyDown = (e) => {
      if (['Escape', 'Enter', ' ', 'ArrowRight'].includes(e.key)) {
        completeIntro();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(autoDismissTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [completeIntro, onFinish]);

  // Self-Contained Floating Canvas Particles Engine with Mouse Interaction
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Initialize randomized particle array
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: 1.0 + Math.random() * 1.5,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      alpha: 0.15 + Math.random() * 0.45,
      alphaSpeed: 0.008 + Math.random() * 0.015,
      pulseDirection: Math.random() > 0.5 ? 1 : -1
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Pulsating alpha transparency
        p.alpha += p.alphaSpeed * p.pulseDirection;
        if (p.alpha >= 0.6) {
          p.alpha = 0.6;
          p.pulseDirection = -1;
        } else if (p.alpha <= 0.15) {
          p.alpha = 0.15;
          p.pulseDirection = 1;
        }

        // Mouse repulsion physics within 80px radius
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80 && dist > 0) {
          const force = (80 - dist) / 80;
          const angle = Math.atan2(dy, dx);
          p.x += Math.cos(angle) * force * 1.8;
          p.y += Math.sin(angle) * force * 1.8;
        }

        // Normal velocity drift
        p.x += p.vx;
        p.y += p.vy;

        // Seamless edge wrapping
        if (p.x < -10) p.x = width + 10;
        else if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        else if (p.y > height + 10) p.y = -10;

        // Draw particle with soft radial glow
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  if (!shouldRender) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="CivicPath Introduction"
      onClick={completeIntro}
      className={`fixed inset-0 z-[9999] bg-[#060911] flex flex-col items-center justify-center cursor-pointer select-none transition-opacity duration-700 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Plus+Jakarta+Sans:wght@500;600;700&display=swap');

        .civicpath-cursive-text {
          font-family: 'Great Vibes', 'Snell Roundhand', 'Brush Script MT', 'Segoe Script', cursive;
          font-size: 110px;
          font-weight: 400;
          stroke: #38bdf8;
          stroke-width: 2px;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 1200;
          stroke-dashoffset: 1200;
          fill: #f8fafc;
          fill-opacity: 0;
          animation: civicpath-draw 2.0s cubic-bezier(0.45, 0, 0.25, 1) forwards;
        }

        @keyframes civicpath-draw {
          0% {
            stroke-dashoffset: 1200;
            fill-opacity: 0;
            filter: drop-shadow(0 0 0px rgba(56, 189, 248, 0));
          }
          65% {
            stroke-dashoffset: 0;
            fill-opacity: 0;
            stroke: #38bdf8;
            filter: drop-shadow(0 0 10px rgba(56, 189, 248, 0.6));
          }
          85% {
            fill-opacity: 0.8;
            stroke: #38bdf8;
            filter: drop-shadow(0 0 18px rgba(56, 189, 248, 0.8));
          }
          100% {
            stroke-dashoffset: 0;
            fill-opacity: 1;
            stroke: rgba(56, 189, 248, 0.4);
            filter: drop-shadow(0 0 24px rgba(56, 189, 248, 0.7)) drop-shadow(0 0 6px rgba(248, 250, 252, 0.9));
          }
        }

        .civicpath-badge-fade {
          opacity: 0;
          transform: translateY(8px);
          animation: civicpath-badge-appear 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1.5s forwards;
        }

        @keyframes civicpath-badge-appear {
          0% {
            opacity: 0;
            transform: translateY(8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .civicpath-ambient-glow {
          animation: civicpath-glow-pulse 3s ease-in-out infinite alternate;
        }

        @keyframes civicpath-glow-pulse {
          0% {
            transform: translate(-50%, -50%) scale(0.9);
            opacity: 0.15;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.1);
            opacity: 0.28;
          }
        }
      `}</style>

      {/* Interactive Floating Particles Canvas Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0"
      />

      {/* Atmospheric Background Ambient Light */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 w-[550px] h-[550px] bg-sky-500 rounded-full blur-[140px] civicpath-ambient-glow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-indigo-600/30 rounded-full blur-[100px]" />
      </div>

      {/* Main Center Stage */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 max-w-xl text-center space-y-4">
        {/* Apple "hello" inspired Cursive SVG for "CivicPath" */}
        <div className="w-full max-w-[500px] h-32 sm:h-40 flex items-center justify-center">
          <svg
            viewBox="0 0 600 160"
            className="w-full h-full overflow-visible"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="civicGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>
            </defs>

            <text
              x="50%"
              y="58%"
              dominantBaseline="middle"
              textAnchor="middle"
              className="civicpath-cursive-text"
            >
              CivicPath
            </text>
          </svg>
        </div>

        {/* Sub-Badge that softly fades in */}
        <div className="civicpath-badge-fade flex flex-col items-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 text-xs font-medium tracking-wide shadow-lg shadow-sky-950/30 backdrop-blur-md">
            <Compass className="w-3.5 h-3.5 text-sky-400 animate-spin-slow" />
            <span className="text-slate-200">Maharashtra Statutory Permitting Engine</span>
          </div>

          <p className="text-[11px] text-slate-500 font-sans tracking-tight">
            Click anywhere to skip
          </p>
        </div>
      </div>
    </div>
  );
}

