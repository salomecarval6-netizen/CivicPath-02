import React, { useRef, useEffect, useState } from 'react';
import clsx from 'clsx';

export default function LineNav({
  items = [], // Array of { id, label, icon: Icon, badge?: string | number }
  activeId,
  onChange,
  className = '',
  size = 'md'
}) {
  const containerRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const activeEl = containerRef.current.querySelector(`[data-nav-id="${activeId}"]`);
    if (activeEl) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();
      setIndicatorStyle({
        left: activeRect.left - containerRect.left,
        width: activeRect.width
      });
    }
  }, [activeId, items]);

  const handleKeyDown = (e) => {
    const currentIndex = items.findIndex((it) => it.id === activeId);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = (currentIndex + 1) % items.length;
      if (onChange) onChange(items[nextIdx].id);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIdx = (currentIndex - 1 + items.length) % items.length;
      if (onChange) onChange(items[prevIdx].id);
    }
  };

  return (
    <nav
      ref={containerRef}
      role="tablist"
      aria-label="Dossier Section Navigation"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className={clsx(
        'relative flex items-center gap-1 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800/90 select-none overflow-x-auto no-scrollbar',
        className
      )}
    >
      {/* Sliding Active Underline Indicator */}
      <div
        className="absolute bottom-1 h-0.5 bg-gradient-to-r from-indigo-500 via-indigo-400 to-purple-400 rounded-full transition-all duration-300 ease-out pointer-events-none"
        style={{
          left: `${indicatorStyle.left}px`,
          width: `${indicatorStyle.width}px`
        }}
      />

      {items.map((item) => {
        const isActive = item.id === activeId;
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            data-nav-id={item.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${item.id}`}
            type="button"
            onClick={() => onChange && onChange(item.id)}
            className={clsx(
              'relative flex-1 flex items-center justify-center gap-1.5 rounded-xl font-bold transition-all duration-200 cursor-pointer whitespace-nowrap outline-none focus:ring-2 focus:ring-indigo-500',
              size === 'sm' ? 'py-1.5 px-2.5 text-[11px]' : 'py-2 px-3 text-xs',
              isActive
                ? 'bg-slate-850 text-white shadow-sm border border-slate-750/80'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            )}
          >
            {Icon && (
              <Icon
                className={clsx(
                  'w-3.5 h-3.5 transition-colors',
                  isActive ? 'text-indigo-400' : 'text-slate-500'
                )}
              />
            )}
            <span>{item.label}</span>
            {item.badge !== undefined && (
              <span
                className={clsx(
                  'text-[10px] px-1.5 py-0.2 rounded-full font-mono border',
                  isActive
                    ? 'bg-indigo-950 text-indigo-300 border-indigo-800/60'
                    : 'bg-slate-900 text-slate-500 border-slate-800'
                )}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
