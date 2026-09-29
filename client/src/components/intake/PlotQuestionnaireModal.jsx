import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Sliders,
  X,
  Building2,
  Trees,
  LandPlot,
  Plane,
  Sparkles,
  Mountain,
  Zap,
  HelpCircle,
  Flame,
  Lock,
  Compass,
  MapPin
} from 'lucide-react';
import clsx from 'clsx';
import ElasticSlider from '../common/ElasticSlider';
import WheelPicker from '../common/WheelPicker';
import { triggerHaptic } from '../../utils/haptics';

const MAHARASHTRA_JURISDICTIONS = [
  { id: 'Maharashtra', label: 'Maharashtra State ULBs', desc: 'MahaBPAMS / UDCPR 2020 Standard' },
  { id: 'Pune', label: 'Pune Municipal Corp (PMC)', desc: 'Pune AutoDCR / Unified UDCPR' },
  { id: 'Mumbai', label: 'MCGM / AutoDCR (Mumbai)', desc: 'DCPR 2034 Special Planning' },
  { id: 'Pimpri-Chinchwad', label: 'PCMC (Pimpri-Chinchwad)', desc: 'PCMC AutoDCR Portal' },
  { id: 'Thane', label: 'Thane Municipal Corp (TMC)', desc: 'TMC Online Town Planning' },
  { id: 'Navi Mumbai', label: 'Navi Mumbai / CIDCO', desc: 'CIDCO Town Planning Norms' },
  { id: 'Matheran', label: 'Matheran Hill Station', desc: 'Eco-Sensitive Zone (ESZ Committee)' },
  { id: 'Nashik', label: 'Nashik Municipal Corp (NMC)', desc: 'NMC MahaBPAMS Portal' },
  { id: 'Nagpur', label: 'Nagpur Municipal Corp (NMC)', desc: 'NMC MahaBPAMS Portal' }
];

const CONSTRUCTION_TYPES = [
  { id: 'RESIDENTIAL', label: 'Residential', desc: 'Bungalow, Villa, Apartments, Row House', tag: 'Appx A-1' },
  { id: 'COMMERCIAL', label: 'Commercial', desc: 'Offices, Retail, Shopping Mall, Showroom', tag: 'Rule 6.2' },
  { id: 'INSTITUTIONAL', label: 'Institutional', desc: 'School, College, Hospital, Community Hall', tag: 'Rule 6.3' },
  { id: 'HOSPITALITY', label: 'Hospitality', desc: 'Hotel, Resort, Guest House, Lodge', tag: 'Rule 6.4' },
  { id: 'MIXED_USE', label: 'Mixed-Use', desc: 'Combined Residential + Commercial / Retail', tag: 'Podium' },
  { id: 'INDUSTRIAL', label: 'Industrial', desc: 'Factory, Workshop, Warehouse, Storage', tag: 'MPCB' },
  { id: 'OTHER', label: 'Other', desc: 'Specialized or Custom Facility', tag: 'Custom' }
];

const ROAD_WIDTH_PRESETS = [
  { id: 6.0, label: '6.0m — Minimum lane', desc: 'Standard low-density residential access', tag: '6.0m' },
  { id: 9.0, label: '9.0m — Standard street', desc: 'Default municipal residential street (FSI 1.1)', tag: '9.0m' },
  { id: 12.0, label: '12.0m — Collector road', desc: 'Permits commercial & institutional developments', tag: '12.0m' },
  { id: 18.0, label: '18.0m+ — Major arterial', desc: 'Maximum premium FSI / TDR loading allowed', tag: '18.0m' }
];

