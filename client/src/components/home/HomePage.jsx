import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  Sparkles,
  ArrowRight,
  Search,
  AlertCircle,
  HelpCircle,
  X
} from 'lucide-react';
import clsx from 'clsx';
import GlowCardGrid from './GlowCardGrid';
import ScrollLogosCarousel from './ScrollLogosCarousel';
import FluidGradientText from '../common/FluidGradientText';

const TOTAL_STEPS = 10;
const CIVICPATH_INTERVAL_MS = 8000;  // 8 seconds specifically for CivicPath title header (Step 1)
const DEFAULT_INTERVAL_MS = 15000;   // 15 seconds for all other components

export default function HomePage({
  searchQuery,
  setSearchQuery,
  onStartConstruct,
  onOpenQuestionnaire,
  onOpenJargonBuster,
  hasActiveRoadmap = false,
  onViewActiveRoadmap,
  loading = false,
  scopeFeedback = null,
  onClearScopeFeedback,
  introActive = false,
  onReplayIntro = null
}) {
  const [activeStep, setActiveStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const containerRef = useRef(null);
  const lastScrolledStepRef = useRef(1);

  // Sequential Step Timer: 12s specifically for 'CivicPath' (Step 1) and 10s for all other components
  useEffect(() => {
    if (introActive || !isPlaying || activeStep >= TOTAL_STEPS) return;

    const interval = activeStep === 1 ? CIVICPATH_INTERVAL_MS : DEFAULT_INTERVAL_MS;

    const timer = setTimeout(() => {
      setActiveStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
    }, interval);

    return () => clearTimeout(timer);
  }, [activeStep, isPlaying, introActive]);

  // Gentle auto-scroll follow as new steps unlock below the fold
  useEffect(() => {
    if (introActive || !isPlaying || activeStep <= 2) return;
    if (activeStep === lastScrolledStepRef.current) return;
    lastScrolledStepRef.current = activeStep;

    const targetEl = document.querySelector(`[data-seq-step="${activeStep}"]`);
    if (targetEl && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();

      // Only gently scroll if the new step is below current visible scroll area
      if (targetRect.bottom > containerRect.bottom || targetRect.top < containerRect.top) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activeStep, isPlaying, introActive]);

  // Scroll downwards observer: If the user manually scrolls down, reveal elements coming into view
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !('IntersectionObserver' in window)) return;

    const stepElements = container.querySelectorAll('[data-seq-step]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const stepNum = parseInt(entry.target.getAttribute('data-seq-step'), 10);
            if (!isNaN(stepNum)) {
              setActiveStep((prev) => Math.max(prev, stepNum));
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.1,
        rootMargin: '0px 0px -20px 0px'
      }
    );

    stepElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onStartConstruct(searchQuery);
  };

  const isStepVisible = (step) => activeStep >= step;
  const isCurrentStep = (step) => activeStep === step;

  const samplePrompts = [
    {
      title: 'Residential Bungalow (Pune)',
      query: 'I want to construct a residential G+2 house in Pune'
    },
    {
      title: 'Commercial Complex (Mumbai)',
      query: 'I want to construct a commercial shopping and office complex in Mumbai'
    },
    {
      title: 'Institutional School (Thane)',
      query: 'I want to construct a school and educational building in Thane'
    },
    {
      title: 'Hospitality Hotel (Pune)',
      query: 'I want to build a hotel and resort in Pune'
    },
    {
      title: 'Mixed-Use Building (PCMC)',
      query: 'I want a mixed-use building with retail shops and residential apartments'
    },
    {
      title: 'Industrial Warehouse (Thane)',
      query: 'I want to build an industrial manufacturing plant and warehouse'
    }
  ];

  const handleSelectTypology = (typologyId) => {
    if (onOpenQuestionnaire) {
      onOpenQuestionnaire({ constructionType: typologyId });
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto bg-slate-50 text-slate-900 dark:bg-[#060911] dark:text-slate-100 font-sans select-none relative scroll-smooth transition-colors duration-200"
    >
      {/* Main Content Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-12 pb-24">

        {/* STEP 1: Top Header / Welcome Banner */}
        <div
          data-seq-step="1"
          className={clsx(
            'text-center space-y-4 transition-all duration-700 ease-out',
            isStepVisible(1) ? 'sequential-step-visible' : 'sequential-step-hidden',
            isCurrentStep(1) && 'sequential-glow-active'
          )}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 dark:bg-indigo-950/80 dark:border-indigo-800/60 dark:text-indigo-300 text-xs font-semibold shadow-xs">
            <Compass className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 animate-pulse" />
            <span>Maharashtra Construction Permitting Navigator • UDCPR 2020 & MRTP Act 1966</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent dark:from-white dark:to-slate-300">
            Welcome to CivicPath
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Your interactive statutory guide to navigating municipal building permissions, architectural scrutiny, and parallel departmental NOC clearances for residential, commercial, institutional, hospitality, mixed-use, and industrial construction projects across Maharashtra.
          </p>
        </div>

        {/* STEP 2: Project Requirement Input Box */}
        <div
          data-seq-step="2"
          className={clsx(
            'transition-all duration-700 ease-out',
            isStepVisible(2) ? 'sequential-step-visible' : 'sequential-step-hidden',
            isCurrentStep(2) && 'sequential-glow-active'
          )}
        >
          <div className="relative p-6 sm:p-8 rounded-2xl bg-white/85 border border-slate-200/90 shadow-xl backdrop-blur-md dark:bg-slate-900/60 dark:border-slate-800/80 dark:shadow-2xl">
            <div className="mb-4">
              <label htmlFor="custom-request-input" className="block text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
                Start with Your Project Requirement
              </label>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Describe what you want to build or what approval you need (Residential, Commercial, Institutional, Hospitality, Mixed-Use, Industrial, or Other). Clicking <strong className="text-slate-800 dark:text-slate-200">Construct</strong> opens the Plot Questionnaire to tailor your statutory roadmap.
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="custom-request-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (scopeFeedback && onClearScopeFeedback) {
                        onClearScopeFeedback();
                      }
                    }}
                    placeholder="e.g., I want to construct a commercial complex in Pune / residential house / school..."
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white dark:bg-slate-950/70 dark:border-slate-700 dark:text-black dark:placeholder-slate-400 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 active:scale-95 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all duration-150 disabled:opacity-50 cursor-pointer shrink-0"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{loading ? 'Constructing...' : 'Construct'}</span>
                </button>
              </div>

              {/* Scope / Intent Validation Feedback */}
              {scopeFeedback && (
                <div
                  className={clsx(
                    'p-3.5 rounded-xl text-xs flex items-start gap-2.5 border shadow-md transition-all',
                    scopeFeedback.status === 'OUT_OF_SCOPE'
                      ? 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/60 dark:border-rose-800/80 dark:text-rose-200'
                      : 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/60 dark:border-amber-800/80 dark:text-amber-200'
                  )}
                >
                  {scopeFeedback.status === 'OUT_OF_SCOPE' ? (
                    <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                  ) : (
                    <HelpCircle className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 space-y-1">
                    <div className="font-bold text-[12px]">
                      {scopeFeedback.status === 'OUT_OF_SCOPE'
                        ? 'Requirement Outside CivicPath Scope'
                        : 'Clarification Needed'}
                    </div>
                    <p className="leading-relaxed text-[11px] opacity-90">
                      {scopeFeedback.message}
                    </p>
                  </div>
                  {onClearScopeFeedback && (
                    <button
                      type="button"
                      onClick={onClearScopeFeedback}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5 cursor-pointer"
                      title="Dismiss notice"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              {/* Quick Suggestions */}
              <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">Try an example:</span>
                {samplePrompts.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSearchQuery(p.query);
                      if (scopeFeedback && onClearScopeFeedback) {
                        onClearScopeFeedback();
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300/80 text-black dark:text-black font-semibold dark:bg-slate-100 dark:hover:bg-slate-200 dark:border-slate-300/80 text-[11px] transition-colors cursor-pointer"
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            </form>

            {/* Quick Active Roadmap Return Banner if available */}
            {hasActiveRoadmap && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">You have an active roadmap loaded.</span>
                <button
                  type="button"
                  onClick={onViewActiveRoadmap}
                  className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold cursor-pointer"
                >
                  <span>View Current Roadmap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* STEP 3: Glow Card Grid: 7 Construction Typologies */}
        <div
          data-seq-step="3"
          className={clsx(
            'transition-all duration-700 ease-out',
            isStepVisible(3) ? 'sequential-step-visible' : 'sequential-step-hidden',
            isCurrentStep(3) && 'sequential-glow-active'
          )}
        >
          <GlowCardGrid onSelectTypology={handleSelectTypology} />
        </div>

        {/* STEPS 4-9: Logos Carousel & Explanatory Architecture Sections */}
        <ScrollLogosCarousel
          activeStep={activeStep}
          onOpenQuestionnaire={onOpenQuestionnaire}
          onOpenJargonBuster={onOpenJargonBuster}
        />

        {/* STEP 10: Fluid Gradient Text: Closing CivicPath Identity */}
        <div
          data-seq-step="10"
          className={clsx(
            'transition-all duration-700 ease-out',
            isStepVisible(10) ? 'sequential-step-visible' : 'sequential-step-hidden',
            isCurrentStep(10) && 'sequential-glow-active'
          )}
        >
          <FluidGradientText
            text="CivicPath"
            subtitle="Deterministic Maharashtra Statutory Construction Permitting Engine"
          />
        </div>

      </div>
    </div>
  );
}

