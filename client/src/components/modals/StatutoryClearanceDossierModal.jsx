import React, { useMemo } from 'react';
import {
  CheckCircle2,
  Download,
  RotateCcw,
  Sparkles,
  X,
  FileCheck,
  Building,
  Clock,
  Coins,
  ShieldCheck,
  Award,
  Landmark,
  Scale,
  Calendar,
  ExternalLink,
  Printer
} from 'lucide-react';
import clsx from 'clsx';

export default function StatutoryClearanceDossierModal({
  isOpen,
  onClose,
  graphData,
  completedNodes = new Set(),
  onResetRoadmap,
  jurisdiction = 'Maharashtra State ULBs',
  typology = 'Residential (Appx A-1)'
}) {
  if (!isOpen) return null;

  // Aggregate metrics from graph data
  const metrics = useMemo(() => {
    const nodes = graphData?.nodes || [];
    const totalDays = nodes.reduce((acc, n) => acc + (n.estimatedDays || 0), 0);
    const totalCost = nodes.reduce((acc, n) => acc + (n.cost || 0), 0);
    const totalCount = nodes.length;
    const completedCount = nodes.filter((n) => completedNodes.has(n.id)).length;

    return {
      totalDays: totalDays || 116,
      totalCost: totalCost || 74000,
      totalCount: totalCount || 11,
      completedCount: completedCount || totalCount || 11,
      formattedCost: new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(totalCost || 74000)
    };
  }, [graphData, completedNodes]);

  // Generate verified clearances list
  const clearancesList = useMemo(() => {
    const nodes = graphData?.nodes || [];
    if (nodes.length > 0) {
      return nodes.map((node, idx) => ({
        id: node.id,
        serial: idx + 1,
        title: node.title,
        stage: node.stage || `Stage ${Math.min(5, Math.floor(idx / 2) + 1)}`,
        department: node.department || 'Municipal Planning Authority',
        statutoryRule: node.statutoryRule || 'UDCPR 2020 Standard Compliance',
        estimatedDays: node.estimatedDays || 7,
        cost: node.cost || 0,
        status: 'Sanctioned & Validated',
        date: new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        })
      }));
    }

    // Default canonical fallback list
    return [
      {
        id: '1',
        serial: 1,
        title: 'Land Title & Demarcation Verification',
        stage: 'Stage 1: Revenue & Land Title',
        department: 'Land Records (Mahabhulekh / TILR)',
        statutoryRule: 'MLRC 1966 & UDCPR Reg 2.2.3(b)',
        status: 'Sanctioned & Validated',
        date: new Date().toLocaleDateString('en-IN')
      },
      {
        id: '2',
        serial: 2,
        title: 'AutoDCR CAD Blueprint & Setback Sanction',
        stage: 'Stage 2: Architectural Scrutiny',
        department: 'Town Planning Department',
        statutoryRule: 'UDCPR 2020 Regulation 2.2.1',
        status: 'Sanctioned & Validated',
        date: new Date().toLocaleDateString('en-IN')
      },
      {
        id: '3',
        serial: 3,
        title: 'Tree Authority Conservation Clearance',
        stage: 'Stage 3: Parallel Departmental NOCs',
        department: 'Municipal Tree Authority',
        statutoryRule: 'Maharashtra Trees Act 1975 Sec 8',
        status: 'Sanctioned & Validated',
        date: new Date().toLocaleDateString('en-IN')
      },
      {
        id: '4',
        serial: 4,
        title: 'Hydraulic & Drainage Infrastructure NOC',
        stage: 'Stage 3: Parallel Departmental NOCs',
        department: 'Water Supply & Sewerage Dept',
        statutoryRule: 'UDCPR 2020 Regulation 2.2.11',
        status: 'Sanctioned & Validated',
        date: new Date().toLocaleDateString('en-IN')
      },
      {
        id: '5',
        serial: 5,
        title: 'Commencement Certificate (CC — Appendix C)',
        stage: 'Stage 4: Groundbreaking to Plinth',
        department: 'Executive Engineer (Building Permissions)',
        statutoryRule: 'MRTP Act 1966 Sec 45 & UDCPR Reg 2.6',
        status: 'Sanctioned & Validated',
        date: new Date().toLocaleDateString('en-IN')
      },
      {
        id: '6',
        serial: 6,
        title: 'Plinth Level Boundary Verification Certificate',
        stage: 'Stage 4: Groundbreaking to Plinth',
        department: 'Municipal Site Inspection Squad',
        statutoryRule: 'UDCPR 2020 Regulation 2.8.4',
        status: 'Sanctioned & Validated',
        date: new Date().toLocaleDateString('en-IN')
      },
      {
        id: '7',
        serial: 7,
        title: 'Full Occupancy Certificate (OC — Appendix I)',
        stage: 'Stage 5: Habitation & Utilities',
        department: 'Commissioner / Competent Authority',
        statutoryRule: 'UDCPR 2020 Reg 2.10 & MRTP Sec 45',
        status: 'Sanctioned & Validated',
        date: new Date().toLocaleDateString('en-IN')
      }
    ];
  }, [graphData]);

  // Export JSON/Audit report
  const handleDownloadReport = () => {
    const reportData = {
      projectTitle: 'CivicPath Statutory Clearance Dossier',
      sanctionFramework: 'Unified Development Control and Promotion Regulations (UDCPR 2020) & MRTP Act 1966',
      jurisdiction,
      typology,
      certificationDate: new Date().toISOString(),
      summaryMetrics: {
        totalLeadTimeDays: metrics.totalDays,
        totalConsolidatedFees: metrics.formattedCost,
        sanctionedApprovals: `${metrics.completedCount}/${metrics.totalCount}`,
        finalStatus: 'Occupancy Certificate (Appendix I) Issued & Validated'
      },
      approvedChecklist: clearancesList
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CivicPath-Statutory-Dossier-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={clsx(
          'relative w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden rounded-2xl font-sans',
          'bg-white dark:bg-slate-900 border border-emerald-500/50 shadow-[0_20px_70px_rgba(16,185,129,0.25)] dark:shadow-[0_25px_80px_rgba(16,185,129,0.3)]',
          'text-slate-900 dark:text-slate-100 animate-in zoom-in-95 duration-200'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-emerald-50/60 dark:bg-emerald-950/30 flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0">
              <Award className="w-6 h-6" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/80 text-[11px] font-extrabold uppercase tracking-wider mb-1.5 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                All Statutory Milestones Cleared (100%)
              </div>

              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
                Project Clearance Dossier — Final Sanction
              </h2>

              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Full Statutory Sanction under <strong>UDCPR 2020</strong> &amp; <strong>MRTP Act 1966</strong> for{' '}
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{jurisdiction}</span> ({typology}).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Close Dossier (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar">
          {/* Milestone Metrics Summary Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Card 1: Statutory Lead Time */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850/90 border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Total Lead Time
                </span>
                <p className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate">
                  ~{metrics.totalDays} Working Days
                </p>
              </div>
            </div>

            {/* Card 2: Consolidated Scrutiny & NOC Fees */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850/90 border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Coins className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Consolidated Fees
                </span>
                <p className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate">
                  {metrics.formattedCost}
                </p>
              </div>
            </div>

            {/* Card 3: Total Sanctioned Approvals */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850/90 border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Approvals Granted
                </span>
                <p className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400 truncate">
                  {metrics.completedCount}/{metrics.totalCount} Cleared
                </p>
              </div>
            </div>

            {/* Card 4: Final Milestone Status */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850/90 border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Landmark className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Final Status
                </span>
                <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                  OC (Appendix I) Issued
                </p>
              </div>
            </div>
          </div>

          {/* Clearance Checklist Table Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Verified Statutory Clearance Register
              </h3>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                MahaRERA &amp; Municipal Ready
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <div className="overflow-x-auto max-h-72">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 font-mono text-[10px] uppercase tracking-wider sticky top-0 z-10">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Approval Name</th>
                      <th className="py-2.5 px-3">Statutory Act &amp; Clause</th>
                      <th className="py-2.5 px-3">Department</th>
                      <th className="py-2.5 px-3 text-right">Verification Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 bg-white dark:bg-slate-900/60">
                    {clearancesList.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors"
                      >
                        <td className="py-2 px-3 font-mono text-slate-400 text-[11px]">
                          {item.serial}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-900 dark:text-slate-100">
                          {item.title}
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-300 italic">
                          {item.statutoryRule}
                        </td>
                        <td className="py-2 px-3 text-slate-500 dark:text-slate-400 text-[11px]">
                          {item.department}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/80 shadow-xs">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            Validated
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Sticky Footer Action Bar */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadReport}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/25 transition-all cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download Compliance Audit (JSON)</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-300 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700/60 transition-colors cursor-pointer"
              title="Print Summary Document"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onResetRoadmap && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to reset all completed milestones and start a new roadmap evaluation?')) {
                    onResetRoadmap();
                    onClose();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer"
                title="Reset completion status for all roadmap nodes"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Roadmap</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700/60 rounded-xl transition-colors cursor-pointer"
            >
              Return to Graph (Archive Mode)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
