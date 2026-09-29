import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ChevronUp, ChevronDown, CheckCircle2, Lock, List, Disc } from 'lucide-react';
import clsx from 'clsx';

export default function WheelPicker({
  label,
  items = [],
  value,
  onChange,
  disabled = false,
  lockedId = null,
  lockedMessage = '',
  itemHeight = 44,
  visibleCount = 3,
  id = 'wheel-picker'
}) {
  const [mode, setMode] = useState('wheel'); // 'wheel' | 'grid'
  const containerRef = useRef(null);
  const isScrollingRef = useRef(false);

  const selectedIndex = Math.max(0, items.findIndex((item) => item.id === value));

  const selectIndex = useCallback((index) => {
    if (index < 0 || index >= items.length) return;
    const target = items[index];
    if (lockedId && target.id !== lockedId) return;
    if (onChange) onChange(target.id);
  }, [items, lockedId, onChange]);

  // Scroll to active index on mount or value change
  useEffect(() => {
    if (containerRef.current && mode === 'wheel') {
      const targetScroll = selectedIndex * itemHeight;
      containerRef.current.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    }
  }, [selectedIndex, itemHeight, mode]);

  const handleScroll = () => {
    if (!containerRef.current || isScrollingRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const nearestIndex = Math.round(scrollTop / itemHeight);
    if (nearestIndex >= 0 && nearestIndex < items.length && nearestIndex !== selectedIndex) {
      selectIndex(nearestIndex);
    }
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      if (selectedIndex < items.length - 1) {
        selectIndex(selectedIndex + 1);
      }
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      if (selectedIndex > 0) {
        selectIndex(selectedIndex - 1);
      }
    }
  };

  return (
    <div className="space-y-2 select-none" onKeyDown={handleKeyDown} tabIndex={0} role="region" aria-label={label}>
      {/* Label and Mode Switcher */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-200">
            {label}
          </label>
          {lockedId && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 text-[10px] font-semibold">
              <Lock className="w-3 h-3 text-indigo-400" />
              Locked by query
            </span>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-850 p-0.5 rounded-lg border border-slate-750">
          <button
            type="button"
            onClick={() => setMode('wheel')}
            className={clsx(
              'px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer',
              mode === 'wheel'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            )}
            title="Wheel Picker Mode"
          >
            <Disc className="w-3 h-3" />
            <span className="hidden sm:inline">Wheel</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('grid')}
            className={clsx(
              'px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer',
              mode === 'grid'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            )}
            title="Grid Cards Mode"
          >
            <List className="w-3 h-3" />
            <span className="hidden sm:inline">Grid</span>
          </button>
        </div>
      </div>

      {mode === 'wheel' ? (
        /* React Wheel Picker Drum View */
        <div className="relative rounded-2xl bg-slate-900/90 border border-slate-800 p-2 overflow-hidden shadow-inner">
          {/* Top / Bottom Gradient Masks for 3D Perspective Fade */}
          <div className="pointer-events-none absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-slate-900 via-slate-900/80 to-transparent z-10" />
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent z-10" />

          {/* Center Selection Lens / Highlight Bar */}
          <div
            className="pointer-events-none absolute left-2 right-2 rounded-xl bg-indigo-950/60 border border-indigo-500/40 shadow-md shadow-indigo-950/30 z-0 transition-all duration-200"
            style={{
              top: '50%',
              transform: 'translateY(-50%)',
              height: `${itemHeight}px`
            }}
          />

          {/* Navigation Step Arrows */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1">
            <button
              type="button"
              disabled={disabled || selectedIndex <= 0}
              onClick={() => selectIndex(selectedIndex - 1)}
              className="p-1 rounded-md bg-slate-800 hover:bg-slate-750 text-slate-300 disabled:opacity-30 transition-all cursor-pointer"
              title="Previous item"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={disabled || selectedIndex >= items.length - 1}
              onClick={() => selectIndex(selectedIndex + 1)}
              className="p-1 rounded-md bg-slate-800 hover:bg-slate-750 text-slate-300 disabled:opacity-30 transition-all cursor-pointer"
              title="Next item"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Scrollable Drum Container */}
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="overflow-y-auto no-scrollbar snap-y snap-mandatory relative z-10"
            style={{
              height: `${itemHeight * visibleCount}px`,
              paddingTop: `${itemHeight * Math.floor(visibleCount / 2)}px`,
              paddingBottom: `${itemHeight * Math.floor(visibleCount / 2)}px`
            }}
            role="listbox"
            aria-activedescendant={`${id}-item-${selectedIndex}`}
          >
            {items.map((item, idx) => {
              const isSelected = item.id === value;
              const isLockedOut = Boolean(lockedId && item.id !== lockedId);
              const distance = Math.abs(idx - selectedIndex);

              return (
                <div
                  key={item.id}
                  id={`${id}-item-${idx}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => !isLockedOut && selectIndex(idx)}
                  className={clsx(
                    'snap-center flex items-center justify-between px-4 cursor-pointer transition-all duration-200 select-none',
                    isLockedOut ? 'opacity-30 cursor-not-allowed' : 'hover:opacity-100',
                    isSelected
                      ? 'text-white font-bold scale-100 opacity-100'
                      : distance === 1
                      ? 'text-slate-300 font-medium scale-95 opacity-60'
                      : 'text-slate-500 scale-90 opacity-35'
                  )}
                  style={{
                    height: `${itemHeight}px`
                  }}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-xs truncate">{item.label}</span>
                    {item.tag && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-indigo-300 font-mono">
                        {item.tag}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pl-2">
                    {item.desc && isSelected && (
                      <span className="text-[10px] text-slate-400 font-normal truncate hidden sm:inline">
                        {item.desc}
                      </span>
                    )}
                    {isSelected && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Grid Cards Fallback View */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {items.map((item, idx) => {
            const isSelected = item.id === value;
            const isLockedOut = Boolean(lockedId && item.id !== lockedId);

            return (
              <button
                key={item.id}
                type="button"
                disabled={isLockedOut}
                onClick={() => !isLockedOut && selectIndex(idx)}
                className={clsx(
                  'p-3 rounded-xl border text-left transition-all',
                  isSelected
                    ? 'bg-indigo-950/80 border-indigo-500 ring-1 ring-indigo-500/50 text-white shadow-md'
                    : isLockedOut
                    ? 'bg-slate-900/30 border-slate-800/40 text-slate-500 opacity-40 cursor-not-allowed'
                    : 'bg-slate-850/80 border-slate-750 text-slate-300 hover:bg-slate-800 hover:border-slate-700 cursor-pointer'
                )}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-bold">{item.label}</span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                  {isLockedOut && <Lock className="w-3 h-3 text-slate-500 shrink-0" />}
                </div>
                {item.desc && (
                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-snug">
                    {item.desc}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      )}

      {lockedMessage && lockedId && (
        <p className="text-[10px] text-slate-400 italic">
          {lockedMessage}
        </p>
      )}
    </div>
  );
}
