import React, { useState, useEffect } from 'react';
import {
  Zap, Search, Play, Check, Copy, Sparkles, ShieldAlert,
  TrendingUp, BarChart3, Users, Layers, Film, Swords,
  ExternalLink, Lock, LogOut, RefreshCw, AlertTriangle,
  DollarSign, Tv, Flame, Target, ArrowRight, UserCheck, Eye, Compass
} from 'lucide-react';

const PRESET_CREATORS = [
  { name: 'CarryMinati', niche: 'Comedy & Roasts' },
  { name: 'MrBeast', niche: 'High-Stakes Challenges' },
  { name: 'Dhruv Rathee', niche: 'Explanatory Journalism' },
  { name: 'Aakash Dhawan', niche: 'Motovlogging & Lifestyle' },
  { name: 'Ryan Trahan', niche: 'Documentary Storytelling' }
];

export default function App() {
  // Navigation & Search State
  const [activeTab, setActiveTab] = useState('dossier');
  const [creatorName, setCreatorName] = useState('');
  const [comparisonCreator, setComparisonCreator] = useState('');
  const [niche, setNiche] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Data State
  const [intelData, setIntelData] = useState(null);
  const [copyData, setCopyData] = useState(null);
  const [prevFindings, setPrevFindings] = useState(null);

  // Hook Testing State
  const [hooksText, setHooksText] = useState('');
  const [sampleSize, setSampleSize] = useState(15);
  const [hookSimulating, setHookSimulating] = useState(false);
  const [simResults, setSimResults] = useState(null);

  // User Auth & History State
  const [user, setUser] = useState(null);
  const [userHistory, setUserHistory] = useState([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authUsername, setAuthUsername] = useState('');
  const [authPin, setAuthPin] = useState('');
  const [authError, setAuthError] = useState('');

  // Toast / Copy notification
  const [copiedId, setCopiedId] = useState(null);

  // Fetch suggestions on creator name change
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
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [creatorName]);

  // Load User History if logged in
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

  // Auth Handlers
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!authUsername.trim() || !authPin.trim()) {
      setAuthError('Please enter both username and PIN.');
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
        setAuthError(data.detail || 'Authentication failed.');
      } else {
        setUser(data.username);
        setAuthModalOpen(false);
        setAuthUsername('');
        setAuthPin('');
        loadHistory(data.username);
      }
    } catch (err) {
      setAuthError('Network error connecting to auth server.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setUserHistory([]);
  };

  // Run Intelligence & Clone Pipeline
  const handleAnalyze = async (targetOverride, compOverride) => {
    const target = targetOverride || creatorName.trim();
    if (!target) return;

    setLoading(true);
    setStatusMessage(`Initiating deep reconnaissance on ${target}...`);

    try {
      setStatusMessage('Scanning digital footprint, uploads and audience retention patterns...');
      const res = await fetch('/api/intel/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creator_name: target,
          comparison_creator: compOverride !== undefined ? compOverride : comparisonCreator.trim(),
          niche: niche.trim(),
          username: user || ''
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Analysis engine failed.');
      }

      const data = await res.json();
      setIntelData(data.intel);
      setCopyData(data.copy_data);
      setPrevFindings(data.prev_findings);
      if (user) loadHistory(user);
    } catch (err) {
      alert(`Error during analysis: ${err.message}`);
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  };

  // Hook Simulation Handler
  const handleSimulateHooks = async () => {
    if (!hooksText.trim()) return;
    setHookSimulating(true);
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
        throw new Error(err.detail || 'Simulator failed.');
      }
      const data = await res.json();
      setSimResults(data);
    } catch (err) {
      alert(`Simulation error: ${err.message}`);
    } finally {
      setHookSimulating(false);
    }
  };

  // Helper to copy text to clipboard
  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Quick preset loader
  const handleSelectPreset = (p) => {
    setCreatorName(p.name);
    setNiche(p.niche);
    handleAnalyze(p.name);
  };

  // Render video player safely
  const renderVideoPlayer = (url, title) => {
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
        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-zinc-800 bg-black">
          {vidId ? (
            <iframe
              src={`https://www.youtube.com/embed/${vidId}`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={title}
            />
          ) : (
            <a href={cleanUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center h-full text-indigo-400 hover:underline">
              Open YouTube Video <ExternalLink className="w-4 h-4 ml-1" />
            </a>
          )}
        </div>
      );
    }

    return (
      <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-center">
        <a href={cleanUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 text-sm font-medium">
          Play Video on Web <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    );
  };

  const profile = intelData?.creator_profile || {};
  const h2h = copyData?.head_to_head;
  const suggestionsList = intelData?.content_suggestions || [];
  const styleDna = copyData?.style_card?.style_dna || {};
  const blueprints = copyData?.blueprints || [];
  const piracyIdeas = copyData?.piracy_ideas || [];
  const negativeReviews = intelData?.negative_reviews || [];
  const improvementSuggestions = intelData?.improvement_suggestions || [];
  const metrics = intelData?.platform_metrics || {};
  const rateCard = intelData?.rate_card_and_sponsors || {};

  return (
    <div className="min-h-screen bg-[#08090E] text-[#F8FAFC]">
      {/* Top Application Bar */}
      <header className="border-b border-[#1E2130] bg-[#0C0E16]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-500/20">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-sm tracking-tight text-white">PARALLEL</span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-medium">
                  CREATOR OS 2.4
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Groq Llama-3.3-70b Core Active</span>
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-200">
                  @{user}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 shadow-sm"
              >
                <Lock className="w-3.5 h-3.5" /> Sign In / Account
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Spotlight Command Bar */}
        <section className="bg-[#10121A] border border-[#202333] rounded-2xl p-5 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3 text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1.5 text-zinc-300 font-medium">
              <Compass className="w-3.5 h-3.5 text-indigo-400" /> RECONNAISSANCE &amp; DECOUPLING CONSOLE
            </span>
            <span className="hidden sm:inline">LIVE FIRECRAWL + NEURAL DECONSTRUCTION</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-3">
            <div className="md:col-span-5 relative">
              <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">Target Creator (To Clone)</label>
              <div className="relative">
                <input
                  type="text"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                  placeholder="e.g. CarryMinati, MrBeast, Aakash Dhawan"
                  className="w-full bg-[#161824] border border-[#262A3B] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none transition"
                />
                {suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-[#141622] border border-zinc-700 rounded-lg shadow-xl z-30 max-h-48 overflow-y-auto">
                    {suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setCreatorName(s.name);
                          if (s.niche) setNiche(s.niche);
                          setSuggestions([]);
                        }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-800 text-zinc-200 border-b border-zinc-800 last:border-0 flex justify-between"
                      >
                        <span className="font-medium text-white">{s.name}</span>
                        <span className="text-zinc-500 text-[11px]">{s.niche}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-4">
              <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">Benchmark Creator (Optional Rival)</label>
              <input
                type="text"
                value={comparisonCreator}
                onChange={(e) => setComparisonCreator(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                placeholder="e.g. Ashish Chanchlani, your channel"
                className="w-full bg-[#161824] border border-[#262A3B] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none transition"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">Niche / Category</label>
              <input
                type="text"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                placeholder="e.g. Comedy, Motovlog"
                className="w-full bg-[#161824] border border-[#262A3B] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none transition"
              />
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs text-zinc-500">Quick Presets:</span>
            {PRESET_CREATORS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectPreset(p)}
                className="text-xs px-2.5 py-1 rounded-md bg-[#161824] hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700 transition"
              >
                {p.name}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleAnalyze()}
            disabled={loading || !creatorName.trim()}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm rounded-lg flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/20"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{statusMessage || 'Analyzing...'}</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current" />
                <span>Execute Deep Analysis &amp; Decouple Formula</span>
              </>
            )}
          </button>
        </section>

        {/* 6 Workspace Tabs */}
        <nav className="flex space-x-1 border-b border-[#202333] pb-2 overflow-x-auto">
          {[
            { id: 'dossier', label: 'Executive Dossier', icon: Film },
            { id: 'ideas', label: `Viral Content Studio (${suggestionsList.length || 5})`, icon: Sparkles },
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
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#141622]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* TAB 1: EXECUTIVE DOSSIER */}
        {activeTab === 'dossier' && (
          <div className="space-y-6">
            {!intelData ? (
              <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
                <Film className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Enter a target creator in the Reconnaissance Console above to generate the Executive Dossier.</p>
              </div>
            ) : (
              <>
                {/* Hero Profile Card */}
                <div className="bg-[#10121A] border border-[#202333] rounded-2xl p-6 relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.name}
                        className="w-24 h-24 rounded-full object-cover ring-4 ring-indigo-500/30 shadow-xl"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center text-3xl">
                        👤
                      </div>
                    )}

                    <div className="flex-1 text-center sm:text-left">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                        <h2 className="text-2xl font-heading font-extrabold text-white">{profile.name}</h2>
                        <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold">
                          {profile.tier || 'Mega 10M+'}
                        </span>
                      </div>

                      <div className="text-xs text-zinc-400 space-x-3 mb-3">
                        <span>🎯 Category: <strong className="text-zinc-200">{profile.core_niche || 'Content'}</strong></span>
                        <span>•</span>
                        <span>📍 Region: <strong className="text-zinc-200">{profile.location || 'Global'}</strong></span>
                      </div>

                      {profile.discovered_accounts?.length > 0 && (
                        <div className="flex flex-wrap gap-2 text-xs">
                          {profile.discovered_accounts.map((acc, i) => (
                            <a
                              key={i}
                              href={acc.url || '#'}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 rounded bg-[#161824] border border-zinc-800 text-zinc-300 hover:border-zinc-700 transition flex items-center gap-1"
                            >
                              <span>{acc.platform}: {acc.title}</span>
                              {acc.url && <ExternalLink className="w-3 h-3 text-zinc-500" />}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="bg-[#161824] border border-zinc-800 rounded-xl p-4">
                      <div className="text-xs font-mono uppercase text-indigo-400 mb-1">🎭 Delivery Rhythm &amp; Style</div>
                      <p className="text-sm text-zinc-300">{profile.tone_and_style || 'High-energy, satirical, engaging pacing.'}</p>
                    </div>
                    <div className="bg-[#161824] border border-zinc-800 rounded-xl p-4">
                      <div className="text-xs font-mono uppercase text-cyan-400 mb-1">👥 Audience Persona &amp; Vibe</div>
                      <p className="text-sm text-zinc-300">{profile.audience_vibe || 'Young, college, mobile-first community.'}</p>
                    </div>
                  </div>
                </div>

                {/* Head to Head Battle (If benchmark provided) */}
                {h2h && (
                  <div className="bg-[#10121A] border border-[#202333] rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Swords className="w-5 h-5 text-rose-500" />
                      <h3 className="font-heading font-bold text-base text-white">
                        Head-to-Head Comparative Duel: {profile.name} vs {h2h.benchmark_creator}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-[#161824] border border-indigo-900/40 rounded-xl p-4">
                        <span className="font-mono text-xs text-indigo-400 uppercase">{profile.name} (Retention Edge)</span>
                        <p className="text-sm text-zinc-200 mt-1">{h2h.target_style_edge}</p>
                      </div>
                      <div className="bg-[#161824] border border-rose-900/40 rounded-xl p-4">
                        <span className="font-mono text-xs text-rose-400 uppercase">{h2h.benchmark_creator} (Retention Vulnerability)</span>
                        <p className="text-sm text-zinc-200 mt-1">{h2h.benchmark_weakness}</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-indigo-950/40 to-cyan-950/30 border border-indigo-800/40 rounded-xl p-4 mb-4">
                      <div className="text-xs font-mono text-indigo-300 uppercase mb-1">Winning Clone Formula</div>
                      <p className="text-sm text-zinc-200">{h2h.cloning_conversion_rule}</p>

                      {h2h.hook_contrast?.winning_hybrid_hook && (
                        <div className="mt-3 pt-3 border-t border-indigo-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <span className="text-xs text-cyan-400 font-mono">⚡ Winning Hybrid Hook:</span>
                            <p className="text-sm font-medium text-white italic">"{h2h.hook_contrast.winning_hybrid_hook}"</p>
                          </div>
                          <button
                            onClick={() => {
                              const cand = h2h.hook_contrast.candidate_hooks || [
                                { sid: 'S1', text: h2h.hook_contrast.creator_a_hook },
                                { sid: 'S2', text: h2h.hook_contrast.creator_b_hook },
                                { sid: 'S3', text: h2h.hook_contrast.winning_hybrid_hook }
                              ];
                              setHooksText(`Battle: ${profile.name} vs ${h2h.benchmark_creator}\n` + cand.map(h => `${h.sid}: ${h.text}`).join('\n'));
                              setActiveTab('simulator');
                            }}
                            className="text-xs px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg whitespace-nowrap transition"
                          >
                            Send to Simulator →
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Top Creator Videos On-Screen Player */}
                {intelData?.creator_videos?.length > 0 && (
                  <div className="bg-[#10121A] border border-[#202333] rounded-2xl p-6">
                    <h3 className="font-heading font-bold text-base text-white mb-4">Proven Uploads (Deconstruct on Screen)</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      <div className="lg:col-span-7">
                        {renderVideoPlayer(intelData.creator_videos[0]?.url, intelData.creator_videos[0]?.title)}
                      </div>
                      <div className="lg:col-span-5 space-y-3">
                        <div className="bg-[#161824] border border-zinc-800 rounded-xl p-4">
                          <span className="text-xs font-mono text-zinc-400 uppercase">Retention Hook Breakdown</span>
                          <p className="text-sm text-zinc-300 font-medium italic mt-1">"{intelData.creator_videos[0]?.opening_hook || '—'}"</p>
                        </div>
                        <div className="bg-[#161824] border border-zinc-800 rounded-xl p-4">
                          <span className="text-xs font-mono text-zinc-400 uppercase">Why It Succeeded</span>
                          <p className="text-sm text-zinc-300 mt-1">{intelData.creator_videos[0]?.why_it_went_viral || '—'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* TAB 2: VIRAL CONTENT STUDIO */}
        {activeTab === 'ideas' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-heading font-bold text-lg text-white">Viral Content Concepts ({suggestionsList.length} Ideas)</h3>
                <p className="text-xs text-zinc-400">Live trending angles engineered with 4 distinct hook retention archetypes.</p>
              </div>

              {suggestionsList.length > 0 && (
                <button
                  onClick={() => {
                    const lines = suggestionsList.slice(0, 5).map((s, idx) => {
                      const topH = s.candidate_hooks?.[0]?.text || s.title;
                      return `S${idx + 1}: ${topH}`;
                    });
                    setHooksText(`5-Concept Showdown:\n${lines.join('\n')}`);
                    setActiveTab('simulator');
                  }}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition shadow"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Push ALL 5 Concepts to Simulator
                </button>
              )}
            </div>

            {suggestionsList.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
                <Sparkles className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Run analysis to unlock 5 engineered viral concepts with 4 hook archetypes each.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {suggestionsList.map((item, idx) => (
                  <div key={idx} className="bg-[#10121A] border border-[#202333] rounded-2xl p-5 hover:border-zinc-700 transition">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold">
                            CONCEPT #{item.id || idx + 1}
                          </span>
                          <span className="text-xs text-amber-400 font-mono">🔥 {item.trending_topic || 'Trending Niche'}</span>
                        </div>
                        <h4 className="font-heading font-bold text-base text-white">{item.title}</h4>
                        <p className="text-xs text-zinc-400 mt-1">{item.why_it_works}</p>
                      </div>

                      <div className="text-right whitespace-nowrap">
                        <span className="text-[11px] font-mono text-zinc-500 uppercase block">Est. Views Potential</span>
                        <span className="text-base font-heading font-extrabold text-cyan-400">{item.estimated_views || '1.2M+'}</span>
                      </div>
                    </div>

                    {/* 4 Hook Archetypes */}
                    <div className="mt-4 pt-4 border-t border-zinc-800/80">
                      <div className="text-xs font-mono uppercase text-zinc-400 mb-2 flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-indigo-400" /> 4 Candidate Hook Archetypes (3-Sec Retention Pacing):
                      </div>
                      <div className="space-y-2">
                        {item.candidate_hooks?.map((hk, hIdx) => {
                          const archetypes = ['INCIDENT', 'CURIOSITY', 'SHOCK', 'CONTRARIAN'];
                          const arch = archetypes[hIdx % archetypes.length];
                          const hookKey = `hook-${idx}-${hIdx}`;
                          return (
                            <div key={hIdx} className="bg-[#161824] border border-[#232638] rounded-lg p-2.5 flex items-center justify-between gap-3 text-xs">
                              <div className="flex items-start gap-2">
                                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">{hk.sid || `S${hIdx + 1}`}</span>
                                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase">{arch}</span>
                                <span className="text-zinc-200">{hk.text}</span>
                              </div>
                              <button
                                onClick={() => copyToClipboard(hk.text, hookKey)}
                                className="text-zinc-400 hover:text-white p-1 rounded transition"
                                title="Copy Hook"
                              >
                                {copiedId === hookKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => {
                          const lines = item.candidate_hooks?.map(h => `${h.sid}: ${h.text}`).join('\n') || '';
                          setHooksText(`Concept #${item.id}: ${item.title}\n${lines}`);
                          setActiveTab('simulator');
                        }}
                        className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition"
                      >
                        Test all 4 hooks in Simulator <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: STYLE DNA & BLUEPRINTS */}
        {activeTab === 'blueprints' && (
          <div className="space-y-6">
            {!copyData ? (
              <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
                <Layers className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Run analysis above to decouple Style DNA, shooting blueprints, and niche piracy ideas.</p>
              </div>
            ) : (
              <>
                {/* Style DNA Grid */}
                <div className="bg-[#10121A] border border-[#202333] rounded-2xl p-6">
                  <h3 className="font-heading font-bold text-base text-white mb-4">Decoded Style DNA Formula</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <div className="bg-[#161824] border border-zinc-800 rounded-xl p-3.5">
                      <span className="font-mono text-zinc-400 uppercase text-[10px] block mb-1">Hook Formula</span>
                      <p className="text-zinc-200 font-medium">{styleDna.hook_formula || '—'}</p>
                    </div>
                    <div className="bg-[#161824] border border-zinc-800 rounded-xl p-3.5">
                      <span className="font-mono text-zinc-400 uppercase text-[10px] block mb-1">Content Structure</span>
                      <p className="text-zinc-200 font-medium">{styleDna.content_structure || '—'}</p>
                    </div>
                    <div className="bg-[#161824] border border-zinc-800 rounded-xl p-3.5">
                      <span className="font-mono text-zinc-400 uppercase text-[10px] block mb-1">Editing Cadence</span>
                      <p className="text-zinc-200 font-medium">{styleDna.editing_rhythm || '—'}</p>
                    </div>
                    <div className="bg-[#161824] border border-zinc-800 rounded-xl p-3.5">
                      <span className="font-mono text-zinc-400 uppercase text-[10px] block mb-1">Thumbnail Formula</span>
                      <p className="text-zinc-200 font-medium">{styleDna.thumbnail_formula || '—'}</p>
                    </div>
                    <div className="bg-[#161824] border border-zinc-800 rounded-xl p-3.5">
                      <span className="font-mono text-zinc-400 uppercase text-[10px] block mb-1">CTA Pattern</span>
                      <p className="text-zinc-200 font-medium">{styleDna.cta_pattern || '—'}</p>
                    </div>
                    <div className="bg-[#161824] border border-zinc-800 rounded-xl p-3.5">
                      <span className="font-mono text-amber-400 uppercase text-[10px] block mb-1">Viral Trigger</span>
                      <p className="text-zinc-200 font-medium">{styleDna.viral_trigger || '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Shooting Scripts */}
                {blueprints.length > 0 && (
                  <div className="bg-[#10121A] border border-[#202333] rounded-2xl p-6">
                    <h3 className="font-heading font-bold text-base text-white mb-4">Frame-by-Frame Shooting Blueprint</h3>
                    {blueprints.map((bp, bIdx) => (
                      <div key={bIdx} className="space-y-3">
                        <h4 className="text-sm font-semibold text-indigo-400">{bp.source_video?.title || `Blueprint #${bIdx + 1}`}</h4>
                        {bp.shooting_script?.length > 0 && (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border border-zinc-800 rounded-xl overflow-hidden">
                              <thead className="bg-[#161824] text-zinc-400 font-mono text-[11px]">
                                <tr>
                                  <th className="p-2.5">Scene</th>
                                  <th className="p-2.5">Shot</th>
                                  <th className="p-2.5">Action</th>
                                  <th className="p-2.5">Dialogue / Caption</th>
                                  <th className="p-2.5">Duration</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-zinc-800/60 bg-[#12141F]">
                                {bp.shooting_script.map((row, rIdx) => (
                                  <tr key={rIdx} className="hover:bg-zinc-800/40">
                                    <td className="p-2.5 font-mono text-indigo-300">{row.scene}</td>
                                    <td className="p-2.5 text-zinc-300">{row.shot_type}</td>
                                    <td className="p-2.5 text-zinc-300">{row.action}</td>
                                    <td className="p-2.5 text-zinc-200 font-medium">{row.dialogue_or_caption}</td>
                                    <td className="p-2.5 font-mono text-zinc-400">{row.duration_seconds}s</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* TAB 4: AUDIENCE FRICTION AUDIT */}
        {activeTab === 'friction' && (
          <div className="space-y-6">
            {!intelData ? (
              <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
                <ShieldAlert className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Audit real viewer complaints and counter-hooks by analyzing a creator.</p>
              </div>
            ) : (
              <>
                <div className="bg-[#10121A] border border-[#202333] rounded-2xl p-6">
                  <h3 className="font-heading font-bold text-base text-white mb-2">Real Viewer Complaints &amp; Drop-off Triggers</h3>
                  <p className="text-xs text-zinc-400 mb-4">Sentiment friction points mined from real comment sections and discussion boards.</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {negativeReviews.map((rev, rIdx) => (
                      <div key={rIdx} className="bg-[#161824] border border-rose-900/30 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-mono text-xs font-bold text-rose-400">{rev.criticism_category}</span>
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-300">
                            {rev.frequency}
                          </span>
                        </div>
                        {rev.audience_quote_example && (
                          <p className="text-xs text-zinc-300 italic mb-2">"{rev.audience_quote_example}"</p>
                        )}
                        <span className="text-[11px] text-zinc-500 block">Impact: {rev.impact_on_channel}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upgraded Counter Hooks */}
                {improvementSuggestions.length > 0 && (
                  <div className="bg-[#10121A] border border-[#202333] rounded-2xl p-6">
                    <h3 className="font-heading font-bold text-base text-white mb-4">Counter-Hook Upgrades</h3>
                    <div className="space-y-3">
                      {improvementSuggestions.map((imp, iIdx) => (
                        <div key={iIdx} className="bg-[#161824] border border-emerald-900/30 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div>
                            <div className="text-xs font-mono text-emerald-400 mb-1">Fix #{iIdx + 1}: {imp.fix_title}</div>
                            <p className="text-xs text-zinc-400 mb-2">{imp.fix_description}</p>
                            <span className="text-xs text-white font-medium italic block">Upgraded Hook: "{imp.hook_upgrade}"</span>
                          </div>
                          <button
                            onClick={() => {
                              setHooksText(`Counter-Hook Upgrade:\nS1: ${imp.hook_upgrade}`);
                              setActiveTab('simulator');
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-lg whitespace-nowrap transition"
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

        {/* TAB 5: HOOK SIMULATOR & PREDICTIVE MONETIZATION */}
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            <div className="bg-[#10121A] border border-[#202333] rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                <div>
                  <h3 className="font-heading font-bold text-base text-white">Algorithmic Stop-Scroll Simulator</h3>
                  <p className="text-xs text-zinc-400">Calibrate hooks against simulated Gen-Z demographic panels and predict revenue.</p>
                </div>
                <button
                  onClick={() => setHooksText(
                    "Creator: CarryMinati. Niche: Viral Roasts.\n" +
                    "S1: I found the fakest gym influencer on Instagram and confronted him.\n" +
                    "S2: Nobody noticed this millionaire YouTuber doing this in India...\n" +
                    "S3: If you watch motivational podcasts, I have terrible news for you.\n" +
                    "S4: This one video got 10 million views for the worst reason ever."
                  )}
                  className="text-xs px-2.5 py-1 bg-[#161824] hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-lg transition"
                >
                  Load Trending Preset
                </button>
              </div>

              <textarea
                value={hooksText}
                onChange={(e) => setHooksText(e.target.value)}
                rows={5}
                placeholder="S1: Hook 1...&#10;S2: Hook 2...&#10;S3: Hook 3..."
                className="w-full bg-[#161824] border border-[#262A3B] focus:border-indigo-500 rounded-xl p-3 text-sm text-white placeholder-zinc-500 font-mono outline-none mb-4"
              />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                <div className="w-full sm:w-auto flex items-center gap-3">
                  <span className="text-xs text-zinc-400 whitespace-nowrap font-mono">Sample Size: {sampleSize} personas</span>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={sampleSize}
                    onChange={(e) => setSampleSize(Number(e.target.value))}
                    className="w-full sm:w-48 accent-indigo-500 cursor-pointer"
                  />
                </div>

                <button
                  onClick={handleSimulateHooks}
                  disabled={hookSimulating || !hooksText.trim()}
                  className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition shadow"
                >
                  {hookSimulating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Simulating Audience Panel...</span>
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4" />
                      <span>Run Simulation</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Simulation Results Display */}
            {simResults && (
              <div className="space-y-6">
                {/* Predictions KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#10121A] border border-[#202333] rounded-2xl p-5">
                    <span className="text-[11px] font-mono text-zinc-400 uppercase">Estimated Video Earnings ({simResults.predictions.top_hook})</span>
                    <div className="text-2xl font-heading font-extrabold text-white mt-1">
                      ₹{simResults.predictions.tot_rev_min.toLocaleString()} – ₹{simResults.predictions.tot_rev_max.toLocaleString()}
                      <span className="text-xs text-zinc-400 ml-2 font-normal">(${simResults.predictions.tot_rev_usd_min.toLocaleString()} – ${simResults.predictions.tot_rev_usd_max.toLocaleString()})</span>
                    </div>
                    <div className="text-xs text-zinc-400 mt-2 space-y-1">
                      <div>• Estimated Views: <strong className="text-zinc-200">{simResults.predictions.views_tier}</strong></div>
                      <div>• AdSense Revenue: <strong className="text-zinc-200">₹{simResults.predictions.adsense_min.toLocaleString()} – ₹{simResults.predictions.adsense_max.toLocaleString()}</strong></div>
                      <div>• Brand Sponsor Value: <strong className="text-zinc-200">₹{simResults.predictions.sponsor_min.toLocaleString()} – ₹{simResults.predictions.sponsor_max.toLocaleString()}</strong></div>
                    </div>
                  </div>

                  <div className="bg-[#10121A] border border-[#202333] rounded-2xl p-5">
                    <span className="text-[11px] font-mono text-zinc-400 uppercase">Viral Fame Potential Index</span>
                    <div className="text-2xl font-heading font-extrabold text-cyan-400 mt-1">
                      {simResults.predictions.viral_index} / 100
                    </div>
                    <div className="text-xs text-zinc-400 mt-2 space-y-1">
                      <div>• Category Tier: <strong className="text-zinc-200">{simResults.predictions.fame_label}</strong></div>
                      <div>• Algorithmic Push: <strong className="text-zinc-200">{simResults.predictions.algo_prob}</strong></div>
                      <div>• Subscriber Gain: <strong className="text-zinc-200">{simResults.predictions.subs_gain}</strong></div>
                    </div>
                  </div>
                </div>

                {/* Ranking Table */}
                <div className="bg-[#10121A] border border-[#202333] rounded-2xl p-5">
                  <h4 className="font-heading font-bold text-sm text-white mb-3">Hook Performance Ranking</h4>
                  <div className="space-y-2">
                    {simResults.items.map((it, idx) => (
                      <div key={idx} className="bg-[#161824] border border-zinc-800 rounded-xl p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex items-start gap-2">
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-bold">{it.sid}</span>
                          <span className="text-xs text-zinc-200">{it.hook_text}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-mono">
                          <div>
                            <span className="text-zinc-500 text-[10px] block">STOP-SCROLL</span>
                            <span className="text-emerald-400 font-bold">{it.score.toFixed(2)} / 5.0</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 text-[10px] block">FAVORITE</span>
                            <span className="text-zinc-300">{(it.best * 100).toFixed(0)}%</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 text-[10px] block">DROP-OFF</span>
                            <span className="text-rose-400">{(it.worst * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: REACH & COMMERCIALS */}
        {activeTab === 'reach' && (
          <div className="space-y-6">
            {!intelData ? (
              <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
                <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Run analysis to evaluate multi-platform reach and benchmark sponsorship rate cards.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-[#10121A] border border-[#202333] rounded-2xl p-4">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">Combined Reach</span>
                    <div className="text-xl font-heading font-extrabold text-white mt-1">{metrics.total_reach || '45M+'}</div>
                  </div>
                  <div className="bg-[#10121A] border border-[#202333] rounded-2xl p-4">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">YouTube Audience</span>
                    <div className="text-xl font-heading font-extrabold text-rose-400 mt-1">{metrics.youtube_subscribers || '—'}</div>
                  </div>
                  <div className="bg-[#10121A] border border-[#202333] rounded-2xl p-4">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">Instagram Followers</span>
                    <div className="text-xl font-heading font-extrabold text-pink-400 mt-1">{metrics.instagram_followers || '—'}</div>
                  </div>
                  <div className="bg-[#10121A] border border-[#202333] rounded-2xl p-4">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">Engagement Rate</span>
                    <div className="text-xl font-heading font-extrabold text-emerald-400 mt-1">{metrics.engagement_rate || '7.2%'}</div>
                  </div>
                </div>

                <div className="bg-[#10121A] border border-[#202333] rounded-2xl p-6">
                  <h3 className="font-heading font-bold text-base text-white mb-4">Estimated Brand Rate Card</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-[#161824] border border-zinc-800 rounded-xl p-4">
                      <span className="font-mono text-xs text-zinc-400 uppercase">YouTube Dedicated / Integration</span>
                      <div className="text-base font-bold text-white mt-1">{rateCard.est_youtube_rate || '₹35L - ₹75L'}</div>
                    </div>
                    <div className="bg-[#161824] border border-zinc-800 rounded-xl p-4">
                      <span className="font-mono text-xs text-zinc-400 uppercase">Instagram Dedicated Reel</span>
                      <div className="text-base font-bold text-white mt-1">{rateCard.est_instagram_reel_rate || '₹12L - ₹25L'}</div>
                    </div>
                    <div className="bg-[#161824] border border-zinc-800 rounded-xl p-4">
                      <span className="font-mono text-xs text-zinc-400 uppercase">Instagram Story Series</span>
                      <div className="text-base font-bold text-white mt-1">{rateCard.est_story_rate || '₹3L - ₹6L'}</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Auth Modal */}
      {authModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#10121A] border border-zinc-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-heading font-bold text-white">
                {authMode === 'login' ? 'Sign In to Workspace' : 'Create New Account'}
              </h3>
              <button onClick={() => setAuthModalOpen(false)} className="text-zinc-500 hover:text-zinc-300">✕</button>
            </div>

            {authError && <div className="text-xs text-rose-400 mb-3 bg-rose-500/10 p-2 rounded">{authError}</div>}

            <form onSubmit={handleAuth} className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">Username</label>
                <input
                  type="text"
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  placeholder="e.g. asuja"
                  className="w-full bg-[#161824] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">PIN</label>
                <input
                  type="password"
                  value={authPin}
                  onChange={(e) => setAuthPin(e.target.value)}
                  placeholder="4-digit PIN"
                  className="w-full bg-[#161824] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition mt-2"
              >
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="text-xs text-indigo-400 hover:underline"
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
