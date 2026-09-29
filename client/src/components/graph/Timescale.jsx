import React, { useMemo } from 'react';
import {
  CheckCircle2,
  CircleDot,
  Lock,
  ChevronRight,
  Clock,
  Layers
} from 'lucide-react';
import clsx from 'clsx';

export default function Timescale({
  graphData,
  completedNodes = new Set(),
  activeStage = null,
  onFocusStage,
  className = ''
}) {
  const stageGroups = useMemo(() => {
    if (!graphData || !Array.isArray(graphData.nodes)) return [];

    const map = new Map();
    graphData.nodes.forEach((node) => {
      const stageKey = node.stage || 'Stage 1';
      if (!map.has(stageKey)) {
        map.set(stageKey, {
          stage: stageKey,
          nodes: [],
          totalDays: 0,
          totalCost: 0
        });
      }
      const group = map.get(stageKey);
      group.nodes.push(node);
      group.totalDays += node.estimatedDays || 0;
      group.totalCost += node.cost || 0;
    });

    return Array.from(map.values()).map((group) => {
      const totalCount = group.nodes.length;
      const completedCount = group.nodes.filter((n) => completedNodes.has(n.id)).length;
      const allDone = totalCount > 0 && completedCount === totalCount;
      const hasStarted = completedCount > 0 || group.nodes.some((n) => {
        // If any node in this stage has its parents met
        if (!graphData.edges) return true;
        const parentEdges = graphData.edges.filter((e) => e.target === n.id);
        return parentEdges.length === 0 || parentEdges.every((e) => completedNodes.has(e.source));
      });

      let status = 'upcoming';
      if (allDone) status = 'completed';
      else if (hasStarted) status = 'in_progress';

      return {
        ...group,
        totalCount,
        completedCount,
        status
      };
    });
  }, [graphData, completedNodes]);

  if (stageGroups.length === 0) return null;

  return (
    <div className={clsx('bg-white dark:bg-[#0d1322] border-b border-slate-200 dark:border-slate-800 px-4 py-2 select-none no-print shadow-xs transition-colors duration-200', className)}>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
          <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-indigo-400" />
          <span className="font-bold uppercase tracking-wider text-[11px] text-slate-800 dark:text-slate-200">
            Roadmap Sequence & Stage Milestones
          </span>
        </div>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono hidden sm:inline">
          Qualitative Progression • UDCPR 2020 Sequential Stages
        </span>
      </div>

      {/* Horizontal Stage Sequence Track */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {stageGroups.map((stageItem, idx) => {
          const isSelected = activeStage === stageItem.stage;
          const isCompleted = stageItem.status === 'completed';
          const isInProgress = stageItem.status === 'in_progress';
          const isUpcoming = stageItem.status === 'upcoming';

          return (
            <React.Fragment key={stageItem.stage}>
              <button
                type="button"
                onClick={() => onFocusStage && onFocusStage(stageItem.stage)}
                className={clsx(
                  'group flex items-center gap-2 px-3 py-1.5 rounded-xl border text-left transition-all duration-200 shrink-0 cursor-pointer shadow-xs',
                  isSelected
                    ? 'ring-2 ring-blue-500 border-blue-300 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:border-blue-700 dark:text-blue-300 dark:ring-blue-500'
                    : isCompleted
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-800/60 dark:text-emerald-200 dark:hover:bg-emerald-950/60'
                    : isInProgress
                    ? 'bg-blue-50/70 border-blue-200 text-blue-800 hover:bg-blue-100 dark:bg-slate-850 dark:border-indigo-700/80 dark:text-slate-200 dark:hover:border-indigo-500'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
                )}
                title={`Jump to ${stageItem.stage} (${stageItem.completedCount}/${stageItem.totalCount} completed)`}
              >
                {/* Status Indicator Icon */}
                <div className="shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : isInProgress ? (
                    <CircleDot className="w-4 h-4 text-blue-600 dark:text-indigo-400 animate-pulse" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  )}
                </div>

                {/* Stage Info */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold whitespace-nowrap">
                      {stageItem.stage}
                    </span>
                    <span
                      className={clsx(
                        'text-[9px] font-mono px-1.5 py-0.2 rounded-full border',
                        isSelected
                          ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/60 dark:text-blue-300 dark:border-blue-700/60'
                          : isCompleted
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/60 dark:text-emerald-300 dark:border-emerald-700/60'
                          : isInProgress
                          ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-indigo-900/60 dark:text-indigo-300 dark:border-indigo-700/60'
                          : 'bg-slate-200 text-slate-600 border-slate-300 dark:bg-slate-900 dark:text-slate-500 dark:border-slate-800'
                      )}
                    >
                      {stageItem.completedCount}/{stageItem.totalCount}
                    </span>
                  </div>
                </div>
              </button>

              {/* Connecting Chevron Arrow */}
              {idx < stageGroups.length - 1 && (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0 opacity-60" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
