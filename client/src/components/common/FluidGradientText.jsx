import React from 'react';
import clsx from 'clsx';

export default function FluidGradientText({
  text = 'CivicPath',
  className = '',
  subtitle = 'Maharashtra Statutory Permitting Intelligence Engine'
}) {
  return (
    <div className={clsx('text-center py-8 space-y-2 select-none', className)}>
      <div className="inline-block relative">
        {/* Soft background glow halo */}
        <div
          aria-hidden="true"
          className="absolute inset-0 blur-2xl opacity-40 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-full scale-110 pointer-events-none"
        />

        {/* Fluid animated gradient text */}
        <h3
          className="relative text-3xl sm:text-4xl md:text-5xl font-black tracking-tight fluid-gradient-text"
          style={{ letterSpacing: '-0.03em' }}
        >
          {text}
        </h3>
      </div>

      {subtitle && (
        <p className="text-xs text-slate-400 font-medium tracking-wide">
          {subtitle}
        </p>
      )}
    </div>
  );
}
