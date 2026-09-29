import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Compass,
  Sliders,
  BookOpen,
  Printer,
  Home,
  Building,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  Flame,
  Trees,
  ShieldCheck,
  Scale,
  Sparkles,
  X,
  CornerDownLeft,
  ArrowRight,
  FileText
} from 'lucide-react';
import clsx from 'clsx';

export default function CommandPaletteModal({
  isOpen,
  onClose,
  graphData,
  onSelectNode,
  onOpenQuestionnaire,
  onOpenJargonBuster,
  onNavigateHome,
  onNavigateRoadmap,
  onSelectCity,
  onSelectTypology,
  completedNodes = new Set()
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle global and modal key shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1 < filteredItems.length ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filteredItems.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex]);

  // Keep selected item in view
  useEffect(() => {
    if (listRef.current && listRef.current.children[selectedIndex]) {
      listRef.current.children[selectedIndex].scrollIntoView({
        block: 'nearest'
      });
    }
  }, [selectedIndex]);

  // Build command palette item list
  const allItems = useMemo(() => {
    const items = [];

    // 1. Navigation & App Views
    items.push({
      id: 'nav-roadmap',
      category: 'Views & Navigation',
      title: 'Active Permitting Roadmap',
      subtitle: 'View live statutory DAG workflow',
      icon: Compass,
      shortcut: 'G R',
      action: () => onNavigateRoadmap?.()
    });

    items.push({
      id: 'nav-home',
      category: 'Views & Navigation',
      title: 'Home / Requirement Intake',
      subtitle: 'Start a new project search or requirements query',
      icon: Home,
      shortcut: 'G H',
      action: () => onNavigateHome?.()
    });

    items.push({
      id: 'nav-questionnaire',
      category: 'Views & Navigation',
      title: 'Plot & Rule Questionnaire',
      subtitle: 'Configure height, plot area, road width, and statutory constraints',
      icon: Sliders,
      shortcut: 'G Q',
      action: () => onOpenQuestionnaire?.()
    });

    items.push({
      id: 'nav-jargon',
      category: 'Views & Navigation',
      title: 'Civic Jargon Buster',
      subtitle: 'Demystify 7/12, AutoDCR, IOD, CC, FSSAI, and UDCPR statutes',
      icon: BookOpen,
      shortcut: 'G J',
      action: () => onOpenJargonBuster?.()
    });

    items.push({
      id: 'act-print',
      category: 'Views & Navigation',
      title: 'Print / Export Statutory Dossier (PDF)',
      subtitle: 'Generate complete offline municipal document bundle',
      icon: Printer,
      shortcut: '⌘ P',
      action: () => window.print()
    });

    // 2. Active Permitting Steps from Roadmap DAG
    if (graphData && Array.isArray(graphData.nodes)) {
      graphData.nodes.forEach((node) => {
        const isDone = completedNodes.has(node.id);
        items.push({
          id: `step-${node.id}`,
          category: 'Roadmap Milestone Steps',
          title: node.title,
          subtitle: `${node.stage} • ${node.department || 'Statutory Cell'} • ~${node.estimatedDays}d`,
          badge: isDone ? 'COMPLETED' : node.type?.toUpperCase(),
          badgeColor: isDone ? 'emerald' : 'indigo',
          icon: isDone ? CheckCircle2 : FileText,
          action: () => {
            onNavigateRoadmap?.();
            onSelectNode?.(node);
          }
        });
      });
    }

    // 3. Quick Switch Jurisdictions
    const jurisdictions = [
      { id: 'Pune', label: 'Pune Municipal Corporation (PMC)' },
      { id: 'Mumbai', label: 'Municipal Corporation of Greater Mumbai (MCGM / AutoDCR)' },
      { id: 'Thane', label: 'Thane Municipal Corporation (TMC)' },
      { id: 'Pimpri-Chinchwad', label: 'Pimpri Chinchwad Municipal Corporation (PCMC)' },
      { id: 'Matheran', label: 'Matheran Hill Station Municipal Council (Eco-Sensitive)' },
      { id: 'Maharashtra', label: 'Maharashtra State ULBs (MahaBPAMS / UDCPR 2020)' }
    ];

    jurisdictions.forEach((j) => {
      items.push({
        id: `jurisdiction-${j.id}`,
        category: 'Quick Switch Planning Authority',
        title: j.label,
        subtitle: `Set active jurisdiction to ${j.id}`,
        icon: MapPin,
        action: () => onSelectCity?.(j.id)
      });
    });

    // 4. Quick Switch Construction Typology
    const typologies = [
      { id: 'RESIDENTIAL', label: 'Residential', desc: 'Bungalow, Villa, Apartments' },
      { id: 'COMMERCIAL', label: 'Commercial', desc: 'Offices, Retail, Shopping Complex' },
      { id: 'INSTITUTIONAL', label: 'Institutional', desc: 'School, College, Hospital' },
      { id: 'HOSPITALITY', label: 'Hospitality', desc: 'Hotel, Resort, Guest House' },
      { id: 'MIXED_USE', label: 'Mixed-Use', desc: 'Combined Residential + Commercial' },
      { id: 'INDUSTRIAL', label: 'Industrial', desc: 'Factory, Workshop, Warehouse' }
    ];

    typologies.forEach((typ) => {
      items.push({
        id: `typology-${typ.id}`,
        category: 'Filter Building Typology',
        title: `${typ.label} Building Permission`,
        subtitle: typ.desc,
        icon: Building,
        action: () => onSelectTypology?.(typ.id)
      });
    });

    return items;
  }, [graphData, completedNodes, onNavigateRoadmap, onNavigateHome, onOpenQuestionnaire, onOpenJargonBuster, onSelectNode, onSelectCity, onSelectTypology]);

  // Filter items by query
  const filteredItems = useMemo(() => {
    if (!query.trim()) return allItems;
    const lower = query.toLowerCase();
    return allItems.filter(
      (item) =>
        item.title.toLowerCase().includes(lower) ||
        item.subtitle.toLowerCase().includes(lower) ||
        item.category.toLowerCase().includes(lower)
    );
  }, [allItems, query]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] p-4 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans text-slate-900 dark:text-slate-100 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-4 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 dark:text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, roadmap step, jurisdiction, or statutory search..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          <div className="flex items-center gap-1.5 shrink-0">
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md">
              ESC
            </kbd>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results List */}
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400 space-y-2">
              <Search className="w-8 h-8 mx-auto text-slate-400 dark:text-slate-600 opacity-50" />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-300">No commands or milestones found</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Try searching for "AutoDCR", "Tree NOC", "Pune", or "Commercial"</p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon || Compass;
              const isSelected = idx === selectedIndex;
              const isFirstOfCategory =
                idx === 0 || filteredItems[idx - 1].category !== item.category;

              return (
                <React.Fragment key={item.id}>
                  {isFirstOfCategory && (
                    <div className="px-3 pt-3 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400/90 font-mono">
                      {item.category}
                    </div>
                  )}

                  <div
                    onClick={() => {
                      item.action();
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={clsx(
                      'group flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all',
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-500/50 text-indigo-950 dark:text-white shadow-sm'
                        : 'border border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={clsx(
                          'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate flex items-center gap-2">
                          <span>{item.title}</span>
                          {item.badge && (
                            <span
                              className={clsx(
                                'text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider',
                                item.badgeColor === 'emerald'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800/80'
                                  : 'bg-indigo-100 text-indigo-800 border border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800/80'
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate leading-snug">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.shortcut && (
                        <kbd className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-mono font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-md">
                          {item.shortcut}
                        </kbd>
                      )}
                      {isSelected && (
                        <CornerDownLeft className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                      )}
                    </div>
                  </div>
                </React.Fragment>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-[10px]">↓</kbd>
              <span className="ml-1">navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-[10px]">↵</kbd>
              <span className="ml-1">select</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-sans">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CivicPath Command Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
}
