import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  FileText,
  Search,
  Printer,
  ExternalLink,
  Clock,
  IndianRupee,
  AlertTriangle,
  CheckSquare,
  Square,
  Activity,
  Building,
  Scale,
  Sparkles,
  Info,
  CheckCircle2,
  CircleDashed,
  Lock,
  PanelRightClose,
  ShieldCheck,
  Compass
} from 'lucide-react';
import axios from 'axios';
import clsx from 'clsx';
import { API_ENDPOINTS } from '../../config/api';
import ApplicabilitySummary from '../common/ApplicabilitySummary';
import StatusButton from '../common/StatusButton';
import CopyButton from '../common/CopyButton';
import SwipeActionRow from '../common/SwipeActionRow';
import LineNav from '../common/LineNav';
import TOCMinimap from '../common/TOCMinimap';
import ScrollContainerWithFade from '../common/ScrollContainerWithFade';
import ShareMenu from '../common/ShareMenu';

export default function DocumentDrawer({
  graphData,
  selectedNode,
  onSelectNode,
  completedNodes = new Set(),
  onToggleComplete,
  onClose,
  onOpenQuestionnaire,
  className
}) {
  const [activeTab, setActiveTab] = useState('kit'); // 'kit' | 'inspector' | 'applicability'
  const [docSearch, setDocSearch] = useState('');
  const [checkedDocs, setCheckedDocs] = useState({});
  const [linkStatus, setLinkStatus] = useState(null);
  const [showTOC, setShowTOC] = useState(false);

  const kitScrollRef = useRef(null);
  const inspectorScrollRef = useRef(null);
  const applicabilityScrollRef = useRef(null);

  // Switch to inspector tab automatically when a node is clicked
  useEffect(() => {
    if (selectedNode) {
      setActiveTab('inspector');
      setLinkStatus(null);
    }
  }, [selectedNode]);

  // Aggregate all unique forms across the DAG
  const masterDocList = useMemo(() => {
    if (!graphData || !graphData.nodes) return [];

    const docMap = new Map();
    graphData.nodes.forEach((node) => {
      if (Array.isArray(node.forms)) {
        node.forms.forEach((formName) => {
          const trimmed = formName.trim();
          if (!docMap.has(trimmed)) {
            docMap.set(trimmed, {
              name: trimmed,
              steps: [
                {
                  id: node.id,
                  title: node.title,
                  stage: node.stage,
                  department: node.department
                }
              ]
            });
          } else {
            docMap.get(trimmed).steps.push({
              id: node.id,
              title: node.title,
              stage: node.stage,
              department: node.department
            });
          }
        });
      }
    });

    return Array.from(docMap.values());
  }, [graphData]);

  // Filtered documents
  const filteredDocs = useMemo(() => {
    if (!docSearch.trim()) return masterDocList;
    return masterDocList.filter((d) =>
      d.name.toLowerCase().includes(docSearch.toLowerCase())
    );
  }, [masterDocList, docSearch]);

  const toggleDoc = (docName) => {
    setCheckedDocs((prev) => ({
      ...prev,
      [docName]: !prev[docName]
    }));
  };

  const checkedCount = useMemo(() => {
    return Object.values(checkedDocs).filter(Boolean).length;
  }, [checkedDocs]);

  const metrics = useMemo(() => {
    const totalDays =
      graphData?.nodes && graphData.nodes.length > 0
        ? graphData.nodes.reduce((acc, n) => acc + (n.estimatedDays || 0), 0)
        : graphData?.totalEstimatedDays || 0;
    const totalCost =
      graphData?.nodes && graphData.nodes.length > 0
        ? graphData.nodes.reduce((acc, n) => acc + (n.cost || 0), 0)
        : graphData?.totalEstimatedCostINR || 0;
    const totalDocs = masterDocList.length;
    const bottlenecks =
      graphData?.nodes?.filter((n) => n.isBottleneck)?.length || 0;

    return { totalDays, totalCost, totalDocs, bottlenecks };
  }, [graphData, masterDocList]);

  // Government portal reachability checker (Protected against SSRF)
  const handleCheckLink = async (url) => {
    if (!url) return;
    setLinkStatus({ loading: true });
    try {
      const response = await axios.get(
        API_ENDPOINTS.linkStatus(url),
        { timeout: 4000 }
      );
      setLinkStatus({
        loading: false,
        reachable: response.data?.reachable,
        status: response.data?.status
      });
    } catch (err) {
      setLinkStatus({
        loading: false,
        reachable: false,
        status: err.response ? err.response.status : null,
        error: err.response?.data?.reason || err.message
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const isStepCompleted = selectedNode ? completedNodes.has(selectedNode.id) : false;
  const isStepAvailable = useMemo(() => {
    if (!selectedNode || !graphData || !graphData.edges) return true;
    const parentEdges = graphData.edges.filter((e) => e.target === selectedNode.id);
    if (parentEdges.length === 0) return true;
    return parentEdges.every((e) => completedNodes.has(e.source));
  }, [selectedNode, graphData, completedNodes]);

  // Define actual sections for TOC Minimap per active tab
  const kitSections = useMemo(() => [
    { id: 'kit-metrics', label: 'Statutory Metrics', icon: Sparkles },
    { id: 'kit-search', label: 'Clearance Search', icon: Search },
    { id: 'kit-clearances', label: 'Required Clearances', icon: CheckSquare }
  ], []);

  const inspectorSections = useMemo(() => [
    { id: 'inspector-overview', label: 'Step Overview', icon: Building },
    { id: 'inspector-action', label: 'Status & Action', icon: CheckCircle2 },
    { id: 'inspector-summary', label: 'Plain Explanation', icon: Info },
    { id: 'inspector-rule', label: 'Statutory Rule', icon: Scale },
    { id: 'inspector-forms', label: 'Forms Required', icon: FileText },
    { id: 'inspector-portal', label: 'Official Portal', icon: ExternalLink }
  ], []);

  const applicabilitySections = useMemo(() => [
    { id: 'app-overview', label: 'Plot Parameters', icon: Building },
    { id: 'app-outcomes', label: 'Rule Outcomes', icon: ShieldCheck }
  ], []);

  return (
    <aside
      className={clsx(
        'w-full h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col z-20 text-slate-900 dark:text-slate-100 shadow-2xl printable-drawer overflow-hidden relative transition-colors duration-200',
        className
      )}
    >
      {/* 1. Header LineNav Tab Bar with Minimize & TOC Quick Toggle */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/80 p-2.5 gap-2 no-print shrink-0">
        <LineNav
          items={[
            {
              id: 'kit',
              label: 'Dossier',
              icon: FileText,
              badge: `${checkedCount}/${masterDocList.length}`
            },
            {
              id: 'inspector',
              label: 'Inspector',
              icon: Search,
              badge: selectedNode ? 'Selected' : undefined
            },
            {
              id: 'applicability',
              label: 'Applicability',
              icon: ShieldCheck
            }
          ]}
          activeId={activeTab}
          onChange={setActiveTab}
          className="flex-1"
        />

        <div className="flex items-center gap-1 shrink-0">
          {/* Share Menu Utility */}
          <ShareMenu
            graphData={graphData}
            selectedNode={selectedNode}
            align="right"
            label=""
            buttonClassName="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 hover:bg-slate-200 border-slate-200 dark:bg-slate-850 dark:border-slate-750 dark:hover:bg-slate-800"
          />

          {/* TOC Minimap Toggle Button */}
          <button
            type="button"
            onClick={() => setShowTOC((prev) => !prev)}
            className={clsx(
              'p-2 rounded-xl transition-colors border cursor-pointer',
              showTOC
                ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 hover:bg-slate-200 border-slate-200 dark:bg-slate-850 dark:border-slate-750 dark:hover:bg-slate-800'
            )}
            title="Toggle Table of Contents Minimap"
          >
            <Compass className="w-4 h-4" />
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 border-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 transition-colors dark:border-slate-750 shrink-0 cursor-pointer"
              title="Minimize/Close Right Sidebar"
            >
              <PanelRightClose className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Tab Content Area with ScrollContainerWithFade */}
      <div className="flex-1 min-h-0 flex relative overflow-hidden">
        
        {/* Tab 1: Master Document Kit */}
        {activeTab === 'kit' && (
          <ScrollContainerWithFade containerRef={kitScrollRef} className="p-4 space-y-4">
            {/* Section 1: Quick Metrics Summary Banner */}
            <div id="kit-metrics" className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm dark:shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="w-4 h-4" />
                  Statutory Metrics
                </div>
                <div className="flex items-center gap-2 no-print">
                  <ShareMenu
                    graphData={graphData}
                    selectedNode={selectedNode}
                    align="right"
                    label="Share"
                    buttonClassName="px-2.5 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 rounded-lg shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 rounded-lg transition-colors shadow-xs border border-slate-200 dark:border-slate-700 cursor-pointer"
                    title="Print official document kit"
                  >
                    <Printer className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    Print Kit
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="group bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-850/95 rounded-xl p-3 border border-slate-200 dark:border-slate-800/80 hover:border-blue-400 dark:hover:border-blue-500/40 transition-all shadow-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] mb-1 group-hover:text-blue-500 transition-colors">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    <span>Indicative Turnaround</span>
                  </div>
                  <div className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
                    ~{metrics.totalDays} <span className="text-xs font-normal text-slate-500 dark:text-slate-400 font-sans">Days (RTS Benchmark)</span>
                  </div>
                </div>

                <div className="group bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-850/95 rounded-xl p-3 border border-slate-200 dark:border-slate-800/80 hover:border-emerald-400 dark:hover:border-emerald-500/40 transition-all shadow-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] mb-1 group-hover:text-emerald-500 transition-colors">
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Indicative Municipal Fees</span>
                  </div>
                  <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                    ₹{Number(metrics.totalCost).toLocaleString('en-IN')} <span className="text-[10px] font-normal text-emerald-700/80 dark:text-emerald-300/80 font-sans">(Est.)</span>
                  </div>
                </div>

                <div className="group bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-850/95 rounded-xl p-3 border border-slate-200 dark:border-slate-800/80 hover:border-amber-400 dark:hover:border-amber-500/40 transition-all shadow-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] mb-1 group-hover:text-amber-500 transition-colors">
                    <FileText className="w-3.5 h-3.5 text-amber-500" />
                    <span>Total Forms</span>
                  </div>
                  <div className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
                    {metrics.totalDocs} <span className="text-xs font-normal text-slate-500 dark:text-slate-400 font-sans">Clearances</span>
                  </div>
                </div>

                <div className="group bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-850/95 rounded-xl p-3 border border-slate-200 dark:border-slate-800/80 hover:border-rose-400 dark:hover:border-rose-500/40 transition-all shadow-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] mb-1 group-hover:text-rose-500 transition-colors">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                    <span>Bottlenecks</span>
                  </div>
                  <div className="text-base font-extrabold text-rose-600 dark:text-rose-400 font-mono">
                    {metrics.bottlenecks} <span className="text-xs font-normal text-rose-700 dark:text-rose-300 font-sans">Critical</span>
                  </div>
                </div>
              </div>

              {/* Project / Construction Type Badge */}
              <div className="flex items-center justify-between text-xs py-1.5 px-3 bg-white dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Project Type:</span>
                <span className="font-bold text-indigo-700 dark:text-indigo-300 uppercase">
                  {graphData?.constructionType || graphData?.eligibility?.constructionType || 'RESIDENTIAL'}
                </span>
              </div>

              {/* Print Header (Only in print) */}
              <div className="hidden print:block text-slate-800 text-xs mt-2 border-t pt-2">
                <div className="font-bold text-sm">{graphData?.taskTitle}</div>
                <div>Project Type: {graphData?.constructionType || graphData?.eligibility?.constructionType || 'RESIDENTIAL'}</div>
                <div>Jurisdiction: {graphData?.jurisdiction}</div>
                <div>Legal Authority: {graphData?.legalReference}</div>
              </div>
            </div>

            {/* Section 2: Search Documents in Dossier */}
            <div id="kit-search" className="relative no-print">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
                placeholder="Search required forms, NOCs, certificates..."
                className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900"
              />
            </div>

            {/* Section 3: Interactive Dossier Checklist */}
            <div id="kit-clearances">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Required Clearances ({filteredDocs.length})
                </h4>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 no-print">
                  {checkedCount} gathered
                </span>
              </div>

              <div className="space-y-2">
                {filteredDocs.map((doc, idx) => {
                  const isChecked = Boolean(checkedDocs[doc.name]);
                  return (
                    <SwipeActionRow
                      key={idx}
                      status={isChecked ? 'completed' : 'available'}
                      onToggleStatus={() => toggleDoc(doc.name)}
                      onViewDetails={() => {}}
                    >
                      <div
                        onClick={() => toggleDoc(doc.name)}
                        className={clsx(
                          'group flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none shadow-2xs',
                          isChecked
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/60 text-emerald-950 dark:text-slate-200'
                            : 'bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850/80 text-slate-800 dark:text-slate-300'
                        )}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1.5">
                            <p
                              className={clsx(
                                'text-xs font-semibold leading-snug truncate',
                                isChecked && 'line-through text-slate-400 dark:text-slate-500'
                              )}
                            >
                              {doc.name}
                            </p>
                            <CopyButton
                              text={doc.name}
                              label=""
                              copiedLabel="Copied"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity py-0 px-1 text-[9px]"
                              title="Copy clearance name"
                            />
                          </div>
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {doc.steps.map((st, sIdx) => (
                              <span
                                key={sIdx}
                                className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                              >
                                {st.stage.split(':')[0] || st.stage}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </SwipeActionRow>
                  );
                })}
              </div>
            </div>
          </ScrollContainerWithFade>
        )}

        {/* Tab 2: Step Inspector */}
        {activeTab === 'inspector' && (
          <ScrollContainerWithFade containerRef={inspectorScrollRef} className="p-4 space-y-4">
            {!selectedNode ? (
              /* Empty State */
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 dark:text-slate-400 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-md">
                  <Search className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-200">
                    Select a Step on the Map
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-[260px] leading-relaxed">
                    Click any roadmap node to inspect official statutory forms, section rules, and portal links.
                  </p>
                </div>
              </div>
            ) : (
              /* Detailed Step Inspector */
              <div className="space-y-4">
                {/* Section 1: Overview Header Card */}
                <div id="inspector-overview" className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-sm dark:shadow-xl">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-800/60">
                      {selectedNode.stage}
                    </span>
                    {selectedNode.isBottleneck && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800/60">
                        <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        Bottleneck
                      </span>
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug flex-1">
                      {selectedNode.title}
                    </h3>
                    <CopyButton
                      text={selectedNode.title}
                      label="Copy"
                      copiedLabel="Copied"
                      size="sm"
                      title="Copy step title"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{selectedNode.department}</span>
                  </div>

                  {/* Time & Cost Badges */}
                  <div className="flex flex-wrap items-center gap-3 pt-2 mt-2 border-t border-slate-200 dark:border-slate-850 text-xs">
                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300" title="Indicative Right to Services (RTS) benchmark duration">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      <span>~{selectedNode.estimatedDays} Days (Indicative turnaround)</span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold" title="Indicative baseline estimate subject to local municipal calculation">
                      <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />
                      <span>₹{Number(selectedNode.cost || 0).toLocaleString('en-IN')} (Indicative estimate)</span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Step Completion Action Bar with StatusButton */}
                <div id="inspector-action" className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-sm dark:shadow-xl">
                  <div className="flex items-center gap-2">
                    {isStepCompleted ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-100/90 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-300 dark:border-emerald-800/50">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        Step Completed
                      </span>
                    ) : isStepAvailable ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-blue-800 dark:text-indigo-300 bg-blue-100/90 dark:bg-indigo-950/60 px-2.5 py-1 rounded-xl border border-blue-300 dark:border-indigo-800/50">
                        <CircleDashed className="w-4 h-4 text-blue-600 dark:text-indigo-400 animate-spin-slow" />
                        Ready for Action
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-200 dark:bg-slate-900/90 px-2.5 py-1 rounded-xl border border-slate-300 dark:border-slate-800">
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                        Prereq Locked
                      </span>
                    )}
                  </div>

                  <StatusButton
                    status={isStepCompleted ? 'completed' : isStepAvailable ? 'available' : 'locked'}
                    onToggle={(nextStatus) => {
                      if (onToggleComplete) {
                        onToggleComplete(selectedNode.id, nextStatus);
                      }
                    }}
                    disabled={!isStepCompleted && !isStepAvailable}
                    size="md"
                  />
                </div>

                {/* Section 3: Plain Language Summary */}
                {selectedNode.plainLanguageSummary && (
                  <div id="inspector-summary" className="p-4 rounded-2xl bg-blue-50/70 dark:bg-indigo-950/40 border border-blue-200 dark:border-indigo-900/50 space-y-1.5 shadow-xs">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-800 dark:text-indigo-300 uppercase tracking-wider">
                      <Info className="w-3.5 h-3.5 text-blue-600 dark:text-indigo-400" />
                      Plain Language Explanation
                    </div>
                    <p className="text-xs text-slate-700 dark:text-indigo-100 leading-relaxed">
                      {selectedNode.plainLanguageSummary}
                    </p>
                  </div>
                )}

                {/* Section 4: Statutory Legal Rule with CopyButton */}
                {selectedNode.statutoryRule && (
                  <div id="inspector-rule" className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        <Scale className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        Statutory Rule & Section
                      </div>
                      <CopyButton
                        text={selectedNode.statutoryRule}
                        label="Copy Citation"
                        copiedLabel="Copied Citation"
                        size="sm"
                      />
                    </div>
                    <p className="text-xs text-slate-800 dark:text-slate-200 font-mono italic bg-white dark:bg-slate-900/90 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      {selectedNode.statutoryRule}
                    </p>
                  </div>
                )}

                {/* Section 5: Step Forms with Copy Buttons */}
                {Array.isArray(selectedNode.forms) && selectedNode.forms.length > 0 && (
                  <div id="inspector-forms" className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      Forms & Submissions Required
                    </h4>
                    <div className="space-y-1.5">
                      {selectedNode.forms.map((form, fIdx) => (
                        <div
                          key={fIdx}
                          className="group flex items-center justify-between gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200"
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                            <span className="leading-snug truncate">{form}</span>
                          </div>
                          <CopyButton
                            text={form}
                            label=""
                            copiedLabel="Copied"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 py-0.5 px-1.5 text-[10px]"
                            title="Copy form title"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section 6: Official Portal & Link Status */}
                {selectedNode.officialUrl && (
                  <div id="inspector-portal" className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm dark:shadow-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
                        Official Government Portal
                      </span>
                      <CopyButton
                        text={selectedNode.officialUrl}
                        label="Copy URL"
                        copiedLabel="Copied URL!"
                        size="sm"
                      />
                    </div>

                    <a
                      href={selectedNode.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/30 active:scale-95"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Official Portal
                    </a>

                    {selectedNode.officialUrl.includes('mcgm.gov.in') && (
                      <div className="text-[11px] text-amber-800 dark:text-amber-300/90 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-300 dark:border-amber-800/40 leading-relaxed">
                        ⚠️ <strong>Authority-specific portal:</strong> MCGM (Mumbai). If your project is located in another Urban Local Body across Maharashtra, verify the portal for your local municipal jurisdiction.
                      </div>
                    )}

                    {/* Portal Status Checker */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => handleCheckLink(selectedNode.officialUrl)}
                        disabled={linkStatus?.loading}
                        className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        <Activity
                          className={clsx('w-3.5 h-3.5', linkStatus?.loading && 'animate-spin text-indigo-600 dark:text-indigo-400')}
                        />
                        {linkStatus?.loading ? 'Probing portal...' : 'Test Server Connectivity'}
                      </button>

                      {linkStatus && !linkStatus.loading && (
                        <div>
                          {linkStatus.reachable ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 dark:text-emerald-400 dark:bg-emerald-950/80 dark:border-emerald-800/80 px-2.5 py-0.5 rounded-full">
                              🟢 Online ({linkStatus.status || '200 OK'})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 border border-amber-300 dark:text-amber-400 dark:bg-amber-950/80 dark:border-amber-800/80 px-2.5 py-0.5 rounded-full">
                              ⚠️ Unreachable
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollContainerWithFade>
        )}

        {/* Tab 3: Applicability Overview */}
        {activeTab === 'applicability' && (
          <ScrollContainerWithFade containerRef={applicabilityScrollRef} className="p-4 space-y-4">
            <div id="app-overview">
              <ApplicabilitySummary
                eligibility={graphData?.eligibility}
                onOpenQuestionnaire={onOpenQuestionnaire}
              />
            </div>
          </ScrollContainerWithFade>
        )}

        {/* 2. TOC Minimap Floating Rail (Toggleable or visible on demand) */}
        {showTOC && (
          <div className="absolute right-3 top-3 z-30 animate-in fade-in slide-in-from-right-2 duration-150 max-w-[170px]">
            <TOCMinimap
              sections={
                activeTab === 'kit'
                  ? kitSections
                  : activeTab === 'inspector'
                  ? inspectorSections
                  : applicabilitySections
              }
              scrollContainerRef={
                activeTab === 'kit'
                  ? kitScrollRef
                  : activeTab === 'inspector'
                  ? inspectorScrollRef
                  : applicabilityScrollRef
              }
            />
          </div>
        )}

      </div>
    </aside>
  );
}
