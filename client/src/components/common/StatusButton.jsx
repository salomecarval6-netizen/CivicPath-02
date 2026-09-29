import React, { useState } from 'react';
import {
  Check,
  Lock,
  RotateCcw,
  CheckCircle2,
  CircleDot
} from 'lucide-react';
import clsx from 'clsx';

export default function StatusButton({
  status = 'available', // 'locked' | 'available' | 'completed'
  onToggle,
  disabled = false,
  size = 'md',
  className = ''
}) {
  const [isHovered, setIsHovered] = useState(false);

  const isCompleted = status === 'completed';
  const isAvailable = status === 'available';
  const isLocked = status === 'locked';

  const handleClick = (e) => {
    e.stopPropagation();
    if (disabled || isLocked) return;
    if (onToggle) {
      onToggle(isCompleted ? 'available' : 'completed');
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isLocked}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={clsx(
        'relative inline-flex items-center justify-center gap-1.5 rounded-xl font-semibold transition-all duration-200 select-none shadow-sm',
        size === 'sm' ? 'px-2.5 py-1 text-[10px]' : 'px-3.5 py-1.5 text-xs',
        isCompleted
          ? 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-emerald-600/30 cursor-pointer active:scale-95'
          : isAvailable
          ? 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-indigo-600/30 cursor-pointer active:scale-95'
          : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed opacity-60',
        className
      )}
      title={
        isCompleted
          ? 'Step is completed. Click to undo.'
          : isAvailable
          ? 'Prerequisites met. Click to mark step as completed.'
          : 'Prerequisites must be completed first.'
      }
      aria-label={
        isCompleted
          ? 'Completed, click to undo'
          : isAvailable
          ? 'Mark step completed'
          : 'Prerequisite locked'
      }
    >
      {/* Icon Swap Animation */}
      {isCompleted ? (
        <span key="done" className="flex items-center gap-1 animate-icon-pop">
          {isHovered ? (
            <>
              <RotateCcw className="w-3.5 h-3.5 text-emerald-200" />
              <span>Undo</span>
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5 text-white" />
              <span>Done</span>
            </>
          )}
        </span>
      ) : isAvailable ? (
        <span key="ready" className="flex items-center gap-1 animate-icon-pop">
          <CircleDot className="w-3.5 h-3.5 text-white animate-pulse" />
          <span>Mark Done</span>
        </span>
      ) : (
        <span key="locked" className="flex items-center gap-1">
          <Lock className="w-3.5 h-3.5 text-slate-500" />
          <span>Locked</span>
        </span>
      )}
    </button>
  );
}
