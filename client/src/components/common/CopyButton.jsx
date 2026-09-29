import React, { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import clsx from 'clsx';
import { triggerHaptic } from '../../utils/haptics';

/**
 * CopyButton - Universal Accessible Copy-to-Clipboard Button
 * 
 * Provides robust clipboard copying with graceful fallback, Icon Swap feedback,
 * haptic response, theme compatibility, and reduced motion safety.
 */
export default function CopyButton({
  text = '',
  label = 'Copy',
  copiedLabel = 'Copied!',
  size = 'sm', // 'xs' | 'sm' | 'md'
  className = '',
  title = 'Copy to clipboard',
  onCopy = null
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async (e) => {
    e.stopPropagation();
    if (!text || copied) return;

    let success = false;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        success = true;
      } else {
        // Fallback for non-secure / unsupported contexts
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        success = document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      if (success) {
        triggerHaptic('selection');
        setCopied(true);
        if (onCopy) onCopy(text);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Do not show false success if copy operation failed or threw
      setCopied(false);
    }
  }, [text, copied, onCopy]);

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[9px]',
    sm: 'px-2 py-1 text-[10px]',
    md: 'px-2.5 py-1.5 text-xs'
  }[size] || 'px-2 py-1 text-[10px]';

  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5'
  }[size] || 'w-3 h-3';

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={clsx(
        'inline-flex items-center gap-1 rounded-lg border font-medium transition-all duration-200 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--civic-accent-teal)]',
        sizeClasses,
        copied
          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80 shadow-sm shadow-emerald-950/40'
          : 'bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-750 hover:border-slate-650',
        className
      )}
      title={copied ? copiedLabel : title}
      aria-label={copied ? copiedLabel : (title || (label ? `Copy ${label}` : 'Copy to clipboard'))}
    >
      {copied ? (
        <span key="copied" className="flex items-center gap-1 motion-safe:animate-icon-pop text-emerald-300 font-semibold">
          <Check className={clsx(iconSizes, 'text-emerald-400')} />
          {copiedLabel && <span>{copiedLabel}</span>}
        </span>
      ) : (
        <span key="copy" className="flex items-center gap-1">
          <Copy className={clsx(iconSizes, 'text-slate-400')} />
          {label && <span>{label}</span>}
        </span>
      )}
    </button>
  );
}
