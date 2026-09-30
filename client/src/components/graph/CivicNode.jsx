import React from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  Clock,
  IndianRupee,
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  Lock,
  Building,
  Scale
} from 'lucide-react';
import clsx from 'clsx';
import StatusButton from '../common/StatusButton';
import CopyButton from '../common/CopyButton';

export default function CivicNode({ data, selected }) {
  const {
    id,
    title = 'Permit Step',
    stage = 'Stage 1',
    department = 'Municipal Authority',
    estimatedDays = 0,
    cost = 0,
    isBottleneck = false,
    statutoryRule = '',
    status = 'available', // 'locked' | 'available' | 'completed'
    orientation = 'TB', // 'TB' (top-to-bottom) | 'LR' (left-to-right)
    onStatusChange
  } = data;

  const isCompleted = status === 'completed';
  const isAvailable = status === 'available';
  const isLocked = status === 'locked';

  const handleToggleStatus = (nextStatus) => {
    if (!onStatusChange || isLocked) return;
    onStatusChange(id, nextStatus);
  };

  const targetPosition = orientation === 'LR' ? Position.Left : Position.Top;
  const sourcePosition = orientation === 'LR' ? Position.Right : Position.Bottom;

  return (
    <div
      className={clsx(
        'group relative rounded-2xl p-4 min-w-[300px] max-w-[320px] transition-all duration-300 text-left cursor-pointer font-sans select-none backdrop-blur-md',
        // Status border, background & shadow styling
        isAvailable &&
          'bg-white dark:bg-[#0f172a] border-2 border-blue-500 shadow-[0_10px_25px_rgba(59,130,246,0.15)] dark:shadow-[0_10px_30px_rgba(59,130,246,0.25)] text-slate-900 dark:text-white',
        isLocked &&
          'bg-slate-100/90 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-500 opacity-85 hover:opacity-100 dark:opacity-65 dark:hover:opacity-80 shadow-xs',
        isCompleted &&
          'bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-400 dark:border-emerald-600 text-emerald-950 dark:text-emerald-100 shadow-sm',
        selected &&
          'ring-2 ring-blue-500 dark:ring-blue-400 border-blue-500 dark:border-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.35)] scale-[1.02]'
      )}
    >
      {/* React Flow Target Handle */}
      <Handle
        type="target"
        position={targetPosition}
        className={clsx(
          '!w-3.5 !h-3.5 !border-2 !border-white dark:!border-slate-900 transition-all duration-200',
          isCompleted && '!bg-emerald-500 shadow-[0_0_8px_#10b981]',
          isAvailable && '!bg-blue-500 shadow-[0_0_8px_#3b82f6]',
          isLocked && '!bg-slate-400 dark:!bg-slate-600'
        )}
      />

      {/* Header: Stage Pill and Status Badge */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span
          className={clsx(
            'text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full truncate border',
            isCompleted && 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800/60',
            isAvailable && 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800/60',
            isLocked && 'bg-slate-200 text-slate-600 border-slate-300 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
          )}
        >
          {stage}
        </span>

        <div className="flex items-center gap-1 shrink-0">
          {isCompleted && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-400 bg-emerald-100/90 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800/50">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Done
            </span>
          )}
          {isAvailable && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-800 dark:text-indigo-300 bg-blue-100/90 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full border border-blue-300 dark:border-indigo-800/50">
              <CircleDashed className="w-3.5 h-3.5 text-blue-600 dark:text-indigo-400 animate-spin-slow" />
              Actionable
            </span>
          )}
          {isLocked && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-200 dark:bg-slate-900/80 px-2 py-0.5 rounded-full border border-slate-300 dark:border-slate-800">
              <Lock className="w-3 h-3 text-slate-500" />
              Prereq Locked
            </span>
          )}
        </div>
      </div>

      {/* Node Title with Quick Copy Button */}
      <div className="flex items-start justify-between gap-1.5 my-1">
        <h3
          className={clsx(
            'text-slate-900 dark:text-white font-semibold text-sm leading-snug line-clamp-2 flex-1',
            isLocked && 'text-slate-600 dark:text-slate-400'
          )}
        >
          {title}
        </h3>
        <CopyButton
          text={title}
          label=""
          copiedLabel="Copied"
          size="sm"
          className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 py-0.5 px-1.5"
          title="Copy Step Title"
        />
      </div>

      {/* Department Badge */}
      <div className="my-2">
        <span
          className={clsx(
            'inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg font-medium truncate max-w-full border',
            'bg-slate-100 dark:bg-slate-850 text-black dark:text-black border-slate-200 dark:border-slate-750'
          )}
        >
          <Building className="w-3 h-3 shrink-0 text-slate-700 dark:text-slate-700" />
          <span className="truncate text-black dark:text-black">{department}</span>
        </span>
      </div>

      {/* Statutory Rule Citation */}
      {statutoryRule && (
        <div className="flex items-center justify-between gap-1 text-[10px] text-slate-500 dark:text-slate-400 italic mb-2 font-mono">
          <div className="flex items-center gap-1.5 truncate">
            <Scale className="w-3 h-3 text-blue-600 dark:text-indigo-400 shrink-0" />
            <span className="truncate">{statutoryRule}</span>
          </div>
          <CopyButton
            text={statutoryRule}
            label=""
            copiedLabel="Copied"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 py-0 px-1 text-[9px]"
            title="Copy Statutory Rule Citation"
          />
        </div>
      )}

      {/* Bottleneck Alert */}
      {isBottleneck && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 mb-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-[11px] font-semibold">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="truncate">Known Municipal Bottleneck</span>
        </div>
      )}

      {/* Metric Bar & Status Button */}
      <div className="pt-2.5 mt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div
            className="inline-flex items-center gap-1 font-medium text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            title="Estimated turnaround time"
          >
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span>{estimatedDays}d</span>
          </div>

          <div
            className="inline-flex items-center gap-0.5 font-medium text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            title="Estimated fee"
          >
            <IndianRupee className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{Number(cost).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Status Button with Icon Swap and Prerequisite Protection */}
        <StatusButton
          status={status}
          onToggle={handleToggleStatus}
          disabled={isLocked}
          size="sm"
        />
      </div>

      {/* React Flow Source Handle */}
      <Handle
        type="source"
        position={sourcePosition}
        className={clsx(
          '!w-3.5 !h-3.5 !border-2 !border-white dark:!border-slate-900 transition-all duration-200',
          isCompleted && '!bg-emerald-500 shadow-[0_0_8px_#10b981]',
          isAvailable && '!bg-blue-500 shadow-[0_0_8px_#3b82f6]',
          isLocked && '!bg-slate-400 dark:!bg-slate-600'
        )}
      />
    </div>
  );
}