export default function PlotQuestionnaireModal({
  isOpen,
  onClose,
  initialValues = {},
  onSubmitQuestionnaire,
  loading = false,
  lockedTypology = null,
  sourceQuery = ''
}) {
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);
  const canvasRef = useRef(null);

  const [formData, setFormData] = useState(() => ({
    constructionType: initialValues.constructionType || 'RESIDENTIAL',
    customConstructionType: initialValues.customConstructionType || '',
    mixedUseComponents: initialValues.mixedUseComponents || ['RESIDENTIAL', 'COMMERCIAL'],
    jurisdiction: initialValues.jurisdiction || 'Maharashtra',
    plotArea: initialValues.plotArea || 200,
    buildingHeight: initialValues.buildingHeight || 8.5,
    roadWidth: initialValues.roadWidth || 9.0,
    treesAffected: initialValues.treesAffected || 0,
    heritageZone: initialValues.heritageZone || false,
    airportZone: initialValues.airportZone || false,
    ecoSensitiveZone: initialValues.ecoSensitiveZone || false,
    hasHighTensionLine: initialValues.hasHighTensionLine || false
  }));

  // Synchronize form data when modal opens or initial values change
  useEffect(() => {
    if (isOpen) {
      setFormData({
        constructionType: initialValues.constructionType || 'RESIDENTIAL',
        customConstructionType: initialValues.customConstructionType || '',
        mixedUseComponents: initialValues.mixedUseComponents || ['RESIDENTIAL', 'COMMERCIAL'],
        jurisdiction: initialValues.jurisdiction || 'Maharashtra',
        plotArea: initialValues.plotArea || 200,
        buildingHeight: initialValues.buildingHeight || 8.5,
        roadWidth: initialValues.roadWidth || 9.0,
        treesAffected: initialValues.treesAffected || 0,
        heritageZone: initialValues.heritageZone || false,
        airportZone: initialValues.airportZone || false,
        ecoSensitiveZone: initialValues.ecoSensitiveZone || false,
        hasHighTensionLine: initialValues.hasHighTensionLine || false
      });
    }
  }, [isOpen, initialValues]);

  // Handle animated entrance & exit transitions
  useEffect(() => {
    let frameId;
    let timerId;

    if (isOpen) {
      setIsRendered(true);
      frameId = requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else if (isRendered) {
      setIsVisible(false);
      timerId = setTimeout(() => {
        setIsRendered(false);
      }, 300);
    }

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      if (timerId) clearTimeout(timerId);
    };
  }, [isOpen, isRendered]);

  // Flickering Grid Canvas Engine (inspired by Magic UI Flickering Grid)
  useEffect(() => {
    if (!isRendered) return;
    const canvas = canvasRef.current;
    const container = cardRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    const squareSize = 4;
    const gridGap = 8;
    const step = squareSize + gridGap;

    let cols = 0;
    let rows = 0;
    let grid = [];
    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;

    const setupGrid = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      if (width === 0 || height === 0) return;

      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      cols = Math.ceil(width / step);
      rows = Math.ceil(height / step);

      const totalCells = cols * rows;
      grid = new Array(totalCells);
      for (let i = 0; i < totalCells; i++) {
        const initialAlpha = 0.05 + Math.random() * 0.3;
        grid[i] = {
          alpha: initialAlpha,
          targetAlpha: initialAlpha
        };
      }
    };

    setupGrid();

    const resizeObserver = new ResizeObserver(() => {
      setupGrid();
    });
    resizeObserver.observe(container);

    const render = () => {
      if (!ctx || width === 0 || height === 0 || grid.length === 0) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Randomly fluctuate individual square alphas (~6-8% of cells per frame)
      const numToUpdate = Math.max(1, Math.floor(grid.length * 0.08));
      for (let k = 0; k < numToUpdate; k++) {
        const index = Math.floor(Math.random() * grid.length);
        if (grid[index]) {
          grid[index].targetAlpha = 0.05 + Math.random() * 0.30;
        }
      }

      // Render 2D grid of small square dots
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const index = r * cols + c;
          const cell = grid[index];
          if (!cell) continue;

          // Smooth interpolation towards target alpha
          cell.alpha += (cell.targetAlpha - cell.alpha) * 0.15;

          const x = c * step;
          const y = r * step;

          ctx.fillStyle = `rgba(59, 130, 246, ${cell.alpha.toFixed(3)})`;
          ctx.fillRect(x, y, squareSize, squareSize);
        }
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      resizeObserver.disconnect();
    };
  }, [isRendered]);

  const handleAnimatedClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 220);
  }, [onClose]);

  // Global Escape key support with exit transition
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        handleAnimatedClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleAnimatedClose]);

  if (!isRendered) return null;

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    triggerHaptic('submit');
    onSubmitQuestionnaire(formData);
  };

  const toggleMixedUseComponent = (comp) => {
    const current = formData.mixedUseComponents || [];
    if (current.includes(comp)) {
      if (current.length > 1) {
        setFormData({ ...formData, mixedUseComponents: current.filter((c) => c !== comp) });
      }
    } else {
      setFormData({ ...formData, mixedUseComponents: [...current, comp] });
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="questionnaire-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleAnimatedClose();
        }
      }}
      className={clsx(
        'fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ease-out',
        isVisible
          ? 'opacity-100 backdrop-blur-md bg-slate-900/50 dark:bg-slate-950/75 pointer-events-auto'
          : 'opacity-0 backdrop-blur-none bg-slate-950/0 pointer-events-none'
      )}
    >
      {/* Floating Glassmorphism Modal Card */}
      <div
        ref={cardRef}
        onClick={(e) => e.stopPropagation()}
        className={clsx(
          'w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden relative',
          'bg-white/95 dark:bg-slate-900/85 border border-slate-200 dark:border-slate-700/60 shadow-[0_20px_70px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_70px_rgba(0,0,0,0.65)] rounded-2xl ring-1 ring-blue-500/20 backdrop-blur-xl',
          'transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] transform will-change-transform',
          isVisible
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-[0.92] translate-y-6'
        )}
      >
        {/* Dynamic Flickering Grid Canvas Background */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none z-0 opacity-40 dark:opacity-100"
        />

        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 ring-1 ring-white/10">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 id="questionnaire-modal-title" className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Project & Plot Questionnaire
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60 hidden sm:inline">
                  UDCPR 2020 RULES ENGINE
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure your project parameters to calculate exact statutory clearances and sequential approvals.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAnimatedClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
            title="Close Questionnaire"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <form id="plot-questionnaire-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-6 custom-scrollbar relative z-10">
          
          {/* Section 1: Project Typology */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                1. Project & Construction Typology
              </h3>
              {lockedTypology && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/90 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 text-[11px] font-semibold">
                  <Lock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  Locked to <span className="text-blue-950 dark:text-white font-bold">{CONSTRUCTION_TYPES.find(c => c.id === lockedTypology)?.label || lockedTypology}</span> by query
                </span>
              )}
            </div>

            <WheelPicker
              id="typology-wheel"
              label="Select Typology Category"
              items={CONSTRUCTION_TYPES}
              value={formData.constructionType}
              onChange={(newTypology) => setFormData({ ...formData, constructionType: newTypology })}
              lockedId={lockedTypology}
              lockedMessage={lockedTypology ? `Typology locked to ${lockedTypology} for this query: "${sourceQuery || lockedTypology}"` : ''}
              itemHeight={44}
              visibleCount={3}
            />

            {/* Conditional Sub-Question: Other Description */}
            {formData.constructionType === 'OTHER' && (
              <div className="p-3.5 rounded-xl bg-white dark:bg-white border border-slate-200 dark:border-slate-300 animate-in fade-in duration-150 space-y-1.5 shadow-2xs">
                <label className="block text-xs font-bold text-slate-900 dark:text-black">
                  Describe Custom Construction Type
                </label>
                <input
                  type="text"
                  value={formData.customConstructionType}
                  onChange={(e) => setFormData({ ...formData, customConstructionType: e.target.value })}
                  placeholder="e.g. Data Center, Sports Complex, Film Studio, Solar Farm..."
                  className="w-full bg-white dark:bg-white border border-slate-300 dark:border-slate-400 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </div>
            )}

            {/* Conditional Sub-Question: Mixed Use Components */}
            {formData.constructionType === 'MIXED_USE' && (
              <div className="p-3.5 rounded-xl bg-white dark:bg-white border border-slate-200 dark:border-slate-300 animate-in fade-in duration-150 space-y-2 shadow-2xs">
                <label className="block text-xs font-bold text-slate-900 dark:text-black">
                  Select Primary Mixed-Use Components:
                </label>
                <div className="flex flex-wrap gap-3 text-xs">
                  {['RESIDENTIAL', 'COMMERCIAL', 'INSTITUTIONAL', 'HOSPITALITY', 'OTHER'].map((comp) => {
                    const isChecked = (formData.mixedUseComponents || []).includes(comp);
                    return (
                      <label key={comp} className="flex items-center gap-1.5 cursor-pointer text-slate-800 dark:text-black hover:text-slate-950 dark:hover:text-black font-semibold transition-colors">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleMixedUseComponent(comp)}
                          className="rounded bg-white dark:bg-white border-slate-300 dark:border-slate-400 text-blue-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                        />
                        <span>{comp.charAt(0) + comp.slice(1).toLowerCase()}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Location & Plot Geometry */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <LandPlot className="w-4 h-4" />
              2. Location & Plot Geometry
            </h3>

            {/* Jurisdiction / Planning Authority */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Planning Authority / Jurisdiction
              </label>
              <select
                value={formData.jurisdiction}
                onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all cursor-pointer"
              >
                {MAHARASHTRA_JURISDICTIONS.map((j) => (
                  <option
                    key={j.id}
                    value={j.id}
                    className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 py-1"
                  >
                    {j.label} — {j.desc}
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                Determines applicable statutory portal (MahaBPAMS vs MCGM AutoDCR vs CIDCO).
              </span>
            </div>

            {/* Elastic Slider: Plot Area */}
            <ElasticSlider
              id="slider-plot-area"
              label="Plot Area (in square meters)"
              value={formData.plotArea}
              onChange={(val) => setFormData({ ...formData, plotArea: val })}
              min={30}
              max={5000}
              step={1}
              unit="sq.m"
              secondaryDisplay={`~${(formData.plotArea * 10.764).toFixed(0)} sq.ft`}
              subtitle="Affects basic FSI entitlement, mandatory marginal open spaces, and rainwater harvesting thresholds."
              presets={[
                { label: '150 sq.m (Small)', value: 150 },
                { label: '300 sq.m (Standard)', value: 300 },
                { label: '500 sq.m (Medium)', value: 500 },
                { label: '1000 sq.m (Large)', value: 1000 }
              ]}
            />

            {/* Elastic Slider: Building Height */}
            <ElasticSlider
              id="slider-building-height"
              label="Proposed Building Height (meters)"
              value={formData.buildingHeight}
              onChange={(val) => setFormData({ ...formData, buildingHeight: val })}
              min={3.0}
              max={50.0}
              step={0.01}
              unit="m"
              secondaryDisplay={`~${Math.round(formData.buildingHeight / 3)} floors`}
              subtitle="Ground + 2 bungalow is typically ~8.5m. UDCPR 2020 mandates CFO Fire Safety NOC for buildings strictly >15.00m."
              badge={
                formData.buildingHeight > 15 ? (
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1 bg-amber-50 dark:bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-800/60">
                    <Flame className="w-3 h-3" /> &gt;15m High-Rise (CFO Fire NOC required)
                  </span>
                ) : (
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-800/50">
                    ≤15m Low-Rise (CFO High-Rise Exempt)
                  </span>
                )
              }
              presets={[
                { label: '8.5m (G+2)', value: 8.5 },
                { label: '14.99m (Exempt)', value: 14.99 },
                { label: '15.00m (Boundary)', value: 15.00 },
                { label: '15.01m (CFO Applies)', value: 15.01 },
                { label: '24.0m (Mid-Rise)', value: 24.0 }
              ]}
            />

            {/* Abutting Road Width */}
            <WheelPicker
              id="road-width-wheel"
              label="Abutting Road Width (meters)"
              items={ROAD_WIDTH_PRESETS}
              value={formData.roadWidth}
              onChange={(newRoadWidth) => setFormData({ ...formData, roadWidth: Number(newRoadWidth) })}
              itemHeight={40}
              visibleCount={3}
            />
          </div>

          {/* Section 3: Environmental & Site Clearances */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Trees className="w-4 h-4" />
              3. Environmental & Site Clearances
            </h3>

            {/* Trees Slider */}
            <ElasticSlider
              id="slider-trees-affected"
              label="Trees on Plot Footprint Requiring Felling / Transplanting"
              value={formData.treesAffected}
              onChange={(val) => setFormData({ ...formData, treesAffected: Math.round(val) })}
              min={0}
              max={20}
              step={1}
              unit="trees"
              subtitle={
                formData.treesAffected > 0
                  ? `⚠️ ${formData.treesAffected} tree(s) must be felled/transplanted → Tree Authority NOC required.`
                  : '✓ Zero trees on footprint → Tree felling NOC is exempt (based on reported questionnaire facts).'
              }
              presets={[
                { label: '0 trees (Exempt)', value: 0 },
                { label: '2 trees', value: 2 },
                { label: '5 trees', value: 5 },
                { label: '10+ trees', value: 10 }
              ]}
            />

            {/* Statutory Checkboxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Eco-Sensitive Zone */}
              <div className="p-3 rounded-xl bg-white dark:bg-white border border-slate-200 dark:border-slate-300 hover:border-slate-400 dark:hover:border-slate-400 transition-colors shadow-2xs">
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="chk-esz" className="text-xs font-bold text-slate-900 dark:text-black flex items-center gap-1.5 cursor-pointer">
                    <Mountain className="w-4 h-4 text-cyan-600 dark:text-cyan-700" />
                    Eco-Sensitive / Hill Station Zone
                  </label>
                  <input
                    id="chk-esz"
                    type="checkbox"
                    checked={formData.ecoSensitiveZone || /matheran/i.test(formData.jurisdiction)}
                    onChange={(e) => setFormData({ ...formData, ecoSensitiveZone: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 bg-white dark:bg-white border-slate-300 dark:border-slate-400 cursor-pointer transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-900 font-medium">
                  {formData.ecoSensitiveZone || /matheran/i.test(formData.jurisdiction)
                    ? '⚠️ Requires High-Level ESZ Monitoring Committee approval.'
                    : 'Standard urban zone (outside Eco-Sensitive buffer zones).'}
                </p>
              </div>

              {/* Heritage Zone */}
              <div className="p-3 rounded-xl bg-white dark:bg-white border border-slate-200 dark:border-slate-300 hover:border-slate-400 dark:hover:border-slate-400 transition-colors shadow-2xs">
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="chk-heritage" className="text-xs font-bold text-slate-900 dark:text-black flex items-center gap-1.5 cursor-pointer">
                    <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-700" />
                    Heritage Precinct (Within 100m)
                  </label>
                  <input
                    id="chk-heritage"
                    type="checkbox"
                    checked={formData.heritageZone}
                    onChange={(e) => setFormData({ ...formData, heritageZone: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 bg-white dark:bg-white border-slate-300 dark:border-slate-400 cursor-pointer transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-900 font-medium">
                  {formData.heritageZone
                    ? '⚠️ Proximity to Grade I/II listed building → MHCC NOC required.'
                    : 'Outside heritage precincts.'}
                </p>
              </div>

              {/* Airport / Aviation Funnel Zone */}
              <div className="p-3 rounded-xl bg-white dark:bg-white border border-slate-200 dark:border-slate-300 hover:border-slate-400 dark:hover:border-slate-400 transition-colors shadow-2xs">
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="chk-airport" className="text-xs font-bold text-slate-900 dark:text-black flex items-center gap-1.5 cursor-pointer">
                    <Plane className="w-4 h-4 text-blue-600 dark:text-blue-700" />
                    Airport Funnel (AAI CCZM Map)
                  </label>
                  <input
                    id="chk-airport"
                    type="checkbox"
                    checked={formData.airportZone}
                    onChange={(e) => setFormData({ ...formData, airportZone: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 bg-white dark:bg-white border-slate-300 dark:border-slate-400 cursor-pointer transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-900 font-medium">
                  {formData.airportZone
                    ? '⚠️ Within civil aviation flight path → AAI NOCAS clearance required.'
                    : 'Outside radar and obstacle limitation surfaces.'}
                </p>
              </div>

              {/* High-Tension Power Line Hazard */}
              <div className="p-3 rounded-xl bg-white dark:bg-white border border-slate-200 dark:border-slate-300 hover:border-slate-400 dark:hover:border-slate-400 transition-colors shadow-2xs">
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="chk-ht" className="text-xs font-bold text-slate-900 dark:text-black flex items-center gap-1.5 cursor-pointer">
                    <Zap className="w-4 h-4 text-amber-500 dark:text-amber-600" />
                    Overhead High-Tension (HT) Line
                  </label>
                  <input
                    id="chk-ht"
                    type="checkbox"
                    checked={formData.hasHighTensionLine}
                    onChange={(e) => setFormData({ ...formData, hasHighTensionLine: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 bg-white dark:bg-white border-slate-300 dark:border-slate-400 cursor-pointer transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-700 dark:text-slate-900 font-medium">
                  {formData.hasHighTensionLine
                    ? '⚠️ Requires mandatory corridor verification under UDCPR Reg 3.4.'
                    : 'No overhead transmission corridors crossing plot.'}
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Sticky Footer Action Bar */}
        <div className="sticky bottom-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800/80 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">Deterministic engine calculates statutory NOCs instantly</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleAnimatedClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700/60 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="plot-questionnaire-form"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Evaluating UDCPR Rules...' : 'Construct Tailored Roadmap'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

