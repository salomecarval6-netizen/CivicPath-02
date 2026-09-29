import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { toggleThemeWithEffect } from '../../utils/theme';

export default function ThemeSwitcher({ theme, onThemeChange, className = '' }) {
  const isDark = theme === 'dark';

  const handleClick = (e) => {
    toggleThemeWithEffect(theme, onThemeChange, e);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`relative inline-flex items-center justify-center p-2 rounded-xl border transition-all duration-200 cursor-pointer group active:scale-95 ${
        isDark
          ? 'bg-slate-800 hover:bg-slate-750 text-amber-300 border-slate-700/80 shadow-sm hover:border-amber-500/40 hover:shadow-amber-500/10'
          : 'bg-white hover:bg-slate-100 text-indigo-600 border-slate-200 shadow-sm hover:border-indigo-400/50 hover:shadow-indigo-500/10'
      } ${className}`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-300 group-hover:rotate-45 group-hover:scale-110 transition-transform duration-300" />
        ) : (
          <Moon className="w-4 h-4 text-indigo-600 group-hover:-rotate-12 group-hover:scale-110 transition-transform duration-300" />
        )}
      </div>
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
