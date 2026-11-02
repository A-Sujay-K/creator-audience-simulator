import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Layers, ShieldAlert, Target, BarChart3,
  Search, ArrowRight, ExternalLink, Check, Copy, User,
  LogOut, RefreshCw, ChevronRight, Swords, Compass, Lock,
  Play, Clock, DollarSign, TrendingUp, HelpCircle, AlertCircle,
  Sun, Moon, Flame, Zap, Lightbulb, Eye, Share2, CheckCircle2,
  ChevronDown, Tv, Award, Users, AlertTriangle, FileText, CheckCircle,
  Sliders, ArrowUpRight
} from 'lucide-react';

const PRESET_CREATORS = [
  { name: 'CarryMinati', niche: 'Comedy & Roasts' },
  { name: 'MrBeast', niche: 'High-Stakes Challenges' },
  { name: 'Dhruv Rathee', niche: 'Explanatory Journalism' },
  { name: 'Aakash Dhawan', niche: 'Motovlogging & Lifestyle' },
  { name: 'Ryan Trahan', niche: 'Documentary Storytelling' }
];

/**
 * FeatureHelp Component:
 * Clean, dynamically aligned info explainer popover.
 * Placed ONLY in dedicated window headers to eliminate clutter.
 * Anchored cleanly to prevent any viewport overflow or misalignment.
 */
