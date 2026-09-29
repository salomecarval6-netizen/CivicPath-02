import React, { useRef, useState, useEffect } from 'react';
import clsx from 'clsx';

export default function ScrollContainerWithFade({
  children,
  className = '',
  containerRef: externalRef
}) {
  const internalRef = useRef(null);
  const containerRef = externalRef || internalRef;
  const [showTopFade, setShowTopFade] = useState(false);
  const [showBottomFade, setShowBottomFade] = useState(false);

  const checkScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    setShowTopFade(scrollTop > 12);
    setShowBottomFade(scrollHeight - scrollTop - clientHeight > 12);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);

    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [containerRef]);

  return (
    <div className="relative flex-1 min-h-0 overflow-hidden flex flex-col">
      {/* Top Scroll Fade Mask */}
      <div
        className={clsx(
          'pointer-events-none absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-slate-900 to-transparent z-10 transition-opacity duration-200',
          showTopFade ? 'opacity-100' : 'opacity-0'
        )}
      />

      {/* Scrollable Main Area */}
      <div
        ref={containerRef}
        className={clsx('flex-1 overflow-y-auto', className)}
      >
        {children}
      </div>

      {/* Bottom Scroll Fade Mask */}
      <div
        className={clsx(
          'pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-slate-900 to-transparent z-10 transition-opacity duration-200',
          showBottomFade ? 'opacity-100' : 'opacity-0'
        )}
      />
    </div>
  );
}
