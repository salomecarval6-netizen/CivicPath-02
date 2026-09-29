import React, { useRef } from 'react';
import {
  Home,
  Building2,
  Landmark,
  Hotel,
  Layers,
  Factory,
  SlidersHorizontal,
  ArrowUpRight
} from 'lucide-react';
import clsx from 'clsx';

const TYPOLOGIES = [
  {
    id: 'RESIDENTIAL',
    label: 'Residential',
    desc: 'Bungalow, Villa, Apartments, Row House',
    icon: Home,
    tag: 'Rule 6.1 • Appendix A-1',
    badgeColor: 'text-indigo-700 bg-indigo-50 border-indigo-200 dark:text-indigo-400 dark:bg-indigo-950/80 dark:border-indigo-800/60'
  },
  {
    id: 'COMMERCIAL',
    label: 'Commercial',
    desc: 'Offices, Retail, Shopping Mall, Showroom',
    icon: Building2,
    tag: 'Rule 6.2 • Parking Scrutiny',
    badgeColor: 'text-sky-700 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-950/80 dark:border-sky-800/60'
  },
  {
    id: 'INSTITUTIONAL',
    label: 'Institutional',
    desc: 'School, College, Hospital, Community Hall',
    icon: Landmark,
    tag: 'Rule 6.3 • Fire & Health NOC',
    badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/80 dark:border-emerald-800/60'
  },
  {
    id: 'HOSPITALITY',
    label: 'Hospitality',
    desc: 'Hotel, Resort, Guest House, Lodge',
    icon: Hotel,
    tag: 'Rule 6.4 • Tourism Clearances',
    badgeColor: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/80 dark:border-amber-800/60'
  },
  {
    id: 'MIXED_USE',
    label: 'Mixed-Use',
    desc: 'Combined Residential + Commercial / Retail',
    icon: Layers,
    tag: 'Dual Scrutiny • Podium Rules',
    badgeColor: 'text-purple-700 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-950/80 dark:border-purple-800/60'
  },
  {
    id: 'INDUSTRIAL',
    label: 'Industrial',
    desc: 'Factory, Workshop, Warehouse, Storage',
    icon: Factory,
    tag: 'MPCB & DISH Safety NOC',
    badgeColor: 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/80 dark:border-rose-800/60'
  },
  {
    id: 'OTHER',
    label: 'Other',
    desc: 'Specialized or Custom Facility',
    icon: SlidersHorizontal,
    tag: 'Custom Local Body Intake',
    badgeColor: 'text-teal-700 bg-teal-50 border-teal-200 dark:text-teal-400 dark:bg-teal-950/80 dark:border-teal-800/60'
  }
];

export default function GlowCardGrid({ onSelectTypology }) {
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    containerRef.current.style.setProperty('--grid-mouse-x', `${x}px`);
    containerRef.current.style.setProperty('--grid-mouse-y', `${y}px`);
  };

  const handleCardMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--card-mouse-x', `${x}px`);
    card.style.setProperty('--card-mouse-y', `${y}px`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Select Construction Typology
          </h2>
        </div>
        <span className="text-xs text-slate-600 dark:text-slate-400">
          Click any category to tailor statutory requirements & clearances
        </span>
      </div>

      {/* Infinite Auto-Scrolling Marquee Carousel with Bilateral Gradient Edge Masks */}
      <div
        className="relative w-full overflow-hidden py-2"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
        }}
      >
        {/* Scrolling Flex Track */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          className="flex gap-4 w-max animate-typology-marquee hover:[animation-play-state:paused] focus-within:[animation-play-state:paused] py-1"
        >
          {[...TYPOLOGIES, ...TYPOLOGIES].map((typology, idx) => {
            const Icon = typology.icon;
            return (
              <div
                key={`${typology.id}-${idx}`}
                role="button"
                tabIndex={0}
                onClick={() => onSelectTypology && onSelectTypology(typology.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (onSelectTypology) onSelectTypology(typology.id);
                  }
                }}
                onMouseMove={handleCardMouseMove}
                className={clsx(
                  'glow-card relative w-[300px] min-w-[280px] shrink-0 rounded-2xl p-4.5 bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800/80',
                  'hover:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-950',
                  'transition-all duration-300 cursor-pointer group flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1',
                  'min-h-[190px]'
                )}
              >
                {/* Card-level Radial Spotlight Glow */}
                <div
                  className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                  style={{
                    background:
                      'radial-gradient(280px circle at var(--card-mouse-x, 50%) var(--card-mouse-y, 50%), rgba(99, 102, 241, 0.18), transparent 80%)'
                  }}
                />

                <div className="relative z-10 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 group-hover:text-white group-hover:bg-indigo-600 transition-all duration-300 shadow-inner">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={clsx(
                        'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border',
                        typology.badgeColor
                      )}
                    >
                      {typology.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-200 transition-colors flex items-center justify-between">
                      <span>{typology.label}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-indigo-500 dark:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mt-1 line-clamp-2">
                      {typology.desc}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300">
                  <span>Start Questionnaire</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline">Construct →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
