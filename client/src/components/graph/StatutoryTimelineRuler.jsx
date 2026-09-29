import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  CircleDot,
  Lock,
  Clock,
  ChevronRight,
  Sparkles,
  Compass,
  FileCheck2,
  Building,
  ShieldCheck,
  Award,
  CalendarDays,
  Coins
} from 'lucide-react';
import clsx from 'clsx';

// Canonical Maharashtra UDCPR 2020 Statutory Journey Stages
const CANONICAL_STAGES = [
  {
    id: 1,
    keyMatch: /revenue|land title|stage 1/i,
    title: 'Revenue & Land Title',
    subtitle: '7/12 Extract, CTS & Mojani',
    shortRef: '7/12 & Mojani',
    icon: FileCheck2,
    defaultDays: 14
  },
  {
    id: 2,
    keyMatch: /architectural|scrutiny|predcr|autodcr|stage 2/i,
    title: 'Architectural Scrutiny',
    subtitle: 'AutoDCR Blueprint Scrutiny',
    shortRef: 'AutoDCR Scrutiny',
    icon: Compass,
    defaultDays: 21
  },
  {
    id: 3,
    keyMatch: /parallel|departmental|noc|stage 3/i,
    title: 'Parallel Departmental NOCs',
    subtitle: 'CFO Fire, Tree Authority, MPCB',
    shortRef: 'CFO / Tree / MPCB',
    icon: ShieldCheck,
    defaultDays: 30
  },
  {
    id: 4,
    keyMatch: /groundbreaking|plinth|commencement|stage 4/i,
    title: 'Groundbreaking & Plinth',
    subtitle: 'Commencement Cert (CC) & Check',
    shortRef: 'Plinth CC Inspection',
    icon: Building,
    defaultDays: 15
  },
  {
    id: 5,
    keyMatch: /habitation|utilities|occupancy|completion|stage 5/i,
    title: 'Completion & Occupancy',
    subtitle: 'Occupancy Cert (OC) & Meters',
    shortRef: 'OC / Drainage Final',
    icon: Award,
    defaultDays: 18
  }
];

