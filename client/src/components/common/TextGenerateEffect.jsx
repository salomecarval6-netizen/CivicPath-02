import React from 'react';
import clsx from 'clsx';

/**
 * TextGenerateEffect - Aceternity-inspired word-by-word stagger text reveal
 * Splits text into individual word tokens and animates opacity, blur, and vertical translation.
 */
export default function TextGenerateEffect({
  words,
  className = '',
  isVisible = false,
  baseDelay = 0,
  wordDelay = 25,
  as: Component = 'span'
}) {
  const [reducedMotion, setReducedMotion] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mql.matches);
      const handler = (e) => setReducedMotion(e.matches);
      mql.addEventListener?.('change', handler);
      return () => mql.removeEventListener?.('change', handler);
    }
  }, []);

  const tokens = typeof words === 'string' ? words.trim().split(/\s+/) : [];

  return (
    <Component className={className}>
      {tokens.map((word, idx) => {
        const delayMs = reducedMotion ? 0 : baseDelay + idx * wordDelay;
        return (
          <React.Fragment key={`${word}-${idx}`}>
            <span
              style={{
                transitionDelay: isVisible || reducedMotion ? `${delayMs}ms` : '0ms'
              }}
              className={clsx(
                'inline-block transition-all duration-300 ease-out',
                isVisible || reducedMotion
                  ? 'opacity-100 filter-none translate-y-0'
                  : 'opacity-0 filter blur-[4px] translate-y-1'
              )}
            >
              {word}
            </span>
            {idx < tokens.length - 1 ? ' ' : ''}
          </React.Fragment>
        );
      })}
    </Component>
  );
}
