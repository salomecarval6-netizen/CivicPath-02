import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Compass, ChevronRight } from 'lucide-react';

export default function TOCMinimap({
  sections = [], // Array of { id: string, label: string, icon?: Icon }
  scrollContainerRef,
  className = ''
}) {
  const [activeSectionId, setActiveSectionId] = useState(sections[0]?.id || '');

  useEffect(() => {
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find visible entries
        const visibleEntry = entries.find((e) => e.isIntersecting);
        if (visibleEntry) {
          setActiveSectionId(visibleEntry.target.id);
        }
      },
      {
        root: scrollContainerRef?.current || null,
        rootMargin: '-10% 0px -60% 0px',
        threshold: 0.1
      }
    );

    sections.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [sections, scrollContainerRef]);

  const scrollToSection = (id) => {
    setActiveSectionId(id);
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  if (!sections.length) return null;

  return (
    <div
      role="navigation"
      aria-label="Table of Contents Minimap"
      className={clsx(
        'select-none no-print',
        className
      )}
    >
      {/* Desktop / Tablet Vertical TOC Minimap Rail */}
      <div className="flex flex-col gap-1 p-2 rounded-2xl bg-slate-950/70 backdrop-blur-md border border-slate-800/80 shadow-lg">
        <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-850 mb-1">
          <Compass className="w-3 h-3 text-indigo-400" />
          <span>TOC Rail</span>
        </div>

        {sections.map((sec) => {
          const isActive = activeSectionId === sec.id;
          const Icon = sec.icon;

          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => scrollToSection(sec.id)}
              className={clsx(
                'group flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left transition-all duration-200 cursor-pointer outline-none focus:ring-1 focus:ring-indigo-500',
                isActive
                  ? 'bg-indigo-950/80 border border-indigo-700/70 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
              )}
              title={`Jump to ${sec.label}`}
            >
              {/* Active Marker Indicator Bar */}
              <div
                className={clsx(
                  'w-1.5 h-1.5 rounded-full transition-all shrink-0',
                  isActive
                    ? 'bg-indigo-400 ring-2 ring-indigo-400/40 scale-125'
                    : 'bg-slate-600 group-hover:bg-slate-400'
                )}
              />

              <div className="flex items-center gap-1.5 truncate">
                {Icon && (
                  <Icon
                    className={clsx(
                      'w-3 h-3 shrink-0',
                      isActive ? 'text-indigo-300' : 'text-slate-500'
                    )}
                  />
                )}
                <span className="text-[11px] truncate">{sec.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
