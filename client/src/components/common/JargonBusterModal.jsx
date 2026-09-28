import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  BookOpen,
  Search,
  X,
  Scale,
  FileText,
  Sparkles,
  Loader2,
  HelpCircle,
  PlusCircle,
  Building,
  Layers,
  CheckCircle2,
  Compass,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  ShieldAlert,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import axios from 'axios';
import clsx from 'clsx';
import { API_ENDPOINTS } from '../../config/api';

// Comprehensive Maharashtra Statutory & Municipal Lexicon
const STATIC_JARGON_DICTIONARY = [
  // 1. Land & Revenue Records
  {
    term: '7/12 Extract (सातबारा उतारा)',
    category: 'Land Title & Revenue',
    shortDef: 'Official Land Register Extract',
    explanation: 'A fundamental revenue document issued by the Land Records Department (Mahabhulekh) showing legal ownership, survey/gut numbers, crop history, and encumbrances/liens against rural or peri-urban land.',
    statutoryAct: 'Maharashtra Land Revenue Code (MLRC) 1966'
  },
  {
    term: 'CTS / Property Card (मालमत्ता पत्रक)',
    category: 'Urban Land Records',
    shortDef: 'City Title Survey Record',
    explanation: 'The urban equivalent of the 7/12 extract, maintained by City Survey Offices (CTSO) for properties within municipal corporation limits and urban gaothans.',
    statutoryAct: 'MLRC 1966 & CTSO Manual'
  },
  {
    term: 'Mojani (मोजणी / Kayam Mojani)',
    category: 'Survey & Demarcation',
    shortDef: 'Cadastral Boundary Measurement Sheet',
    explanation: 'An on-ground trigonometric survey conducted by the Taluka Inspector of Land Records (TILR). It officially fixes plot boundaries, street widening setbacks, and adjoining government reservations before blueprint sanction.',
    statutoryAct: 'UDCPR 2020, Reg 2.2.3(b)'
  },
  {
    term: 'NA Order (Non-Agricultural Sanction)',
    category: 'Land Conversion',
    shortDef: 'Agricultural to Residential Conversion',
    explanation: 'Order issued by District Collector/Tehsildar permitting agricultural land to be utilized for residential, commercial, or industrial construction.',
    statutoryAct: 'Section 42 & 44, MLRC 1966'
  },

  // 2. Building Permissions & UDCPR 2020
  {
    term: 'AutoDCR / PreDCR Scrutiny',
    category: 'Architectural Compliance',
    shortDef: 'State Automated CAD Blueprint Checker',
    explanation: 'State-mandated software (integrated into MahaBPAMS) that parses layered AutoCAD (.dwg) files submitted by licensed architects to algorithmically verify setback distances, FSI, ground coverage, parking, and staircase ventilation.',
    statutoryAct: 'UDCPR 2020, Reg 2.2.1'
  },
  {
    term: 'MahaBPAMS (Maha Building Permission & Approval Management System)',
    category: 'E-Governance Portal',
    shortDef: 'State Single-Window Building Permission Portal',
    explanation: 'The unified online portal used by all Municipal Corporations and Councils across Maharashtra (outside BMC/MCGM) for electronic submission, scrutiny, and time-bound approval of development permissions.',
    statutoryAct: 'Maharashtra RTS Act 2015 & UDCPR 2020'
  },
  {
    term: 'IOD (Intimation of Disapproval)',
    category: 'Conditional Approval',
    shortDef: 'Section 45 Conditional Sanction Notice',
    explanation: 'A conditional green signal. The municipal authority approves architectural drawings in principle, but forbids ground excavation until ~15 to 20 parallel departmental NOCs (tree, hydraulic, fire, structural) are submitted.',
    statutoryAct: 'MRTP Act 1966 & UDCPR Reg 2.5'
  },
  {
    term: 'CC (Commencement Certificate)',
    category: 'Permits & Construction',
    shortDef: 'Legal Groundbreaking Authorization',
    explanation: 'The definitive statutory permit (Appendix C under UDCPR 2020) issued by the Town Planning authority. It legally unlocks physical excavation and structural casting up to the plinth height level.',
    statutoryAct: 'UDCPR 2020, Reg 2.6'
  },
  {
    term: 'Plinth Checking (Regulation 2.8.4)',
    category: 'Inspections & Hold Points',
    shortDef: 'Mandatory Foundation Inspection Halt',
    explanation: 'A statutory halt where construction must pause when the foundation reaches plinth height. Municipal engineers inspect the physical site to verify that actual boundary offsets and road setbacks match the sanctioned blueprint before issuing Superstructure CC.',
    statutoryAct: 'UDCPR 2020, Reg 2.8.4'
  },
  {
    term: 'OC (Occupancy Certificate)',
    category: 'Habitation & Utilities',
    shortDef: 'Final Habitability Certification',
    explanation: 'Issued under UDCPR Regulation 2.10 upon building completion. It validates that construction strictly follows the sanctioned plan, unlocking legal permanent electricity meters, drinking water mains, and municipal tax assessment.',
    statutoryAct: 'UDCPR 2020, Reg 2.10'
  },
  {
    term: 'FSI / TDR (Floor Space Index / Transfer of Development Rights)',
    category: 'Zoning & Density',
    shortDef: 'Permissible Built-Up Area Ratio',
    explanation: 'Ratio of allowable gross floor area to the total plot area. TDR allows buying extra building potential generated from surrendered road widening or reserved public plots.',
    statutoryAct: 'UDCPR 2020, Chapter 6'
  },
  {
    term: 'Setback / Marginal Distances',
    category: 'Architectural Compliance',
    shortDef: 'Mandatory Open Space Around Building',
    explanation: 'The compulsory open space required between the outer plot boundaries and the building exterior walls to ensure natural light, ventilation, and emergency fire tender access.',
    statutoryAct: 'UDCPR 2020, Reg 6.2'
  },
  {
    term: 'Fire NOC / CFO Clearance',
    category: 'Safety & Hazard Control',
    shortDef: 'Chief Fire Officer Safety Certificate',
    explanation: 'Mandatory for buildings with height 15 meters or above (and special commercial/hazard typologies) to verify fire egress staircases, hydrants, smoke alarms, and water storage tanks.',
    statutoryAct: 'Maharashtra Fire Prevention & Life Safety Act 2006'
  },
  {
    term: 'AAI NOCAS (Civil Aviation Clearance)',
    category: 'Aviation Restrictions',
    shortDef: 'Airport Height Obstruction Clearance',
    explanation: 'Mandatory clearance from Airports Authority of India for plots located within designated flight approach funnels or high-elevation zones relative to airport runways.',
    statutoryAct: 'Ministry of Civil Aviation GSR 751(E)'
  },
  {
    term: 'Tree Authority NOC',
    category: 'Environmental Compliance',
    shortDef: 'Tree Felling & Compensatory Plantation Sanction',
    explanation: 'Mandatory survey ensuring no protected trees are cut on the plot without formal municipal permission and compensatory plantation deposits (usually 5 saplings per felled tree).',
    statutoryAct: 'Maharashtra (Urban Areas) Protection of Trees Act 1975'
  },

  // 3. Commercial, Food & Labor (Cloud Kitchens / Shops)
  {
    term: 'Gumasta License (गुमास्ता परवाना)',
    category: 'Commercial Registration',
    shortDef: 'Shop & Establishment Registration',
    explanation: 'Mandatory certificate issued by the Municipal Health/Labor Department authorizing commercial operations, regulating working hours, employee welfare, and trade validity.',
    statutoryAct: 'Maharashtra Shops & Establishments Act, 2017'
  },
  {
    term: 'FSSAI State License / Registration',
    category: 'Food Safety & Hygiene',
    shortDef: 'Food Business Operator (FBO) Sanction',
    explanation: 'Statutory hygiene and food safety license required for all cloud kitchens, restaurants, and food handlers with turnover brackets.',
    statutoryAct: 'Food Safety & Standards Act, 2006'
  },
  {
    term: 'Trade License / Section 394 License',
    category: 'Municipal Trade Clearance',
    shortDef: 'Health & Sanitation Business Permit',
    explanation: 'Issued by Municipal Corporation Medical Officer of Health (MOH) ensuring the commercial trade is not hazardous or a public nuisance.',
    statutoryAct: 'Maharashtra Municipal Corporations (MMC) Act'
  },
  {
    term: 'RTS Act (Right to Public Services Act)',
    category: 'Statutory Governance',
    shortDef: 'Time-Bound Service Delivery Guarantee',
    explanation: 'State legislation guaranteeing statutory maximum timelines for municipal permissions (e.g. 30-60 days) with financial penalties on officers for unexcused administrative delays.',
    statutoryAct: 'Maharashtra RTS Act, 2015'
  }
];

