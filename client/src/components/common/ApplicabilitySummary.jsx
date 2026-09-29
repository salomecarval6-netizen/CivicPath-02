import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Building2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  LandPlot,
  Sliders,
  Sparkles
} from 'lucide-react';
import clsx from 'clsx';
import CopyButton from './CopyButton';

const DEFAULT_FALLBACK_ELIGIBILITY = {
  constructionType: 'RESIDENTIAL',
  jurisdiction: 'Maharashtra (UDCPR 2020)',
  plotArea: 200,
  buildingHeight: 8.5,
  roadWidth: 9.0,
  applicable: [
    {
      id: 'base_title_record',
      name: 'Land Title & 7/12 / CTS Property Card',
      status: 'APPLIES',
      reason: 'Mandatory under UDCPR 2020 Reg 2.2.3(a) & MLRC 1966 Sec 148 for Residential development to prove unencumbered ownership.',
      statutoryRef: 'UDCPR 2020 Reg 2.2.3(a)'
    },
    {
      id: 'base_cadastral_demarcation',
      name: 'Cadastral Demarcation (Kayam Mojani)',
      status: 'APPLIES',
      reason: 'Mandatory under UDCPR 2020 Reg 2.2.3(b) & MLRC 1966 Sec 135 to verify physical plot boundaries, road widening line, and statutory setbacks.',
      statutoryRef: 'UDCPR 2020 Reg 2.2.3(b)'
    },
    {
      id: 'base_property_tax',
      name: 'Municipal Property Tax No-Dues NOC',
      status: 'APPLIES',
      reason: 'Mandatory proof under MMCA Sec 129 / UDCPR Reg 2.2.3(f) that all municipal open land taxes are cleared.',
      statutoryRef: 'UDCPR 2020 Reg 2.2.3(f)'
    },
    {
      id: 'base_autodcr_scrutiny',
      name: 'Architect CAD Plan Submission & Automated Scrutiny (MahaBPAMS / MCGM AutoDCR)',
      status: 'APPLIES',
      reason: 'Statutory automated verification of FSI, ground coverage, ventilation, parking norms, and open spaces under UDCPR 2020.',
      statutoryRef: 'UDCPR 2020 Reg 2.2.1 & 2.2.4'
    },
    {
      id: 'base_site_inspection',
      name: 'Assistant Town Planner (ATP) Site Inspection',
      status: 'APPLIES',
      reason: 'Mandatory ground verification by planning authority before granting IOD / Development Sanction.',
      statutoryRef: 'UDCPR 2020 Reg 2.4 & RTS Act'
    },
    {
      id: 'base_iod_sanction',
      name: 'Development Sanction / Conditional Sanction (Intimation of Disapproval - IOD in Mumbai)',
      status: 'APPLIES',
      reason: 'Statutory conditional planning sanction under Section 45 of MRTP Act 1966.',
      statutoryRef: 'MRTP Act 1966 Sec 45'
    },
    {
      id: 'hydraulic_noc',
      name: 'Hydraulic & Stormwater Drainage Sanction',
      status: 'APPLIES',
      reason: 'Mandatory under UDCPR Reg 2.2.5(d) for municipal water and stormwater network connectivity.',
      statutoryRef: 'UDCPR 2020 Reg 2.2.5(d)'
    },
    {
      id: 'base_cc_permit',
      name: 'Commencement Certificate (CC) — Plinth Level',
      status: 'APPLIES',
      reason: 'Statutory permit under UDCPR 2020 Reg 2.6 unlocking physical excavation.',
      statutoryRef: 'UDCPR 2020 Reg 2.6'
    },
    {
      id: 'base_plinth_check',
      name: 'Mandatory Plinth Inspection & Superstructure CC',
      status: 'APPLIES',
      reason: 'Statutory inspection halt under UDCPR Reg 2.8.4 before casting upper slabs.',
      statutoryRef: 'UDCPR 2020 Reg 2.8.4'
    },
    {
      id: 'base_oc_permit',
      name: 'Building Completion & Final Occupancy Certificate (OC)',
      status: 'APPLIES',
      reason: 'Statutory occupancy authorization under UDCPR 2020 Reg 2.10 unlocking legal utilities.',
      statutoryRef: 'UDCPR 2020 Reg 2.10'
    }
  ],
  exempt: [
    {
      id: 'fire_noc',
      name: 'Chief Fire Officer (CFO) Fire NOC',
      status: 'EXEMPT',
      reason: 'Exempt under UDCPR 2020 Reg 1.3(53) for low-rise structures (Height 8.5m < 15.0m threshold).',
      statutoryRef: 'UDCPR 2020 Reg 1.3(53)'
    },
    {
      id: 'tree_authority_noc',
      name: 'Tree Authority Felling / Preservation Clearance',
      status: 'EXEMPT',
      reason: 'Exempt: No existing trees (0) reported on plot requiring felling or transplanting.',
      statutoryRef: 'Maharashtra Tree Act 1975'
    },
    {
      id: 'heritage_committee_noc',
      name: 'Mumbai/Pune Heritage Conservation Committee NOC',
      status: 'EXEMPT',
      reason: 'Exempt: Plot is not situated within a notified heritage precinct or listed Grade I/II/III structure.',
      statutoryRef: 'UDCPR 2020 Reg 5.3'
    },
    {
      id: 'moef_ec',
      name: 'State Environmental Impact Assessment Authority (SEIAA) Clearance',
      status: 'EXEMPT',
      reason: 'Exempt: Built-up area is below EIA 2006 threshold of 20,000 sq.m.',
      statutoryRef: 'EIA Notification 2006'
    }
  ],
  uncertain: [
    {
      id: 'airport_height_noc',
      name: 'Airports Authority of India (AAI NOCAS) Clearance',
      status: 'REQUIRES_VERIFICATION',
      reason: 'Requires CCZM verification: Verify exact plot coordinates against the Color Coded Zoning Map for civil aviation funnel restrictions.',
      statutoryRef: 'GSR 751(E) / UDCPR 2020'
    }
  ]
};

