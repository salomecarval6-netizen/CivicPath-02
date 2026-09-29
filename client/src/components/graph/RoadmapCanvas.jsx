import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  MarkerType,
  useReactFlow,
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import CivicNode from './CivicNode';
import Timescale from './Timescale';
import StatutoryTimelineRuler from './StatutoryTimelineRuler';
import StatutoryClearanceDossierModal from '../modals/StatutoryClearanceDossierModal';
import { triggerCelebrationConfetti } from '../../utils/confetti';
import {
  CheckCircle2,
  Maximize2,
  ArrowDownUp,
  ArrowRightLeft,
  ZoomIn,
  ZoomOut,
  Target,
  Sparkles,
  Layers,
  ChevronRight,
  Award
} from 'lucide-react';
import clsx from 'clsx';

const nodeTypes = {
  civicNode: CivicNode
};

/**
 * Calculates topological levels and coordinates for DAG nodes.
 */
function layoutDAG(rawNodes = [], rawEdges = [], orientation = 'TB') {
  if (!rawNodes || rawNodes.length === 0) return { nodes: [], edges: [], stages: [] };

  const nodeMap = new Map();
  const inDegree = new Map();
  const adj = new Map();

  rawNodes.forEach((node) => {
    nodeMap.set(node.id, node);
    inDegree.set(node.id, 0);
    adj.set(node.id, []);
  });

  rawEdges.forEach((edge) => {
    if (inDegree.has(edge.target)) {
      inDegree.set(edge.target, inDegree.get(edge.target) + 1);
    }
    if (adj.has(edge.source)) {
      adj.get(edge.source).push(edge.target);
    }
  });

  // Calculate topological rank for each node
  const ranks = new Map();
  const queue = [];

  rawNodes.forEach((node) => {
    if (inDegree.get(node.id) === 0) {
      ranks.set(node.id, 0);
      queue.push(node.id);
    }
  });

  while (queue.length > 0) {
    const currId = queue.shift();
    const currRank = ranks.get(currId) || 0;
    const children = adj.get(currId) || [];

    for (const childId of children) {
      const existingRank = ranks.get(childId);
      const nextRank = Math.max(existingRank !== undefined ? existingRank : 0, currRank + 1);
      ranks.set(childId, nextRank);
      queue.push(childId);
    }
  }

  // Group nodes by calculated rank
  const levelGroups = new Map();
  rawNodes.forEach((node) => {
    const r = ranks.get(node.id) || 0;
    if (!levelGroups.has(r)) {
      levelGroups.set(r, []);
    }
    levelGroups.get(r).push(node);
  });

  const sortedLevels = Array.from(levelGroups.keys()).sort((a, b) => a - b);
  const positionedNodes = [];
  const stagesList = [];

  const isTB = orientation === 'TB';
  const PRIMARY_SPACING = isTB ? 260 : 420;
  const SECONDARY_SPACING = isTB ? 380 : 240;
  const OFFSET_CENTER = 450;

  sortedLevels.forEach((level) => {
    const nodesInLevel = levelGroups.get(level);
    const count = nodesInLevel.length;

    nodesInLevel.forEach((node, idx) => {
      const secondaryOffset = (idx - (count - 1) / 2) * SECONDARY_SPACING;

      let x, y;
      if (isTB) {
        x = OFFSET_CENTER + secondaryOffset;
        y = 60 + level * PRIMARY_SPACING;
      } else {
        x = 80 + level * PRIMARY_SPACING;
        y = OFFSET_CENTER + secondaryOffset;
      }

      positionedNodes.push({
        id: node.id,
        type: 'civicNode',
        position: { x, y },
        data: {
          ...node,
          id: node.id,
          orientation,
          title: node.title,
          stage: node.stage,
          department: node.department,
          estimatedDays: node.estimatedDays || 0,
          cost: node.cost || 0,
          isBottleneck: Boolean(node.isBottleneck),
          statutoryRule: node.statutoryRule,
          forms: node.forms || [],
          officialUrl: node.officialUrl || '',
          plainLanguageSummary: node.plainLanguageSummary || ''
        }
      });
    });
  });

  // Extract unique stages
  const uniqueStages = Array.from(new Set(rawNodes.map((n) => n.stage).filter(Boolean)));

  // Styled edges with glowing connectors
  const styledEdges = rawEdges.map((edge) => ({
    id: edge.id || `e_${edge.source}_${edge.target}`,
    source: edge.source,
    target: edge.target,
    type: 'smoothstep',
    animated: true,
    label: edge.label || '',
    style: {
      stroke: '#6366f1',
      strokeWidth: 2,
      strokeDasharray: '6 4'
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 14,
      height: 14,
      color: '#6366f1'
    },
    labelStyle: {
      fontSize: 10,
      fontWeight: 600,
      fill: '#94a3b8'
    },
    labelBgStyle: {
      fill: '#0f172a',
      fillOpacity: 0.95,
      stroke: '#334155',
      strokeWidth: 1
    },
    labelBgPadding: [6, 4],
    labelBgBorderRadius: 6
  }));

  return { nodes: positionedNodes, edges: styledEdges, stages: uniqueStages };
}

function useIsDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof document === 'undefined') return true;
    return document.documentElement.classList.contains('dark') || document.documentElement.getAttribute('data-theme') === 'dark';
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const observer = new MutationObserver(() => {
      const dark = document.documentElement.classList.contains('dark') || document.documentElement.getAttribute('data-theme') === 'dark';
      setIsDark(dark);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

function InnerRoadmapCanvas({
  graphData,
  onSelectNode,
  selectedNodeId,
  completedNodes = new Set(),
  onToggleComplete,
  onResetRoadmap,
  className
}) {
  const isDark = useIsDarkMode();
  const [orientation, setOrientation] = useState('TB'); // 'TB' | 'LR'
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [activeStageFilter, setActiveStageFilter] = useState(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const hasCelebratedRef = React.useRef(false);

  const { fitView, setCenter, zoomTo, zoomIn, zoomOut } = useReactFlow();

  // Toggle node completion status
  const handleStatusChange = useCallback((nodeId, nextStatus) => {
    if (onToggleComplete) {
      onToggleComplete(nodeId, nextStatus);
    }
  }, [onToggleComplete]);

  // Compute status for all nodes based on prerequisites DAG
  const computedGraph = useMemo(() => {
    if (!graphData || !graphData.nodes) return { nodes: [], edges: [], stages: [], isAllComplete: false };
    const { nodes: rawNodes, edges: rawEdges, stages } = layoutDAG(
      graphData.nodes,
      graphData.edges,
      orientation
    );

    const isAllComplete = rawNodes.length > 0 && rawNodes.every((n) => completedNodes.has(n.id));

    // Build incoming prerequisite lookup
    const incomingParents = new Map();
    rawNodes.forEach((n) => incomingParents.set(n.id, []));
    rawEdges.forEach((e) => {
      if (incomingParents.has(e.target)) {
        incomingParents.get(e.target).push(e.source);
      }
    });

    // Determine status: "completed" | "available" | "locked"
    const enrichedNodes = rawNodes.map((n) => {
      const isDone = completedNodes.has(n.id);
      let status = 'locked';

      if (isDone) {
        status = 'completed';
      } else {
        const parents = incomingParents.get(n.id) || [];
        const allParentsDone =
          parents.length === 0 || parents.every((pId) => completedNodes.has(pId));
        status = allParentsDone ? 'available' : 'locked';
      }

      return {
        ...n,
        selected: n.id === selectedNodeId,
        data: {
          ...n.data,
          status,
          orientation,
          onStatusChange: handleStatusChange
        }
      };
    });

    // Update edge styling based on completion and theme
    const enrichedEdges = rawEdges.map((e) => {
      const sourceCompleted = completedNodes.has(e.source);
      const edgeColor = isAllComplete ? '#10b981' : sourceCompleted ? '#10b981' : isDark ? '#6366f1' : '#3b82f6';
      return {
        ...e,
        animated: true,
        style: {
          ...e.style,
          stroke: edgeColor,
          strokeWidth: isAllComplete ? 3 : sourceCompleted ? 2.5 : 1.75,
          strokeDasharray: isAllComplete ? undefined : '6 4'
        },
        markerEnd: {
          ...e.markerEnd,
          color: edgeColor
        },
        labelStyle: {
          fontSize: 10,
          fontWeight: 600,
          fill: isAllComplete ? '#10b981' : isDark ? '#94a3b8' : '#475569'
        },
        labelBgStyle: {
          fill: isDark ? '#0f172a' : '#ffffff',
          fillOpacity: 0.95,
          stroke: isAllComplete ? '#10b981' : isDark ? '#334155' : '#e2e8f0',
          strokeWidth: 1
        }
      };
    });

    return { nodes: enrichedNodes, edges: enrichedEdges, stages, isAllComplete };
  }, [graphData, completedNodes, selectedNodeId, orientation, isDark, handleStatusChange]);

  // Sync ReactFlow internal state with computed nodes and edges
  useEffect(() => {
    setNodes(computedGraph.nodes);
    setEdges(computedGraph.edges);
  }, [computedGraph.nodes, computedGraph.edges, setNodes, setEdges]);

  // Initial focus on the first node ONLY when graphData/taskId changes (Not on completion!)
  const lastTaskIdRef = React.useRef(null);
  useEffect(() => {
    const currentTaskId = graphData?.taskId || 'default-task';
    if (lastTaskIdRef.current !== currentTaskId) {
      lastTaskIdRef.current = currentTaskId;
      if (computedGraph.nodes.length > 0) {
        const firstNode = computedGraph.nodes[0];
        if (firstNode) {
          setTimeout(() => {
            setCenter(firstNode.position.x + 150, firstNode.position.y + 120, {
              zoom: 0.9,
              duration: 500
            });
          }, 100);
        }
      }
    }
  }, [graphData?.taskId, computedGraph.nodes, setCenter]);

  // Smoothly center camera when active/selected node changes
  useEffect(() => {
    if (selectedNodeId && computedGraph.nodes.length > 0) {
      const targetNode = computedGraph.nodes.find((n) => n.id === selectedNodeId);
      if (targetNode) {
        setCenter(targetNode.position.x + 150, targetNode.position.y + 100, {
          zoom: 0.95,
          duration: 500
        });
      }
    }
  }, [selectedNodeId, computedGraph.nodes, setCenter]);

  // Jump to specific stage
  const handleFocusStage = (stageName) => {
    setActiveStageFilter(stageName);
    const stageNodes = computedGraph.nodes.filter((n) => n.data.stage === stageName);
    if (stageNodes.length > 0) {
      const avgX = stageNodes.reduce((acc, n) => acc + n.position.x, 0) / stageNodes.length;
      const avgY = stageNodes.reduce((acc, n) => acc + n.position.y, 0) / stageNodes.length;
      setCenter(avgX + 150, avgY + 100, { zoom: 0.95, duration: 600 });
    }
  };

  // Focus next available actionable step
  const handleFocusActionable = () => {
    const readyNode = computedGraph.nodes.find((n) => n.data.status === 'available');
    if (readyNode) {
      if (onSelectNode) onSelectNode(readyNode.data);
    } else {
      const nextUncompleted = computedGraph.nodes.find((n) => n.data.status !== 'completed');
      if (nextUncompleted && onSelectNode) {
        onSelectNode(nextUncompleted.data);
      }
    }
  };

  // Reset to 100% zoom
  const handleResetZoom = () => {
    const firstNode = computedGraph.nodes[0];
    if (firstNode) {
      setCenter(firstNode.position.x + 150, firstNode.position.y + 120, {
        zoom: 1.0,
        duration: 400
      });
    }
  };

  // Overall Stats summary
  const stats = useMemo(() => {
    const total = graphData?.nodes?.length || 0;
    const completedCount = completedNodes.size;
    const progressPercent = total > 0 ? Math.round((completedCount / total) * 100) : 0;
    const isComplete = total > 0 && completedCount >= total;
    return { total, completedCount, progressPercent, isComplete };
  }, [graphData, completedNodes]);

  // Trigger celebration visual effect and open dossier modal when all 5 stages reach 100%
  useEffect(() => {
    if (stats.isComplete) {
      if (!hasCelebratedRef.current) {
        hasCelebratedRef.current = true;
        triggerCelebrationConfetti(3500);
        const timer = setTimeout(() => {
          setIsDossierOpen(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    } else {
      hasCelebratedRef.current = false;
    }
  }, [stats.isComplete]);

  const handleNodeClick = useCallback(
    (event, node) => {
      if (onSelectNode) {
        onSelectNode(node.data);
      }
    },
    [onSelectNode]
  );

  return (
    <div className={`w-full h-full relative bg-[#f8fafc] dark:bg-[#0b0f19] overflow-hidden flex flex-col transition-colors duration-200 ${className || ''}`}>
      {/* Timescale Stage Progression Bar */}
      <Timescale
        graphData={graphData}
        completedNodes={completedNodes}
        activeStage={activeStageFilter}
        onFocusStage={handleFocusStage}
      />

      {/* Visual Statutory Timeline / Ruler Milestone Journey */}
      <StatutoryTimelineRuler
        graphData={graphData}
        completedNodes={completedNodes}
        activeStage={activeStageFilter}
        onFocusStage={handleFocusStage}
        onOpenDossier={() => setIsDossierOpen(true)}
      />

      {/* Main Flow Canvas */}
      <div className="flex-1 w-full h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          defaultViewport={{ x: 50, y: 50, zoom: 0.9 }}
          minZoom={0.2}
          maxZoom={1.5}
          defaultEdgeOptions={{ type: 'smoothstep' }}
          className="touch-none"
        >
          <Background color={isDark ? '#1e293b' : '#cbd5e1'} gap={28} size={1.5} />
          <Controls
            className="!bg-white/95 dark:!bg-slate-900/95 !border-slate-200 dark:!border-slate-800 !fill-slate-700 dark:!fill-slate-200 !rounded-xl !shadow-lg dark:!shadow-2xl [&>button]:!border-slate-200 dark:[&>button]:!border-slate-800 [&>button]:!bg-white dark:[&>button]:!bg-slate-900 [&>button]:!text-slate-700 dark:[&>button]:!text-slate-200 hover:[&>button]:!bg-slate-100 dark:hover:[&>button]:!bg-slate-800"
            showInteractive={false}
          />
          <MiniMap
            nodeStrokeWidth={3}
            nodeColor={(node) => {
              if (node.data?.status === 'completed') return '#10b981';
              if (node.data?.status === 'available') return '#3b82f6';
              return isDark ? '#475569' : '#cbd5e1';
            }}
            maskColor={isDark ? 'rgba(11, 15, 25, 0.75)' : 'rgba(248, 250, 252, 0.75)'}
            className="!bg-white/90 dark:!bg-slate-900/90 !border-slate-200 dark:!border-slate-800 !rounded-xl !shadow-lg dark:!shadow-2xl hidden md:block"
          />

          {/* Top Left: Blueprint Tag & Progress Meter */}
          <Panel position="top-left" className="m-3 flex flex-wrap items-center gap-2 pointer-events-auto">
            {/* Progress Badge */}
            <div
              className={clsx(
                'flex items-center gap-3 px-3.5 py-2 rounded-xl backdrop-blur-md shadow-md dark:shadow-xl text-slate-900 dark:text-slate-100 transition-all',
                stats.isComplete
                  ? 'bg-emerald-50/90 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700/80'
                  : 'bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800'
              )}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                <span className="text-xs font-bold">
                  {stats.completedCount} / {stats.total} Done ({stats.progressPercent}%)
                </span>
              </div>
              <div className="w-16 sm:w-20 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-750">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-300 rounded-full"
                  style={{ width: `${stats.progressPercent}%` }}
                />
              </div>
            </div>

            {/* Technical Blueprint Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-950/80 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 text-[10px] font-mono text-slate-600 dark:text-slate-400 shadow-xs">
              <span className="text-blue-600 dark:text-indigo-400 font-bold">FIG. 1.0</span>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <span>UDCPR 2020 DAG</span>
            </div>

            {/* Final Sanction Dossier Quick Button if 100% complete */}
            {stats.isComplete && (
              <button
                type="button"
                onClick={() => setIsDossierOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all cursor-pointer active:scale-95 animate-pulse"
                title="View Final Statutory Clearance Dossier"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Sanction Dossier</span>
              </button>
            )}
          </Panel>

          {/* Bottom Center: Floating Glassmorphism Quick-Nav Dock */}
          <Panel position="bottom-center" className="mb-4 z-20">
            <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-lg dark:shadow-xl text-slate-800 dark:text-slate-200">
              {/* Next Actionable Step Trigger OR Final Dossier Button */}
              {stats.isComplete ? (
                <button
                  type="button"
                  onClick={() => setIsDossierOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                  title="Open Project Clearance Dossier"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Sanction Dossier</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFocusActionable}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
                  title="Center camera on the next actionable step"
                >
                  <Target className="w-3.5 h-3.5 animate-pulse" />
                  <span>Next Step</span>
                </button>
              )}

              <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" />

              {/* Layout Orientation Switcher */}
              <button
                type="button"
                onClick={() => setOrientation((prev) => (prev === 'TB' ? 'LR' : 'TB'))}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800/80 dark:hover:bg-slate-750 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold border border-slate-200 dark:border-slate-700/60 active:scale-95 transition-all cursor-pointer"
                title="Toggle between Vertical Hierarchy and Horizontal Pipeline"
              >
                {orientation === 'TB' ? (
                  <>
                    <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600 dark:text-indigo-400" />
                    <span className="hidden md:inline">Horizontal</span>
                  </>
                ) : (
                  <>
                    <ArrowDownUp className="w-3.5 h-3.5 text-blue-600 dark:text-indigo-400" />
                    <span className="hidden md:inline">Vertical</span>
                  </>
                )}
              </button>

              <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" />

              {/* Zoom Controls Pill */}
              <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl p-0.5">
                <button
                  type="button"
                  onClick={() => zoomOut({ duration: 300 })}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 active:scale-90 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="px-2 py-1 text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-indigo-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Reset to 100% Zoom"
                >
                  100%
                </button>
                <button
                  type="button"
                  onClick={() => zoomIn({ duration: 300 })}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 active:scale-90 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Fit View */}
              <button
                type="button"
                onClick={() => fitView({ padding: 0.15, duration: 400 })}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800/80 dark:hover:bg-slate-750 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/60 active:scale-90 transition-all cursor-pointer"
                title="Fit entire map in window"
              >
                <Maximize2 className="w-3.5 h-3.5 text-blue-600 dark:text-indigo-400" />
              </button>

              <div className="hidden lg:flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                  <span>Done</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500 dark:bg-indigo-400" />
                  <span>Ready</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600" />
                  <span>Locked</span>
                </div>
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Statutory Clearance Dossier Modal (Auto-opens at 100% completion) */}
      <StatutoryClearanceDossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        graphData={graphData}
        completedNodes={completedNodes}
        onResetRoadmap={onResetRoadmap}
      />
    </div>
  );
}

export default function RoadmapCanvas(props) {
  return (
    <ReactFlowProvider>
      <InnerRoadmapCanvas {...props} />
    </ReactFlowProvider>
  );
}