function FeatureHelp({ title, description, tip, align = "right" }) {
  const [isOpen, setIsOpen] = useState(false);
  const helpRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (helpRef.current && !helpRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={helpRef} className="relative inline-flex items-center shrink-0">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`inline-flex items-center justify-center w-5 h-5 rounded-md text-xs transition-all duration-150 cursor-pointer ${
          isOpen
            ? 'bg-blue-600 text-white shadow-xs'
            : 'text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-500/10'
        }`}
        aria-label={title || "Feature guide"}
        title={!isOpen ? "Click to learn how this works" : undefined}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div
          role="tooltip"
          onClick={(e) => e.stopPropagation()}
          className={`absolute top-full mt-2 ${
            align === "left" ? "left-0" : "right-0"
          } w-72 sm:w-80 p-4 rounded-xl shadow-2xl z-50 text-left bg-[#0E111A] text-slate-100 border border-slate-700/80 shadow-black/70 backdrop-blur-xl animate-popover`}
          style={{ maxWidth: 'calc(100vw - 32px)' }}
        >
          {title && (
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
              <span className="font-heading font-semibold text-xs text-white flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                {title}
              </span>
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white text-xs p-0.5 rounded transition cursor-pointer"
                aria-label="Close tooltip"
              >
                ✕
              </button>
            </div>
          )}
          <p className="text-[11px] leading-relaxed text-slate-300">
            {description}
          </p>
          {tip && (
            <div className="mt-2.5 pt-2 border-t border-white/10 text-[10px] text-blue-300 flex items-start gap-1.5 font-medium bg-blue-500/10 p-2 rounded-lg">
              <span className="shrink-0 text-xs">💡</span>
              <span className="leading-normal">{tip}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function App() {
  // Theme State: 'dark' | 'light'
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'dark';
    }
    return 'dark';
  });

  const isDark = theme === 'dark';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Tab & UI state
  const [activeTab, setActiveTab] = useState('dossier');
  const [expandedRoadmapStep, setExpandedRoadmapStep] = useState(null);
  const [creatorName, setCreatorName] = useState('');
  const [comparisonCreator, setComparisonCreator] = useState('');
  const [niche, setNiche] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [statusStep, setStatusStep] = useState(1);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorBanner, setErrorBanner] = useState('');

  // Data State
  const [intelData, setIntelData] = useState(null);
  const [copyData, setCopyData] = useState(null);
  const [prevFindings, setPrevFindings] = useState(null);

  // Tab 1 selector states
  const [selectedUploadIdx, setSelectedUploadIdx] = useState(0);
  const [selectedPeerIdx, setSelectedPeerIdx] = useState(0);

  // Hook Simulator State
  const [hooksText, setHooksText] = useState('');
  const [sampleSize, setSampleSize] = useState(15);
  const [simulating, setSimulating] = useState(false);
  const [simResults, setSimResults] = useState(null);
  const [sendingToPanel, setSendingToPanel] = useState(false);
  const [panelSendResult, setPanelSendResult] = useState(null);

  // User Auth State
  const [user, setUser] = useState(null);
  const [userHistory, setUserHistory] = useState([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authUsername, setAuthUsername] = useState('');
  const [authPin, setAuthPin] = useState('');
  const [authError, setAuthError] = useState('');

  // Copy Feedback
  const [copiedKey, setCopiedKey] = useState(null);

  // Dynamic Senior-Designer Color System
  const th = isDark ? {
    root: 'bg-[#090A0F] text-[#F8FAFC]',
    sidebar: 'bg-[#0E1017] border-white/[0.08]',
    header: 'bg-[#0E1017]/90 backdrop-blur-xl border-white/[0.08]',
    card: 'bg-[#12151F] border-white/[0.08] shadow-sm',
    cardInner: 'bg-[#0A0C13] border-white/[0.06]',
    cardHover: 'hover:bg-white/[0.03]',
    cardHighlight: 'bg-gradient-to-b from-[#181D2B] to-[#12151F] border-blue-500/30',
    input: 'bg-[#0B0D14] border-white/[0.12] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-[#F8FAFC] placeholder-slate-500',
    btnPrimary: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-md shadow-blue-500/20 active:scale-[0.99]',
    btnSecondary: 'bg-[#151824] hover:bg-[#1D2132] text-slate-300 hover:text-white border-white/[0.10]',
    navActive: 'bg-blue-600/10 text-blue-400 border-blue-500/30 font-semibold shadow-xs',
    navInactive: 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] border-transparent',
    pill: 'bg-[#151824] text-slate-300 border-white/[0.08]',
    pillSecondary: 'bg-[#0D0F17] text-slate-400 border-white/[0.07] hover:text-white hover:border-white/[0.15]',
    pillSelected: 'bg-blue-600/15 text-blue-400 border-blue-500/40 font-semibold',
    textPrimary: 'text-[#F8FAFC]',
    textSecondary: 'text-slate-400',
    textMuted: 'text-slate-500',
    border: 'border-white/[0.08]',
    borderMedium: 'border-white/[0.14]',
    tableHead: 'bg-[#0A0C13] text-slate-400 border-white/[0.08]',
    tableRow: 'bg-[#12151F] hover:bg-white/[0.02]',
    codeBg: 'bg-[#06070B] border-white/[0.08]',
    modalBg: 'bg-[#10131E] border-white/[0.15] shadow-2xl',
    statusCard: 'bg-gradient-to-b from-[#131724] to-[#0E111A] border-blue-500/30 shadow-lg shadow-blue-500/5',
    progressTrack: 'bg-[#0A0C13] border-white/[0.08]',
    progressBar: 'bg-gradient-to-r from-blue-500 to-indigo-500',
    sliderTrack: 'accent-blue-500',
  } : {
    root: 'bg-[#F8FAFC] text-slate-900',
    sidebar: 'bg-white border-slate-200/90 shadow-xs',
    header: 'bg-white/95 backdrop-blur-xl border-slate-200/90 shadow-xs',
    card: 'bg-white border-slate-200/90 shadow-sm shadow-slate-200/40',
    cardInner: 'bg-slate-50/80 border-slate-200/80',
    cardHover: 'hover:bg-slate-50',
    cardHighlight: 'bg-gradient-to-b from-blue-50/40 to-white border-blue-200',
    input: 'bg-white border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 text-slate-900 placeholder-slate-400',
    btnPrimary: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-md shadow-blue-500/20 active:scale-[0.99]',
    btnSecondary: 'bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200 shadow-xs',
    navActive: 'bg-blue-50 text-blue-700 border-blue-200 font-semibold shadow-xs',
    navInactive: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-transparent',
    pill: 'bg-slate-100 text-slate-700 border-slate-200',
    pillSecondary: 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300',
    pillSelected: 'bg-blue-50 text-blue-700 border-blue-300 font-semibold',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-600',
    textMuted: 'text-slate-400',
    border: 'border-slate-200',
    borderMedium: 'border-slate-300',
    tableHead: 'bg-slate-50 text-slate-600 border-slate-200',
    tableRow: 'bg-white hover:bg-slate-50/80',
    codeBg: 'bg-slate-950 text-white border-slate-800',
    modalBg: 'bg-white border-slate-200 shadow-2xl',
    statusCard: 'bg-white border-blue-200 shadow-lg shadow-blue-500/5',
    progressTrack: 'bg-slate-100 border-slate-200',
    progressBar: 'bg-gradient-to-r from-blue-600 to-indigo-600',
    sliderTrack: 'accent-blue-600',
  };

  // Suggestion lookup
  useEffect(() => {
    if (creatorName.trim().length >= 2) {
      const timer = setTimeout(async () => {
        try {
          const res = await fetch(`/api/creators/suggest?query=${encodeURIComponent(creatorName.trim())}`);
          if (res.ok) {
            const data = await res.json();
            setSuggestions(data.suggestions || []);
          }
        } catch (e) {
          console.error(e);
        }
      }, 250);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [creatorName]);

  const loadHistory = async (username) => {
    try {
      const res = await fetch(`/api/user/history?username=${encodeURIComponent(username)}`);
      if (res.ok) {
        const data = await res.json();
        setUserHistory(data.history || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!authUsername.trim() || !authPin.trim()) {
      setAuthError('Please fill in both fields.');
      return;
    }
    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/signup';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: authUsername.trim(), pin: authPin.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.detail || 'Authentication error.');
      } else {
        setUser(data.username);
        setAuthModalOpen(false);
        setAuthUsername('');
        setAuthPin('');
        loadHistory(data.username);
      }
    } catch (err) {
      setAuthError('Network communication error.');
    }
  };

  // Restore cached run
  const handleLoadCached = async (targetCreator, targetComp) => {
    if (!user) return;
    setCreatorName(targetCreator);
    if (targetComp) setComparisonCreator(targetComp);
    setLoading(true);
    setStatusText(`Restoring saved report for ${targetCreator}...`);
    try {
      const res = await fetch(`/api/user/cached?username=${encodeURIComponent(user)}&creator=${encodeURIComponent(targetCreator)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.intel) {
          setIntelData(data.intel);
          if (data.clone) {
            setCopyData({
              target_creator: targetCreator,
              comparison_creator: targetComp || '',
              target_niche: data.intel.creator_profile?.core_niche || '',
              target_profile: data.intel.creator_profile || {},
              style_card: data.clone.style_card || {},
              blueprints: data.clone.blueprints || [],
              piracy_ideas: data.clone.piracy_ideas || [],
              head_to_head: data.clone.head_to_head || null,
              target_intel: data.intel
            });
          }
          setPrevFindings(data.prev_findings || {});
          setSelectedUploadIdx(0);
          setSelectedPeerIdx(0);
        }
      }
    } catch (e) {
      console.error('Failed to restore cached intel', e);
    } finally {
      setLoading(false);
      setStatusText('');
    }
  };

  // Analyze action
  const handleAnalyze = async () => {
    const target = creatorName.trim();
    if (!target) return;

    setLoading(true);
    setErrorBanner('');
    setStatusStep(1);
    setStatusText(`Searching web & video footprint for ${target}...`);
    setElapsedSeconds(0);
    setSelectedUploadIdx(0);
    setSelectedPeerIdx(0);
    setExpandedRoadmapStep(null);

    const startTime = Date.now();
    const intervalId = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedSeconds(elapsed);
      if (elapsed < 8) {
        setStatusStep(1);
        setStatusText(`🌐 Phase 1/4: Scanning video footprint & verified accounts... (${elapsed}s)`);
      } else if (elapsed < 20) {
        setStatusStep(2);
        setStatusText(`👥 Phase 2/4: Profiling audience demographics & sponsorship rate card... (${elapsed}s)`);
      } else if (elapsed < 32) {
        setStatusStep(3);
        setStatusText(`🎬 Phase 3/4: Deconstructing opening hooks & viral pacing... (${elapsed}s)`);
      } else {
        setStatusStep(4);
        setStatusText(`💡 Phase 4/4: Synthesizing 5 production ideas & shooting script... (${elapsed}s)`);
      }
    }, 1000);

    try {
      const res = await fetch('/api/intel/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creator_name: target,
          comparison_creator: comparisonCreator.trim(),
          niche: niche.trim(),
          username: user || ''
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Analysis failed.');
      }

      const data = await res.json();
      setIntelData(data.intel);
      setCopyData(data.copy_data);
      setPrevFindings(data.prev_findings);
      if (user) loadHistory(user);
    } catch (err) {
      setErrorBanner(`Analysis Notice: ${err.message}`);
    } finally {
      clearInterval(intervalId);
      setLoading(false);
      setStatusText('');
    }
  };


  const handleSendToPanel = async () => {
    if (!hooksText.trim()) return;
    setSendingToPanel(true);
    setPanelSendResult(null);
    try {
      const res = await fetch('/api/panel/send-hook-study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hooks_text: hooksText,
          concept_title: '',
          creator_tone: '',
          username: user || ''
        })
      });
      setPanelSendResult(res.ok ? 'success' : 'error');
    } catch (e) {
      setPanelSendResult('error');
    } finally {
      setSendingToPanel(false);
    }
  };

  const handleSimulate = async () => {
    if (!hooksText.trim()) return;
    setSimulating(true);
    try {
      const res = await fetch('/api/hooks/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: hooksText.trim(),
          sample_size: sampleSize
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Simulation error.');
      }
      const data = await res.json();
      setSimResults(data);
    } catch (err) {
      alert(`Error running simulation: ${err.message}`);
    } finally {
      setSimulating(false);
    }
  };

  const copyText = (txt, id) => {
    navigator.clipboard.writeText(txt);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // Video Player Component
  const renderVideo = (url, title) => {
    if (!url) return null;
    let cleanUrl = url.trim();
    if (cleanUrl.includes('youtube.com/shorts/')) {
      const match = cleanUrl.match(/\/shorts\/([A-Za-z0-9_-]+)/);
      if (match) cleanUrl = `https://www.youtube.com/watch?v=${match[1]}`;
    }

    if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
      const vidMatch = cleanUrl.match(/(?:v=|\/embed\/|youtu\.be\/|\/shorts\/)([A-Za-z0-9_-]+)/);
      const vidId = vidMatch ? vidMatch[1] : '';
      return (
        <div className={`w-full aspect-video rounded-xl overflow-hidden border shadow-inner ${th.codeBg}`}>
          {vidId ? (
            <iframe
              src={`https://www.youtube.com/embed/${vidId}`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={title || 'YouTube Player'}
            />
          ) : (
            <div className="flex items-center justify-center h-full p-6">
              <a href={cleanUrl} target="_blank" rel="noreferrer" className={`text-xs ${th.textSecondary} hover:${th.textPrimary} flex items-center gap-2`}>
                <Play className="w-4 h-4 text-red-500" /> Open YouTube Stream <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      );
    }

    if (cleanUrl.includes('instagram.com')) {
      const match = cleanUrl.match(/\/(?:reel|reels|p|tv)\/([A-Za-z0-9_-]+)/);
      const code = match ? match[1] : '';
      return (
        <div className={`w-full rounded-xl overflow-hidden border p-2 text-center ${th.codeBg}`}>
          {code ? (
            <iframe
              src={`https://www.instagram.com/reel/${code}/embed`}
              className="w-full h-80 border-0 rounded-lg"
              scrolling="no"
              allowFullScreen
              title={title || 'Instagram Reel'}
            />
          ) : (
            <div className="py-8">
              <a href={cleanUrl} target="_blank" rel="noreferrer" className={`text-xs ${th.textSecondary} hover:${th.textPrimary} inline-flex items-center gap-1.5`}>
                <Play className="w-4 h-4 text-pink-500" /> View on Instagram <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className={`p-5 border rounded-xl text-center ${th.cardInner}`}>
        <a href={cleanUrl} target="_blank" rel="noreferrer" className={`text-xs ${th.textSecondary} hover:${th.textPrimary} inline-flex items-center gap-2 font-medium`}>
          <Play className="w-4 h-4 text-blue-500" /> Watch Media Source ({title || cleanUrl}) <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    );
  };

  const profile = intelData?.creator_profile || {};
  const h2h = copyData?.head_to_head;
  const creatorVideos = intelData?.creator_videos || [];
  const peerVideos = intelData?.niche_trending_videos || [];
  const suggestionsList = intelData?.content_suggestions || [];
  const styleDna = copyData?.style_card?.style_dna || {};
  const cloneRoadmap = copyData?.style_card?.clone_roadmap || [];
  const blueprints = copyData?.blueprints || [];
  const piracyIdeas = copyData?.piracy_ideas || [];
  const negativeReviews = intelData?.negative_reviews || [];
  const improvementSuggestions = intelData?.improvement_suggestions || [];
  const metrics = intelData?.platform_metrics || {};
  const rateCard = intelData?.rate_card_and_sponsors || {};
  const demographics = intelData?.audience_demographics || {};

  return (
    <div className={`min-h-screen flex ${th.root} transition-colors duration-200 antialiased`}>
      {/* ─── LEFT SIDEBAR NAVIGATION (Clean, Minimal, NO "?" Icons) ────────── */}
      <aside className={`w-64 border-r flex flex-col justify-between shrink-0 select-none hidden md:flex ${th.sidebar} transition-colors duration-200 z-20`}>
        <div>
          {/* Brand Header: HookLab */}
          <div className={`h-16 border-b px-5 flex items-center justify-between ${th.border}`}>
            <div className="flex items-center gap-3">
              {/* HookLab Logo Mark: Dual-Hook Waveform Prism */}
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-cyan-400 p-0.5 shadow-md shadow-blue-500/20 flex items-center justify-center shrink-0">
                <div className="w-full h-full bg-[#0E1017] rounded-[10px] flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                    <path d="M6 5v14M18 5v14M6 12h12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className={`font-heading font-extrabold text-sm tracking-tight ${th.textPrimary}`}>HookLab</span>
                  <span className="font-mono text-[9px] px-1.5 py-0.5 rounded font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">AI</span>
                </div>
                <div className={`text-[10px] ${th.textMuted} font-medium`}>Viral Creator Intelligence</div>
              </div>
            </div>
          </div>

          {/* Grouped Sidebar Navigation (CLEAN: No "?" badges) */}
          <div className="p-3.5 space-y-4">
            <div>
              <div className={`px-2.5 mb-1.5 text-[9px] font-mono uppercase font-bold tracking-wider ${th.textMuted}`}>
                Intelligence &amp; Content
              </div>
              <nav className="space-y-1">
                {[
                  { 
                    id: 'dossier', 
                    label: 'Creator Profile & Summary', 
                    icon: Sparkles
                  },
                  { 
                    id: 'ideas', 
                    label: '5 Ready-to-Make Video Ideas', 
                    icon: Flame, 
                    badge: '5'
                  },
                  { 
                    id: 'blueprints', 
                    label: 'Creator Style Blueprint', 
                    icon: Layers
                  }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer border ${
                        isActive ? th.navActive : th.navInactive
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-500' : th.textMuted}`} />
                        <span className="truncate">{tab.label}</span>
                      </div>
                      {tab.badge && (
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                          isActive ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                        }`}>
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div>
              <div className={`px-2.5 mb-1.5 text-[9px] font-mono uppercase font-bold tracking-wider ${th.textMuted}`}>
                Retention &amp; Revenue
              </div>
              <nav className="space-y-1">
                {[
                  { 
                    id: 'friction', 
                    label: 'Viewer Complaints & Drop-offs', 
                    icon: ShieldAlert
                  },
                  { 
                    id: 'simulator', 
                    label: 'Video Hook Tester', 
                    icon: Target
                  },
                  { 
                    id: 'reach', 
                    label: 'Audience Size & Ad Rates', 
                    icon: TrendingUp
                  }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer border ${
                        isActive ? th.navActive : th.navInactive
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-500' : th.textMuted}`} />
                        <span className="truncate">{tab.label}</span>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Saved Sessions Drawer */}
          {user && userHistory.length > 0 && (
            <div className={`p-3.5 border-t ${th.border}`}>
              <div className="flex items-center justify-between mb-2 px-1">
                <span className={`text-[10px] font-mono uppercase ${th.textMuted} font-bold tracking-wider`}>
                  Saved Searches
                </span>
              </div>
              <div className="space-y-1 max-h-36 overflow-y-auto">
                {userHistory.map((h, idx) => (
                  <button
                    key={h.id || idx}
                    type="button"
                    onClick={() => handleLoadCached(h.creator_name, h.comparison_creator || '')}
                    className={`w-full text-left px-2.5 py-1.5 text-xs ${th.textSecondary} hover:${th.textPrimary} ${th.cardHover} rounded-md truncate block transition`}
                  >
                    {h.creator_name} {h.comparison_creator ? `vs ${h.comparison_creator}` : ''}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Footer: Theme Toggle & User Auth */}
        <div className={`p-3.5 border-t space-y-2.5 ${th.border}`}>
          {/* Theme Switcher Card */}
          <div className={`flex items-center justify-between p-1.5 rounded-xl border ${th.cardInner}`}>
            <span className={`text-xs font-medium px-2 ${th.textSecondary}`}>Mode</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition ${
                  !isDark ? 'bg-white shadow-xs text-blue-600 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
                title="White Theme"
              >
                <Sun className="w-3.5 h-3.5" />
                <span className="text-[10px]">Light</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition ${
                  isDark ? 'bg-[#181B26] shadow-xs text-blue-400 font-semibold border border-white/10' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Dark Theme"
              >
                <Moon className="w-3.5 h-3.5" />
                <span className="text-[10px]">Dark</span>
              </button>
            </div>
          </div>

          {/* User Account / Profile */}
          {user ? (
            <div className={`flex items-center justify-between border rounded-xl p-2.5 ${th.cardInner}`}>
              <div className="truncate">
                <span className={`text-[9px] ${th.textMuted} block font-mono uppercase font-bold`}>Active Account</span>
                <span className={`text-xs font-semibold ${th.textPrimary} truncate`}>@{user}</span>
              </div>
              <button
                onClick={() => setUser(null)}
                className={`p-1.5 rounded-lg ${th.textSecondary} hover:${th.textPrimary} transition`}
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className={`w-full py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition cursor-pointer ${th.btnSecondary}`}
            >
              <Lock className="w-3.5 h-3.5 text-blue-500" /> 
              <span>Sign In / Save Progress</span>
            </button>
          )}
        </div>
      </aside>

      {/* ─── MAIN CONTENT VIEWPORT ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Header Bar */}
        <header className={`h-16 border-b px-6 flex items-center justify-between gap-4 sticky top-0 z-30 ${th.header}`}>
          <div className="flex items-center gap-2">
            <span className={`font-heading font-extrabold text-sm tracking-tight ${th.textPrimary}`}>HookLab Studio</span>
            <span className={`text-xs ${th.textMuted} hidden lg:inline`}>/ Viral Pacing, Hook Decoupler &amp; Growth Studio</span>
          </div>

          <div className="flex items-center gap-3">
            {/* LPU Status Indicator */}
            <div className={`hidden sm:flex items-center gap-2 font-mono text-[11px] px-3 py-1 rounded-full border ${th.pill}`}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-medium">Groq LPU Engine (GPT-OSS-120B)</span>
            </div>

            {/* Direct Theme Switcher Button */}
            <button
              type="button"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`p-2 rounded-xl border flex items-center gap-2 text-xs font-medium transition cursor-pointer ${th.btnSecondary}`}
              title={isDark ? "Switch to White Theme" : "Switch to Dark Theme"}
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline font-semibold">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-blue-600" />
                  <span className="hidden sm:inline font-semibold">Dark</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Workspace Canvas */}
        <main className="p-6 md:p-8 max-w-6xl w-full mx-auto space-y-7">
          {/* Dismissible Error Banner */}
          {errorBanner && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-between text-xs text-rose-500 shadow-sm">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="font-medium">{errorBanner}</span>
              </div>
              <button onClick={() => setErrorBanner('')} className="text-xs px-2.5 py-1 rounded-md hover:bg-rose-500/20 font-semibold cursor-pointer">
                Dismiss
              </button>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* DEDICATED WINDOW: CREATOR RECON & DECOUPLING CONSOLE               */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          <div className={`border rounded-2xl p-5 md:p-6 shadow-sm space-y-5 ${th.card}`}>
            {/* Window Header with Dedicated Aligned Info Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-white/[0.06]">
              <div>
                <h2 className={`font-heading font-extrabold text-base tracking-tight ${th.textPrimary}`}>
                  Analyze Any Creator
                </h2>
                <p className={`text-xs ${th.textSecondary} mt-0.5`}>
                  Multi-platform web scrape + Groq LPU neural synthesis
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${th.pill}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  <span>Live Footprint Crawl</span>
                </div>
                {/* Clean, perfectly aligned info button for the whole console window */}
                <FeatureHelp 
                  title="How Creator Analysis Works"
                  description="Type in any creator's name. HookLab researches their real public video catalog, measures audience retention drop-offs, reverse-engineers their 3-second opening hook formula, and synthesizes 5 production-ready concepts."
                  tip="Add a benchmark rival creator to run a comparative retention duel and generate a hybrid hook."
                  align="right"
                />
              </div>
            </div>

            {/* Inputs Grid (Clean, symmetrical, NO noisy individual "?" badges) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
              {/* Target Creator Input */}
              <div className="md:col-span-5 relative">
                <label className={`block text-[10px] font-mono uppercase font-bold tracking-wider mb-1.5 ${th.textMuted}`}>
                  Creator to Study *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={creatorName}
                    onChange={(e) => setCreatorName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                    placeholder="e.g. CarryMinati, MrBeast, Aakash Dhawan"
                    className={`w-full rounded-xl px-3.5 py-2.5 text-xs outline-none transition border font-medium ${th.input}`}
                  />
                  {/* Autocomplete Suggestions Menu */}
                  {suggestions.length > 0 && (
                    <div className={`absolute left-0 right-0 top-full mt-2 border rounded-xl shadow-2xl z-50 max-h-56 overflow-y-auto ${th.modalBg}`}>
                      {suggestions.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setCreatorName(s.name);
                            if (s.niche) setNiche(s.niche);
                            setSuggestions([]);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-xs ${th.textSecondary} hover:${th.textPrimary} ${th.cardHover} border-b ${th.border} last:border-0 flex justify-between items-center transition cursor-pointer`}
                        >
                          <span className={`font-semibold ${th.textPrimary}`}>{s.name}</span>
                          <span className={`text-[11px] font-mono ${th.textMuted}`}>{s.niche}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Benchmark Rival Input */}
              <div className="md:col-span-4">
                <label className={`block text-[10px] font-mono uppercase font-bold tracking-wider mb-1.5 ${th.textMuted}`}>
                  Compare With Rival (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={comparisonCreator}
                    onChange={(e) => setComparisonCreator(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                    placeholder="e.g. Ashish Chanchlani, Ryan Trahan"
                    className={`w-full rounded-xl px-3.5 py-2.5 text-xs outline-none transition border font-medium ${th.input}`}
                  />
                </div>
              </div>

              {/* Content Category Input */}
              <div className="md:col-span-3">
                <label className={`block text-[10px] font-mono uppercase font-bold tracking-wider mb-1.5 ${th.textMuted}`}>
                  Content Category (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                    placeholder="e.g. Comedy, Motovlog, Tech"
                    className={`w-full rounded-xl px-3.5 py-2.5 text-xs outline-none transition border font-medium ${th.input}`}
                  />
                </div>
              </div>
            </div>

            {/* Featured Creators Shelf (Cleanly aligned, NO question marks) */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className={`text-[11px] font-mono uppercase font-bold mr-1 ${th.textMuted}`}>
                Popular Creators:
              </span>
              {PRESET_CREATORS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCreatorName(p.name);
                    setNiche(p.niche);
                  }}
                  className={`px-3 py-1.5 rounded-lg border text-xs transition cursor-pointer flex items-center gap-1.5 ${th.pillSecondary}`}
                >
                  <span className={`font-semibold ${th.textPrimary}`}>{p.name}</span>
                  <span className={`text-[10px] ${th.textMuted}`}>({p.niche})</span>
                </button>
              ))}
            </div>

            {/* Prominent Action Button */}
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading || !creatorName.trim()}
              className={`w-full py-3 px-6 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${th.btnPrimary} disabled:opacity-50`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing Creator &amp; Reverse-Engineering Formula...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Creator &amp; Generate Blueprint</span>
                </>
              )}
            </button>
          </div>

          {/* AI Synthesis Pipeline Status Tracker */}
          {loading && (
            <div className={`p-5 md:p-6 border rounded-2xl space-y-4 shadow-lg ${th.statusCard}`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className={`flex items-center gap-2.5 ${th.textPrimary} font-bold text-xs`}>
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                  <span>{statusText || 'Researching digital footprint and viewer retention...'}</span>
                </div>
                <span className={`font-mono text-[11px] ${th.textMuted}`}>
                  {elapsedSeconds}s elapsed · estimated ~35s
                </span>
              </div>
              <div className={`w-full h-2 rounded-full overflow-hidden border ${th.progressTrack}`}>
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${th.progressBar}`}
                  style={{
                    width: `${Math.min(96, Math.max(12, statusStep * 24 + Math.min(15, elapsedSeconds)))}%`
                  }}
                />
              </div>
              <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono ${th.textMuted}`}>
                <div className={`p-2 rounded-lg border ${statusStep >= 1 ? 'border-blue-500/40 bg-blue-500/10 text-blue-400 font-bold' : th.cardInner}`}>
                  1. Footprint Search
                </div>
                <div className={`p-2 rounded-lg border ${statusStep >= 2 ? 'border-blue-500/40 bg-blue-500/10 text-blue-400 font-bold' : th.cardInner}`}>
                  2. Audience &amp; Rates
                </div>
                <div className={`p-2 rounded-lg border ${statusStep >= 3 ? 'border-blue-500/40 bg-blue-500/10 text-blue-400 font-bold' : th.cardInner}`}>
                  3. Hook Formulas
                </div>
                <div className={`p-2 rounded-lg border ${statusStep >= 4 ? 'border-blue-500/40 bg-blue-500/10 text-blue-400 font-bold' : th.cardInner}`}>
                  4. Scripts &amp; Ideas
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* TAB 1: CREATOR PROFILE & SUMMARY                                */}
          {/* ─────────────────────────────────────────────────────────────── */}
          {activeTab === 'dossier' && (
            <div className="space-y-6">
              {!intelData ? (
                <div className={`text-center py-20 border border-dashed rounded-2xl ${th.card} p-8 space-y-3`}>
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto text-blue-500">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className={`font-heading font-bold text-base ${th.textPrimary}`}>Ready to Study Any Creator</h3>
                  <p className={`text-xs ${th.textSecondary} max-w-md mx-auto leading-relaxed`}>
                    Type a creator's name in the box above (like CarryMinati or MrBeast) and click "Analyze Creator" to reveal their complete growth profile.
                  </p>
                </div>
              ) : (
                <>
                  {/* Executive Creator Briefing Card */}
                  <div className={`border rounded-2xl p-6 space-y-5 ${th.card}`}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} alt="" className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-500/40 shadow-md" />
                        ) : (
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border ${th.cardInner}`}>👤</div>
                        )}
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h2 className={`font-heading font-extrabold text-2xl ${th.textPrimary}`}>{profile.name}</h2>
                            <span className={`font-mono text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${th.pill}`}>
                              {profile.tier || 'Macro Creator'}
                            </span>
                          </div>
                          <div className={`text-xs ${th.textSecondary} flex flex-wrap items-center gap-3 font-medium`}>
                            <span>Category: <strong className={th.textPrimary}>{profile.core_niche || 'Digital Content'}</strong></span>
                            <span>•</span>
                            <span>Primary Region: <strong className={th.textPrimary}>{profile.location || 'India'}</strong></span>
                          </div>

                          {/* Verified Handles */}
                          {profile.discovered_accounts?.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              <span className={`text-[10px] font-mono ${th.textMuted} uppercase font-bold mr-1`}>Verified:</span>
                              {profile.discovered_accounts.map((acc, aIdx) => (
                                <a
                                  key={aIdx}
                                  href={acc.url || '#'}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={`px-2.5 py-1 rounded-lg text-[11px] border inline-flex items-center gap-1.5 transition ${th.pillSecondary}`}
                                >
                                  <span>{acc.platform}: {acc.title}</span>
                                  {acc.url && <ExternalLink className="w-3 h-3 text-blue-500" />}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Single aligned info button for the profile section */}
                      <FeatureHelp 
                        title="Creator Profile Snapshot" 
                        description="General overview of the creator, their subscriber tier, main category, verified accounts, and vocal rhythm."
                        align="right"
                      />
                    </div>

                    {/* Delivery Style & Audience Persona Cards */}
                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t ${th.border}`}>
                      <div className={`border rounded-xl p-4 text-xs space-y-1.5 ${th.cardInner}`}>
                        <span className={`text-[10px] font-mono ${th.textMuted} uppercase font-bold block`}>Speaking Style &amp; Pacing</span>
                        <p className={`${th.textSecondary} leading-relaxed font-medium`}>{profile.tone_and_style || 'High-energy, satirical, engaging delivery.'}</p>
                      </div>
                      <div className={`border rounded-xl p-4 text-xs space-y-1.5 ${th.cardInner}`}>
                        <span className={`text-[10px] font-mono ${th.textMuted} uppercase font-bold block`}>Who Watches Them</span>
                        <p className={`${th.textSecondary} leading-relaxed font-medium`}>{profile.audience_vibe || 'Young, college, mobile-first community.'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Head-to-Head Comparative Duel */}
                  {h2h && (
                    <div className={`border rounded-2xl p-6 space-y-4 ${th.card}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Swords className="w-4 h-4 text-blue-500" />
                          <h3 className={`font-heading font-extrabold text-sm ${th.textPrimary}`}>
                            Side-by-Side Comparison: {profile.name} vs {h2h.benchmark_creator}
                          </h3>
                        </div>
                        <FeatureHelp 
                          title="Side-by-Side Retention Duel"
                          description="Compares the retention strengths of both creators and crafts a winning hybrid opening hook combining the best of both."
                          align="right"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className={`border rounded-xl p-4 space-y-1 ${th.cardInner}`}>
                          <span className={`text-[10px] font-mono text-emerald-500 uppercase block font-bold`}>
                            {profile.name}'s Key Retention Edge
                          </span>
                          <p className={`${th.textSecondary} leading-relaxed`}>{h2h.target_style_edge}</p>
                        </div>
                        <div className={`border rounded-xl p-4 space-y-1 ${th.cardInner}`}>
                          <span className={`text-[10px] font-mono text-rose-500 uppercase block font-bold`}>
                            {h2h.benchmark_creator}'s Vulnerability
                          </span>
                          <p className={`${th.textSecondary} leading-relaxed`}>{h2h.benchmark_weakness}</p>
                        </div>
                      </div>

                      {h2h.hook_contrast?.winning_hybrid_hook && (
                        <div className={`border rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${th.cardInner}`}>
                          <div className="space-y-1">
                            <span className={`text-[10px] font-mono ${th.textMuted} uppercase block font-bold`}>Winning Hybrid Opening Hook</span>
                            <span className={`text-xs ${th.textPrimary} italic font-semibold`}>"{h2h.hook_contrast.winning_hybrid_hook}"</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const cand = h2h.hook_contrast.candidate_hooks || [
                                { sid: 'S1', text: h2h.hook_contrast.creator_a_hook || 'Stop scrolling — this changes everything.' },
                                { sid: 'S2', text: h2h.hook_contrast.creator_b_hook || 'Today we are going to look into this problem.' },
                                { sid: 'S3', text: h2h.hook_contrast.winning_hybrid_hook },
                                { sid: 'S4', text: `I took ${h2h.benchmark_creator}'s biggest video and remade it using ${profile.name}'s formula.` }
                              ];
                              setHooksText(`Battle: ${profile.name} vs ${h2h.benchmark_creator}\n` + cand.map(h => `${h.sid}: ${h.text}`).join('\n'));
                              setActiveTab('simulator');
                            }}
                            className={`px-4 py-2 border text-xs font-bold rounded-lg transition shrink-0 cursor-pointer ${th.btnSecondary}`}
                          >
                            Send to Hook Tester →
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Creator's Proven Uploads */}
                  {creatorVideos.length > 0 && (
                    <div className={`border rounded-2xl p-6 space-y-5 ${th.card}`}>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <h3 className={`font-heading font-extrabold text-sm ${th.textPrimary}`}>
                            Top Performing Videos ({creatorVideos.length} Uploads Deconstructed)
                          </h3>
                          <span className={`text-[11px] font-mono ${th.textMuted}`}>Click to watch &amp; examine pacing</span>
                        </div>
                        <FeatureHelp 
                          title="Top Videos Deconstruction"
                          description="Real videos uploaded by this creator. Click any video to inspect its exact opening 3-second hook and why it held viewer attention."
                          align="right"
                        />
                      </div>

                      {/* Video Selector Pills */}
                      <div className="flex flex-wrap gap-2">
                        {creatorVideos.map((v, vIdx) => (
                          <button
                            key={vIdx}
                            type="button"
                            onClick={() => setSelectedUploadIdx(vIdx)}
                            className={`px-3 py-1.5 rounded-lg text-xs transition border text-left truncate max-w-xs cursor-pointer ${
                              selectedUploadIdx === vIdx ? th.pillSelected : th.pillSecondary
                            }`}
                          >
                            <span className={`font-mono text-[10px] ${th.textMuted} mr-1.5 font-bold`}>[{v.platform || 'Video'}]</span>
                            {v.title || `Upload #${vIdx + 1}`}
                          </button>
                        ))}
                      </div>

                      {/* Video Player & Retention Deconstruction */}
                      {creatorVideos[selectedUploadIdx] && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
                          <div className="lg:col-span-7">
                            {renderVideo(creatorVideos[selectedUploadIdx].url, creatorVideos[selectedUploadIdx].title)}
                          </div>
                          <div className="lg:col-span-5 space-y-3.5 text-xs">
                            <div className={`border rounded-xl p-4 ${th.cardInner}`}>
                              <span className={`text-[10px] font-mono ${th.textMuted} uppercase block mb-1 font-bold`}>View Count Benchmark</span>
                              <span className={`text-base font-extrabold text-emerald-500`}>{creatorVideos[selectedUploadIdx].views || 'High Engagement'}</span>
                            </div>
                            <div className={`border rounded-xl p-4 ${th.cardInner}`}>
                              <span className={`text-[10px] font-mono ${th.textMuted} uppercase block mb-1 font-bold`}>First 3-Second Opening Hook</span>
                              <p className={`${th.textPrimary} italic font-semibold leading-relaxed`}>"{creatorVideos[selectedUploadIdx].opening_hook || '—'}"</p>
                            </div>
                            <div className={`border rounded-xl p-4 ${th.cardInner}`}>
                              <span className={`text-[10px] font-mono ${th.textMuted} uppercase block mb-1 font-bold`}>Why People Watched Until the End</span>
                              <p className={`${th.textSecondary} leading-relaxed`}>{creatorVideos[selectedUploadIdx].why_it_went_viral || '—'}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Peer Category Trending Videos */}
                  {peerVideos.length > 0 && (
                    <div className={`border rounded-2xl p-6 space-y-5 ${th.card}`}>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <h3 className={`font-heading font-extrabold text-sm ${th.textPrimary}`}>
                            Popular Videos from Similar Creators ({peerVideos.length} Category Benchmarks)
                          </h3>
                          <span className={`text-[11px] font-mono ${th.textMuted}`}>Category viral benchmarks</span>
                        </div>
                        <FeatureHelp 
                          title="Category Benchmarks"
                          description="Viral videos from other creators in the same niche so you can identify emerging trends and adapt their opening hooks."
                          align="right"
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {peerVideos.map((pv, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => setSelectedPeerIdx(pIdx)}
                            className={`px-3 py-1.5 rounded-lg text-xs transition border text-left truncate max-w-xs cursor-pointer ${
                              selectedPeerIdx === pIdx ? th.pillSelected : th.pillSecondary
                            }`}
                          >
                            <span className={`font-mono text-[10px] ${th.textMuted} mr-1.5 font-bold`}>[{pv.platform || 'Peer'}]</span>
                            {pv.title || `Peer #${pIdx + 1}`}
                          </button>
                        ))}
                      </div>

                      {peerVideos[selectedPeerIdx] && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
                          <div className="lg:col-span-7">
                            {renderVideo(peerVideos[selectedPeerIdx].url, peerVideos[selectedPeerIdx].title)}
                          </div>
                          <div className="lg:col-span-5 space-y-3.5 text-xs">
                            <div className={`border rounded-xl p-4 ${th.cardInner}`}>
                              <span className={`text-[10px] font-mono ${th.textMuted} uppercase block mb-1 font-bold`}>Total Views</span>
                              <span className={`text-base font-extrabold text-emerald-500`}>{peerVideos[selectedPeerIdx].views || 'Trending Wave'}</span>
                            </div>
                            <div className={`border rounded-xl p-4 ${th.cardInner}`}>
                              <span className={`text-[10px] font-mono ${th.textMuted} uppercase block mb-1 font-bold`}>Their Opening Hook</span>
                              <p className={`${th.textPrimary} italic font-semibold leading-relaxed`}>"{peerVideos[selectedPeerIdx].opening_hook || '—'}"</p>
                            </div>
                            <div className={`border rounded-xl p-4 ${th.cardInner}`}>
                              <span className={`text-[10px] font-mono ${th.textMuted} uppercase block mb-1 font-bold`}>How to Adapt This Hook for Yourself</span>
                              <p className={`${th.textSecondary} leading-relaxed`}>{peerVideos[selectedPeerIdx].adapt_hook_template || '—'}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* TAB 2: 5 READY-TO-MAKE VIDEO IDEAS                              */}
          {/* ─────────────────────────────────────────────────────────────── */}
          {activeTab === 'ideas' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <div>
                    <h3 className={`font-heading font-extrabold text-base ${th.textPrimary}`}>5 Ready-to-Make Video Ideas with 4 Opening Hooks</h3>
                    <p className={`text-xs ${th.textSecondary} mt-0.5`}>Engineered for short-form retention pacing with playable reference benchmarks.</p>
                  </div>
                  <FeatureHelp 
                    title="5 Viral Video Concepts"
                    description="Custom video angles designed using the creator's viral mechanics. Each video idea includes 4 tested opening hook styles (Incident, Curiosity, Shock, Contrarian)."
                    tip="Click 'Test All 5 in Hook Tester' to score candidate openers against simulated viewers."
                    align="right"
                  />
                </div>
                {suggestionsList.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const lines = suggestionsList.slice(0, 5).map((s, idx) => {
                        const topH = s.candidate_hooks?.[0]?.text || s.title;
                        return `S${idx + 1}: ${topH}`;
                      });
                      setHooksText(`5-Concept Showdown:\n${lines.join('\n')}`);
                      setActiveTab('simulator');
                    }}
                    className={`px-4 py-2 border text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-2 ${th.btnSecondary}`}
                  >
                    <Target className="w-3.5 h-3.5 text-blue-500" />
                    <span>Test All 5 in Hook Tester →</span>
                  </button>
                )}
              </div>

              {suggestionsList.length === 0 ? (
                <div className={`text-center py-20 border border-dashed rounded-2xl ${th.card} p-8 space-y-3`}>
                  <Flame className="w-10 h-10 mx-auto text-orange-500 opacity-40" />
                  <h3 className={`font-semibold text-sm ${th.textPrimary}`}>No Video Ideas Yet</h3>
                  <p className={`text-xs ${th.textSecondary}`}>Analyze a creator in the command bar above to generate 5 high-retention video briefs.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {suggestionsList.map((item, idx) => (
                    <div key={idx} className={`border rounded-2xl p-6 space-y-4 ${th.card}`}>
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2.5 mb-2">
                            <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              CONCEPT #{item.id || idx + 1}
                            </span>
                            <span className={`text-xs font-mono font-medium ${th.textMuted}`}>{item.trending_topic}</span>
                          </div>
                          <h4 className={`font-heading font-extrabold text-lg ${th.textPrimary}`}>{item.title}</h4>
                          <p className={`text-xs ${th.textSecondary} mt-1.5 leading-relaxed`}>{item.why_it_works}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`text-[10px] font-mono ${th.textMuted} block uppercase font-bold`}>Estimated Views</span>
                          <span className="text-base font-extrabold text-emerald-500">{item.estimated_views}</span>
                        </div>
                      </div>

                      {/* Audience Psychology & Strategic Intelligence Badges */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
                        {item.target_audience_appeal && (
                          <div className={`p-2.5 rounded-xl border text-xs ${th.cardInner}`}>
                            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider block mb-1 text-blue-400 flex items-center gap-1.5`}>
                              <Users className="w-3 h-3 text-blue-400" /> Target Demographic
                            </span>
                            <p className={`text-[11px] leading-snug ${th.textSecondary}`}>{item.target_audience_appeal}</p>
                          </div>
                        )}
                        {item.audience_sentiment_reaction && (
                          <div className={`p-2.5 rounded-xl border text-xs ${th.cardInner}`}>
                            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider block mb-1 text-amber-400 flex items-center gap-1.5`}>
                              <Flame className="w-3 h-3 text-amber-400" /> Audience Reaction
                            </span>
                            <p className={`text-[11px] leading-snug ${th.textSecondary}`}>{item.audience_sentiment_reaction}</p>
                          </div>
                        )}
                        {item.benchmark_differentiation && (
                          <div className={`p-2.5 rounded-xl border text-xs ${th.cardInner}`}>
                            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider block mb-1 text-emerald-400 flex items-center gap-1.5`}>
                              <Swords className="w-3 h-3 text-emerald-400" /> Benchmark Counter
                            </span>
                            <p className={`text-[11px] leading-snug ${th.textSecondary}`}>{item.benchmark_differentiation}</p>
                          </div>
                        )}
                      </div>

                      {/* Reference Benchmark Video Player */}
                      {item.reference_video?.url && (
                        <div className={`border rounded-xl p-4 space-y-3 ${th.cardInner}`}>
                          <div className="flex items-center justify-between text-xs">
                            <span className={`font-mono text-[10px] ${th.textMuted} uppercase font-bold flex items-center gap-1.5`}>
                              <Play className="w-3.5 h-3.5 text-red-500" /> Reference Benchmark: {item.reference_video.title} ({item.reference_video.creator || 'Benchmark'})
                            </span>
                            <span className={`font-mono text-[9px] px-2 py-0.5 rounded-full border ${th.pill}`}>
                              {item.reference_video.platform || 'Video'}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                            <div className="md:col-span-6">
                              {renderVideo(item.reference_video.url, item.reference_video.title)}
                            </div>
                            <div className={`md:col-span-6 text-xs ${th.textSecondary}`}>
                              <span className={`text-[10px] font-mono ${th.textMuted} block uppercase font-bold mb-1`}>Strategic Pacing Rationale</span>
                              <p className="leading-relaxed">{item.reference_video.why_reference || 'Demonstrates category retention pacing and curiosity payoff.'}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 4 Hook Archetypes */}
                      <div className={`pt-4 border-t space-y-2.5 ${th.border}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                          <span className={`text-[10px] font-mono uppercase font-bold ${th.textMuted} block`}>
                            4 Tested Opening Styles (First 3 Seconds) — Grounded in Audience Psychology:
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            Incident · Curiosity · Audience Shock · Benchmark Challenge
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-2.5">
                          {item.candidate_hooks?.map((hk, hIdx) => {
                            const archetypes = [
                              { label: 'INCIDENT / STAKES', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
                              { label: 'CURIOSITY GAP', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
                              { label: 'AUDIENCE REACTION', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
                              { label: 'BENCHMARK CHALLENGE', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
                            ];
                            const arch = archetypes[hIdx % archetypes.length];
                            const hookKey = `h-${idx}-${hIdx}`;
                            return (
                              <div key={hIdx} className={`border rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${th.cardInner} hover:border-white/[0.12] transition`}>
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md font-bold border ${th.pill}`}>{hk.sid || `S${hIdx + 1}`}</span>
                                    <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded border font-bold uppercase tracking-wide ${arch.color}`}>
                                      {hk.archetype || arch.label}
                                    </span>
                                    {hk.hook_technique && (
                                      <span className={`text-[10px] font-mono ${th.textMuted}`}>
                                        · {hk.hook_technique}
                                      </span>
                                    )}
                                  </div>
                                  <p className={`${th.textPrimary} font-medium text-xs leading-relaxed italic`}>
                                    "{hk.text}"
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setHooksText(`Single Hook Test (${item.title}):\n${hk.sid || 'S1'}: ${hk.text}`);
                                      setActiveTab('simulator');
                                    }}
                                    className={`px-2 py-1 rounded-md border text-[11px] font-medium transition cursor-pointer flex items-center gap-1 ${th.btnSecondary}`}
                                    title="Test just this single hook in simulator"
                                  >
                                    <Zap className="w-3 h-3 text-amber-400" /> <span>Test</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => copyText(hk.text, hookKey)}
                                    className={`p-1.5 rounded-md border transition cursor-pointer shrink-0 ${th.btnSecondary}`}
                                    title="Copy this hook line"
                                  >
                                    {copiedKey === hookKey ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const lines = item.candidate_hooks?.map(h => `${h.sid}: ${h.text}`).join('\n') || '';
                            setHooksText(`Concept #${item.id}: ${item.title}\n${lines}`);
                            setActiveTab('simulator');
                          }}
                          className="mt-2 text-xs font-semibold text-blue-500 hover:text-blue-400 flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <span>Test all 4 opening hooks for Idea #{item.id} in Hook Tester</span> <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* TAB 3: CREATOR STYLE BLUEPRINT & SCRIPTS                        */}
          {/* ─────────────────────────────────────────────────────────────── */}
          {activeTab === 'blueprints' && (
            <div className="space-y-6">
              {!copyData ? (
                <div className={`text-center py-20 border border-dashed rounded-2xl ${th.card} p-8 space-y-3`}>
                  <Layers className="w-10 h-10 mx-auto text-blue-500 opacity-40" />
                  <h3 className={`font-semibold text-sm ${th.textPrimary}`}>No Blueprint Loaded</h3>
                  <p className={`text-xs ${th.textSecondary}`}>Analyze a creator to decode their editing cadence, shooting script, and growth roadmap.</p>
                </div>
              ) : (
                <>
                  {/* Style DNA Card */}
                  <div className={`border rounded-2xl p-6 space-y-4 ${th.card}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Layers className="w-4 h-4 text-blue-500" />
                        <h3 className={`font-heading font-extrabold text-sm ${th.textPrimary}`}>The Creator's Secret Recipe (Style DNA)</h3>
                      </div>
                      <FeatureHelp 
                        title="Style DNA"
                        description="The core components that form the creator's video style: opening hooks, editing tempo, thumbnail patterns, and psychological triggers."
                        align="right"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                      <div className={`border rounded-xl p-4 space-y-1 ${th.cardInner}`}>
                        <span className={`font-mono text-[10px] ${th.textMuted} uppercase block font-bold`}>Opening Hook Strategy</span>
                        <p className={`${th.textSecondary} leading-relaxed`}>{styleDna.hook_formula || '—'}</p>
                      </div>
                      <div className={`border rounded-xl p-4 space-y-1 ${th.cardInner}`}>
                        <span className={`font-mono text-[10px] ${th.textMuted} uppercase block font-bold`}>Video Story Structure</span>
                        <p className={`${th.textSecondary} leading-relaxed`}>{styleDna.content_structure || '—'}</p>
                      </div>
                      <div className={`border rounded-xl p-4 space-y-1 ${th.cardInner}`}>
                        <span className={`font-mono text-[10px] ${th.textMuted} uppercase block font-bold`}>Editing Speed &amp; Rhythm</span>
                        <p className={`${th.textSecondary} leading-relaxed`}>{styleDna.editing_rhythm || '—'}</p>
                      </div>
                      <div className={`border rounded-xl p-4 space-y-1 ${th.cardInner}`}>
                        <span className={`font-mono text-[10px] ${th.textMuted} uppercase block font-bold`}>Thumbnail Design Recipe</span>
                        <p className={`${th.textSecondary} leading-relaxed`}>{styleDna.thumbnail_formula || '—'}</p>
                      </div>
                      <div className={`border rounded-xl p-4 space-y-1 ${th.cardInner}`}>
                        <span className={`font-mono text-[10px] ${th.textMuted} uppercase block font-bold`}>Subscribe Call-to-Action Pattern</span>
                        <p className={`${th.textSecondary} leading-relaxed`}>{styleDna.cta_pattern || '—'}</p>
                      </div>
                      <div className={`border rounded-xl p-4 space-y-1 ${th.cardInner}`}>
                        <span className={`font-mono text-[10px] ${th.textMuted} uppercase block font-bold`}>Viral Psychological Trigger</span>
                        <p className={`${th.textSecondary} leading-relaxed`}>{styleDna.viral_trigger || '—'}</p>
                      </div>
                    </div>
                  </div>

                  {/* 5-Step Implementation Roadmap */}
                  {cloneRoadmap.length > 0 && (
                    <div className={`border rounded-2xl p-6 space-y-4 ${th.card}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className={`font-heading font-extrabold text-sm ${th.textPrimary}`}>5-Step Action Plan to Copy Their Success</h3>
                          <p className={`text-[11px] ${th.textMuted} mt-0.5`}>Click any step to reveal the expected result &amp; success signals</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-mono ${th.textMuted} font-bold`}>{cloneRoadmap.length} steps</span>
                          <FeatureHelp 
                            title="5-Step Action Plan"
                            description="Step-by-step instructions to film your video matching this creator's quality standard. Click any step to see what to expect."
                            align="right"
                          />
                        </div>
                      </div>

                      <div className="relative space-y-2.5">
                        {cloneRoadmap.map((step, sIdx) => {
                          const isOpen = expandedRoadmapStep === sIdx;
                          const diffColor = isDark ? (
                            step.difficulty === 'Easy' ? { bg: 'bg-[#12281D]', border: 'border-[#1D4A33]', text: 'text-[#4ADE80]', dot: 'bg-[#4ADE80]' } :
                            step.difficulty === 'Hard' ? { bg: 'bg-[#2E181B]', border: 'border-[#5C2329]', text: 'text-[#F87171]', dot: 'bg-[#F87171]' } :
                            { bg: 'bg-[#282114]', border: 'border-[#4D3A1B]', text: 'text-[#FBBF24]', dot: 'bg-[#FBBF24]' }
                          ) : (
                            step.difficulty === 'Easy' ? { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' } :
                            step.difficulty === 'Hard' ? { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500' } :
                            { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' }
                          );

                          return (
                            <div key={sIdx} className={`border rounded-xl transition-all duration-200 overflow-hidden ${th.cardInner}`}>
                              <button
                                type="button"
                                onClick={() => setExpandedRoadmapStep(isOpen ? null : sIdx)}
                                className={`w-full text-left px-4 py-3.5 flex items-center justify-between gap-3 cursor-pointer ${th.cardHover}`}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <span className={`text-[10px] font-mono ${th.textMuted} uppercase font-bold shrink-0`}>Step {step.step || sIdx + 1}</span>
                                    <span className={`font-mono text-[9px] px-2 py-0.5 rounded-full border font-bold shrink-0 ${diffColor.bg} ${diffColor.border} ${diffColor.text}`}>
                                      {step.difficulty || 'Medium'}
                                    </span>
                                    {step.time_estimate && (
                                      <span className={`text-[10px] font-mono ${th.textMuted} shrink-0`}>
                                        ⏱ {step.time_estimate}
                                      </span>
                                    )}
                                  </div>
                                  <span className={`text-xs font-bold ${th.textPrimary} leading-snug block`}>
                                    {step.action}
                                  </span>
                                  <span className={`text-[11px] ${th.textMuted} mt-0.5 block italic`}>{step.why_it_works}</span>
                                </div>
                                <div className={`shrink-0 w-6 h-6 rounded-md border flex items-center justify-center transition-all ${th.btnSecondary}`}>
                                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                                </div>
                              </button>

                              {isOpen && (
                                <div className={`px-4 pb-4 border-t space-y-3 pt-3.5 ${th.border}`}>
                                  {step.expected_result && (
                                    <div className={`border rounded-xl p-3.5 ${isDark ? 'bg-[#090A0F]' : 'bg-white'}`}>
                                      <div className="flex items-center gap-1.5 mb-1.5">
                                        <div className={`w-2 h-2 rounded-full ${diffColor.dot}`} />
                                        <span className={`text-[10px] font-mono uppercase ${th.textMuted} font-bold tracking-wider`}>Expected Result</span>
                                      </div>
                                      <p className={`text-xs ${th.textPrimary} font-semibold leading-relaxed`}>
                                        {step.expected_result}
                                      </p>
                                    </div>
                                  )}

                                  {step.success_signals?.length > 0 && (
                                    <div className={`border rounded-xl p-3.5 ${isDark ? 'bg-[#090A0F]' : 'bg-white'}`}>
                                      <span className={`text-[10px] font-mono uppercase ${th.textMuted} font-bold tracking-wider block mb-2`}>
                                        ✓ Success Signals — You are done when:
                                      </span>
                                      <div className="space-y-1.5">
                                        {step.success_signals.map((signal, sgIdx) => (
                                          <div key={sgIdx} className="flex items-start gap-2 text-xs">
                                            <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${diffColor.text}`} />
                                            <span className={`${th.textSecondary} leading-relaxed`}>{signal}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Frame-by-Frame Scripts Table */}
                  {blueprints.length > 0 && (
                    <div className={`border rounded-2xl p-6 space-y-4 ${th.card}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-blue-500" />
                          <h3 className={`font-heading font-extrabold text-sm ${th.textPrimary}`}>Scene-by-Scene Video Shooting Script</h3>
                        </div>
                        <FeatureHelp 
                          title="Shooting Script Teleprompter"
                          description="A scene-by-scene filming guide with shot angles, on-camera actions, spoken lines, and duration per scene."
                          align="right"
                        />
                      </div>

                      {blueprints[0]?.shooting_script?.length > 0 && (
                        <div className="overflow-x-auto">
                          <table className={`w-full text-left text-xs border rounded-xl overflow-hidden ${th.border}`}>
                            <thead className={`font-mono text-[10px] ${th.tableHead}`}>
                              <tr>
                                <th className="p-3 border-b">Scene</th>
                                <th className="p-3 border-b">Camera Shot</th>
                                <th className="p-3 border-b">On-Screen Action</th>
                                <th className="p-3 border-b">Dialogue / Voiceover</th>
                                <th className="p-3 border-b">Duration</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {blueprints[0].shooting_script.map((row, rIdx) => (
                                <tr key={rIdx} className={th.tableRow}>
                                  <td className={`p-3 font-mono ${th.textMuted} font-bold`}>{row.scene}</td>
                                  <td className={`p-3 ${th.textSecondary}`}>{row.shot_type}</td>
                                  <td className={`p-3 ${th.textSecondary}`}>{row.action}</td>
                                  <td className={`p-3 ${th.textPrimary} font-semibold`}>{row.dialogue_or_caption}</td>
                                  <td className={`p-3 font-mono ${th.textMuted}`}>{row.duration_seconds}s</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Required Equipment */}
                      {blueprints[0]?.equipment_needed?.length > 0 && (
                        <div className={`flex flex-wrap items-center gap-2 pt-3 border-t ${th.border}`}>
                          <span className={`text-[10px] font-mono ${th.textMuted} uppercase font-bold mr-1`}>Gear You Need:</span>
                          {blueprints[0].equipment_needed.map((eq, eIdx) => (
                            <span key={eIdx} className={`font-mono text-[11px] px-2.5 py-1 rounded-md border ${th.pillSecondary}`}>
                              {eq}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 5 Niche Piracy Upgrade Concepts */}
                  {piracyIdeas.length > 0 && (
                    <div className={`border rounded-2xl p-6 space-y-4 ${th.card}`}>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <h3 className={`font-heading font-extrabold text-sm ${th.textPrimary}`}>5 Ways to Beat Competitor Videos</h3>
                          <span className={`text-xs ${th.textMuted}`}>Turn competitor baselines into superior viral uploads</span>
                        </div>
                        <FeatureHelp 
                          title="Competitor Upgrade Concepts"
                          description="Take video formats that already got millions of views for competitors, and upgrade them to make yours 10x more compelling."
                          align="right"
                        />
                      </div>

                      <div className="space-y-3.5">
                        {piracyIdeas.map((idea, pIdx) => (
                          <div key={pIdx} className={`border rounded-xl p-4.5 text-xs space-y-3 ${th.cardInner}`}>
                            <div className="flex items-center justify-between">
                              <h4 className={`font-bold text-sm ${th.textPrimary}`}>
                                Upgrade #{idea.id || pIdx + 1}: {idea.your_upgrade_title}
                              </h4>
                              <span className={`font-mono text-[10px] px-2.5 py-0.5 rounded-full border ${th.pill}`}>
                                {idea.estimated_views}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-[#090A0F]' : 'bg-white'}`}>
                                <span className={`text-[10px] font-mono ${th.textMuted} uppercase block mb-1 font-bold`}>What the Competitor Did:</span>
                                <p className={th.textSecondary}>{idea.competitor_did}</p>
                              </div>
                              <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-[#090A0F]' : 'bg-white'}`}>
                                <span className={`text-[10px] font-mono ${th.textMuted} uppercase block mb-1 font-bold`}>Why Your Version Wins:</span>
                                <p className={th.textSecondary}>{idea.why_yours_wins}</p>
                              </div>
                            </div>
                            {idea.candidate_hooks?.length > 0 && (
                              <div className={`pt-2.5 border-t space-y-2 ${th.border}`}>
                                <span className={`text-[10px] font-mono ${th.textMuted} uppercase font-bold block`}>Opening Lines:</span>
                                {idea.candidate_hooks.map((phk, phIdx) => (
                                  <div key={phIdx} className={`flex items-center gap-2 text-xs ${th.textPrimary}`}>
                                    <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded border ${th.pill}`}>{phk.sid || `S${phIdx+1}`}</span>
                                    <span>{phk.text}</span>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const lines = idea.candidate_hooks.map(h => `${h.sid}: ${h.text}`).join('\n');
                                    setHooksText(`Piracy Upgrade (${idea.your_upgrade_title}):\n${lines}`);
                                    setActiveTab('simulator');
                                  }}
                                  className="mt-2 text-xs font-semibold text-blue-500 hover:text-blue-400 flex items-center gap-1.5 cursor-pointer"
                                >
                                  <span>Test these openers in Hook Tester</span> <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* TAB 4: VIEWER COMPLAINTS & DROP-OFFS                            */}
          {/* ─────────────────────────────────────────────────────────────── */}
          {activeTab === 'friction' && (
            <div className="space-y-6">
              {!intelData ? (
                <div className={`text-center py-20 border border-dashed rounded-2xl ${th.card} p-8 space-y-3`}>
                  <ShieldAlert className="w-10 h-10 mx-auto text-rose-500 opacity-40" />
                  <h3 className={`font-semibold text-sm ${th.textPrimary}`}>No Audience Feedback Scanned</h3>
                  <p className={`text-xs ${th.textSecondary}`}>Analyze a creator to review real viewer complaints and drop-off reasons.</p>
                </div>
              ) : (
                <>
                  <div className={`border rounded-2xl p-6 space-y-4 ${th.card}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={`font-heading font-extrabold text-sm ${th.textPrimary}`}>What Viewers Are Complaining About</h3>
                        <p className={`text-xs ${th.textSecondary} mt-0.5`}>Mined from comment sentiment and viewer drop-off analytics.</p>
                      </div>
                      <FeatureHelp 
                        title="Audience Criticisms"
                        description="Real criticisms collected from comment sentiment. Highlights what annoys viewers so your videos can avoid the same friction."
                        align="right"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                      {negativeReviews.map((rev, rIdx) => (
                        <div key={rIdx} className={`border rounded-xl p-4 text-xs space-y-2 ${th.cardInner}`}>
                          <div className="flex justify-between items-center">
                            <span className={`font-bold ${th.textPrimary}`}>{rev.criticism_category}</span>
                            <span className={`font-mono text-[9px] px-2 py-0.5 rounded-full border font-bold ${
                              rev.frequency === 'Common'
                                ? 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                                : 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                            }`}>
                              {rev.frequency}
                            </span>
                          </div>
                          {rev.audience_quote_example && (
                            <p className={`${th.textSecondary} italic leading-relaxed`}>"{rev.audience_quote_example}"</p>
                          )}
                          <span className={`text-[10px] ${th.textMuted} block font-medium`}>Channel Impact: {rev.impact_on_channel}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Counter-hook solutions */}
                  {improvementSuggestions.length > 0 && (
                    <div className={`border rounded-2xl p-6 space-y-4 ${th.card}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          <h3 className={`font-heading font-extrabold text-sm ${th.textPrimary}`}>How to Fix These Complaints in Your Videos</h3>
                        </div>
                        <FeatureHelp 
                          title="Counter-Hook Fixes"
                          description="Actionable ways to resolve audience complaints by changing your opening script and pacing."
                          align="right"
                        />
                      </div>

                      <div className="space-y-3">
                        {improvementSuggestions.map((imp, iIdx) => (
                          <div key={iIdx} className={`border rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5 text-xs ${th.cardInner}`}>
                            <div className="flex-1 space-y-1">
                              <span className={`text-[10px] font-mono ${th.textMuted} uppercase font-bold block`}>{imp.fix_title}</span>
                              <p className={`${th.textSecondary} leading-relaxed`}>{imp.fix_description}</p>
                              <span className={`${th.textPrimary} italic font-semibold block pt-0.5`}>"{imp.hook_upgrade}"</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const candLines = (imp.candidate_hooks && imp.candidate_hooks.length >= 3)
                                  ? imp.candidate_hooks.map(h => `${h.sid}: ${h.text}`).join('\n')
                                  : [
                                      `S1: ${imp.hook_upgrade}`,
                                      `S2: Stop making this fatal mistake with ${imp.fix_title}.`,
                                      `S3: I tested ${imp.fix_title} so you don't have to ruin your channel.`,
                                      `S4: The brutal truth about ${imp.problem} that nobody admits.`
                                    ].join('\n');
                                setHooksText(`Counter-Hook Upgrade (${imp.fix_title}):\n${candLines}`);
                                setActiveTab('simulator');
                              }}
                              className={`px-3.5 py-1.5 border rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${th.btnSecondary}`}
                            >
                              Test Fix in Hook Tester →
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* TAB 5: VIDEO HOOK TESTER & EARNINGS PREDICTOR                   */}
          {/* ─────────────────────────────────────────────────────────────── */}
          {activeTab === 'simulator' && (
            <div className="space-y-6">
              <div className={`border rounded-2xl p-6 space-y-4 ${th.card}`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h3 className={`font-heading font-extrabold text-base ${th.textPrimary}`}>Video Hook Tester (3-Second Scroll Stopper)</h3>
                    <p className={`text-xs ${th.textSecondary} mt-0.5`}>Calibrate candidate hooks across simulated audience demographics.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setHooksText(
                        "Creator: CarryMinati. Niche: Viral Roasts.\n" +
                        "S1: I found the fakest gym influencer on Instagram and confronted him.\n" +
                        "S2: Nobody noticed this millionaire YouTuber doing this in India...\n" +
                        "S3: If you watch motivational podcasts, I have terrible news for you.\n" +
                        "S4: This one video got 10 million views for the worst reason ever."
                      )}
                      className={`text-xs px-3 py-1.5 border rounded-lg transition cursor-pointer ${th.btnSecondary}`}
                    >
                      Load Example Hooks
                    </button>
                    <FeatureHelp 
                      title="Video Hook Simulator"
                      description="Simulate how viewers react to the first 3 seconds of your video to predict scroll-stopping retention and revenue."
                      tip="Hooks with scores above 4.0/5.0 have the highest probability of triggering algorithm recommendations."
                      align="right"
                    />
                  </div>
                </div>

                <textarea
                  value={hooksText}
                  onChange={(e) => setHooksText(e.target.value)}
                  rows={4}
                  placeholder="Paste candidate hooks here (e.g. S1: Did you know... S2: Stop doing this...)..."
                  className={`w-full rounded-xl p-3.5 text-xs font-mono outline-none border transition ${th.input}`}
                />

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
                  <div className={`flex items-center gap-3 text-xs ${th.textSecondary}`}>
                    <span className="font-mono text-[11px] font-bold">Test Audience: {sampleSize} Personas</span>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={sampleSize}
                      onChange={(e) => setSampleSize(Number(e.target.value))}
                      className={`w-36 cursor-pointer ${th.sliderTrack}`}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSimulate}
                    disabled={simulating || !hooksText.trim()}
                    className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${th.btnPrimary} disabled:opacity-50`}
                  >
                    {simulating ? 'Calibrating Test...' : 'Test These Opening Hooks'}
                  </button>
                </div>
              </div>


              {/* Send to Real Audience Panel */}
              <div className={`border rounded-2xl p-5 space-y-3 ${th.card}`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h4 className={`font-heading font-extrabold text-sm ${th.textPrimary}`}>
                      Send to Real Audience Panel
                    </h4>
                    <p className={`text-xs ${th.textSecondary} mt-0.5`}>
                      Post these hooks to the Cosmitude Bridge Panel for real human audience ratings.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSendToPanel}
                    disabled={sendingToPanel || !hooksText.trim()}
                    className={`shrink-0 px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${th.btnPrimary} disabled:opacity-50`}
                  >
                    {sendingToPanel ? 'Sending to Panel...' : 'Post to Real Audience ↗'}
                  </button>
                </div>
                {panelSendResult === 'success' && (
                  <div className="text-xs text-emerald-500 font-semibold p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                    Hooks posted to Bridge Panel! Audience members will rate them in the Cosmitude app.
                  </div>
                )}
                {panelSendResult === 'error' && (
                  <div className="text-xs text-rose-500 font-semibold p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
                    Failed to post. Check that the collector agent is running and the server is up.
                  </div>
                )}
              </div>

              {/* Simulation Output */}
              {simResults && (
                <div className="space-y-5">
                  {/* Test Confidence Badge */}
                  {simResults.confidence && (
                    <div className={`p-4 rounded-xl border text-xs flex items-center gap-2.5 ${
                      simResults.confidence[0] === 'LOW'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                        : simResults.confidence[0] !== 'OK'
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                    }`}>
                      <Check className="w-4 h-4 shrink-0" />
                      <span>Test Confidence: <strong>{simResults.confidence[0]}</strong> — {simResults.confidence[1]}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className={`border rounded-2xl p-5 space-y-2 ${th.card}`}>
                      <span className={`text-[10px] font-mono ${th.textMuted} uppercase font-bold block`}>
                        Estimated Earnings ({simResults.predictions.top_hook})
                      </span>
                      <div className={`text-2xl font-extrabold ${th.textPrimary}`}>
                        ₹{simResults.predictions.tot_rev_min.toLocaleString()} – ₹{simResults.predictions.tot_rev_max.toLocaleString()}
                        <span className={`text-xs ${th.textMuted} font-normal ml-2`}>(${simResults.predictions.tot_rev_usd_min.toLocaleString()} – ${simResults.predictions.tot_rev_usd_max.toLocaleString()})</span>
                      </div>
                      <div className={`text-[11px] ${th.textSecondary} space-y-1 pt-1 font-medium`}>
                        <div>Expected Views: <strong className={th.textPrimary}>{simResults.predictions.views_tier}</strong></div>
                        <div>AdSense Estimate: ₹{simResults.predictions.adsense_min.toLocaleString()} – ₹{simResults.predictions.adsense_max.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className={`border rounded-2xl p-5 space-y-2 ${th.card}`}>
                      <span className={`text-[10px] font-mono ${th.textMuted} uppercase font-bold block`}>Viral Potential Index</span>
                      <div className={`text-2xl font-extrabold text-blue-500`}>
                        {simResults.predictions.viral_index} / 100
                      </div>
                      <div className={`text-[11px] ${th.textSecondary} space-y-1 pt-1 font-medium`}>
                        <div>Viral Tier: <strong className={th.textPrimary}>{simResults.predictions.fame_label}</strong></div>
                        <div>Follower Projection: {simResults.predictions.subs_gain}</div>
                      </div>
                    </div>
                  </div>

                  {/* Visual Hook Ranking Distribution Bars */}
                  <div className={`border rounded-2xl p-6 space-y-4 text-xs ${th.card}`}>
                    <h4 className={`font-bold text-sm ${th.textPrimary}`}>Hook Retention Ranking</h4>

                    <div className="space-y-3.5">
                      {simResults.items.map((it, idx) => {
                        const scorePct = Math.min(100, Math.max(10, (it.score / 5.0) * 100));
                        const bestPct = Math.round(it.best * 100);
                        const worstPct = Math.round(it.worst * 100);
                        return (
                          <div key={idx} className={`border rounded-xl p-4 space-y-2.5 ${th.cardInner}`}>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                              <div className="flex items-start gap-2.5">
                                <span className={`font-mono text-[10px] px-2 py-0.5 rounded-md font-extrabold border ${th.pill}`}>{it.sid}</span>
                                <span className={`font-semibold ${th.textPrimary}`}>{it.hook_text}</span>
                              </div>
                              <div className={`font-mono text-xs ${th.textPrimary} shrink-0`}>
                                Score: <strong className="text-sm font-extrabold">{it.score.toFixed(2)}</strong> / 5.0
                              </div>
                            </div>

                            {/* Stop-Scroll Rating Score Bar */}
                            <div className="space-y-1">
                              <div className={`flex justify-between text-[10px] font-mono ${th.textMuted}`}>
                                <span>Attention-Grab Score</span>
                                <span>{scorePct.toFixed(0)}%</span>
                              </div>
                              <div className={`w-full h-2 rounded-full overflow-hidden border ${th.progressTrack}`}>
                                <div className={`h-full rounded-full ${th.progressBar}`} style={{ width: `${scorePct}%` }} />
                              </div>
                            </div>

                            {/* Polarization Split */}
                            <div className="grid grid-cols-2 gap-3 pt-1">
                              <div>
                                <div className={`flex justify-between text-[10px] font-mono ${th.textMuted} mb-1`}>
                                  <span className="text-emerald-500 font-bold">Loved By</span>
                                  <span>{bestPct}%</span>
                                </div>
                                <div className={`w-full h-1.5 rounded-full overflow-hidden border ${th.progressTrack}`}>
                                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${bestPct}%` }} />
                                </div>
                              </div>
                              <div>
                                <div className={`flex justify-between text-[10px] font-mono ${th.textMuted} mb-1`}>
                                  <span className="text-rose-500 font-bold">Skipped By</span>
                                  <span>{worstPct}%</span>
                                </div>
                                <div className={`w-full h-1.5 rounded-full overflow-hidden border ${th.progressTrack}`}>
                                  <div className="bg-rose-500 h-full rounded-full" style={{ width: `${worstPct}%` }} />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Detailed Ranking Data Table */}
                  <div className={`border rounded-2xl p-6 text-xs overflow-x-auto ${th.card}`}>
                    <h4 className={`font-bold ${th.textPrimary} mb-3`}>Detailed Calibration Metrics</h4>
                    <table className={`w-full text-left text-xs border rounded-xl overflow-hidden ${th.border}`}>
                      <thead className={`font-mono text-[10px] ${th.tableHead}`}>
                        <tr>
                          <th className="p-3 border-b">Hook ID</th>
                          <th className="p-3 border-b">Opening Line</th>
                          <th className="p-3 border-b">Rating</th>
                          <th className="p-3 border-b">Loved %</th>
                          <th className="p-3 border-b">Skipped %</th>
                          <th className="p-3 border-b">Clickbait %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {simResults.items.map((r, rIdx) => (
                          <tr key={rIdx} className={th.tableRow}>
                            <td className={`p-3 font-mono ${th.textMuted} font-bold`}>{r.sid}</td>
                            <td className={`p-3 font-medium ${th.textPrimary}`}>{r.hook_text}</td>
                            <td className={`p-3 font-mono font-extrabold ${th.textPrimary}`}>{r.score.toFixed(2)}</td>
                            <td className="p-3 font-mono text-emerald-500 font-semibold">{(r.best * 100).toFixed(0)}%</td>
                            <td className="p-3 font-mono text-rose-500 font-semibold">{(r.worst * 100).toFixed(0)}%</td>
                            <td className={`p-3 font-mono ${th.textMuted}`}>{(r.clickbait * 100).toFixed(0)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* TAB 6: AUDIENCE SIZE & AD RATES                                 */}
          {/* ─────────────────────────────────────────────────────────────── */}
          {activeTab === 'reach' && (
            <div className="space-y-6">
              {!intelData ? (
                <div className={`text-center py-20 border border-dashed rounded-2xl ${th.card} p-8 space-y-3`}>
                  <BarChart3 className="w-10 h-10 mx-auto text-blue-500 opacity-40" />
                  <h3 className={`font-semibold text-sm ${th.textPrimary}`}>No Audience Data Loaded</h3>
                  <p className={`text-xs ${th.textSecondary}`}>Analyze a creator in the command bar above to evaluate reach, demographics, and sponsorship rates.</p>
                </div>
              ) : (
                <>
                  {/* Platform Reach Metrics Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                    <div className={`border rounded-xl p-4 ${th.card}`}>
                      <span className={`text-[10px] font-mono ${th.textMuted} uppercase font-bold block`}>Total Reach</span>
                      <div className={`text-xl font-extrabold ${th.textPrimary} mt-1`}>{metrics.total_reach || '45M+'}</div>
                    </div>
                    <div className={`border rounded-xl p-4 ${th.card}`}>
                      <span className={`text-[10px] font-mono ${th.textMuted} uppercase font-bold block`}>YouTube Base</span>
                      <div className={`text-xl font-extrabold ${th.textPrimary} mt-1`}>{metrics.youtube_subscribers || '—'}</div>
                    </div>
                    <div className={`border rounded-xl p-4 ${th.card}`}>
                      <span className={`text-[10px] font-mono ${th.textMuted} uppercase font-bold block`}>Instagram Base</span>
                      <div className={`text-xl font-extrabold ${th.textPrimary} mt-1`}>{metrics.instagram_followers || '—'}</div>
                    </div>
                    <div className={`border rounded-xl p-4 ${th.card}`}>
                      <span className={`text-[10px] font-mono ${th.textMuted} uppercase font-bold block`}>Engagement</span>
                      <div className={`text-xl font-extrabold text-blue-500 mt-1`}>{metrics.engagement_rate || '—'}</div>
                    </div>
                    <div className={`border rounded-xl p-4 col-span-2 sm:col-span-1 ${th.card}`}>
                      <span className={`text-[10px] font-mono ${th.textMuted} uppercase font-bold block`}>Upload Cadence</span>
                      <div className={`text-xs font-bold ${th.textPrimary} mt-1.5`}>{metrics.youtube_cadence || 'Regular'}</div>
                    </div>
                  </div>

                  {/* Commercial Rate Card Estimates */}
                  <div className={`border rounded-2xl p-6 space-y-4 ${th.card}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <DollarSign className="w-4 h-4 text-emerald-500" />
                        <h3 className={`font-heading font-extrabold text-sm ${th.textPrimary}`}>Sponsorship Price Guide (What Brands Pay)</h3>
                      </div>
                      <FeatureHelp 
                        title="Sponsorship Pricing Guide"
                        description="Estimated prices brands pay to sponsor a dedicated YouTube video, an Instagram Reel, or an Instagram story series."
                        align="right"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div className={`border rounded-xl p-4 ${th.cardInner}`}>
                        <span className={`text-[10px] font-mono ${th.textMuted} uppercase block mb-1 font-bold`}>Dedicated YouTube Video</span>
                        <span className="text-lg font-extrabold text-emerald-500">{rateCard.est_youtube_rate || '₹35L - ₹75L'}</span>
                      </div>
                      <div className={`border rounded-xl p-4 ${th.cardInner}`}>
                        <span className={`text-[10px] font-mono ${th.textMuted} uppercase block mb-1 font-bold`}>Instagram Dedicated Reel</span>
                        <span className="text-lg font-extrabold text-emerald-500">{rateCard.est_instagram_reel_rate || '₹12L - ₹25L'}</span>
                      </div>
                      <div className={`border rounded-xl p-4 ${th.cardInner}`}>
                        <span className={`text-[10px] font-mono ${th.textMuted} uppercase block mb-1 font-bold`}>Instagram Story Series</span>
                        <span className="text-lg font-extrabold text-emerald-500">{rateCard.est_story_rate || '₹3L - ₹6L'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
                      <div className={`border rounded-xl p-4 space-y-3 ${th.cardInner}`}>
                        <span className={`text-[10px] font-mono ${th.textMuted} uppercase font-bold block`}>Best Sponsor Types</span>
                        <div className="flex flex-wrap gap-1.5">
                          {rateCard.brand_affinity_niches?.map((nch, nIdx) => (
                            <span key={nIdx} className={`px-2.5 py-1 rounded-md border text-[11px] ${th.pillSecondary}`}>
                              {nch}
                            </span>
                          ))}
                        </div>
                        {rateCard.past_or_likely_sponsors?.length > 0 && (
                          <div className={`pt-2.5 border-t ${th.border}`}>
                            <span className={`text-[10px] font-mono ${th.textMuted} uppercase block mb-1 font-bold`}>Known Brand Sponsors:</span>
                            <span className={`font-semibold ${th.textPrimary}`}>{rateCard.past_or_likely_sponsors.join(', ')}</span>
                          </div>
                        )}
                      </div>

                      <div className={`border rounded-xl p-4 ${th.cardInner}`}>
                        <span className={`text-[10px] font-mono ${th.textMuted} uppercase font-bold block mb-1`}>Why Brands Love Sponsoring Them</span>
                        <p className={`${th.textSecondary} leading-relaxed`}>{rateCard.why_brands_partner || 'Delivers high conversion resonance with youth audience.'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Audience Demographics Breakdown */}
                  <div className={`border rounded-2xl p-6 space-y-4 ${th.card}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Users className="w-4 h-4 text-blue-500" />
                        <h3 className={`font-heading font-extrabold text-sm ${th.textPrimary}`}>Who Watches This Creator (Demographics)</h3>
                      </div>
                      <FeatureHelp 
                        title="Audience Demographics"
                        description="Geographic breakdown of viewers, age cohort distribution, and gender split."
                        align="right"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Top Countries */}
                      <div className={`border rounded-xl p-4 space-y-3 ${th.cardInner}`}>
                        <span className={`text-[10px] font-mono ${th.textMuted} uppercase block font-bold`}>Top Geographic Countries</span>
                        <div className="space-y-2">
                          {demographics.top_countries?.map((c, cIdx) => (
                            <div key={cIdx} className="space-y-1">
                              <div className="flex justify-between text-[11px]">
                                <span className={`font-semibold ${th.textPrimary}`}>{c.country}</span>
                                <span className={`font-mono ${th.textMuted}`}>{c.share}</span>
                              </div>
                              <div className={`w-full h-1.5 rounded-full overflow-hidden border ${th.progressTrack}`}>
                                <div
                                  className={`h-full rounded-full ${th.progressBar}`}
                                  style={{ width: `${c.share || '20%'}` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Age & Gender Demographics */}
                      <div className="space-y-3.5">
                        <div className={`border rounded-xl p-4 ${th.cardInner}`}>
                          <span className={`text-[10px] font-mono ${th.textMuted} uppercase block mb-1 font-bold`}>Primary Age Group</span>
                          <span className={`text-base font-extrabold ${th.textPrimary}`}>{demographics.primary_age || '18-24 (Gen Z)'}</span>
                        </div>
                        <div className={`border rounded-xl p-4 ${th.cardInner}`}>
                          <span className={`text-[10px] font-mono ${th.textMuted} uppercase block mb-1 font-bold`}>Gender Split</span>
                          <span className={`text-base font-extrabold ${th.textPrimary}`}>{demographics.gender_skew || '76% Male / 24% Female'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ─── AUTHENTICATION MODAL ──────────────────────────────────────────── */}
      {authModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-popover">
          <div className={`border rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 ${th.modalBg}`}>
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h3 className={`font-heading font-extrabold text-sm ${th.textPrimary}`}>
                {authMode === 'login' ? 'Sign In to Your Workspace' : 'Create Account'}
              </h3>
              <button
                onClick={() => setAuthModalOpen(false)}
                className={`${th.textMuted} hover:${th.textPrimary} text-sm cursor-pointer p-1 rounded-md`}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-3.5 text-xs">
              <div>
                <label className={`block text-[10px] font-mono ${th.textMuted} uppercase mb-1 font-bold`}>Username</label>
                <input
                  type="text"
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  placeholder="e.g. asuja"
                  className={`w-full rounded-xl p-3 outline-none border transition ${th.input}`}
                />
              </div>
              <div>
                <label className={`block text-[10px] font-mono ${th.textMuted} uppercase mb-1 font-bold`}>Access PIN</label>
                <input
                  type="password"
                  value={authPin}
                  onChange={(e) => setAuthPin(e.target.value)}
                  placeholder="3-4 digits"
                  className={`w-full rounded-xl p-3 outline-none border transition ${th.input}`}
                />
              </div>

              {authError && <div className="text-[11px] text-rose-500 font-semibold">{authError}</div>}

              <button
                type="submit"
                className={`w-full py-3 rounded-xl font-bold transition cursor-pointer ${th.btnPrimary}`}
              >
                {authMode === 'login' ? 'Sign In' : 'Create Profile'}
              </button>
            </form>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'signup' : 'login');
                  setAuthError('');
                }}
                className={`text-[11px] ${th.textSecondary} hover:${th.textPrimary} cursor-pointer font-medium transition`}
              >
                {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
