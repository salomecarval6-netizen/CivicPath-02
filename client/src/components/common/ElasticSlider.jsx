import React, { useState, useRef } from 'react';
import clsx from 'clsx';

export default function ElasticSlider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  subtitle = '',
  badge = null,
  presets = [],
  secondaryDisplay = null,
  disabled = false,
  id = 'elastic-slider'
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef(null);

  // Clamp current value within bounds for track width calculation
  const safeVal = typeof value === 'number' && !isNaN(value) ? value : min;
  const clampedVal = Math.min(Math.max(safeVal, min), max);
  const percentage = max > min ? Math.max(0, Math.min(100, ((clampedVal - min) / (max - min)) * 100)) : 0;

  const handleRangeChange = (e) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && onChange) {
      onChange(val);
    }
  };

  const handleNumberInputChange = (e) => {
    const textVal = e.target.value;
    if (textVal === '') {
      if (onChange) onChange(0);
      return;
    }
    const val = parseFloat(textVal);
    if (!isNaN(val) && onChange) {
      onChange(val);
    }
  };

  return (
    <div className="space-y-2 select-none">
      {/* Label and Badge Row */}
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-xs font-semibold text-slate-200">
          {label}
        </label>
        {badge}
      </div>

      {/* Main Elastic Slider Container */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={clsx(
          'relative p-3 rounded-xl bg-slate-850/90 border transition-all duration-200',
          isDragging
            ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
            : isHovered
            ? 'border-slate-700 bg-slate-800'
            : 'border-slate-750'
        )}
      >
        {/* Value and Typed Entry Row */}
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-black tracking-tight text-white font-mono">
              {safeVal}
            </span>
            <span className="text-xs text-indigo-400 font-semibold uppercase">
              {unit}
            </span>
            {secondaryDisplay && (
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                ({secondaryDisplay})
              </span>
            )}
          </div>

          {/* Precise Numeric Input for Exact Boundary Tuning */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
            <span className="text-[10px] text-slate-400 font-medium">Exact:</span>
            <input
              id={`${id}-exact`}
              type="number"
              min={min}
              max={max}
              step={step}
              value={safeVal}
              onChange={handleNumberInputChange}
              disabled={disabled}
              className="w-16 bg-transparent text-right text-xs font-mono font-bold text-slate-100 focus:outline-none"
              title="Type exact numeric value"
            />
            <span className="text-[10px] text-slate-400 font-medium">{unit}</span>
          </div>
        </div>

        {/* Interactive Elastic Track */}
        <div className="relative h-6 flex items-center">
          {/* Track background */}
          <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-750 overflow-hidden relative">
            {/* Active Gradient Fill */}
            <div
              className={clsx(
                'h-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-purple-400 transition-all rounded-full',
                isDragging ? 'duration-0 brightness-110' : 'duration-150'
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* Visual Thumb with Elastic Scaling */}
          <div
            className={clsx(
              'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white border-2 border-indigo-600 shadow-md shadow-indigo-950/60 pointer-events-none transition-transform',
              isDragging
                ? 'scale-125 ring-4 ring-indigo-500/30'
                : isHovered
                ? 'scale-110'
                : 'scale-100'
            )}
            style={{ left: `${percentage}%` }}
          />

          {/* Native Semantic Range Input Overlay for Accessibility and Smooth Dragging */}
          <input
            ref={inputRef}
            id={id}
            type="range"
            min={min}
            max={max}
            step={step}
            value={safeVal}
            onChange={handleRangeChange}
            onPointerDown={() => setIsDragging(true)}
            onPointerUp={() => setIsDragging(false)}
            onBlur={() => setIsDragging(false)}
            disabled={disabled}
            aria-label={label}
            aria-valuenow={safeVal}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuetext={`${safeVal} ${unit}`}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
        </div>

        {/* Optional Quick Preset Chips */}
        {presets.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5 text-[10px]">
            <span className="text-slate-400">Presets:</span>
            {presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onChange && onChange(preset.value)}
                className={clsx(
                  'px-2 py-0.5 rounded-md border text-[10px] font-medium transition-colors cursor-pointer',
                  safeVal === preset.value
                    ? 'bg-indigo-950 text-indigo-300 border-indigo-700 font-bold'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                )}
              >
                {preset.label || `${preset.value} ${unit}`}
              </button>
            ))}
          </div>
        )}
      </div>

      {subtitle && (
        <p className="text-[11px] text-slate-400 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