export default function StatutoryTimelineRuler({
  graphData,
  completedNodes = new Set(),
  activeStage = null,
  onFocusStage,
  onOpenDossier,
  className = ''
}) {
  const [hoveredStageId, setHoveredStageId] = useState(null);

  // Group graph nodes into sequential statutory stages
  const stageData = useMemo(() => {
    if (!graphData || !Array.isArray(graphData.nodes)) {
      return CANONICAL_STAGES.map((cs) => ({
        ...cs,
        stageKey: `Stage ${cs.id}`,
        nodes: [],
        totalCount: 0,
        completedCount: 0,
        totalDays: cs.defaultDays,
        totalCost: 0,
        status: cs.id === 1 ? 'in_progress' : 'locked'
      }));
    }

    // Map existing nodes to stage groups
    const stageMap = new Map();
    graphData.nodes.forEach((node) => {
      const stageKey = node.stage || 'Stage 1';
      if (!stageMap.has(stageKey)) {
        stageMap.set(stageKey, {
          stageKey,
          nodes: [],
          totalDays: 0,
          totalCost: 0
        });
      }
      const group = stageMap.get(stageKey);
      group.nodes.push(node);
      group.totalDays += node.estimatedDays || 0;
      group.totalCost += node.cost || 0;
    });

    const graphGroups = Array.from(stageMap.values());

    return CANONICAL_STAGES.map((cs) => {
      // Find matching stage group in graphData
      const matchedGroup = graphGroups.find(
        (g) => cs.keyMatch.test(g.stageKey) || g.stageKey.includes(`Stage ${cs.id}`)
      );

      const nodes = matchedGroup ? matchedGroup.nodes : [];
      const totalCount = nodes.length;
      const completedCount = nodes.filter((n) => completedNodes.has(n.id)).length;
      const totalDays = matchedGroup?.totalDays || cs.defaultDays;
      const totalCost = matchedGroup?.totalCost || 0;

      // Determine status: completed, in_progress, locked
      let status = 'locked';
      if (totalCount > 0 && completedCount === totalCount) {
        status = 'completed';
      } else if (completedCount > 0) {
        status = 'in_progress';
      } else {
        // If any node in this stage is ready (parents done)
        const hasReadyNode = nodes.some((n) => {
          if (!graphData.edges) return true;
          const parentEdges = graphData.edges.filter((e) => e.target === n.id);
          return parentEdges.length === 0 || parentEdges.every((e) => completedNodes.has(e.source));
        });
        if (hasReadyNode || cs.id === 1) {
          status = 'in_progress';
        }
      }

      return {
        ...cs,
        stageKey: matchedGroup ? matchedGroup.stageKey : `Stage ${cs.id}`,
        nodes,
        totalCount,
        completedCount,
        totalDays,
        totalCost,
        status
      };
    });
  }, [graphData, completedNodes]);

  // Overall metric totals
  const overallMetrics = useMemo(() => {
    const totalDays = stageData.reduce((acc, s) => acc + s.totalDays, 0);
    const totalClearances = stageData.reduce((acc, s) => acc + s.totalCount, 0);
    const completedClearances = stageData.reduce((acc, s) => acc + s.completedCount, 0);
    const isComplete = totalClearances > 0 && completedClearances === totalClearances;
    const progressPercent = totalClearances > 0 ? Math.round((completedClearances / totalClearances) * 100) : 0;
    return { totalDays, totalClearances, completedClearances, progressPercent, isComplete };
  }, [stageData]);

  // Handle stage click
  const handleMilestoneClick = (stage) => {
    if (onFocusStage) {
      onFocusStage(stage.stageKey);
    }
  };

  return (
    <div
      className={clsx(
        'w-full bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/90 dark:border-slate-800/90 backdrop-blur-md px-4 py-2.5 select-none transition-colors duration-200 relative z-10 no-print',
        overallMetrics.isComplete && 'ring-1 ring-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/10',
        className
      )}
    >
      {/* Top Header Info Bar */}
      <div className="flex items-center justify-between gap-4 mb-2 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className={clsx(
              'flex items-center justify-center w-5 h-5 rounded-md',
              overallMetrics.isComplete
                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
            )}
          >
            {overallMetrics.isComplete ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <Compass className="w-3.5 h-3.5" />
            )}
          </div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            {overallMetrics.isComplete
              ? '100% — All 5 Stages Complete • Occupancy Sanctioned'
              : 'Statutory Milestone Ruler & Pipeline Journey'}
          </span>
          <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700/60">
            <Clock className="w-3 h-3 text-blue-500" />
            Est. ~{overallMetrics.totalDays} Working Days
          </span>
        </div>

        <div className="flex items-center gap-2.5 text-[11px] font-mono">
          {overallMetrics.isComplete ? (
            <button
              type="button"
              onClick={onOpenDossier}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-sm shadow-emerald-600/30 transition-all cursor-pointer active:scale-95"
            >
              <Award className="w-3.5 h-3.5" />
              <span>View Sanction Dossier</span>
            </button>
          ) : (
            <>
              <span className="text-slate-600 dark:text-slate-400 font-semibold">
                Clearances: <strong className="text-blue-600 dark:text-blue-400">{overallMetrics.completedClearances}</strong>/{overallMetrics.totalClearances}
              </span>
              <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-300"
                  style={{ width: `${overallMetrics.progressPercent}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                {overallMetrics.progressPercent}%
              </span>
            </>
          )}
        </div>
      </div>

      {/* The Calibrated Ruler Track */}
      <div className="relative pt-3 pb-1.5">
        {/* Calibrated Background Metric Track Line */}
        <div className="absolute top-[22px] left-6 right-6 h-[2px] bg-slate-200 dark:bg-slate-800 z-0">
          {/* Active Progress Overlay Line */}
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500 transition-all duration-500"
            style={{
              width: `${
                Math.max(
                  0,
                  (stageData.filter((s) => s.status === 'completed').length / (stageData.length - 1)) * 100
                )
              }%`
            }}
          />
        </div>

        {/* Milestone Nodes Along Ruler */}
        <div className="relative z-10 grid grid-cols-5 gap-2 sm:gap-4 items-start">
          {stageData.map((stage, idx) => {
            const isCompleted = stage.status === 'completed';
            const isInProgress = stage.status === 'in_progress';
            const isLocked = stage.status === 'locked';
            const isSelected = activeStage === stage.stageKey;
            const isHovered = hoveredStageId === stage.id;
            const StageIcon = stage.icon;

            return (
              <div
                key={stage.id}
                onMouseEnter={() => setHoveredStageId(stage.id)}
                onMouseLeave={() => setHoveredStageId(null)}
                onClick={() => handleMilestoneClick(stage)}
                className="group flex flex-col items-center text-center cursor-pointer transition-transform duration-150 active:scale-95"
              >
                {/* Milestone Node Badge with Calibrated Tick Mark */}
                <div className="relative flex flex-col items-center mb-1.5">
                  {/* Circular Node Indicator */}
                  <div
                    className={clsx(
                      'w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm relative z-10',
                      isCompleted
                        ? 'bg-emerald-500 text-white shadow-emerald-500/25 ring-4 ring-emerald-500/20 group-hover:bg-emerald-600'
                        : isInProgress
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/30 animate-pulse group-hover:bg-blue-500'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-slate-700 group-hover:border-slate-400',
                      isSelected && 'ring-4 ring-blue-500 scale-110 shadow-md'
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                    ) : isInProgress ? (
                      <StageIcon className="w-4 h-4" />
                    ) : (
                      <Lock className="w-3.5 h-3.5" />
                    )}
                  </div>

                  {/* Stage Number Flag */}
                  <span
                    className={clsx(
                      'absolute -top-3 text-[9px] font-mono font-black uppercase px-1.5 py-0.2 rounded-full border transition-colors',
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                        : isInProgress
                        ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800'
                        : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-850 dark:text-slate-400 dark:border-slate-750'
                    )}
                  >
                    STG {stage.id}
                  </span>
                </div>

                {/* Micro Ruler Ticks Sub-track below milestone indicator */}
                <div className="w-full flex items-center justify-center gap-1 my-1 opacity-70 group-hover:opacity-100 transition-opacity">
                  <span className="h-1.5 w-[1px] bg-slate-300 dark:bg-slate-700" />
                  <span className="h-2.5 w-[1px] bg-slate-400 dark:bg-slate-600" />
                  <span className="h-1.5 w-[1px] bg-slate-300 dark:bg-slate-700" />
                  <span className="h-3 w-[1.5px] bg-blue-500/70" />
                  <span className="h-1.5 w-[1px] bg-slate-300 dark:bg-slate-700" />
                  <span className="h-2.5 w-[1px] bg-slate-400 dark:bg-slate-600" />
                  <span className="h-1.5 w-[1px] bg-slate-300 dark:bg-slate-700" />
                </div>

                {/* Milestone Details Card */}
                <div
                  className={clsx(
                    'w-full max-w-[140px] px-1.5 py-1 rounded-lg border transition-all duration-150',
                    isSelected
                      ? 'bg-blue-50/90 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 shadow-xs'
                      : isHovered
                      ? 'bg-slate-50 dark:bg-slate-850/80 border-slate-300 dark:border-slate-700 shadow-xs'
                      : 'border-transparent'
                  )}
                >
                  <p
                    className={clsx(
                      'text-xs font-bold leading-tight truncate',
                      isCompleted
                        ? 'text-emerald-700 dark:text-emerald-300'
                        : isInProgress
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-slate-700 dark:text-slate-300'
                    )}
                    title={stage.title}
                  >
                    {stage.title}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate leading-tight font-mono">
                    {stage.shortRef}
                  </p>

                  {/* Stage Metrics Badges */}
                  <div className="flex items-center justify-center gap-1 mt-1 flex-wrap">
                    <span
                      className={clsx(
                        'text-[9px] font-bold px-1.5 py-0.5 rounded-md border',
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60'
                          : isInProgress
                          ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60'
                          : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700/60'
                      )}
                    >
                      {stage.completedCount}/{stage.totalCount || stage.nodes.length} Done
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 hidden sm:inline">
                      ~{stage.totalDays}d
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