export default function ApplicabilitySummary({ eligibility, onOpenQuestionnaire }) {
  const [activeTab, setActiveTab] = useState('applicable'); // 'applicable' | 'exempt' | 'uncertain'
  const [isCollapsed, setIsCollapsed] = useState(false);

  const effectiveEligibility = eligibility || DEFAULT_FALLBACK_ELIGIBILITY;
  const applicable = effectiveEligibility.applicable || [];
  const exempt = effectiveEligibility.exempt || [];
  const uncertain = effectiveEligibility.uncertain || [];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
            Plot Clearance Applicability
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {onOpenQuestionnaire && (
            <button
              type="button"
              onClick={onOpenQuestionnaire}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-900/50 transition-colors"
            >
              <Sliders className="w-3 h-3" />
              <span>Edit Parameters</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-slate-400 hover:text-slate-200 rounded transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand section' : 'Collapse section'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-3.5 space-y-3">
          {/* Quick Plot Metrics Banner */}
          <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800/80 text-[11px] text-slate-300 space-y-2 shadow-inner">
            <div className="flex items-center justify-between text-slate-400 font-medium">
              <span className="flex items-center gap-1 text-slate-300 font-bold">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                Evaluated Parameters
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                UDCPR 2020 Rules Engine
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 border-t border-slate-850">
              <div>
                <span className="text-slate-500 block text-[10px]">Typology</span>
                <strong className="text-indigo-300 uppercase font-semibold">
                  {effectiveEligibility.constructionType || 'RESIDENTIAL'}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Jurisdiction</span>
                <strong className="text-slate-200 font-semibold truncate block">
                  {effectiveEligibility.jurisdiction || 'Maharashtra'}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Building Height</span>
                <strong className="text-slate-200 font-semibold">
                  {effectiveEligibility.buildingHeight || 8.5}m
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Plot Area</span>
                <strong className="text-slate-200 font-semibold">
                  {effectiveEligibility.plotArea || 200} sq.m
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Access Road</span>
                <strong className="text-slate-200 font-semibold">
                  {effectiveEligibility.roadWidth || 9}m
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Rule Outcomes</span>
                <strong className="text-emerald-400 font-semibold">
                  {applicable.length} Applies / {exempt.length} Exempt
                </strong>
              </div>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex border-b border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('applicable')}
              className={clsx(
                'flex-1 py-2 px-2 font-semibold text-center border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer',
                activeTab === 'applicable'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              )}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Applies ({applicable.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('exempt')}
              className={clsx(
                'flex-1 py-2 px-2 font-semibold text-center border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer',
                activeTab === 'exempt'
                  ? 'border-slate-400 text-slate-300 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              )}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Exempt ({exempt.length})</span>
            </button>

            {uncertain.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('uncertain')}
                className={clsx(
                  'flex-1 py-2 px-2 font-semibold text-center border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer',
                  activeTab === 'uncertain'
                    ? 'border-amber-500 text-amber-400 bg-amber-950/20'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                )}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Verify ({uncertain.length})</span>
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1 text-xs">
            {activeTab === 'applicable' && (
              <>
                {applicable.length === 0 ? (
                  <p className="text-center py-6 text-slate-400 text-xs">No applicable NOCs for this configuration.</p>
                ) : (
                  applicable.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="group p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/50 hover:border-emerald-700/60 transition-colors space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs flex-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          {item.name}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          {item.statutoryRef && (
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-400 border border-emerald-800/60">
                              {item.statutoryRef}
                            </span>
                          )}
                          <CopyButton
                            text={`${item.name} — ${item.reason}`}
                            label=""
                            copiedLabel="Copied"
                            size="xs"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Copy determination summary"
                          />
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-300 pl-5 leading-relaxed">
                        {item.reason}
                      </p>
                    </div>
                  ))
                )}
              </>
            )}

            {activeTab === 'exempt' && (
              <>
                {exempt.length === 0 ? (
                  <p className="text-center py-6 text-slate-400 text-xs">No exempt clearances identified.</p>
                ) : (
                  exempt.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="group p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 text-slate-400 hover:border-slate-700/60 transition-colors space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-slate-300 line-through flex items-center gap-1.5 text-xs flex-1">
                          <XCircle className="w-4 h-4 text-slate-400 shrink-0" />
                          {item.name}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            EXEMPT
                          </span>
                          <CopyButton
                            text={`${item.name} (EXEMPT) — ${item.reason}`}
                            label=""
                            copiedLabel="Copied"
                            size="xs"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Copy exemption reason"
                          />
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 pl-5 leading-relaxed">
                        {item.reason}
                      </p>
                    </div>
                  ))
                )}
              </>
            )}

            {activeTab === 'uncertain' && (
              <>
                {uncertain.length === 0 ? (
                  <p className="text-center py-6 text-slate-400 text-xs">No verification caveats active.</p>
                ) : (
                  uncertain.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="group p-3 rounded-xl bg-amber-950/20 border border-amber-900/50 text-amber-200 hover:border-amber-700/60 transition-colors space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-amber-300 flex items-center gap-1.5 text-xs flex-1">
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                          {item.name}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-950/90 text-amber-400 border border-amber-800/60">
                            VERIFY
                          </span>
                          <CopyButton
                            text={`${item.name} (REQUIRES VERIFICATION) — ${item.reason}`}
                            label=""
                            copiedLabel="Copied"
                            size="xs"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Copy verification caveat"
                          />
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-300 pl-5 leading-relaxed">
                        {item.reason}
                      </p>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
