import React, { useState, useRef } from 'react';
import { Check, Lock, RotateCcw, Eye } from 'lucide-react';
import clsx from 'clsx';

export default function SwipeActionRow({
  children,
  status = 'available', // 'locked' | 'available' | 'completed'
  onToggleStatus,
  onViewDetails,
  className = ''
}) {
  const [dragOffset, setDragOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isHorizontalSwipe = useRef(null);

  const isCompleted = status === 'completed';
  const isAvailable = status === 'available';
  const isLocked = status === 'locked';

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isHorizontalSwipe.current = null;
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (!isSwiping) return;
    const diffX = e.touches[0].clientX - touchStartX.current;
    const diffY = e.touches[0].clientY - touchStartY.current;

    // Detect if this is a horizontal gesture rather than page scroll
    if (isHorizontalSwipe.current === null) {
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 8) {
        isHorizontalSwipe.current = true;
      } else if (Math.abs(diffY) > 8) {
        isHorizontalSwipe.current = false;
        return;
      }
    }

    if (!isHorizontalSwipe.current) return;

    // Resistance factor if locked
    const maxOffset = 90;
    let effectiveOffset = diffX;

    if (diffX > 0 && isLocked) {
      // High resistance when pulling right on a locked item
      effectiveOffset = Math.min(diffX * 0.25, 24);
    } else {
      effectiveOffset = Math.max(-maxOffset, Math.min(maxOffset, diffX));
    }

    setDragOffset(effectiveOffset);
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;
    setIsSwiping(false);

    // Trigger action if swiped past threshold
    if (dragOffset > 55) {
      if (isAvailable && onToggleStatus) {
        onToggleStatus('completed');
      } else if (isCompleted && onToggleStatus) {
        onToggleStatus('available');
      }
    } else if (dragOffset < -55) {
      if (onViewDetails) {
        onViewDetails();
      }
    }

    setDragOffset(0);
  };

  return (
    <div className={clsx('relative overflow-hidden rounded-xl touch-pan-y', className)}>
      {/* Background Action Indicators (Revealed during Swipe) */}
      <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
        {/* Left background: Complete / Undo / Locked */}
        <div
          className={clsx(
            'flex items-center gap-1.5 text-xs font-bold transition-opacity',
            dragOffset > 20 ? 'opacity-100' : 'opacity-0',
            isCompleted
              ? 'text-amber-300'
              : isAvailable
              ? 'text-emerald-300'
              : 'text-slate-500'
          )}
        >
          {isCompleted ? (
            <>
              <RotateCcw className="w-4 h-4" />
              <span>Undo</span>
            </>
          ) : isAvailable ? (
            <>
              <Check className="w-4 h-4" />
              <span>Complete</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>Prereq Locked</span>
            </>
          )}
        </div>

        {/* Right background: View details */}
        <div
          className={clsx(
            'flex items-center gap-1.5 text-xs font-bold text-indigo-300 transition-opacity',
            dragOffset < -20 ? 'opacity-100' : 'opacity-0'
          )}
        >
          <span>View</span>
          <Eye className="w-4 h-4" />
        </div>
      </div>

      {/* Main Foreground Card with Smooth Touch Translation */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className={clsx(
          'relative z-10 transition-transform bg-slate-900',
          isSwiping ? 'duration-0' : 'duration-200'
        )}
        style={{
          transform: `translateX(${dragOffset}px)`
        }}
      >
        {children}
      </div>
    </div>
  );
}
