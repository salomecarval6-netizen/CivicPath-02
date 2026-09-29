import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Share2,
  Copy,
  Check,
  FileText,
  Building,
  Link as LinkIcon,
  ExternalLink,
  Sparkles,
  Smartphone
} from 'lucide-react';
import clsx from 'clsx';
import { triggerHaptic } from '../../utils/haptics';

/**
 * ShareMenu - Contextual Dossier & Roadmap Sharing Utility
 * 
 * Provides accessible, native device sharing (via Web Share API) with clipboard fallback.
 * Strictly operates on local user-facing context without inventing fake cloud URLs or public database IDs.
 */
export default function ShareMenu({
  graphData,
  selectedNode,
  className = '',
  buttonClassName = '',
  align = 'right', // 'right' | 'left'
  label = 'Share'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedAction, setCopiedAction] = useState(null); // 'summary' | 'step' | 'link' | null
  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  // Close menu on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Format concise, user-facing summary payload derived directly from active graph
  const dossierSummaryText = useCallback(() => {
    const title = graphData?.taskTitle || 'Maharashtra Construction Permitting Roadmap';
    const type = graphData?.constructionType || graphData?.eligibility?.constructionType || 'Residential';
    const jurisdiction = graphData?.jurisdiction?.split('(')[0]?.trim() || 'Maharashtra';
    
    // Derive days and fees dynamically from actual nodes in the active graph
    const days = graphData?.nodes && graphData.nodes.length > 0
      ? graphData.nodes.reduce((acc, n) => acc + (n.estimatedDays || 0), 0)
      : graphData?.totalEstimatedDays;

    const cost = graphData?.nodes && graphData.nodes.length > 0
      ? graphData.nodes.reduce((acc, n) => acc + (n.cost || 0), 0)
      : graphData?.totalEstimatedCostINR;

    const stepsCount = graphData?.nodes?.length || 0;
    const legal = graphData?.legalReference || 'UDCPR 2020 & MRTP Act 1966';

    const daysText = days ? `~${days} Days (Indicative RTS benchmark)` : 'Variable (Subject to Site Verification)';
    const costText = cost !== undefined && cost !== null ? `₹${Number(cost).toLocaleString('en-IN')} (Indicative municipal estimate)` : 'Variable / Verification Required';

    return [
      `📋 CivicPath Master Dossier: ${title}`,
      `• Project Typology: ${type}`,
      `• Jurisdiction: ${jurisdiction}`,
      `• Modeled Pipeline: ${daysText} across ${stepsCount} Municipal Clearances`,
      `• Indicative Municipal Fees: ${costText}`,
      `• Legal Reference: ${legal}`,
      `\nGenerated via CivicPath — Informational Maharashtra Permitting Navigator`
    ].join('\n');
  }, [graphData]);

  // Format concise step inspector payload
  const stepDetailText = useCallback(() => {
    if (!selectedNode) return '';
    const title = selectedNode.title || 'Permit Step';
    const stage = selectedNode.stage || 'Permit Stage';
    const dept = selectedNode.department || 'Municipal Authority';
    const rule = selectedNode.statutoryRule ? `• Statutory Rule: ${selectedNode.statutoryRule}` : '';
    const days = selectedNode.estimatedDays ? `• Indicative Turnaround: ~${selectedNode.estimatedDays} Days (RTS Benchmark)` : '';
    const cost = selectedNode.cost !== undefined ? `• Indicative Fee: ₹${Number(selectedNode.cost).toLocaleString('en-IN')} (Subject to local calculation)` : '';
    const forms = Array.isArray(selectedNode.forms) && selectedNode.forms.length > 0
      ? `• Required Forms: ${selectedNode.forms.join(', ')}`
      : '';

    return [
      `🏛️ CivicPath Step: ${title}`,
      `• Stage: ${stage}`,
      `• Department: ${dept}`,
      days,
      cost,
      rule,
      forms
    ].filter(Boolean).join('\n');
  }, [selectedNode]);

  // Safe clipboard helper with fallback
  const copyTextToClipboard = async (text, actionKey) => {
    if (!text) return false;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      triggerHaptic('selection');
      setCopiedAction(actionKey);
      setTimeout(() => {
        setCopiedAction(null);
      }, 2000);
      return true;
    } catch {
      // Do not display false positive if clipboard failed
      return false;
    }
  };

  // Native Web Share API trigger
  const handleNativeShare = async () => {
    const title = graphData?.taskTitle || 'CivicPath Master Dossier';
    const text = dossierSummaryText();
    const url = typeof window !== 'undefined' ? window.location.href : '';

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title,
          text,
          url
        });
        triggerHaptic('success');
        setIsOpen(false);
      } catch (err) {
        // If user cancelled, AbortError is normal — do nothing
        if (err.name !== 'AbortError') {
          // Fallback to clipboard
          await copyTextToClipboard(text, 'summary');
        }
      }
    } else {
      // Web Share unavailable -> Fallback to copy summary
      await copyTextToClipboard(text, 'summary');
    }
  };

  const handleCopySummary = async () => {
    await copyTextToClipboard(dossierSummaryText(), 'summary');
  };

  const handleCopyStep = async () => {
    await copyTextToClipboard(stepDetailText(), 'step');
  };

  const handleCopyLink = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    await copyTextToClipboard(url, 'link');
  };

  const hasNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  return (
    <div className={clsx('relative inline-block text-left', className)}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          triggerHaptic('selection');
        }}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Open Dossier Share Menu"
        title="Share or copy dossier context"
        className={clsx(
          'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 cursor-pointer select-none',
          isOpen
            ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-600/30'
            : 'bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-750 hover:border-slate-650',
          buttonClassName
        )}
      >
        <Share2 className="w-3.5 h-3.5 text-indigo-400" />
        {label && <span className="hidden sm:inline">{label}</span>}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Share options"
          className={clsx(
            'absolute top-full mt-2 z-50 w-72 rounded-2xl p-2 border shadow-2xl backdrop-blur-xl bg-slate-900/95 border-slate-800 text-slate-200 animate-in fade-in zoom-in-95 duration-150',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {/* Header */}
          <div className="px-2.5 py-1.5 border-b border-slate-850 mb-1 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Share & Export Dossier
            </span>
            <span className="text-[10px] text-indigo-400 font-mono">CivicPath</span>
          </div>

          {/* Action 1: Native Device Share (when supported) */}
          {hasNativeShare && (
            <button
              type="button"
              role="menuitem"
              onClick={handleNativeShare}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-xs font-medium text-slate-200 hover:text-white hover:bg-indigo-950/60 hover:border-indigo-800/50 border border-transparent transition-all cursor-pointer group"
            >
              <div className="p-1.5 rounded-lg bg-indigo-950/80 text-indigo-400 group-hover:bg-indigo-900 transition-colors">
                <Smartphone className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-100">Share via Device...</div>
                <div className="text-[10px] text-slate-400">Open system share sheet</div>
              </div>
            </button>
          )}

          {/* Action 2: Copy Dossier Summary */}
          <button
            type="button"
            role="menuitem"
            onClick={handleCopySummary}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-750 transition-all cursor-pointer group"
          >
            <div className="p-1.5 rounded-lg bg-slate-850 text-slate-300 group-hover:text-white transition-colors">
              {copiedAction === 'summary' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400 animate-icon-pop" />
              ) : (
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-100 flex items-center justify-between">
                <span>Copy Dossier Summary</span>
                {copiedAction === 'summary' && (
                  <span className="text-[10px] text-emerald-400 font-bold">Copied!</span>
                )}
              </div>
              <div className="text-[10px] text-slate-400">Project timeline, fees & clearances</div>
            </div>
          </button>

          {/* Action 3: Copy Current Selected Step (when a step is selected) */}
          {selectedNode && (
            <button
              type="button"
              role="menuitem"
              onClick={handleCopyStep}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-750 transition-all cursor-pointer group"
            >
              <div className="p-1.5 rounded-lg bg-slate-850 text-slate-300 group-hover:text-white transition-colors">
                {copiedAction === 'step' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 animate-icon-pop" />
                ) : (
                  <Building className="w-3.5 h-3.5 text-blue-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-100 flex items-center justify-between">
                  <span className="truncate">Copy Step Details</span>
                  {copiedAction === 'step' && (
                    <span className="text-[10px] text-emerald-400 font-bold shrink-0">Copied!</span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 truncate">{selectedNode.title}</div>
              </div>
            </button>
          )}

          {/* Action 4: Copy CivicPath App Link */}
          <button
            type="button"
            role="menuitem"
            onClick={handleCopyLink}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-750 transition-all cursor-pointer group"
          >
            <div className="p-1.5 rounded-lg bg-slate-850 text-slate-300 group-hover:text-white transition-colors">
              {copiedAction === 'link' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400 animate-icon-pop" />
              ) : (
                <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-100 flex items-center justify-between">
                <span>Copy Page URL</span>
                {copiedAction === 'link' && (
                  <span className="text-[10px] text-emerald-400 font-bold">Copied!</span>
                )}
              </div>
              <div className="text-[10px] text-slate-400">Current CivicPath application link</div>
            </div>
          </button>

          {/* Local Session Notice (Strict Compliance: No fake cloud sync) */}
          <div className="mt-1 pt-1.5 px-2.5 border-t border-slate-850 text-[10px] text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400/70 shrink-0" />
            <span>Copies formatted text to clipboard</span>
          </div>
        </div>
      )}
    </div>
  );
}
