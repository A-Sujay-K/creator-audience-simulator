import React, { useState, useEffect } from 'react';
import {
  Film, Sparkles, Layers, ShieldAlert, Target, BarChart3,
  Search, ArrowRight, ExternalLink, Check, Copy, User,
  LogOut, RefreshCw, ChevronRight, Swords, Compass, Lock,
  Play, Clock, DollarSign, TrendingUp, HelpCircle
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
  const [creatorName, setCreatorName] = useState('');
  const [comparisonCreator, setComparisonCreator] = useState('');
  const [niche, setNiche] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');

  // Data State
  const [intelData, setIntelData] = useState(null);
  const [copyData, setCopyData] = useState(null);
  const [prevFindings, setPrevFindings] = useState(null);

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

  const handleAnalyze = async (overrideTarget, overrideComp) => {
    const target = overrideTarget || creatorName.trim();
    if (!target) return;

    setLoading(true);
    setStatusText(`Scanning intelligence for ${target}...`);
    try {
      const res = await fetch('/api/intel/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creator_name: target,
          comparison_creator: overrideComp !== undefined ? overrideComp : comparisonCreator.trim(),
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
      alert(`Notice: ${err.message}`);
    } finally {
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

  // Video render helper
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
              title={title}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <a href={cleanUrl} target="_blank" rel="noreferrer" className="text-xs text-[#8E95A5] hover:text-[#E2E5EE] flex items-center gap-1">
                Open YouTube stream <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="p-3 bg-[#11131A] border border-[#212533] rounded-lg text-center">
        <a href={cleanUrl} target="_blank" rel="noreferrer" className="text-xs text-[#8E95A5] hover:text-[#E2E5EE] inline-flex items-center gap-1">
          Open media link <ExternalLink className="w-3 h-3" />
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
    <div className="min-h-screen flex bg-[#0D0F14] text-[#E2E5EE]">
      {/* ─── LEFT SIDEBAR NAVIGATION (240px) ──────────────────────────────── */}
      <aside className="w-60 bg-[#11131A] border-r border-[#212533] flex flex-col justify-between shrink-0 select-none hidden md:flex">
        <div>
          {/* Brand header */}
          <div className="h-14 px-4 flex items-center gap-2.5 border-b border-[#212533]">
            <div className="w-6 h-6 rounded bg-[#2B3042] flex items-center justify-center text-xs font-bold text-[#E2E5EE]">
              P
            </div>
            <div>
              <span className="font-heading text-xs font-bold tracking-tight text-[#E2E5EE] block">PARALLEL</span>
              <span className="text-[10px] text-[#5E6577] block font-mono">Creator Studio v2.4</span>
            </div>
          </div>

          {/* Active Creator Context Pill */}
          <div className="p-3 border-b border-[#212533]">
            <div className="text-[10px] font-mono text-[#5E6577] uppercase tracking-wider mb-1">Active Target</div>
            <div className="flex items-center gap-2 p-1.5 rounded bg-[#151821] border border-[#212533]">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-5 h-5 rounded-full object-cover" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-[#2B3042] flex items-center justify-center text-[10px]">👤</div>
              )}
              <span className="text-xs font-medium text-[#E2E5EE] truncate">
                {profile.name || creatorName || 'No creator selected'}
              </span>
            </div>
          </div>

          {/* Workspace Navigation Links */}
          <nav className="p-2 space-y-0.5">
            {[
              { id: 'dossier', label: 'Executive Dossier', icon: Film },
              { id: 'ideas', label: `Viral Concepts (${suggestionsList.length || 5})`, icon: Sparkles },
              { id: 'blueprints', label: 'Style DNA & Blueprints', icon: Layers },
              { id: 'friction', label: 'Retention Friction Audit', icon: ShieldAlert },
              { id: 'simulator', label: 'Hook Simulator', icon: Target },
              { id: 'reach', label: 'Reach & Commercials', icon: BarChart3 },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition text-left ${
                    isActive
                      ? 'bg-[#1D212D] text-[#E2E5EE] font-semibold border border-[#2B3042]'
                      : 'text-[#8E95A5] hover:text-[#E2E5EE] hover:bg-[#151821]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Search History (if available) */}
          {userHistory.length > 0 && (
            <div className="px-3 py-2 border-t border-[#212533] mt-2">
              <div className="text-[10px] font-mono text-[#5E6577] uppercase tracking-wider mb-1.5">Recent Analyzed</div>
              <div className="space-y-1">
                {userHistory.slice(0, 5).map((h) => (
                  <button
                    key={h.id}
                    onClick={() => {
                      setCreatorName(h.creator_name);
                      if (h.comparison_creator) setComparisonCreator(h.comparison_creator);
                      handleAnalyze(h.creator_name, h.comparison_creator || '');
                    }}
                    className="w-full text-left px-2 py-1 text-[11px] text-[#8E95A5] hover:text-[#E2E5EE] hover:bg-[#151821] rounded truncate block"
                  >
                    {h.creator_name} {h.comparison_creator ? `vs ${h.comparison_creator}` : ''}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Workspace Profile Card */}
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
        {/* Top Header Bar with Minimalist Search */}
        <header className="h-14 bg-[#11131A] border-b border-[#212533] px-5 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <input
                type="text"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                placeholder="Search or analyze target creator (e.g. CarryMinati)..."
                className="w-full bg-[#151821] border border-[#212533] focus:border-[#4F6382] rounded-md px-3 py-1.5 text-xs text-[#E2E5EE] placeholder-[#5E6577] outline-none transition"
              />
              {suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-[#151821] border border-[#2B3042] rounded-md shadow-xl z-50 max-h-48 overflow-y-auto">
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCreatorName(s.name);
                        if (s.niche) setNiche(s.niche);
                        setSuggestions([]);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-[#8E95A5] hover:text-[#E2E5EE] hover:bg-[#1C202C] border-b border-[#212533] last:border-0 flex justify-between"
                    >
                      <span className="font-medium text-[#E2E5EE]">{s.name}</span>
                      <span className="text-[10px] text-[#5E6577]">{s.niche}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <input
              type="text"
              value={comparisonCreator}
              onChange={(e) => setComparisonCreator(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              placeholder="Benchmark vs (optional)..."
              className="w-48 bg-[#151821] border border-[#212533] focus:border-[#4F6382] rounded-md px-2.5 py-1.5 text-xs text-[#E2E5EE] placeholder-[#5E6577] outline-none transition hidden lg:block"
            />

            <button
              onClick={() => handleAnalyze()}
              disabled={loading || !creatorName.trim()}
              className="px-3.5 py-1.5 rounded-md bg-[#252A38] hover:bg-[#2D3344] disabled:opacity-50 text-xs font-medium text-[#E2E5EE] border border-[#31374A] transition shrink-0"
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>

          {/* Engine indicator */}
          <div className="flex items-center gap-2 font-mono text-[11px] text-[#5E6577] shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B7A57]"></span>
            <span>Llama-3.3-70b Core</span>
          </div>
        </header>

        {/* Workspace Body Canvas */}
        <main className="p-6 max-w-6xl w-full mx-auto space-y-6">
          {/* Quick preset chips */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] text-[#5E6577] mr-1">Suggested Targets:</span>
            {PRESET_CREATORS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCreatorName(p.name);
                  setNiche(p.niche);
                  handleAnalyze(p.name);
                }}
                className="px-2.5 py-0.5 rounded bg-[#151821] hover:bg-[#1A1D28] text-[#8E95A5] hover:text-[#E2E5EE] border border-[#212533] transition text-[11px]"
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* Loading status bar */}
          {loading && (
            <div className="p-3 bg-[#151821] border border-[#2B3042] rounded-md flex items-center gap-2.5 text-xs text-[#8E95A5]">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#8E95A5]" />
              <span>{statusText || 'Deconstructing digital footprint and audience retention...'}</span>
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
                  <p className="text-xs">Search or pick a creator in the top bar to generate the Executive Dossier.</p>
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
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h2 className="text-lg font-heading font-bold text-[#E2E5EE]">{profile.name}</h2>
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#1E222D] text-[#8E95A5] border border-[#2B3042]">
                            {profile.tier || 'Mega 10M+'}
                          </span>
                        </div>
                        <div className="text-xs text-[#8E95A5] space-x-3">
                          <span>Niche: <strong className="text-[#E2E5EE]">{profile.core_niche || 'Digital Content'}</strong></span>
                          <span>•</span>
                          <span>Region: <strong className="text-[#E2E5EE]">{profile.location || 'India'}</strong></span>
                        </div>
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
                            onClick={() => {
                              const cand = h2h.hook_contrast.candidate_hooks || [
                                { sid: 'S1', text: h2h.hook_contrast.creator_a_hook },
                                { sid: 'S2', text: h2h.hook_contrast.creator_b_hook },
                                { sid: 'S3', text: h2h.hook_contrast.winning_hybrid_hook }
                              ];
                              setHooksText(`Battle: ${profile.name} vs ${h2h.benchmark_creator}\n` + cand.map(h => `${h.sid}: ${h.text}`).join('\n'));
                              setActiveTab('simulator');
                            }}
                            className="px-3 py-1 bg-[#252A38] hover:bg-[#2D3344] border border-[#31374A] text-xs text-[#E2E5EE] rounded transition shrink-0"
                          >
                            Test in Simulator →
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Proven Uploads Video Deconstruction */}
                  {intelData?.creator_videos?.length > 0 && (
                    <div className="bg-[#151821] border border-[#212533] rounded-xl p-5">
                      <h3 className="font-heading font-semibold text-sm text-[#E2E5EE] mb-3">Upload Retention Deconstruction</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                        <div className="lg:col-span-7">
                          {renderVideo(intelData.creator_videos[0]?.url, intelData.creator_videos[0]?.title)}
                        </div>
                        <div className="lg:col-span-5 space-y-3 text-xs">
                          <div className="bg-[#11131A] border border-[#212533] rounded-lg p-3">
                            <span className="text-[10px] font-mono text-[#5E6577] uppercase block mb-1">Opening 3-Sec Hook</span>
                            <p className="text-[#E2E5EE] italic">"{intelData.creator_videos[0]?.opening_hook || '—'}"</p>
                          </div>
                          <div className="bg-[#11131A] border border-[#212533] rounded-lg p-3">
                            <span className="text-[10px] font-mono text-[#5E6577] uppercase block mb-1">Why It Held Attention</span>
                            <p className="text-[#8E95A5]">{intelData.creator_videos[0]?.why_it_went_viral || '—'}</p>
                          </div>
                        </div>
                      </div>
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
                  <p className="text-xs text-[#8E95A5]">Engineered for short-form retention pacing.</p>
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
                    className="px-3 py-1.5 bg-[#252A38] hover:bg-[#2D3344] border border-[#31374A] text-xs text-[#E2E5EE] rounded transition"
                  >
                    Push All 5 to Simulator →
                  </button>
                )}
              </div>

              {suggestionsList.length === 0 ? (
                <div className="text-center py-16 text-[#5E6577] border border-dashed border-[#212533] rounded-xl">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">Analyze a creator to generate viral concepts.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {suggestionsList.map((item, idx) => (
                    <div key={idx} className="bg-[#151821] border border-[#212533] rounded-xl p-4">
                      <div className="flex justify-between items-start gap-4 mb-2">
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

                      {/* 4 Hook Archetypes */}
                      <div className="mt-3 pt-3 border-t border-[#212533] space-y-1.5">
                        <span className="text-[10px] font-mono uppercase text-[#5E6577] block">4 Hook Archetypes (3-Sec Retention Pacing):</span>
                        {item.candidate_hooks?.map((hk, hIdx) => {
                          const archetypes = ['INCIDENT', 'CURIOSITY', 'SHOCK', 'CONTRARIAN'];
                          const arch = archetypes[hIdx % archetypes.length];
                          const hookKey = `h-${idx}-${hIdx}`;
                          return (
                            <div key={hIdx} className="bg-[#11131A] border border-[#212533] rounded p-2 flex items-center justify-between gap-3 text-xs">
                              <div className="flex items-start gap-2">
                                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#1D212D] text-[#8E95A5] font-bold">{hk.sid || `S${hIdx + 1}`}</span>
                                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#1D212D] text-[#5E6577] uppercase">{arch}</span>
                                <span className="text-[#E2E5EE]">{hk.text}</span>
                              </div>
                              <button
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
                          onClick={() => {
                            const lines = item.candidate_hooks?.map(h => `${h.sid}: ${h.text}`).join('\n') || '';
                            setHooksText(`Concept #${item.id}: ${item.title}\n${lines}`);
                            setActiveTab('simulator');
                          }}
                          className="mt-2 text-xs text-[#8E95A5] hover:text-[#E2E5EE] flex items-center gap-1 font-medium transition"
                        >
                          Test in Simulator <ArrowRight className="w-3 h-3" />
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
                  <p className="text-xs">Analyze a creator to decode style DNA and generate frame-by-frame scripts.</p>
                </div>
              ) : (
                <>
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

                  {/* Frame-by-Frame Scripts Table */}
                  {blueprints.length > 0 && (
                    <div className="bg-[#151821] border border-[#212533] rounded-xl p-5">
                      <h3 className="font-heading font-semibold text-sm text-[#E2E5EE] mb-3">Frame-by-Frame Shooting Script</h3>
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
                            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#1D212D] text-[#8E95A5] border border-[#2B3042]">
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
                              onClick={() => {
                                setHooksText(`Counter-Hook Upgrade:\nS1: ${imp.hook_upgrade}`);
                                setActiveTab('simulator');
                              }}
                              className="px-2.5 py-1 bg-[#252A38] hover:bg-[#2D3344] text-[#E2E5EE] border border-[#31374A] rounded text-xs whitespace-nowrap transition"
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
                    onClick={() => setHooksText(
                      "Creator: CarryMinati. Niche: Viral Roasts.\n" +
                      "S1: I found the fakest gym influencer on Instagram and confronted him.\n" +
                      "S2: Nobody noticed this millionaire YouTuber doing this in India...\n" +
                      "S3: If you watch motivational podcasts, I have terrible news for you.\n" +
                      "S4: This one video got 10 million views for the worst reason ever."
                    )}
                    className="text-xs px-2.5 py-1 bg-[#1A1D28] hover:bg-[#212533] text-[#8E95A5] hover:text-[#E2E5EE] border border-[#212533] rounded transition"
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
                    onClick={handleSimulate}
                    disabled={simulating || !hooksText.trim()}
                    className="w-full sm:w-auto px-4 py-1.5 bg-[#252A38] hover:bg-[#2D3344] disabled:opacity-50 text-xs font-semibold text-[#E2E5EE] border border-[#31374A] rounded-md transition"
                  >
                    {simulating ? 'Calibrating...' : 'Run Simulation'}
                  </button>
                </div>
              </div>

              {/* Simulation Output */}
              {simResults && (
                <div className="space-y-4">
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

                  {/* Ranking List */}
                  <div className="bg-[#151821] border border-[#212533] rounded-xl p-4 text-xs">
                    <h4 className="font-semibold text-[#E2E5EE] mb-2.5">Stop-Scroll Ranking</h4>
                    <div className="space-y-1.5">
                      {simResults.items.map((it, idx) => (
                        <div key={idx} className="bg-[#11131A] border border-[#212533] rounded p-2.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div className="flex items-start gap-2">
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#1D212D] text-[#8E95A5] font-bold">{it.sid}</span>
                            <span className="text-[#E2E5EE]">{it.hook_text}</span>
                          </div>
                          <div className="flex items-center gap-3 font-mono text-[11px] shrink-0">
                            <span>Score: <strong className="text-[#E2E5EE]">{it.score.toFixed(2)}</strong></span>
                            <span className="text-[#5E6577]">Favorite: {(it.best * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
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
                  <p className="text-xs">Analyze a creator to review reach distribution and rate card metrics.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-[#151821] border border-[#212533] rounded-lg p-3">
                      <span className="text-[10px] font-mono text-[#5E6577] uppercase block">Combined Reach</span>
                      <div className="text-base font-bold text-[#E2E5EE] mt-0.5">{metrics.total_reach || '45M+'}</div>
                    </div>
                    <div className="bg-[#151821] border border-[#212533] rounded-lg p-3">
                      <span className="text-[10px] font-mono text-[#5E6577] uppercase block">YouTube Audience</span>
                      <div className="text-base font-bold text-[#E2E5EE] mt-0.5">{metrics.youtube_subscribers || '—'}</div>
                    </div>
                    <div className="bg-[#151821] border border-[#212533] rounded-lg p-3">
                      <span className="text-[10px] font-mono text-[#5E6577] uppercase block">Instagram Base</span>
                      <div className="text-base font-bold text-[#E2E5EE] mt-0.5">{metrics.instagram_followers || '—'}</div>
                    </div>
                    <div className="bg-[#151821] border border-[#212533] rounded-lg p-3">
                      <span className="text-[10px] font-mono text-[#5E6577] uppercase block">Engagement Rate</span>
                      <div className="text-base font-bold text-[#E2E5EE] mt-0.5">{metrics.engagement_rate || '7.2%'}</div>
                    </div>
                  </div>

                  <div className="bg-[#151821] border border-[#212533] rounded-xl p-5 text-xs">
                    <h3 className="font-heading font-semibold text-sm text-[#E2E5EE] mb-3">Benchmark Sponsorship Rate Card</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-[#11131A] border border-[#212533] rounded p-3">
                        <span className="font-mono text-[10px] text-[#5E6577] uppercase block">YouTube Integration</span>
                        <div className="text-sm font-semibold text-[#E2E5EE] mt-0.5">{rateCard.est_youtube_rate || '₹35L - ₹75L'}</div>
                      </div>
                      <div className="bg-[#11131A] border border-[#212533] rounded p-3">
                        <span className="font-mono text-[10px] text-[#5E6577] uppercase block">Instagram Dedicated Reel</span>
                        <div className="text-sm font-semibold text-[#E2E5EE] mt-0.5">{rateCard.est_instagram_reel_rate || '₹12L - ₹25L'}</div>
                      </div>
                      <div className="bg-[#11131A] border border-[#212533] rounded p-3">
                        <span className="font-mono text-[10px] text-[#5E6577] uppercase block">Instagram Story Series</span>
                        <div className="text-sm font-semibold text-[#E2E5EE] mt-0.5">{rateCard.est_story_rate || '₹3L - ₹6L'}</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Auth Modal */}
      {authModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#151821] border border-[#2B3042] rounded-xl max-w-xs w-full p-5 shadow-2xl text-xs">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-[#E2E5EE]">
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </h3>
              <button onClick={() => setAuthModalOpen(false)} className="text-[#5E6577] hover:text-[#E2E5EE]">✕</button>
            </div>

            {authError && <div className="text-[11px] text-[#8B4545] mb-2 bg-[#1E1616] p-2 rounded">{authError}</div>}

            <form onSubmit={handleAuth} className="space-y-2.5">
              <div>
                <label className="block text-[10px] font-mono text-[#5E6577] mb-1">Username</label>
                <input
                  type="text"
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  className="w-full bg-[#11131A] border border-[#212533] rounded px-2.5 py-1.5 text-xs text-[#E2E5EE] outline-none focus:border-[#4F6382]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-[#5E6577] mb-1">PIN</label>
                <input
                  type="password"
                  value={authPin}
                  onChange={(e) => setAuthPin(e.target.value)}
                  className="w-full bg-[#11131A] border border-[#212533] rounded px-2.5 py-1.5 text-xs text-[#E2E5EE] outline-none focus:border-[#4F6382]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-1.5 bg-[#252A38] hover:bg-[#2D3344] text-[#E2E5EE] font-semibold rounded border border-[#31374A] transition mt-2"
              >
                {authMode === 'login' ? 'Sign In' : 'Create'}
              </button>
            </form>

            <div className="mt-3 text-center">
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="text-[11px] text-[#8E95A5] hover:text-[#E2E5EE]"
              >
                {authMode === 'login' ? "Need an account? Sign up" : 'Have an account? Sign in'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
