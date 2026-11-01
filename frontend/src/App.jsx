import React, { useState, useEffect } from 'react';
import {
  Film, Sparkles, Layers, ShieldAlert, Target, BarChart3,
  Search, ArrowRight, ExternalLink, Check, Copy, User,
  LogOut, RefreshCw, ChevronRight, Swords, Compass, Lock,
  Play, Clock, DollarSign, TrendingUp, HelpCircle, AlertCircle
} from 'lucide-react';

const PRESET_CREATORS = [
  { name: 'CarryMinati', niche: 'Comedy & Roasts' },
  { name: 'MrBeast', niche: 'High-Stakes Challenges' },
  { name: 'Dhruv Rathee', niche: 'Explanatory Journalism' },
  { name: 'Aakash Dhawan', niche: 'Motovlogging & Lifestyle' },
  { name: 'Ryan Trahan', niche: 'Documentary Storytelling' }
];

export default function App() {
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

  // Suggestion lookup (fills fields only, NEVER auto-analyzes)
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

  // Restore cached run instantly without re-calling LLM
  const handleLoadCached = async (targetCreator, targetComp) => {
    if (!user) return;
    setCreatorName(targetCreator);
    if (targetComp) setComparisonCreator(targetComp);
    setLoading(true);
    setStatusText(`Restoring cached dossier for ${targetCreator}...`);
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

  // Explicit Analyze action — ONLY runs when user clicks button or presses Enter
  const handleAnalyze = async () => {
    const target = creatorName.trim();
    if (!target) return;

    setLoading(true);
    setErrorBanner('');
    setStatusStep(1);
    setStatusText(`Reconnaissance: Scanning verified web & video footprint for ${target}...`);
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
        setStatusText(`🌐 Step 1/4: Multi-platform web & video reconnaissance (Firecrawl)... (${elapsed}s)`);
      } else if (elapsed < 20) {
        setStatusStep(2);
        setStatusText(`🧬 Step 2/4: Profiling demographics, engagement & rate cards... (${elapsed}s)`);
      } else if (elapsed < 32) {
        setStatusStep(3);
        setStatusText(`🎬 Step 3/4: Reverse-engineering hook formulas & peer benchmarks... (${elapsed}s)`);
      } else {
        setStatusStep(4);
        setStatusText(`💡 Step 4/4: Synthesizing 5 viral concepts & shooting blueprints... (${elapsed}s)`);
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

  // Universal Video Player (Supports YouTube, Shorts, Instagram, TikTok)
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
        <div className="w-full aspect-video rounded-lg overflow-hidden bg-[#0A0C10] border border-[#212533]">
          {vidId ? (
            <iframe
              src={`https://www.youtube.com/embed/${vidId}`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={title || 'YouTube Stream'}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <a href={cleanUrl} target="_blank" rel="noreferrer" className="text-xs text-[#8E95A5] hover:text-[#E2E5EE] flex items-center gap-1">
                Open YouTube Stream <ExternalLink className="w-3.5 h-3.5" />
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
        <div className="w-full rounded-lg overflow-hidden bg-[#0A0C10] border border-[#212533] p-2 text-center">
          {code ? (
            <iframe
              src={`https://www.instagram.com/reel/${code}/embed`}
              className="w-full h-80 border-0 rounded"
              scrolling="no"
              allowFullScreen
              title={title || 'Instagram Reel'}
            />
          ) : (
            <div className="py-8">
              <a href={cleanUrl} target="_blank" rel="noreferrer" className="text-xs text-[#8E95A5] hover:text-[#E2E5EE] inline-flex items-center gap-1">
                View on Instagram <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="p-4 bg-[#11131A] border border-[#212533] rounded-lg text-center">
        <a href={cleanUrl} target="_blank" rel="noreferrer" className="text-xs text-[#8E95A5] hover:text-[#E2E5EE] inline-flex items-center gap-1">
          Open Media Link ({title || cleanUrl}) <ExternalLink className="w-3 h-3" />
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
    <div className="min-h-screen flex bg-[#0D0F14] text-[#E2E5EE]">
      {/* ─── LEFT SIDEBAR NAVIGATION (240px) ──────────────────────────────── */}
      <aside className="w-60 bg-[#11131A] border-r border-[#212533] flex flex-col justify-between shrink-0 select-none hidden md:flex">
        <div>
          {/* Brand header */}
          <div className="h-14 border-b border-[#212533] px-4 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-[#252A38] border border-[#31374A] flex items-center justify-center font-bold text-xs text-[#E2E5EE]">
              P
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-bold text-xs tracking-tight text-[#E2E5EE]">PARALLEL</span>
                <span className="font-mono text-[9px] px-1 rounded bg-[#181B24] border border-[#262A38] text-[#8E95A5]">2.4</span>
              </div>
              <div className="text-[10px] text-[#5E6577]">Creator Intelligence OS</div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            {[
              { id: 'dossier', label: 'Executive Dossier', icon: Film },
              { id: 'ideas', label: 'Viral Content Studio (5)', icon: Sparkles },
              { id: 'blueprints', label: 'Style DNA & Blueprints', icon: Layers },
              { id: 'friction', label: 'Audience Friction Audit', icon: ShieldAlert },
              { id: 'simulator', label: 'Hook Simulator & Economics', icon: Target },
              { id: 'reach', label: 'Reach & Commercials', icon: BarChart3 }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition ${
                    isActive
                      ? 'bg-[#1C202C] text-[#E2E5EE] border border-[#2B3042]'
                      : 'text-[#8E95A5] hover:text-[#E2E5EE] hover:bg-[#151821] border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#8E95A5]' : 'text-[#5E6577]'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Search History */}
          {user && userHistory.length > 0 && (
            <div className="p-3 border-t border-[#212533]">
              <div className="text-[10px] font-mono uppercase text-[#5E6577] mb-2 px-1">
                Saved Sessions
              </div>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {userHistory.map((h, idx) => (
                  <button
                    key={h.id || idx}
                    type="button"
                    onClick={() => handleLoadCached(h.creator_name, h.comparison_creator || '')}
                    className="w-full text-left px-2 py-1 text-[11px] text-[#8E95A5] hover:text-[#E2E5EE] hover:bg-[#151821] rounded truncate block transition"
                  >
                    {h.creator_name} {h.comparison_creator ? `vs ${h.comparison_creator}` : ''}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Card */}
        <div className="p-3 border-t border-[#212533]">
          {user ? (
            <div className="flex items-center justify-between bg-[#151821] border border-[#212533] rounded-md p-2">
              <div className="truncate">
                <span className="text-[10px] text-[#5E6577] block font-mono">Connected</span>
                <span className="text-xs font-medium text-[#E2E5EE] truncate">@{user}</span>
              </div>
              <button
                onClick={() => setUser(null)}
                className="text-[#8E95A5] hover:text-[#E2E5EE] p-1 rounded"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="w-full py-1.5 px-2.5 rounded bg-[#181B24] hover:bg-[#1D212D] border border-[#2B3042] text-[#8E95A5] hover:text-[#E2E5EE] text-xs font-medium flex items-center justify-center gap-1.5 transition"
            >
              <Lock className="w-3 h-3" /> Account / Bridge Store
            </button>
          )}
        </div>
      </aside>

      {/* ─── MAIN CONTENT VIEWPORT ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-14 bg-[#11131A] border-b border-[#212533] px-5 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <span className="font-heading font-semibold text-xs text-[#E2E5EE]">PARALLEL CREATOR OS</span>
            <span className="text-xs text-[#5E6577] hidden sm:inline">· Continuous Creator Intelligence &amp; Retention Decoupler</span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-[#5E6577] shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B7A57] animate-pulse"></span>
            <span>Groq LPU (GPT-OSS-120B)</span>
          </div>
        </header>

        {/* Workspace Body Canvas */}
        <main className="p-6 max-w-6xl w-full mx-auto space-y-6">
          {/* Dismissible Error Banner */}
          {errorBanner && (
            <div className="p-3 bg-[#24171A] border border-[#52252C] rounded-lg flex items-center justify-between text-xs text-[#F28B82]">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#F28B82] shrink-0" />
                <span>{errorBanner}</span>
              </div>
              <button onClick={() => setErrorBanner('')} className="text-[#8E95A5] hover:text-[#E2E5EE] text-xs px-2 py-0.5 rounded">
                Dismiss
              </button>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* RECONNAISSANCE & DECOUPLING CONSOLE (Inputs ONLY fill; click to run)*/}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          <div className="bg-[#151821] border border-[#212533] rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-[#212533]">
              <div>
                <h2 className="font-heading font-semibold text-sm text-[#E2E5EE] tracking-tight">
                  Reconnaissance &amp; Decoupling Console
                </h2>
                <p className="text-xs text-[#8E95A5]">Multi-platform web scrape + Groq LPU neural synthesis</p>
              </div>
              <span className="text-[11px] font-mono text-[#5E6577]">
                Live Footprint Crawl
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Target Creator Input */}
              <div className="md:col-span-5 relative">
                <label className="block text-[10px] font-mono uppercase text-[#5E6577] mb-1 font-semibold">
                  Target Creator (To Clone) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={creatorName}
                    onChange={(e) => setCreatorName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                    placeholder="e.g. CarryMinati, MrBeast, Aakash Dhawan"
                    className="w-full bg-[#11131A] border border-[#212533] focus:border-[#4F6382] rounded-md px-3 py-2 text-xs text-[#E2E5EE] placeholder-[#5E6577] outline-none transition"
                  />
                  {suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-[#151821] border border-[#2B3042] rounded-md shadow-2xl z-50 max-h-48 overflow-y-auto">
                      {suggestions.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setCreatorName(s.name);
                            if (s.niche) setNiche(s.niche);
                            setSuggestions([]);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-[#8E95A5] hover:text-[#E2E5EE] hover:bg-[#1C202C] border-b border-[#212533] last:border-0 flex justify-between"
                        >
                          <span className="font-medium text-[#E2E5EE]">{s.name}</span>
                          <span className="text-[10px] text-[#5E6577]">{s.niche}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Benchmark Rival Input */}
              <div className="md:col-span-4">
                <label className="block text-[10px] font-mono uppercase text-[#5E6577] mb-1 font-semibold">
                  Benchmark Creator (Optional Rival)
                </label>
                <input
                  type="text"
                  value={comparisonCreator}
                  onChange={(e) => setComparisonCreator(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                  placeholder="e.g. Ashish Chanchlani, Ryan Trahan"
                  className="w-full bg-[#11131A] border border-[#212533] focus:border-[#4F6382] rounded-md px-3 py-2 text-xs text-[#E2E5EE] placeholder-[#5E6577] outline-none transition"
                />
              </div>

              {/* Category / Niche Input */}
              <div className="md:col-span-3">
                <label className="block text-[10px] font-mono uppercase text-[#5E6577] mb-1 font-semibold">
                  Category / Niche (Optional)
                </label>
                <input
                  type="text"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                  placeholder="e.g. Comedy, Motovlog, Tech"
                  className="w-full bg-[#11131A] border border-[#212533] focus:border-[#4F6382] rounded-md px-3 py-2 text-xs text-[#E2E5EE] placeholder-[#5E6577] outline-none transition"
                />
              </div>
            </div>

            {/* Quick Preset Chips (Fills fields ONLY — does NOT auto-analyze) */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-[#5E6577] mr-1">Suggested Targets:</span>
              {PRESET_CREATORS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCreatorName(p.name);
                    setNiche(p.niche);
                  }}
                  className="px-2.5 py-1 rounded bg-[#11131A] hover:bg-[#1A1D28] text-[#8E95A5] hover:text-[#E2E5EE] border border-[#212533] transition text-[11px]"
                >
                  {p.name} <span className="text-[9px] text-[#5E6577]">({p.niche})</span>
                </button>
              ))}
            </div>

            {/* Explicit Action Button */}
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading || !creatorName.trim()}
              className="w-full py-2.5 px-4 rounded-lg bg-[#252A38] hover:bg-[#2D3344] disabled:opacity-50 text-xs font-semibold text-[#E2E5EE] border border-[#31374A] transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#8E95A5]" />
                  <span>Executing Deep Analysis &amp; Decoupling Formula...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#8E95A5]" />
                  <span>Execute Deep Analysis &amp; Decouple Formula</span>
                </>
              )}
            </button>
          </div>

          {/* Multi-step loading widget */}
          {loading && (
            <div className="p-4 bg-[#151821] border border-[#2B3042] rounded-xl space-y-3 shadow-sm">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-[#E2E5EE] font-medium">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#8E95A5]" />
                  <span>{statusText || 'Deconstructing digital footprint and audience retention...'}</span>
                </div>
                <span className="font-mono text-[11px] text-[#5E6577]">
                  {elapsedSeconds}s elapsed · avg ~35s
                </span>
              </div>
              <div className="w-full bg-[#11131A] h-1.5 rounded-full overflow-hidden border border-[#212533]">
                <div
                  className="bg-[#4F6382] h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${Math.min(95, Math.max(12, statusStep * 24 + Math.min(15, elapsedSeconds)))}%`
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-[#5E6577]">
                <span className={statusStep >= 1 ? 'text-[#8E95A5]' : ''}>1. Recon</span>
                <span className={statusStep >= 2 ? 'text-[#8E95A5]' : ''}>2. Demographics</span>
                <span className={statusStep >= 3 ? 'text-[#8E95A5]' : ''}>3. Hook Formulas</span>
                <span className={statusStep >= 4 ? 'text-[#8E95A5]' : ''}>4. Concepts &amp; Blueprints</span>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* TAB 1: EXECUTIVE DOSSIER                                         */}
          {/* ─────────────────────────────────────────────────────────────── */}
          {activeTab === 'dossier' && (
            <div className="space-y-5">
              {!intelData ? (
                <div className="text-center py-16 text-[#5E6577] border border-dashed border-[#212533] rounded-xl">
                  <Film className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">Specify a target creator above and click "Execute Deep Analysis" to generate the Executive Dossier.</p>
                </div>
              ) : (
                <>
                  {/* Executive Header Card */}
                  <div className="bg-[#151821] border border-[#212533] rounded-xl p-5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover border border-[#2B3042]" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-[#1E222D] flex items-center justify-center text-xl">👤</div>
                      )}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-heading font-bold text-lg text-[#E2E5EE]">{profile.name}</h2>
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#1D212D] text-[#8E95A5] border border-[#2B3042]">
                            {profile.tier || 'Macro'}
                          </span>
                        </div>
                        <div className="text-xs text-[#8E95A5] space-x-3">
                          <span>Niche: <strong className="text-[#E2E5EE]">{profile.core_niche || 'Digital Content'}</strong></span>
                          <span>•</span>
                          <span>Region: <strong className="text-[#E2E5EE]">{profile.location || 'India'}</strong></span>
                        </div>
                        {/* Verified Handles Pills */}
                        {profile.discovered_accounts?.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[10px] font-mono text-[#5E6577] uppercase mr-1">Verified:</span>
                            {profile.discovered_accounts.map((acc, aIdx) => (
                              <a
                                key={aIdx}
                                href={acc.url || '#'}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2 py-0.5 rounded bg-[#11131A] border border-[#212533] text-[10px] text-[#8E95A5] hover:text-[#E2E5EE] inline-flex items-center gap-1 transition"
                              >
                                <span>{acc.platform}: {acc.title}</span>
                                {acc.url && <ExternalLink className="w-2.5 h-2.5" />}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-4 border-t border-[#212533]">
                      <div className="bg-[#11131A] border border-[#212533] rounded-lg p-3 text-xs">
                        <div className="text-[10px] font-mono text-[#5E6577] uppercase mb-1">Delivery Rhythm &amp; Style</div>
                        <p className="text-[#8E95A5]">{profile.tone_and_style || 'High-energy, satirical, engaging delivery.'}</p>
                      </div>
                      <div className="bg-[#11131A] border border-[#212533] rounded-lg p-3 text-xs">
                        <div className="text-[10px] font-mono text-[#5E6577] uppercase mb-1">Audience Persona</div>
                        <p className="text-[#8E95A5]">{profile.audience_vibe || 'Young, college, mobile-first community.'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Head-to-Head Comparative Duel */}
                  {h2h && (
                    <div className="bg-[#151821] border border-[#212533] rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Swords className="w-4 h-4 text-[#8E95A5]" />
                        <h3 className="font-heading font-semibold text-sm text-[#E2E5EE]">
                          Head-to-Head Duel: {profile.name} vs {h2h.benchmark_creator}
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-3">
                        <div className="bg-[#11131A] border border-[#212533] rounded-lg p-3">
                          <span className="text-[10px] font-mono text-[#5E6577] uppercase block mb-1">{profile.name} Retention Edge</span>
                          <p className="text-[#8E95A5]">{h2h.target_style_edge}</p>
                        </div>
                        <div className="bg-[#11131A] border border-[#212533] rounded-lg p-3">
                          <span className="text-[10px] font-mono text-[#5E6577] uppercase block mb-1">{h2h.benchmark_creator} Retention Vulnerability</span>
                          <p className="text-[#8E95A5]">{h2h.benchmark_weakness}</p>
                        </div>
                      </div>

                      {h2h.hook_contrast?.winning_hybrid_hook && (
                        <div className="bg-[#11131A] border border-[#2B3042] rounded-lg p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div>
                            <span className="text-[10px] font-mono text-[#5E6577] uppercase block">Winning Hybrid Hook</span>
                            <span className="text-xs text-[#E2E5EE] italic">"{h2h.hook_contrast.winning_hybrid_hook}"</span>
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
                            className="px-3 py-1 bg-[#252A38] hover:bg-[#2D3344] border border-[#31374A] text-xs text-[#E2E5EE] rounded transition shrink-0"
                          >
                            Send 4-Hook Contrast Duel to Simulator →
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Creator's Proven Uploads (Watch & Deconstruct with selector) */}
                  {creatorVideos.length > 0 && (
                    <div className="bg-[#151821] border border-[#212533] rounded-xl p-5 space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <h3 className="font-heading font-semibold text-sm text-[#E2E5EE]">
                          Creator Proven Uploads ({creatorVideos.length} Uploads Deconstructed)
                        </h3>
                        <span className="text-[11px] font-mono text-[#5E6577]">Click upload to watch &amp; analyze</span>
                      </div>

                      {/* Video selector pills */}
                      <div className="flex flex-wrap gap-1.5">
                        {creatorVideos.map((v, vIdx) => (
                          <button
                            key={vIdx}
                            type="button"
                            onClick={() => setSelectedUploadIdx(vIdx)}
                            className={`px-2.5 py-1 rounded text-xs transition border text-left truncate max-w-xs ${
                              selectedUploadIdx === vIdx
                                ? 'bg-[#252A38] text-[#E2E5EE] border-[#4F6382]'
                                : 'bg-[#11131A] text-[#8E95A5] hover:text-[#E2E5EE] border-[#212533]'
                            }`}
                          >
                            <span className="font-mono text-[10px] text-[#5E6577] mr-1">[{v.platform || 'Video'}]</span>
                            {v.title || `Upload #${vIdx + 1}`}
                          </button>
                        ))}
                      </div>

                      {/* Active video player & metrics */}
                      {creatorVideos[selectedUploadIdx] && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
                          <div className="lg:col-span-7">
                            {renderVideo(creatorVideos[selectedUploadIdx].url, creatorVideos[selectedUploadIdx].title)}
                          </div>
                          <div className="lg:col-span-5 space-y-3 text-xs">
                            <div className="bg-[#11131A] border border-[#212533] rounded-lg p-3">
                              <span className="text-[10px] font-mono text-[#5E6577] uppercase block mb-1">Views Benchmark</span>
                              <span className="text-sm font-semibold text-[#E2E5EE]">{creatorVideos[selectedUploadIdx].views || 'High Engagement'}</span>
                            </div>
                            <div className="bg-[#11131A] border border-[#212533] rounded-lg p-3">
                              <span className="text-[10px] font-mono text-[#5E6577] uppercase block mb-1">Opening 3-Sec Hook</span>
                              <p className="text-[#E2E5EE] italic">"{creatorVideos[selectedUploadIdx].opening_hook || '—'}"</p>
                            </div>
                            <div className="bg-[#11131A] border border-[#212533] rounded-lg p-3">
                              <span className="text-[10px] font-mono text-[#5E6577] uppercase block mb-1">Why It Held Attention</span>
                              <p className="text-[#8E95A5]">{creatorVideos[selectedUploadIdx].why_it_went_viral || '—'}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Peer Niche Trending Videos from Other Creators */}
                  {peerVideos.length > 0 && (
                    <div className="bg-[#151821] border border-[#212533] rounded-xl p-5 space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <h3 className="font-heading font-semibold text-sm text-[#E2E5EE]">
                          Peer Trending Videos in this Niche ({peerVideos.length} Uploads by Others)
                        </h3>
                        <span className="text-[11px] font-mono text-[#5E6577]">Category benchmarks</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {peerVideos.map((pv, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => setSelectedPeerIdx(pIdx)}
                            className={`px-2.5 py-1 rounded text-xs transition border text-left truncate max-w-xs ${
                              selectedPeerIdx === pIdx
                                ? 'bg-[#252A38] text-[#E2E5EE] border-[#4F6382]'
                                : 'bg-[#11131A] text-[#8E95A5] hover:text-[#E2E5EE] border-[#212533]'
                            }`}
                          >
                            <span className="font-mono text-[10px] text-[#5E6577] mr-1">[{pv.platform || 'Peer'}]</span>
                            {pv.title || `Peer #${pIdx + 1}`}
                          </button>
                        ))}
                      </div>

                      {peerVideos[selectedPeerIdx] && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
                          <div className="lg:col-span-7">
                            {renderVideo(peerVideos[selectedPeerIdx].url, peerVideos[selectedPeerIdx].title)}
                          </div>
                          <div className="lg:col-span-5 space-y-3 text-xs">
                            <div className="bg-[#11131A] border border-[#212533] rounded-lg p-3">
                              <span className="text-[10px] font-mono text-[#5E6577] uppercase block mb-1">Peer Views</span>
                              <span className="text-sm font-semibold text-[#E2E5EE]">{peerVideos[selectedPeerIdx].views || 'Trending Wave'}</span>
                            </div>
                            <div className="bg-[#11131A] border border-[#212533] rounded-lg p-3">
                              <span className="text-[10px] font-mono text-[#5E6577] uppercase block mb-1">Their Opening Hook</span>
                              <p className="text-[#E2E5EE] italic">"{peerVideos[selectedPeerIdx].opening_hook || '—'}"</p>
                            </div>
                            <div className="bg-[#11131A] border border-[#212533] rounded-lg p-3">
                              <span className="text-[10px] font-mono text-[#5E6577] uppercase block mb-1">Adapt-Hook Template</span>
                              <p className="text-[#8E95A5]">{peerVideos[selectedPeerIdx].adapt_hook_template || '—'}</p>
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
          {/* TAB 2: VIRAL CONCEPTS (5)                                       */}
          {/* ─────────────────────────────────────────────────────────────── */}
          {activeTab === 'ideas' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h3 className="font-heading font-semibold text-sm text-[#E2E5EE]">5 Content Concepts with 4 Hook Archetypes</h3>
                  <p className="text-xs text-[#8E95A5]">Engineered for short-form retention pacing with playable reference benchmarks.</p>
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
                    className="px-3 py-1.5 bg-[#252A38] hover:bg-[#2D3344] border border-[#31374A] text-xs text-[#E2E5EE] rounded transition"
                  >
                    🚀 Push ALL 5 Concepts to Simulator →
                  </button>
                )}
              </div>

              {suggestionsList.length === 0 ? (
                <div className="text-center py-16 text-[#5E6577] border border-dashed border-[#212533] rounded-xl">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">Analyze a creator in the console above to generate viral concepts.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {suggestionsList.map((item, idx) => (
                    <div key={idx} className="bg-[#151821] border border-[#212533] rounded-xl p-5 space-y-3">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#1D212D] text-[#8E95A5] border border-[#2B3042]">
                              CONCEPT #{item.id || idx + 1}
                            </span>
                            <span className="text-[11px] text-[#8E95A5] font-mono">{item.trending_topic}</span>
                          </div>
                          <h4 className="font-heading font-semibold text-sm text-[#E2E5EE]">{item.title}</h4>
                          <p className="text-xs text-[#8E95A5] mt-1">{item.why_it_works}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-mono text-[#5E6577] block uppercase">Est. Views</span>
                          <span className="text-xs font-semibold text-[#E2E5EE]">{item.estimated_views}</span>
                        </div>
                      </div>

                      {/* Reference Benchmark Video Player (Restored from app.py) */}
                      {item.reference_video?.url && (
                        <div className="bg-[#11131A] border border-[#212533] rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono text-[10px] text-[#5E6577] uppercase">
                              Reference Benchmark: {item.reference_video.title} ({item.reference_video.creator || 'Benchmark'})
                            </span>
                            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#1D212D] text-[#8E95A5]">
                              {item.reference_video.platform || 'Video'}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                            <div className="md:col-span-6">
                              {renderVideo(item.reference_video.url, item.reference_video.title)}
                            </div>
                            <div className="md:col-span-6 text-xs text-[#8E95A5]">
                              <span className="text-[10px] font-mono text-[#5E6577] block uppercase mb-1">Strategic Rationale</span>
                              <p>{item.reference_video.why_reference || 'Demonstrates category retention pacing and curiosity payoff.'}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 4 Hook Archetypes */}
                      <div className="pt-3 border-t border-[#212533] space-y-1.5">
                        <span className="text-[10px] font-mono uppercase text-[#5E6577] block">4 Hook Archetypes (3-Sec Retention Pacing):</span>
                        {item.candidate_hooks?.map((hk, hIdx) => {
                          const archetypes = ['INCIDENT', 'CURIOSITY', 'SHOCK', 'CONTRARIAN'];
                          const arch = archetypes[hIdx % archetypes.length];
                          const hookKey = `h-${idx}-${hIdx}`;
                          return (
                            <div key={hIdx} className="bg-[#11131A] border border-[#212533] rounded p-2.5 flex items-center justify-between gap-3 text-xs">
                              <div className="flex items-start gap-2">
                                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#1D212D] text-[#8E95A5] font-bold">{hk.sid || `S${hIdx + 1}`}</span>
                                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#1D212D] text-[#5E6577] uppercase">{arch}</span>
                                <span className="text-[#E2E5EE]">{hk.text}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => copyText(hk.text, hookKey)}
                                className="text-[#5E6577] hover:text-[#E2E5EE] p-1 rounded"
                                title="Copy"
                              >
                                {copiedKey === hookKey ? <Check className="w-3.5 h-3.5 text-[#3B7A57]" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          );
                        })}
                        <button
                          type="button"
                          onClick={() => {
                            const lines = item.candidate_hooks?.map(h => `${h.sid}: ${h.text}`).join('\n') || '';
                            setHooksText(`Concept #${item.id}: ${item.title}\n${lines}`);
                            setActiveTab('simulator');
                          }}
                          className="mt-2 text-xs text-[#8E95A5] hover:text-[#E2E5EE] flex items-center gap-1 font-medium transition"
                        >
                          Test all 4 hooks for Concept #{item.id} in Simulator <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────── */}
          {/* TAB 3: STYLE DNA & BLUEPRINTS                                    */}
          {/* ─────────────────────────────────────────────────────────────── */}
          {activeTab === 'blueprints' && (
            <div className="space-y-4">
              {!copyData ? (
                <div className="text-center py-16 text-[#5E6577] border border-dashed border-[#212533] rounded-xl">
                  <Layers className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">Analyze a creator to decode style DNA, 5-step roadmap, scripts, and piracy ideas.</p>
                </div>
              ) : (
                <>
                  {/* Style DNA Card */}
                  <div className="bg-[#151821] border border-[#212533] rounded-xl p-5">
                    <h3 className="font-heading font-semibold text-sm text-[#E2E5EE] mb-3">Decoded Style DNA</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                      <div className="bg-[#11131A] border border-[#212533] rounded p-3">
                        <span className="font-mono text-[10px] text-[#5E6577] uppercase block mb-1">Hook Formula</span>
                        <p className="text-[#8E95A5]">{styleDna.hook_formula || '—'}</p>
                      </div>
                      <div className="bg-[#11131A] border border-[#212533] rounded p-3">
                        <span className="font-mono text-[10px] text-[#5E6577] uppercase block mb-1">Content Structure</span>
                        <p className="text-[#8E95A5]">{styleDna.content_structure || '—'}</p>
                      </div>
                      <div className="bg-[#11131A] border border-[#212533] rounded p-3">
                        <span className="font-mono text-[10px] text-[#5E6577] uppercase block mb-1">Editing Cadence</span>
                        <p className="text-[#8E95A5]">{styleDna.editing_rhythm || '—'}</p>
                      </div>
                      <div className="bg-[#11131A] border border-[#212533] rounded p-3">
                        <span className="font-mono text-[10px] text-[#5E6577] uppercase block mb-1">Thumbnail Formula</span>
                        <p className="text-[#8E95A5]">{styleDna.thumbnail_formula || '—'}</p>
                      </div>
                      <div className="bg-[#11131A] border border-[#212533] rounded p-3">
                        <span className="font-mono text-[10px] text-[#5E6577] uppercase block mb-1">CTA Pattern</span>
                        <p className="text-[#8E95A5]">{styleDna.cta_pattern || '—'}</p>
                      </div>
                      <div className="bg-[#11131A] border border-[#212533] rounded p-3">
                        <span className="font-mono text-[10px] text-[#5E6577] uppercase block mb-1">Viral Psychological Trigger</span>
                        <p className="text-[#8E95A5]">{styleDna.viral_trigger || '—'}</p>
                      </div>
                    </div>
                  </div>

                  {/* 5-Step Implementation Roadmap — Interactive Accordion with inline Results */}
                  {cloneRoadmap.length > 0 && (
                    <div className="bg-[#151821] border border-[#212533] rounded-xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-heading font-semibold text-sm text-[#E2E5EE]">5-Step Implementation Roadmap</h3>
                          <p className="text-[10px] text-[#5E6577] mt-0.5">Click any step to reveal the expected result & success signals</p>
                        </div>
                        <span className="text-[10px] font-mono text-[#5E6577]">{cloneRoadmap.length} steps</span>
                      </div>

                      {/* Connector timeline */}
                      <div className="relative space-y-0">
                        {cloneRoadmap.map((step, sIdx) => {
                          const isOpen = expandedRoadmapStep === sIdx;
                          const diffColor =
                            step.difficulty === 'Easy' ? { bg: 'bg-[#12281D]', border: 'border-[#1D4A33]', text: 'text-[#4ADE80]', dot: 'bg-[#4ADE80]' } :
                            step.difficulty === 'Hard' ? { bg: 'bg-[#2E181B]', border: 'border-[#5C2329]', text: 'text-[#F87171]', dot: 'bg-[#F87171]' } :
                            { bg: 'bg-[#282114]', border: 'border-[#4D3A1B]', text: 'text-[#FBBF24]', dot: 'bg-[#FBBF24]' };

                          return (
                            <div key={sIdx} className="relative pl-8">
                              {/* Vertical line connector (not on last) */}
                              {sIdx < cloneRoadmap.length - 1 && (
                                <div className="absolute left-[13px] top-8 bottom-0 w-px bg-[#212533]" />
                              )}

                              {/* Step number dot */}
                              <div className={`absolute left-0 top-3.5 w-7 h-7 rounded-full border flex items-center justify-center text-[10px] font-bold font-mono transition-all duration-200 ${
                                isOpen
                                  ? `${diffColor.bg} ${diffColor.border} ${diffColor.text}`
                                  : 'bg-[#11131A] border-[#2B3042] text-[#5E6577]'
                              }`}>
                                {step.step || sIdx + 1}
                              </div>

                              {/* Step card */}
                              <div className={`mb-2 rounded-lg border transition-all duration-200 overflow-hidden ${
                                isOpen
                                  ? 'border-[#2B3042] bg-[#11131A]'
                                  : 'border-[#1C2030] bg-[#0F1118] hover:border-[#212533] hover:bg-[#11131A]'
                              }`}>
                                {/* Header row — always visible, click to toggle */}
                                <button
                                  type="button"
                                  onClick={() => setExpandedRoadmapStep(isOpen ? null : sIdx)}
                                  className="w-full text-left px-4 py-3 flex items-center justify-between gap-3 group"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                      <span className="text-[10px] font-mono text-[#5E6577] uppercase shrink-0">Step {step.step || sIdx + 1}</span>
                                      <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded border shrink-0 ${diffColor.bg} ${diffColor.border} ${diffColor.text}`}>
                                        {step.difficulty || 'Medium'}
                                      </span>
                                      {step.time_estimate && (
                                        <span className="text-[9px] font-mono text-[#5E6577] shrink-0">
                                          ⏱ {step.time_estimate}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-xs font-semibold text-[#E2E5EE] leading-snug block">
                                      {step.action}
                                    </span>
                                    <span className="text-[11px] text-[#5E6577] italic mt-0.5 block">{step.why_it_works}</span>
                                  </div>
                                  <div className={`shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-all duration-200 ${
                                    isOpen ? 'bg-[#252A38] border-[#31374A] text-[#E2E5EE]' : 'border-[#212533] text-[#5E6577] group-hover:border-[#2B3042] group-hover:text-[#8E95A5]'
                                  }`}>
                                    <svg className={`w-2.5 h-2.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </div>
                                </button>

                                {/* Expanded result panel */}
                                {isOpen && (
                                  <div className="px-4 pb-4 border-t border-[#1A1D28] space-y-3 pt-3">
                                    {/* Expected Result */}
                                    {step.expected_result && (
                                      <div className="bg-[#0D0F14] border border-[#1E2230] rounded-lg p-3">
                                        <div className="flex items-center gap-1.5 mb-1.5">
                                          <div className={`w-1.5 h-1.5 rounded-full ${diffColor.dot}`} />
                                          <span className="text-[10px] font-mono uppercase text-[#5E6577] tracking-wider">Expected Result</span>
                                        </div>
                                        <p className="text-xs text-[#E2E5EE] font-medium leading-relaxed">
                                          {step.expected_result}
                                        </p>
                                      </div>
                                    )}

                                    {/* Success Signals checklist */}
                                    {step.success_signals?.length > 0 && (
                                      <div className="bg-[#0D0F14] border border-[#1E2230] rounded-lg p-3">
                                        <span className="text-[10px] font-mono uppercase text-[#5E6577] tracking-wider block mb-2">
                                          ✓ Success Signals — you are done when:
                                        </span>
                                        <div className="space-y-1.5">
                                          {step.success_signals.map((signal, sgIdx) => (
                                            <div key={sgIdx} className="flex items-start gap-2 text-xs">
                                              <div className={`mt-0.5 w-4 h-4 rounded border shrink-0 flex items-center justify-center ${diffColor.bg} ${diffColor.border}`}>
                                                <svg className={`w-2.5 h-2.5 ${diffColor.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                              </div>
                                              <span className="text-[#8E95A5] leading-relaxed">{signal}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Fallback if no enriched fields */}
                                    {!step.expected_result && !step.success_signals?.length && (
                                      <div className="bg-[#0D0F14] border border-[#1E2230] rounded-lg p-3">
                                        <span className="text-[10px] font-mono uppercase text-[#5E6577] tracking-wider block mb-1">Why This Works</span>
                                        <p className="text-xs text-[#8E95A5]">{step.why_it_works}</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Frame-by-Frame Scripts Table with Equipment */}
                  {blueprints.length > 0 && (
                    <div className="bg-[#151821] border border-[#212533] rounded-xl p-5 space-y-3">
                      <h3 className="font-heading font-semibold text-sm text-[#E2E5EE]">Frame-by-Frame Shooting Script</h3>
                      {blueprints[0]?.shooting_script?.length > 0 && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border border-[#212533] rounded overflow-hidden">
                            <thead className="bg-[#11131A] text-[#5E6577] font-mono text-[10px]">
                              <tr>
                                <th className="p-2 border-b border-[#212533]">Scene</th>
                                <th className="p-2 border-b border-[#212533]">Shot</th>
                                <th className="p-2 border-b border-[#212533]">Action</th>
                                <th className="p-2 border-b border-[#212533]">Dialogue / Caption</th>
                                <th className="p-2 border-b border-[#212533]">Duration</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#212533] bg-[#151821]">
                              {blueprints[0].shooting_script.map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-[#1A1D28]">
                                  <td className="p-2 font-mono text-[#8E95A5]">{row.scene}</td>
                                  <td className="p-2 text-[#8E95A5]">{row.shot_type}</td>
                                  <td className="p-2 text-[#8E95A5]">{row.action}</td>
                                  <td className="p-2 text-[#E2E5EE] font-medium">{row.dialogue_or_caption}</td>
                                  <td className="p-2 font-mono text-[#5E6577]">{row.duration_seconds}s</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Required Equipment tags (Restored from app.py) */}
                      {blueprints[0]?.equipment_needed?.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#212533]">
                          <span className="text-[10px] font-mono text-[#5E6577] uppercase mr-1">Required Equipment:</span>
                          {blueprints[0].equipment_needed.map((eq, eIdx) => (
                            <span key={eIdx} className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#11131A] border border-[#212533] text-[#8E95A5]">
                              {eq}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 5 Niche Piracy Upgrade Concepts (Restored from app.py) */}
                  {piracyIdeas.length > 0 && (
                    <div className="bg-[#151821] border border-[#212533] rounded-xl p-5 space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <h3 className="font-heading font-semibold text-sm text-[#E2E5EE]">5 Niche Piracy Upgrade Concepts</h3>
                        <span className="text-xs text-[#8E95A5]">Take competitor baselines and engineer 10x superior versions</span>
                      </div>
                      <div className="space-y-3">
                        {piracyIdeas.map((idea, pIdx) => (
                          <div key={pIdx} className="bg-[#11131A] border border-[#212533] rounded-lg p-4 text-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-sm text-[#E2E5EE]">
                                Upgrade #{idea.id || pIdx + 1}: {idea.your_upgrade_title}
                              </h4>
                              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#1D212D] text-[#8E95A5]">
                                {idea.estimated_views}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[#8E95A5]">
                              <div className="bg-[#151821] p-2.5 rounded border border-[#212533]">
                                <span className="text-[10px] font-mono text-[#5E6577] uppercase block mb-0.5">Competitor Baseline:</span>
                                <p>{idea.competitor_did}</p>
                              </div>
                              <div className="bg-[#151821] p-2.5 rounded border border-[#212533]">
                                <span className="text-[10px] font-mono text-[#5E6577] uppercase block mb-0.5">Why Yours Outperforms:</span>
                                <p>{idea.why_yours_wins}</p>
                              </div>
                            </div>
                            {idea.candidate_hooks?.length > 0 && (
                              <div className="pt-2 border-t border-[#212533] space-y-1">
                                <span className="text-[10px] font-mono text-[#5E6577] uppercase block">Upgrade Hooks:</span>
                                {idea.candidate_hooks.map((phk, phIdx) => (
                                  <div key={phIdx} className="flex items-center gap-2 text-[11px] text-[#E2E5EE]">
                                    <span className="font-mono text-[9px] px-1 py-0.5 rounded bg-[#151821] text-[#8E95A5]">{phk.sid || `S${phIdx+1}`}</span>
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
                                  className="mt-2 text-xs text-[#8E95A5] hover:text-[#E2E5EE] flex items-center gap-1 font-medium transition"
                                >
                                  Test 4 Piracy Hooks in Simulator <ArrowRight className="w-3 h-3" />
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
          {/* TAB 4: RETENTION FRICTION AUDIT                                 */}
          {/* ─────────────────────────────────────────────────────────────── */}
          {activeTab === 'friction' && (
            <div className="space-y-4">
              {!intelData ? (
                <div className="text-center py-16 text-[#5E6577] border border-dashed border-[#212533] rounded-xl">
                  <ShieldAlert className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">Analyze a creator to review audience criticisms and drop-off causes.</p>
                </div>
              ) : (
                <>
                  <div className="bg-[#151821] border border-[#212533] rounded-xl p-5">
                    <h3 className="font-heading font-semibold text-sm text-[#E2E5EE] mb-1">Viewer Drop-off Triggers &amp; Complaints</h3>
                    <p className="text-xs text-[#8E95A5] mb-4">Mined from public feedback and comment sentiment patterns.</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {negativeReviews.map((rev, rIdx) => (
                        <div key={rIdx} className="bg-[#11131A] border border-[#212533] rounded-lg p-3 text-xs">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="font-semibold text-[#E2E5EE]">{rev.criticism_category}</span>
                            <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded border ${
                              rev.frequency === 'Common'
                                ? 'bg-[#2E181B] border-[#5C2329] text-[#F87171]'
                                : 'bg-[#282114] border-[#4D3A1B] text-[#FBBF24]'
                            }`}>
                              {rev.frequency}
                            </span>
                          </div>
                          {rev.audience_quote_example && (
                            <p className="text-[#8E95A5] italic mb-1.5">"{rev.audience_quote_example}"</p>
                          )}
                          <span className="text-[10px] text-[#5E6577] block">Impact: {rev.impact_on_channel}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Counter-hook solutions */}
                  {improvementSuggestions.length > 0 && (
                    <div className="bg-[#151821] border border-[#212533] rounded-xl p-5">
                      <h3 className="font-heading font-semibold text-sm text-[#E2E5EE] mb-3">Counter-Hook Fixes</h3>
                      <div className="space-y-2">
                        {improvementSuggestions.map((imp, iIdx) => (
                          <div key={iIdx} className="bg-[#11131A] border border-[#212533] rounded p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                            <div>
                              <span className="text-[10px] font-mono text-[#5E6577] uppercase block">{imp.fix_title}</span>
                              <p className="text-[#8E95A5] mt-0.5">{imp.fix_description}</p>
                              <span className="text-[#E2E5EE] italic font-medium block mt-1">"{imp.hook_upgrade}"</span>
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
                              className="px-2.5 py-1 bg-[#252A38] hover:bg-[#2D3344] text-[#E2E5EE] border border-[#31374A] rounded text-xs whitespace-nowrap transition cursor-pointer"
                            >
                              Test in Simulator →
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
          {/* TAB 5: HOOK SIMULATOR & PREDICTIVE MONETIZATION                 */}
          {/* ─────────────────────────────────────────────────────────────── */}
          {activeTab === 'simulator' && (
            <div className="space-y-4">
              <div className="bg-[#151821] border border-[#212533] rounded-xl p-5">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className="font-heading font-semibold text-sm text-[#E2E5EE]">Hook Stop-Scroll Simulator</h3>
                    <p className="text-xs text-[#8E95A5]">Calibrate candidate hooks across simulated demographic personas.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHooksText(
                      "Creator: CarryMinati. Niche: Viral Roasts.\n" +
                      "S1: I found the fakest gym influencer on Instagram and confronted him.\n" +
                      "S2: Nobody noticed this millionaire YouTuber doing this in India...\n" +
                      "S3: If you watch motivational podcasts, I have terrible news for you.\n" +
                      "S4: This one video got 10 million views for the worst reason ever."
                    )}
                    className="text-xs px-2.5 py-1 bg-[#1A1D28] hover:bg-[#212533] text-[#8E95A5] hover:text-[#E2E5EE] border border-[#212533] rounded transition cursor-pointer"
                  >
                    Load Preset
                  </button>
                </div>

                <textarea
                  value={hooksText}
                  onChange={(e) => setHooksText(e.target.value)}
                  rows={4}
                  placeholder="Paste candidate hooks (S1 to S4)..."
                  className="w-full bg-[#11131A] border border-[#212533] focus:border-[#4F6382] rounded-md p-2.5 text-xs text-[#E2E5EE] font-mono outline-none mb-3"
                />

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-[#8E95A5]">
                    <span className="font-mono text-[11px]">Personas: {sampleSize}</span>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={sampleSize}
                      onChange={(e) => setSampleSize(Number(e.target.value))}
                      className="w-32 accent-[#4F6382] cursor-pointer"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSimulate}
                    disabled={simulating || !hooksText.trim()}
                    className="w-full sm:w-auto px-4 py-1.5 bg-[#252A38] hover:bg-[#2D3344] disabled:opacity-50 text-xs font-semibold text-[#E2E5EE] border border-[#31374A] rounded-md transition cursor-pointer"
                  >
                    {simulating ? 'Calibrating...' : 'Run Simulation'}
                  </button>
                </div>
              </div>

              {/* Simulation Output */}
              {simResults && (
                <div className="space-y-4">
                  {/* Statistical Confidence Badge (Restored from app.py) */}
                  {simResults.confidence && (
                    <div className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                      simResults.confidence[0] === 'LOW'
                        ? 'bg-[#2E181B] border-[#5C2329] text-[#F87171]'
                        : simResults.confidence[0] !== 'OK'
                        ? 'bg-[#282114] border-[#4D3A1B] text-[#FBBF24]'
                        : 'bg-[#12281D] border-[#1D4A33] text-[#4ADE80]'
                    }`}>
                      <Check className="w-4 h-4 shrink-0" />
                      <span>Statistical Confidence: <strong>{simResults.confidence[0]}</strong> — {simResults.confidence[1]}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-[#151821] border border-[#212533] rounded-xl p-4">
                      <span className="text-[10px] font-mono text-[#5E6577] uppercase block">Predicted Earnings ({simResults.predictions.top_hook})</span>
                      <div className="text-lg font-bold text-[#E2E5EE] mt-1">
                        ₹{simResults.predictions.tot_rev_min.toLocaleString()} – ₹{simResults.predictions.tot_rev_max.toLocaleString()}
                        <span className="text-xs text-[#8E95A5] font-normal ml-2">(${simResults.predictions.tot_rev_usd_min.toLocaleString()} – ${simResults.predictions.tot_rev_usd_max.toLocaleString()})</span>
                      </div>
                      <div className="text-[11px] text-[#8E95A5] mt-1.5 space-y-0.5">
                        <div>Views Potential: <strong className="text-[#E2E5EE]">{simResults.predictions.views_tier}</strong></div>
                        <div>AdSense Estimate: ₹{simResults.predictions.adsense_min.toLocaleString()} – ₹{simResults.predictions.adsense_max.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="bg-[#151821] border border-[#212533] rounded-xl p-4">
                      <span className="text-[10px] font-mono text-[#5E6577] uppercase block">Viral Potential Index</span>
                      <div className="text-lg font-bold text-[#E2E5EE] mt-1">
                        {simResults.predictions.viral_index} / 100
                      </div>
                      <div className="text-[11px] text-[#8E95A5] mt-1.5 space-y-0.5">
                        <div>Tier: <strong className="text-[#E2E5EE]">{simResults.predictions.fame_label}</strong></div>
                        <div>Follower Projection: {simResults.predictions.subs_gain}</div>
                      </div>
                    </div>
                  </div>

                  {/* Visual Hook Ranking Distribution Bars (Restored from app.py) */}
                  <div className="bg-[#151821] border border-[#212533] rounded-xl p-5 text-xs space-y-3">
                    <h4 className="font-semibold text-sm text-[#E2E5EE]">Hook Stop-Scroll Visual Ranking</h4>
                    <div className="space-y-3">
                      {simResults.items.map((it, idx) => {
                        const scorePct = Math.min(100, Math.max(10, (it.score / 5.0) * 100));
                        const bestPct = Math.round(it.best * 100);
                        const worstPct = Math.round(it.worst * 100);
                        return (
                          <div key={idx} className="bg-[#11131A] border border-[#212533] rounded-lg p-3 space-y-2">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                              <div className="flex items-start gap-2">
                                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#1D212D] text-[#8E95A5] font-bold shrink-0">{it.sid}</span>
                                <span className="text-[#E2E5EE] font-medium">{it.hook_text}</span>
                              </div>
                              <div className="font-mono text-xs text-[#E2E5EE] shrink-0">
                                Rating: <strong className="text-sm">{it.score.toFixed(2)}</strong> / 5.0
                              </div>
                            </div>

                            {/* Stop-Scroll Rating Score Bar */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] font-mono text-[#5E6577]">
                                <span>Retention Score</span>
                                <span>{scorePct.toFixed(0)}%</span>
                              </div>
                              <div className="w-full bg-[#151821] h-1.5 rounded-full overflow-hidden">
                                <div className="bg-[#4F6382] h-full rounded-full" style={{ width: `${scorePct}%` }} />
                              </div>
                            </div>

                            {/* Polarization Split (Best vs Worst) */}
                            <div className="grid grid-cols-2 gap-2 pt-1">
                              <div>
                                <div className="flex justify-between text-[10px] font-mono text-[#5E6577] mb-0.5">
                                  <span className="text-[#4ADE80]">Favorite Share</span>
                                  <span>{bestPct}%</span>
                                </div>
                                <div className="w-full bg-[#151821] h-1 rounded-full overflow-hidden">
                                  <div className="bg-[#10B981] h-full rounded-full" style={{ width: `${bestPct}%` }} />
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-[10px] font-mono text-[#5E6577] mb-0.5">
                                  <span className="text-[#F87171]">Drop-off Risk</span>
                                  <span>{worstPct}%</span>
                                </div>
                                <div className="w-full bg-[#151821] h-1 rounded-full overflow-hidden">
                                  <div className="bg-[#F43F5E] h-full rounded-full" style={{ width: `${worstPct}%` }} />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Detailed Ranking Data Table (Restored from app.py) */}
                  <div className="bg-[#151821] border border-[#212533] rounded-xl p-4 text-xs overflow-x-auto">
                    <h4 className="font-semibold text-[#E2E5EE] mb-2.5">Detailed Calibration Metrics</h4>
                    <table className="w-full text-left text-xs border border-[#212533] rounded">
                      <thead className="bg-[#11131A] text-[#5E6577] font-mono text-[10px]">
                        <tr>
                          <th className="p-2 border-b border-[#212533]">Hook ID</th>
                          <th className="p-2 border-b border-[#212533]">Hook Text</th>
                          <th className="p-2 border-b border-[#212533]">Rating</th>
                          <th className="p-2 border-b border-[#212533]">Best %</th>
                          <th className="p-2 border-b border-[#212533]">Worst %</th>
                          <th className="p-2 border-b border-[#212533]">Clickbait</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#212533] bg-[#151821]">
                        {simResults.items.map((r, rIdx) => (
                          <tr key={rIdx} className="hover:bg-[#1A1D28]">
                            <td className="p-2 font-mono text-[#8E95A5]">{r.sid}</td>
                            <td className="p-2 text-[#E2E5EE]">{r.hook_text}</td>
                            <td className="p-2 font-mono font-semibold text-[#E2E5EE]">{r.score.toFixed(2)}</td>
                            <td className="p-2 font-mono text-[#4ADE80]">{(r.best * 100).toFixed(0)}%</td>
                            <td className="p-2 font-mono text-[#F87171]">{(r.worst * 100).toFixed(0)}%</td>
                            <td className="p-2 font-mono text-[#8E95A5]">{(r.clickbait * 100).toFixed(0)}%</td>
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
          {/* TAB 6: REACH & COMMERCIALS                                      */}
          {/* ─────────────────────────────────────────────────────────────── */}
          {activeTab === 'reach' && (
            <div className="space-y-4">
              {!intelData ? (
                <div className="text-center py-16 text-[#5E6577] border border-dashed border-[#212533] rounded-xl">
                  <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">Analyze a creator in the console above to evaluate channel reach, audience demographics, and rate card benchmarks.</p>
                </div>
              ) : (
                <>
                  {/* Platform Reach Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="bg-[#151821] border border-[#212533] rounded-lg p-3">
                      <span className="text-[10px] font-mono text-[#5E6577] uppercase block">Combined Reach</span>
                      <div className="text-base font-bold text-[#E2E5EE] mt-0.5">{metrics.total_reach || '45M+'}</div>
                    </div>
                    <div className="bg-[#151821] border border-[#212533] rounded-lg p-3">
                      <span className="text-[10px] font-mono text-[#5E6577] uppercase block">YouTube Base</span>
                      <div className="text-base font-bold text-[#E2E5EE] mt-0.5">{metrics.youtube_subscribers || '—'}</div>
                    </div>
                    <div className="bg-[#151821] border border-[#212533] rounded-lg p-3">
                      <span className="text-[10px] font-mono text-[#5E6577] uppercase block">Instagram Base</span>
                      <div className="text-base font-bold text-[#E2E5EE] mt-0.5">{metrics.instagram_followers || '—'}</div>
                    </div>
                    <div className="bg-[#151821] border border-[#212533] rounded-lg p-3">
                      <span className="text-[10px] font-mono text-[#5E6577] uppercase block">Engagement</span>
                      <div className="text-base font-bold text-[#E2E5EE] mt-0.5">{metrics.engagement_rate || '—'}</div>
                    </div>
                    <div className="bg-[#151821] border border-[#212533] rounded-lg p-3 col-span-2 sm:col-span-1">
                      <span className="text-[10px] font-mono text-[#5E6577] uppercase block">Cadence</span>
                      <div className="text-xs font-semibold text-[#E2E5EE] mt-1">{metrics.youtube_cadence || 'Regular'}</div>
                    </div>
                  </div>

                  {/* Commercial Rate Card Estimates */}
                  <div className="bg-[#151821] border border-[#212533] rounded-xl p-5 space-y-4">
                    <h3 className="font-heading font-semibold text-sm text-[#E2E5EE]">Commercial Rate Card Estimates</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-[#11131A] border border-[#212533] rounded-lg p-3">
                        <span className="text-[10px] font-mono text-[#5E6577] uppercase block mb-1">YouTube Dedicated Integration</span>
                        <span className="text-sm font-semibold text-[#E2E5EE]">{rateCard.est_youtube_rate || '₹35L - ₹75L'}</span>
                      </div>
                      <div className="bg-[#11131A] border border-[#212533] rounded-lg p-3">
                        <span className="text-[10px] font-mono text-[#5E6577] uppercase block mb-1">Instagram Dedicated Reel</span>
                        <span className="text-sm font-semibold text-[#E2E5EE]">{rateCard.est_instagram_reel_rate || '₹12L - ₹25L'}</span>
                      </div>
                      <div className="bg-[#11131A] border border-[#212533] rounded-lg p-3">
                        <span className="text-[10px] font-mono text-[#5E6577] uppercase block mb-1">Instagram Story Series</span>
                        <span className="text-sm font-semibold text-[#E2E5EE]">{rateCard.est_story_rate || '₹3L - ₹6L'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                      <div className="bg-[#11131A] border border-[#212533] rounded-lg p-3 space-y-2">
                        <span className="text-[10px] font-mono text-[#5E6577] uppercase block">High Affinity Sponsor Sectors</span>
                        <div className="flex flex-wrap gap-1.5">
                          {rateCard.brand_affinity_niches?.map((nch, nIdx) => (
                            <span key={nIdx} className="px-2 py-0.5 rounded bg-[#151821] border border-[#212533] text-[11px] text-[#8E95A5]">
                              {nch}
                            </span>
                          ))}
                        </div>
                        {rateCard.past_or_likely_sponsors?.length > 0 && (
                          <div className="pt-2 border-t border-[#212533]">
                            <span className="text-[10px] font-mono text-[#5E6577] uppercase block mb-1">Recent Active Advertisers</span>
                            <span className="text-[#E2E5EE] font-medium">{rateCard.past_or_likely_sponsors.join(', ')}</span>
                          </div>
                        )}
                      </div>

                      <div className="bg-[#11131A] border border-[#212533] rounded-lg p-3">
                        <span className="text-[10px] font-mono text-[#5E6577] uppercase block mb-1">Strategic Value &amp; Conversion Pitch</span>
                        <p className="text-[#8E95A5] leading-relaxed">{rateCard.why_brands_partner || 'Delivers high conversion resonance with youth audience.'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Audience Demographics Breakdown (Restored from app.py) */}
                  <div className="bg-[#151821] border border-[#212533] rounded-xl p-5 space-y-4">
                    <h3 className="font-heading font-semibold text-sm text-[#E2E5EE]">Audience Demographics Breakdown</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Top Countries */}
                      <div className="bg-[#11131A] border border-[#212533] rounded-lg p-3 space-y-2">
                        <span className="text-[10px] font-mono text-[#5E6577] uppercase block">Top Geographic Markets</span>
                        <div className="space-y-1.5">
                          {demographics.top_countries?.map((c, cIdx) => (
                            <div key={cIdx} className="space-y-0.5">
                              <div className="flex justify-between text-[11px]">
                                <span className="text-[#E2E5EE]">{c.country}</span>
                                <span className="font-mono text-[#8E95A5]">{c.share}</span>
                              </div>
                              <div className="w-full bg-[#151821] h-1 rounded-full overflow-hidden">
                                <div
                                  className="bg-[#4F6382] h-full rounded-full"
                                  style={{ width: `${c.share || '20%'}` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Age & Gender Demographics */}
                      <div className="space-y-3">
                        <div className="bg-[#11131A] border border-[#212533] rounded-lg p-3">
                          <span className="text-[10px] font-mono text-[#5E6577] uppercase block mb-1">Primary Age Cohort</span>
                          <span className="text-sm font-semibold text-[#E2E5EE]">{demographics.primary_age || '18-24 (Gen Z)'}</span>
                        </div>
                        <div className="bg-[#11131A] border border-[#212533] rounded-lg p-3">
                          <span className="text-[10px] font-mono text-[#5E6577] uppercase block mb-1">Gender Skew</span>
                          <span className="text-sm font-semibold text-[#E2E5EE]">{demographics.gender_skew || '76% Male / 24% Female'}</span>
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#151821] border border-[#2B3042] rounded-xl max-w-sm w-full p-5 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-heading font-semibold text-sm text-[#E2E5EE]">
                {authMode === 'login' ? 'Connect Account' : 'Create Account'}
              </h3>
              <button
                onClick={() => setAuthModalOpen(false)}
                className="text-[#8E95A5] hover:text-[#E2E5EE] text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-mono text-[#5E6577] uppercase mb-1">Username</label>
                <input
                  type="text"
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  placeholder="e.g. asuja"
                  className="w-full bg-[#11131A] border border-[#212533] focus:border-[#4F6382] rounded p-2 text-[#E2E5EE] outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-[#5E6577] uppercase mb-1">PIN</label>
                <input
                  type="password"
                  value={authPin}
                  onChange={(e) => setAuthPin(e.target.value)}
                  placeholder="3-4 digits"
                  className="w-full bg-[#11131A] border border-[#212533] focus:border-[#4F6382] rounded p-2 text-[#E2E5EE] outline-none"
                />
              </div>

              {authError && <div className="text-[11px] text-[#F28B82]">{authError}</div>}

              <button
                type="submit"
                className="w-full py-2 bg-[#252A38] hover:bg-[#2D3344] text-[#E2E5EE] font-medium rounded transition"
              >
                {authMode === 'login' ? 'Sign In' : 'Create Profile'}
              </button>
            </form>

            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'signup' : 'login');
                  setAuthError('');
                }}
                className="text-[11px] text-[#8E95A5] hover:text-[#E2E5EE]"
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
