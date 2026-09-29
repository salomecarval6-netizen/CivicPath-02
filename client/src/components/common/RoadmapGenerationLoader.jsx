import React from 'react';
import MobiusLoop from './MobiusLoop';
import ShimmeringText from './ShimmeringText';

export default function RoadmapGenerationLoader({
  loading = false,
  message = 'Constructing your roadmap…',
  subtitle = 'Evaluating Maharashtra UDCPR 2020 rules & parallel departmental NOCs'
}) {
  if (!loading) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      className="fixed inset-0 z-[150] flex flex-col items-center justify-center p-6 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-200 select-none"
    >
      <div className="flex flex-col items-center max-w-md text-center space-y-6">
        {/* Mobius Loop Visual Indicator */}
        <div className="relative">
          <MobiusLoop size={88} />
        </div>

        {/* Shimmering Text Feedback */}
        <ShimmeringText text={message} subtitle={subtitle} />

        {/* Ambient progress indicators */}
        <div className="w-48 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 w-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