const SUGGESTED_CIVIC_TERMS = [
  '7/12 Extract',
  'Commencement Certificate (CC)',
  'IOD Sanction',
  'AutoDCR Scrutiny',
  'Gumasta License',
  'FSSAI State License',
  'TDR & FSI',
  'Plinth Checking',
  'Property Card'
];

export default function JargonBusterModal({ isOpen, onClose, graphData }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'workflow' | 'ai'
  const [aiCustomTerms, setAiCustomTerms] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  
  // Dynamic Alert Box state for invalid queries like 'abc'
  const [alertModal, setAlertModal] = useState(null); // { isOpen: boolean, term: string, message: string }
  const searchInputRef = useRef(null);

  // Close on Escape key (closes alert first if open, or modal)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        if (alertModal) {
          handleDismissAlert();
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, alertModal]);

  // Dynamically extract terms from current active graph
  const workflowTerms = useMemo(() => {
    if (!graphData || !graphData.nodes) return [];
    const extracted = [];

    graphData.nodes.forEach((node) => {
      extracted.push({
        term: node.title,
        category: node.stage || 'Current Workflow Stage',
        shortDef: node.department || 'Statutory Milestone',
        explanation: node.plainLanguageSummary || `Required milestone for ${node.title} regulated under ${node.statutoryRule || 'municipal bylaws'}.`,
        statutoryAct: node.statutoryRule || graphData.legalReference
      });
    });

    return extracted;
  }, [graphData]);

  // Combined dictionary
  const allTerms = useMemo(() => {
    return [...aiCustomTerms, ...workflowTerms, ...STATIC_JARGON_DICTIONARY];
  }, [aiCustomTerms, workflowTerms]);

  // Filtered list
  const filteredTerms = useMemo(() => {
    let source = allTerms;
    if (activeTab === 'workflow') source = workflowTerms;
    if (activeTab === 'ai') source = aiCustomTerms;

    if (!searchTerm.trim()) return source;

    const lower = searchTerm.toLowerCase();
    return source.filter(
      (item) =>
        item.term.toLowerCase().includes(lower) ||
        item.explanation.toLowerCase().includes(lower) ||
        item.category.toLowerCase().includes(lower) ||
        (item.shortDef && item.shortDef.toLowerCase().includes(lower))
    );
  }, [allTerms, workflowTerms, aiCustomTerms, activeTab, searchTerm]);

  // Dismiss alert and return focus to search input
  const handleDismissAlert = (suggestedTerm = '') => {
    setAlertModal(null);
    if (suggestedTerm) {
      setSearchTerm(suggestedTerm);
      setActiveTab('all');
    } else {
      setSearchTerm('');
    }
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  };

  // Dynamic AI Explainer with accurate invalid query validation & dynamic alert box
  const handleExplainWithAI = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const query = searchTerm.trim();
    if (!query) return;

    // Check for obvious invalid / meaningless queries client-side
    const lowerQuery = query.toLowerCase();
    const invalidDummies = ['abc', 'xyz', 'test', 'asdf', 'qwerty', 'foo', 'bar', 'aaa', 'bbb', 'ccc', 'temp', 'dummy'];
    if (lowerQuery.length < 2 || invalidDummies.includes(lowerQuery)) {
      setAlertModal({
        isOpen: true,
        term: query,
        message: `"${query}" is not recognized as a valid statutory acronym, municipal procedure, or UDCPR regulatory term in Maharashtra.`
      });
      return;
    }

    setAiLoading(true);
    setAiError('');

    try {
      const response = await axios.post(
        API_ENDPOINTS.explainTerm,
        {
          term: query,
          context: `${graphData?.taskTitle || ''} (${graphData?.jurisdiction || ''})`
        },
        { timeout: 9000 }
      );

      // Check if backend flagged term as invalid
      if (response.data && response.data.isValid === false) {
        setAlertModal({
          isOpen: true,
          term: query,
          message: response.data.message || `"${query}" is not recognized as a valid statutory acronym, municipal procedure, or UDCPR regulatory term.`
        });
        return;
      }

      if (response.data && response.data.term && response.data.explanation) {
        setAiCustomTerms((prev) => [
          {
            ...response.data,
            isAiGenerated: true
          },
          ...prev.filter((t) => t.term.toLowerCase() !== response.data.term.toLowerCase())
        ]);
        setActiveTab('all');
      }
    } catch (err) {
      console.warn('[Jargon Explainer] Error analyzing term:', query, err.message);
      // For unrecognized or failed queries, present the dynamic alert box
      setAlertModal({
        isOpen: true,
        term: query,
        message: `"${query}" is not recognized as a valid municipal term or statutory regulation under Maharashtra UDCPR 2020 / MRTP Act 1966.`
      });
    } finally {
      setAiLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative bg-slate-900 border border-slate-700/90 rounded-2xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden font-sans text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* DYNAMIC ALERT BOX OVERLAY (blocks further action until user explicitly clicks to proceed) */}
        {alertModal && (
          <div
            id="jargon-alert-modal-backdrop"
            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="alert-dialog-title"
          >
            <div
              className="w-full max-w-md bg-slate-900 border-2 border-amber-500/60 rounded-2xl p-6 shadow-2xl shadow-amber-500/10 flex flex-col items-center text-center space-y-4 animate-in slide-in-from-bottom-2 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Pulsing Warning Icon */}
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/20">
                  <AlertTriangle className="w-7 h-7 animate-pulse" />
                </div>
                <div className="absolute -inset-1 rounded-2xl bg-amber-500/20 blur-md -z-10 animate-ping opacity-30" />
              </div>

              {/* Title & Badges */}
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[11px] font-bold uppercase tracking-wider">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Unrecognized Civic Term
                </div>
                <h3 id="alert-dialog-title" className="text-lg font-extrabold text-white">
                  Invalid Query: <span className="text-amber-400 font-mono font-bold">"{alertModal.term}"</span>
                </h3>
              </div>

              {/* Message Explanation */}
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
                {alertModal.message}
              </p>

              {/* Suggested valid terms */}
              <div className="w-full pt-3 border-t border-slate-800 text-left">
                <p className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  Try searching recognized statutory terms:
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {SUGGESTED_CIVIC_TERMS.slice(0, 6).map((termName) => (
                    <button
                      key={termName}
                      type="button"
                      onClick={() => handleDismissAlert(termName)}
                      className="px-2.5 py-1 text-[11px] font-medium bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 rounded-lg border border-slate-700 transition-all cursor-pointer truncate max-w-full"
                    >
                      {termName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary Action Button to Proceed */}
              <div className="w-full pt-2">
                <button
                  id="btn-alert-proceed"
                  type="button"
                  onClick={() => handleDismissAlert()}
                  autoFocus
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <span>Acknowledge & Proceed</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-600/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                Civic Jargon Buster
                <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-950 px-2.5 py-0.5 rounded-full border border-indigo-800/60 hidden sm:inline-block">
                  AI-Powered Lexicon
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Demystifying statutory acronyms, Marathi revenue terms, and bylaws for any civic query.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close modal (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 space-y-3">
          {/* Tabs */}
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={clsx(
                'px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer',
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-850 text-slate-400 hover:text-slate-200'
              )}
            >
              All Statutory Terms ({allTerms.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('workflow')}
              className={clsx(
                'px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer',
                activeTab === 'workflow'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-850 text-slate-400 hover:text-slate-200'
              )}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Active Query Workflow ({workflowTerms.length})
            </button>

            {aiCustomTerms.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('ai')}
                className={clsx(
                  'px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer',
                  activeTab === 'ai'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-850 text-slate-400 hover:text-slate-200'
                )}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                AI Generated ({aiCustomTerms.length})
              </button>
            )}
          </div>

          {/* Search Form + Ask AI Action */}
          <form onSubmit={handleExplainWithAI} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (aiError) setAiError('');
                }}
                placeholder="Search any term (e.g., 7/12, IOD, FSSAI, Gumasta, TDR, Plinth, NA Order, Setbacks)..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={aiLoading || !searchTerm.trim()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50 shrink-0 cursor-pointer"
              title="Use Gemini AI to deconstruct any new civic jargon not yet in the dictionary"
            >
              {aiLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask AI to Explain</span>
                </>
              )}
            </button>
          </form>

          {aiError && (
            <p className="text-xs text-rose-400 font-medium">{aiError}</p>
          )}
        </div>

        {/* Jargon Cards Grid */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {filteredTerms.length === 0 ? (
            <div className="text-center py-12 space-y-3 text-slate-400">
              <HelpCircle className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">
                No built-in term found matching "{searchTerm}"
              </p>
              <p className="text-xs max-w-sm mx-auto text-slate-400">
                Click <strong>"Ask AI to Explain"</strong> above and our Gemini engine will verify and deconstruct this statutory term.
              </p>
              <button
                type="button"
                onClick={handleExplainWithAI}
                disabled={aiLoading}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                Ask AI to Explain "{searchTerm}"
              </button>
            </div>
          ) : (
            filteredTerms.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all space-y-2 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                      {item.category}
                    </span>
                    {item.isAiGenerated && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        AI Explainer
                      </span>
                    )}
                  </div>
                  {item.shortDef && (
                    <span className="text-xs font-semibold text-slate-400">
                      {item.shortDef}
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  {item.term}
                </h4>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.explanation}
                </p>

                {item.statutoryAct && (
                  <div className="pt-2 border-t border-slate-850 flex items-center gap-1.5 text-[11px] text-slate-400 font-mono italic">
                    <Scale className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">Statute: {item.statutoryAct}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/90 flex items-center justify-end text-xs text-slate-400">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold rounded-xl transition-colors border border-slate-700 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

