/**
 * CivicPath / Vertexa Active Roadmap Session Persistence
 * 
 * Manages atomic, robust persistence of the user's active roadmap session to localStorage
 * so that full session state (view, graphData, completed nodes, selected step, questionnaire)
 * resumes seamlessly across refreshes, tab closes, browser restarts, or offline reloads.
 */

export const SESSION_STORAGE_KEY = 'vertexa_active_session';
export const LEGACY_COMPLETED_KEY = 'vertexa_completed_nodes';
export const LEGACY_QUESTIONNAIRE_KEY = 'vertexa_plot_questionnaire';

const DEFAULT_QUESTIONNAIRE = {
  constructionType: 'RESIDENTIAL',
  customConstructionType: '',
  mixedUseComponents: [],
  jurisdiction: 'Pune',
  plotArea: 200,
  buildingHeight: 8.5,
  roadWidth: 9.0,
  treesAffected: 0,
  heritageZone: false,
  airportZone: false,
  ecoSensitiveZone: false,
  hasHighTensionLine: false
};

/**
 * Validates whether a loaded session object contains a structurally sound active roadmap
 */
export function validateActiveSession(session) {
  if (!session || typeof session !== 'object') return false;
  if (!session.graphData || typeof session.graphData !== 'object') return false;
  if (!Array.isArray(session.graphData.nodes) || session.graphData.nodes.length === 0) return false;
  return true;
}

/**
 * Loads and reconstructs the active session during application startup.
 * Handles migration from legacy keys gracefully and ensures fail-safe defaults.
 */
export function loadActiveSession(fallbackGraph = null) {
  let rawSession = null;

  try {
    const serialized = localStorage.getItem(SESSION_STORAGE_KEY);
    if (serialized) {
      rawSession = JSON.parse(serialized);
    }
  } catch (err) {
    console.warn('[SessionPersistence] Failed to parse active session JSON, falling back:', err);
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  // If a valid active session exists with full graph data
  if (rawSession && validateActiveSession(rawSession)) {
    const graphData = rawSession.graphData;
    const nodeIds = new Set(graphData.nodes.map((n) => n.id));

    // Reconstruct completed nodes set, filtering out any orphaned IDs
    const rawCompletedIds = Array.isArray(rawSession.completedNodeIds)
      ? rawSession.completedNodeIds
      : [];
    const completedNodes = new Set(rawCompletedIds.filter((id) => nodeIds.has(id)));

    // Reconstruct selectedNode from graphData
    let selectedNode = null;
    if (rawSession.selectedNodeId && nodeIds.has(rawSession.selectedNodeId)) {
      selectedNode = graphData.nodes.find((n) => n.id === rawSession.selectedNodeId) || null;
    }
    if (!selectedNode && graphData.nodes.length > 0) {
      selectedNode = graphData.nodes[0];
    }

    // Reconstruct questionnaireState preserving exact constructionType
    const questionnaireState = {
      ...DEFAULT_QUESTIONNAIRE,
      ...(rawSession.questionnaireState || {})
    };

    return {
      isValid: true,
      currentView: rawSession.currentView === 'roadmap' ? 'roadmap' : 'home',
      hasConstructedRoadmap: Boolean(rawSession.hasConstructedRoadmap !== false),
      searchQuery: typeof rawSession.searchQuery === 'string' ? rawSession.searchQuery : '',
      selectedCity: typeof rawSession.selectedCity === 'string' ? rawSession.selectedCity : (questionnaireState.jurisdiction || 'Maharashtra'),
      lockedTypology: rawSession.lockedTypology || null,
      sourceQuery: typeof rawSession.sourceQuery === 'string' ? rawSession.sourceQuery : '',
      isSidebarOpen: rawSession.isSidebarOpen !== undefined ? Boolean(rawSession.isSidebarOpen) : true,
      questionnaireState,
      graphData,
      completedNodes,
      selectedNode
    };
  }

  // Legacy fallback migration: Check if legacy questionnaire or completed nodes exist
  let legacyQuestionnaire = DEFAULT_QUESTIONNAIRE;
  try {
    const savedQ = localStorage.getItem(LEGACY_QUESTIONNAIRE_KEY);
    if (savedQ) {
      legacyQuestionnaire = { ...DEFAULT_QUESTIONNAIRE, ...JSON.parse(savedQ) };
    }
  } catch (e) {
    console.warn('[SessionPersistence] Failed to read legacy questionnaire:', e);
  }

  let legacyCompleted = new Set();
  try {
    const savedC = localStorage.getItem(LEGACY_COMPLETED_KEY);
    if (savedC) {
      legacyCompleted = new Set(JSON.parse(savedC));
    }
  } catch (e) {
    console.warn('[SessionPersistence] Failed to read legacy completed nodes:', e);
  }

  return {
    isValid: false,
    currentView: 'home',
    hasConstructedRoadmap: false,
    searchQuery: '',
    selectedCity: legacyQuestionnaire.jurisdiction || 'Maharashtra',
    lockedTypology: null,
    sourceQuery: '',
    isSidebarOpen: true,
    questionnaireState: legacyQuestionnaire,
    graphData: fallbackGraph,
    completedNodes: legacyCompleted,
    selectedNode: null
  };
}

/**
 * Persists the current session state atomically to localStorage.
 */
export function saveActiveSession(sessionState) {
  if (!sessionState) return;

  try {
    const {
      currentView = 'home',
      hasConstructedRoadmap = false,
      searchQuery = '',
      selectedCity = 'Maharashtra',
      lockedTypology = null,
      sourceQuery = '',
      isSidebarOpen = true,
      questionnaireState = DEFAULT_QUESTIONNAIRE,
      graphData = null,
      completedNodes = new Set(),
      selectedNode = null
    } = sessionState;

    // Only serialize active session if a roadmap has been constructed
    if (hasConstructedRoadmap && graphData && Array.isArray(graphData.nodes)) {
      const payload = {
        version: 1,
        savedAt: new Date().toISOString(),
        currentView,
        hasConstructedRoadmap: true,
        searchQuery,
        selectedCity,
        lockedTypology,
        sourceQuery,
        isSidebarOpen,
        questionnaireState,
        graphData,
        completedNodeIds: Array.from(completedNodes),
        selectedNodeId: selectedNode?.id || (graphData.nodes[0] ? graphData.nodes[0].id : null)
      };

      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(payload));
    }

    // Keep legacy keys synced for backward compatibility
    if (completedNodes) {
      localStorage.setItem(LEGACY_COMPLETED_KEY, JSON.stringify(Array.from(completedNodes)));
    }
    if (questionnaireState) {
      localStorage.setItem(LEGACY_QUESTIONNAIRE_KEY, JSON.stringify(questionnaireState));
    }
  } catch (err) {
    console.warn('[SessionPersistence] Error saving active session to localStorage:', err);
  }
}

/**
 * Clears the active roadmap session (used when intentionally generating a fresh project).
 */
export function clearActiveSession() {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(LEGACY_COMPLETED_KEY);
  } catch (err) {
    console.warn('[SessionPersistence] Error clearing active session:', err);
  }
}
