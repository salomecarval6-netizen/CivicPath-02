import React from 'react';
import {
  Compass,
  Sparkles,
  Sliders,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Layers,
  HelpCircle,
  Clock,
  CheckSquare,
  Building,
  FileCheck2,
  Search,
  Landmark,
  Scale,
  TreePine,
  Flame,
  FileSpreadsheet
} from 'lucide-react';
import clsx from 'clsx';
import ScrollFade from '../common/ScrollFade';

const STATUTORY_AUTHORITY_LOGOS = [
  { name: 'UDCPR 2020', role: 'Unified Development Control Rules', icon: Scale },
  { name: 'MRTP Act 1966', role: 'Maharashtra Town Planning', icon: Landmark },
  { name: 'Town Planning Dept', role: 'Cadastral & Zoning Scrutiny', icon: Building },
  { name: 'TILR / Revenue', role: '7/12 & Kayam Mojani Survey', icon: FileSpreadsheet },
  { name: 'CFO / Fire Authority', role: 'Life Safety Clearances', icon: Flame },
  { name: 'Tree Authority', role: 'Green Preservation Clearances', icon: TreePine },
  { name: 'Council of Architecture', role: 'Licensed Professional Scrutiny', icon: Compass }
];

export default function ScrollLogosCarousel({
  onOpenQuestionnaire,
  onOpenJargonBuster,
  activeStep = 10
}) {
  const isStepVisible = (step) => activeStep >= step;
  const isCurrentStep = (step) => activeStep === step;

  return (
    <div className="space-y-12">
      {/* Visual Adaptation: Statutory Authority Logo Carousel Ribbon (Step 4) */}
      <div
        data-seq-step="4"
        className={clsx(
          'space-y-3 transition-all duration-700 ease-out',
          isStepVisible(4)
            ? 'sequential-step-visible'
            : 'sequential-step-hidden',
          isCurrentStep(4) && 'sequential-glow-active'
        )}
      >
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
          <span className="font-semibold uppercase tracking-wider text-[11px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Statutory Frameworks & Authority Standards
          </span>
          <span className="text-[11px] hidden sm:inline text-slate-500 dark:text-slate-400">
            Compliant with Maharashtra Municipal Regulations
          </span>
        </div>

        {/* Outer Carousel Container with Masked Edge Gradients */}
        <div className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800/80 p-3 shadow-sm dark:shadow-inner">
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-slate-50 via-slate-50/60 to-transparent dark:from-slate-900 dark:via-slate-900/60 z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-slate-50 via-slate-50/60 to-transparent dark:from-slate-900 dark:via-slate-900/60 z-10" />

          {/* Scrolling Ticker Track */}
          <div className="flex gap-4 w-max animate-carousel-scroll hover:[animation-play-state:paused]">
            {[...STATUTORY_AUTHORITY_LOGOS, ...STATUTORY_AUTHORITY_LOGOS].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-850/80 border border-slate-200 dark:border-slate-750 text-slate-800 dark:text-slate-200 text-xs shrink-0 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-500/40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all select-none"
                >
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 dark:bg-indigo-950/80 dark:border-indigo-800/50 dark:text-indigo-400 flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-[11px] text-slate-900 dark:text-slate-100">{item.name}</div>
                    <div className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">{item.role}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 1: What CivicPath Does (Step 5) */}
      <div
        data-seq-step="5"
        className={clsx(
          'transition-all duration-700 ease-out',
          isStepVisible(5) ? 'sequential-step-visible' : 'sequential-step-hidden',
          isCurrentStep(5) && 'sequential-glow-active'
        )}
      >
        <div id="section-what-it-does" className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 dark:bg-indigo-950/80 dark:border-indigo-800/60 dark:text-indigo-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">1. What CivicPath Does</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">Comprehensive permitting intelligence engine</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 space-y-2.5 shadow-sm hover:border-indigo-300 dark:hover:border-slate-700 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 dark:bg-indigo-950 dark:border-indigo-800/60 dark:text-indigo-400 flex items-center justify-center">
                <Search className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">1. Analyzes Your Requirement</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Accepts your custom construction query and parses key project parameters for any urban local body across Maharashtra.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 space-y-2.5 shadow-sm hover:border-emerald-300 dark:hover:border-slate-700 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 dark:bg-emerald-950 dark:border-emerald-800/60 dark:text-emerald-400 flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">2. Evaluates Plot Rules</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Uses our deterministic UDCPR 2020 rules engine to calculate which statutory clearances apply, which are exempt, and which require site verification.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 space-y-2.5 shadow-sm hover:border-blue-300 dark:hover:border-slate-700 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 dark:bg-blue-950 dark:border-blue-800/60 dark:text-blue-400 flex items-center justify-center">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">3. Generates Interactive Roadmap</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Constructs a step-by-step sequential DAG mapping revenue title proofs, CAD scrutiny, ATP inspections, parallel NOCs, Plinth check, and Final OC.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: How to Use the App (Step 6) */}
      <div
        data-seq-step="6"
        className={clsx(
          'transition-all duration-700 ease-out',
          isStepVisible(6) ? 'sequential-step-visible' : 'sequential-step-hidden',
          isCurrentStep(6) && 'sequential-glow-active'
        )}
      >
        <div id="section-how-to-use" className="p-6 rounded-2xl bg-white/90 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800 space-y-6 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 dark:bg-indigo-950/80 dark:border-indigo-800/60 dark:text-indigo-400 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">2. How to Use the App</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">Follow these simple steps to build and navigate your approval roadmap</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-750 space-y-1.5 shadow-2xs">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800/50">
                Step 1
              </span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200">Describe What You Need</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Enter your custom request in the search box above (e.g. Pune G+2 Bungalow or hill station house).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-750 space-y-1.5 shadow-2xs">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800/50">
                Step 2
              </span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200">Click Construct</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Press the Construct button to open the Plot Questionnaire modal.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-750 space-y-1.5 shadow-2xs">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800/50">
                Step 3
              </span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200">Answer Plot Questionnaire</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Confirm your plot dimensions, building height, road width, and any site factors (trees, heritage, airport, HT lines).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-750 space-y-1.5 shadow-2xs">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800/50">
                Step 4
              </span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200">Review Your Roadmap</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Explore the generated node workflow, estimated timelines, statutory rules, forms, and official government portal links.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-750 space-y-1.5 shadow-2xs">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800/50">
                Step 5
              </span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200">Track Progress Step-by-Step</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Click "Mark Step as Completed" to track progress. CivicPath automatically highlights the next consecutive statutory step.
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenJargonBuster}
              className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-850/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-750 hover:border-indigo-400 dark:hover:border-indigo-500/50 space-y-1.5 text-left transition-all cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800/50">
                  Step 6
                </span>
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 font-semibold flex items-center gap-1">
                  Open Jargon Buster →
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200">Use Dossier & Jargon Tools</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Download your Master Document Kit or open the Jargon Buster glossary for simple explanations of civic terms (7/12, IOD, CC, OC).
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 3: Main Features Grid (Step 7) */}
      <div
        data-seq-step="7"
        className={clsx(
          'transition-all duration-700 ease-out',
          isStepVisible(7) ? 'sequential-step-visible' : 'sequential-step-hidden',
          isCurrentStep(7) && 'sequential-glow-active'
        )}
      >
        <div id="section-main-features" className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 dark:bg-indigo-950/80 dark:border-indigo-800/60 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">3. Main Features</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">Core architecture powering statutory predictability</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-2 shadow-sm">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
                <Compass className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                Tailored Roadmap Generation
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Directed Acyclic Graph (DAG) visualizing dependencies across 5 structured stages from Land Title to Occupancy.
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenQuestionnaire}
              className="p-4 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850/90 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500/50 space-y-2 text-left transition-all cursor-pointer group shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  Plot Questionnaire
                </h3>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold group-hover:underline">Configure →</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Structured parameter intake capturing building height, road width, and environmental zones for precise rule evaluation.
              </p>
            </button>

            <button
              type="button"
              onClick={onOpenQuestionnaire}
              className="p-4 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850/90 border border-slate-200/90 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/50 space-y-2 text-left transition-all cursor-pointer group shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  Authority Applicability Engine
                </h3>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold group-hover:underline">Evaluate Rules →</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Three-state classification clearly distinguishing APPLIES, EXEMPT, and REQUIRES VERIFICATION with statutory references.
              </p>
            </button>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-2 shadow-sm">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                Sequential Progress Tracking
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Automated progression that updates your active step upon completion and persists completed milestones in local storage.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-2 shadow-sm">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                Master Document Dossier
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Consolidated document checklist detailing Appendix A-1, supervision certificates, and required forms for printing or download.
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenJargonBuster}
              className="p-4 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850/90 border border-slate-200/90 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-500/50 space-y-2 text-left transition-all cursor-pointer group shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                  Civic Jargon Buster
                </h3>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold group-hover:underline">Search Terms →</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Searchable lexicon explaining complex Marathi and English municipal terms like Kayam Mojani, PreDCR, IOD, CC, and OC.
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 4 & SECTION 5: How It Helps & How to Track Progress (Step 8) */}
      <div
        data-seq-step="8"
        className={clsx(
          'transition-all duration-700 ease-out',
          isStepVisible(8) ? 'sequential-step-visible' : 'sequential-step-hidden',
          isCurrentStep(8) && 'sequential-glow-active'
        )}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div id="section-how-it-helps" className="h-full p-5 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 space-y-2.5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              4. How CivicPath Helps You
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Municipal permitting in Maharashtra involves multiple departments (TILR, Town Planning, Tree Authority, CFO, Water Supply, Heritage). Instead of a confusing list of rules, CivicPath translates statutory regulations (UDCPR 2020 & MRTP Act 1966) into an orderly, transparent roadmap tailored to your specific plot.
            </p>
          </div>

          <div id="section-track-progress" className="h-full p-5 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 space-y-2.5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              5. How to Track Progress
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              As you obtain clearance documents from authorities, click <strong>"Mark as Completed"</strong> in the Document Drawer. CivicPath visually ticks the node on the interactive graph, computes your progress percentage, and advances your active focus to the next consecutive prerequisite step.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 6: Statutory Guidance Notice & Public Disclosure (Step 9) */}
      <div
        data-seq-step="9"
        className={clsx(
          'transition-all duration-700 ease-out',
          isStepVisible(9) ? 'sequential-step-visible' : 'sequential-step-hidden',
          isCurrentStep(9) && 'sequential-glow-active'
        )}
      >
        <div id="section-guidance-notice" className="p-5 rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-3.5 shadow-md">
          <ShieldCheck className="w-5 h-5 text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">
              6. Regulatory Model Scope & Public Disclosure Statement
            </h4>
            <p className="leading-relaxed text-[11px] text-slate-600 dark:text-slate-300">
              CivicPath models standard municipal permitting workflows and clearance sequences represented under the <strong>Maharashtra Unified Development Control and Promotion Regulations (UDCPR 2020)</strong> and the <strong>MRTP Act 1966</strong> across seven construction typologies (Residential, Commercial, Institutional, Hospitality, Mixed-Use, Industrial, and Other).
            </p>
            <p className="leading-relaxed text-[11px] text-slate-500 dark:text-slate-400">
              Clearances and timelines are indicative Right to Services (RTS) benchmarks. Site-specific factors—including heritage precinct buffers, airport radar OLS surfaces, eco-sensitive zone (ESZ) notifications, high-tension lines, and local Development Plan (DP) reservations—require empirical site verification. Non-modeled special jurisdictions (e.g., MIDC industrial estates, CIDCO project areas, MHADA/SRA redevelopment schemes, and Coastal Regulation Zones) are subject to separate statutory authorities.
            </p>
            <p className="leading-relaxed text-[11px] text-indigo-700 dark:text-indigo-200/90 font-medium">
              This system is an informational planning aid, not legal advice or a guaranteed municipal sanction. All formal proposals and CAD scrutinies must be submitted and validated by a Council of Architecture (COA) registered architect or licensed structural engineer through the relevant local Urban Local Body.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
