import React from 'react';
import clsx from 'clsx';

export default function ShimmeringText({
  text = 'Constructing your roadmap…',
  subtitle = 'Evaluating UDCPR 2020 & MRTP Act statutory workflows',
  className = ''
}) {
  return (
    <div className={clsx('text-center space-y-1.5 select-none', className)}>
      <h3 className="text-lg sm:text-xl font-bold tracking-tight shimmer-text">
        {text}
      </h3>
      {subtitle && (
        <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
