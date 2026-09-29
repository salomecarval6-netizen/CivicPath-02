import React from 'react';
import {
  Scale,
  Landmark,
  Building,
  FileSpreadsheet,
  Flame,
  TreePine,
  Compass,
  ShieldCheck
} from 'lucide-react';
import clsx from 'clsx';

// 7 Canonical Statutory Authorities & Frameworks
const STATUTORY_AUTHORITIES = [
  {
    id: 'udcpr',
    name: 'UDCPR 2020',
    role: 'Unified Development Control Rules',
    icon: Scale
  },
  {
    id: 'mrtp',
    name: 'MRTP Act 1966',
    role: 'Maharashtra Town Planning',
    icon: Landmark
  },
  {
    id: 'tp',
    name: 'Town Planning',
    role: 'Cadastral & Zoning Scrutiny',
    icon: Building
  },
  {
    id: 'tilr',
    name: 'TILR',
    role: '7/12 & Kayam Mojani Survey',
    icon: FileSpreadsheet
  },
  {
    id: 'cfo',
    name: 'CFO',
    role: 'Life Safety Clearances',
    icon: Flame
  },
  {
    id: 'tree',
    name: 'Tree Authority',
    role: 'Green Preservation Clearances',
    icon: TreePine
  },
  {
    id: 'coa',
    name: 'Council of Architecture',
    role: 'Licensed Professional Scrutiny',
    icon: Compass
  }
];

export default function LogosCarousel({ className = '' }) {
  // Duplicate array once for a seamless infinite ticker loop
  const displayItems = [...STATUTORY_AUTHORITIES, ...STATUTORY_AUTHORITIES];

  return (
    <section
      aria-label="Statutory Frameworks and Authorities Ecosystem"
      className={clsx('space-y-3', className)}
    >
      {/* Section Header & Provenance Tag */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <span className="font-semibold uppercase tracking-wider text-[11px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
          Statutory Frameworks &amp; Authority Standards
        </span>
        <span className="text-[11px] hidden sm:inline text-slate-500 dark:text-slate-400">
          Built around Maharashtra’s municipal planning and clearance ecosystem
        </span>
      </div>

      {/* Outer Carousel Container with Masked Edge Gradients */}
      <div className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800/80 p-3 shadow-sm dark:shadow-inner">
        {/* Left / Right Fade Masks */}
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-slate-50 via-slate-50/60 to-transparent dark:from-slate-900 dark:via-slate-900/60 z-10"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-slate-50 via-slate-50/60 to-transparent dark:from-slate-900 dark:via-slate-900/60 z-10"
          aria-hidden="true"
        />

        {/* Scrolling Ticker Track */}
        <div className="flex gap-4 w-max animate-carousel-scroll hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]">
          {displayItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={`${item.id}-${idx}`}
                tabIndex={0}
                className={clsx(
                  'flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs shrink-0 select-none transition-all duration-200',
                  'bg-white dark:bg-white border border-slate-200 dark:border-slate-300',
                  'text-slate-900 dark:text-black shadow-xs',
                  'hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md hover:-translate-y-0.5',
                  'focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500'
                )}
                role="group"
                aria-label={`${item.name} - ${item.role}`}
              >
                <div
                  className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 dark:bg-indigo-950 dark:border-indigo-800/50 dark:text-indigo-300 flex items-center justify-center shrink-0"
                  aria-hidden="true"
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-[11px] text-slate-900 dark:text-black leading-tight">
                    {item.name}
                  </div>
                  <div className="text-[9px] text-slate-700 dark:text-slate-900 font-semibold leading-tight">
                    {item.role}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
