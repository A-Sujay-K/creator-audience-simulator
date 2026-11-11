import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Sidebar,
  Header,
  CommandPalette,
  AnalyzeForm,
  CrawlLoader,
  CreatorProfileModule,
  VideoIdeasModule,
  ShotListStudio,
  CompetitorUpgradesModule,
  ViewerComplaintsModule,
  StyleBlueprintModule,
  HookTesterModule,
  MonetizationAndDemographicsModule,
  DisambiguationModal,
  BridgeStoreModal,
  AuthModal,
  TeleprompterModal
} from './components';

const PRESET_CREATORS = [
  { name: 'CarryMinati', niche: 'Comedy & Roasts' },
  { name: 'MrBeast', niche: 'High-Stakes Challenges' },
  { name: 'Dhruv Rathee', niche: 'Explanatory Journalism' },
  { name: 'Aakash Dhawan', niche: 'Motovlogging & Travel' },
  { name: 'Ryan Trahan', niche: 'Documentary Storytelling' }
];

export default function App() {
  // ─── Theme State ─────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'dark';
    }
    return 'dark';
  });

  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // ─── Input & Navigation State ────────────────────────────────────────────────
  const [creatorName, setCreatorName] = useState('');
  const [comparisonCreator, setComparisonCreator] = useState('');
  const [niche, setNiche] = useState('');
  const [activeSection, setActiveSection] = useState('dossier');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // ─── Command Palette & Suggestions ───────────────────────────────────────────
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [disambiguationOpen, setDisambiguationOpen] = useState(false);
  const [similarSuggestions, setSimilarSuggestions] = useState([]);
  const [typedQuery, setTypedQuery] = useState('');

  // ─── Analysis Pipeline State ─────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [statusStep, setStatusStep] = useState(1);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorBanner, setErrorBanner] = useState('');

  // ─── Data Payload State ──────────────────────────────────────────────────────
  const [intelData, setIntelData] = useState(null);
  const [copyData, setCopyData] = useState(null);
  const [prevFindings, setPrevFindings] = useState(null);

  // ─── Hook Simulation & Panel Testing ─────────────────────────────────────────
  const [hooksText, setHooksText] = useState('');
  const [sampleSize, setSampleSize] = useState(15);
  const [simulating, setSimulating] = useState(false);
  const [simResults, setSimResults] = useState(null);
  const [sendingToPanel, setSendingToPanel] = useState(false);
  const [panelSendResult, setPanelSendResult] = useState(null);

  // ─── User Profile & Bridge Store ─────────────────────────────────────────────
  const [user, setUser] = useState(() => localStorage.getItem('hooklab_user') || 'user');
  const [userHistory, setUserHistory] = useState([]);
  const [bridgeModalOpen, setBridgeModalOpen] = useState(false);
  const [bridgeStoreData, setBridgeStoreData] = useState(null);
  const [loadingBridgeStore, setLoadingBridgeStore] = useState(false);

  // ─── Auth State ──────────────────────────────────────────────────────────────
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authUsername, setAuthUsername] = useState('');
  const [authPin, setAuthPin] = useState('');
  const [authError, setAuthError] = useState('');

  // ─── Teleprompter State ──────────────────────────────────────────────────────
  const [teleprompterOpen, setTeleprompterOpen] = useState(false);
  const [teleprompterScript, setTeleprompterScript] = useState([]);

  // ─── Restore Cached Run ──────────────────────────────────────────────────────
  const handleLoadCached = async (targetCreator, targetComp, autoScroll = true) => {
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
          if (autoScroll) {
            scrollToSection('dossier');
          }
        }
      }
    } catch (e) {
      console.error('Failed to restore cached intel:', e);
    } finally {
      setLoading(false);
      setStatusText('');
    }
  };

  // ─── Auth & User History Actions ─────────────────────────────────────────────
  const loadHistory = async (username, autoRestore = false) => {
    try {
      const res = await fetch(`/api/user/history?username=${encodeURIComponent(username)}`);
      if (res.ok) {
        const data = await res.json();
        const hist = data.history || [];
        setUserHistory(hist);
        if (autoRestore && hist.length > 0 && !intelData) {
          handleLoadCached(hist[0].creator_name, hist[0].comparison_creator || '', false);
        }
      }
    } catch (e) {
      console.warn('History fetch error:', e);
    }
  };

  const loadBridgeStore = async (username) => {
    if (!username) return;
    setLoadingBridgeStore(true);
    try {
      const res = await fetch(`/api/user/bridge-store?username=${encodeURIComponent(username)}`);
      if (res.ok) {
        const data = await res.json();
        setBridgeStoreData(data);
      }
    } catch (e) {
      console.error('Bridge store fetch error:', e);
    } finally {
      setLoadingBridgeStore(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!authUsername.trim() || !authPin.trim()) {
      setAuthError('Please fill in both username and access PIN.');
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
        loadHistory(data.username, false);
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.85 } });
      }
    } catch (err) {
      setAuthError('Network communication error.');
    }
  };

  // ─── Sync user to local storage and load their history on mount ───────────────
  useEffect(() => {
    if (user) {
      localStorage.setItem('hooklab_user', user);
      loadHistory(user, false);
    }
  }, [user]);

  // ─── Global Shortcut Listener (⌘K / Ctrl+K) ──────────────────────────────────
  useEffect(() => {
    function handleGlobalKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // ─── Dynamic Autocomplete Suggestions (Debounced 40ms) ──────────────────────
  useEffect(() => {
    const q = creatorName.trim();
    if (q.length >= 1) {
      const timer = setTimeout(async () => {
        try {
          const res = await fetch(`/api/creators/suggest?query=${encodeURIComponent(q)}`);
          if (res.ok) {
            const data = await res.json();
            setSuggestions(data.suggestions || []);
          }
        } catch (e) {
          console.warn('Suggestion lookup error:', e);
        }
      }, 40);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [creatorName]);

  // ─── ScrollSpy Section Tracking ──────────────────────────────────────────────
  useEffect(() => {
    if (!intelData) return;

    const sections = ['dossier', 'ideas', 'blueprints', 'friction', 'simulator', 'reach'];
    const observers = [];

    sections.forEach(secId => {
      const el = document.getElementById(secId);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setActiveSection(secId);
            }
          });
        },
        { rootMargin: '-20% 0px -70% 0px' }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach(obs => obs.disconnect());
  }, [intelData]);

  const scrollToSection = (secId) => {
    setActiveSection(secId);
    const el = document.getElementById(secId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // ─── Core Analysis Execution ─────────────────────────────────────────────────
  const executeAnalysis = async (targetCreator, targetNiche = null) => {
    const target = (targetCreator || creatorName).trim();
    if (!target) return;
    const finalNiche = (targetNiche !== null ? targetNiche : niche).trim();

    // Immediately clear stale results to prevent cross-creator confusion
    setIntelData(null);
    setCopyData(null);
    setLoading(true);
    setErrorBanner('');
    setStatusStep(1);
    setStatusText(`Searching web & video footprint for ${target}...`);
    setElapsedSeconds(0);

    const startTime = Date.now();
    const intervalId = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedSeconds(elapsed);
      if (elapsed < 8) {
        setStatusStep(1);
        setStatusText(`🌐 Phase 1/4: Scanning video footprint & verified accounts... (${elapsed}s)`);
      } else if (elapsed < 20) {
        setStatusStep(2);
        setStatusText(`👥 Phase 2/4: Profiling audience demographics & rate card... (${elapsed}s)`);
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
          niche: finalNiche,
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

      // Celebrate successful analysis
      confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
    } catch (err) {
      setErrorBanner(`Analysis Notice: ${err.message}`);
    } finally {
      clearInterval(intervalId);
      setLoading(false);
      setStatusText('');
    }
  };

  // ─── Smart Pre-Check: Disambiguation & Spellfix ──────────────────────────────
  const handleAnalyze = async () => {
    const target = creatorName.trim();
    if (!target) return;

    setTypedQuery(target);

    try {
      const sugRes = await fetch(`/api/creators/suggest?query=${encodeURIComponent(target)}`);
      const sugData = sugRes.ok ? await sugRes.json() : { suggestions: [] };
      const sugs = sugData.suggestions || [];

      // Check if user's entered name matches directly or has high confidence match
      const exactMatch = sugs.find(s => s.is_exact || s.name.toLowerCase() === target.toLowerCase());

      if (exactMatch) {
        setSuggestions([]);
        executeAnalysis(exactMatch.name, exactMatch.niche || niche);
        return;
      }

      // Check for fuzzy alternatives or LLM spellfix
      let candidates = sugs.filter(s => s.score >= 0.45);
      if (candidates.length === 0 || (candidates[0] && candidates[0].score < 0.70)) {
        try {
          const spellRes = await fetch(`/api/creators/spellfix?query=${encodeURIComponent(target)}`);
          if (spellRes.ok) {
            const spellData = await spellRes.json();
            const aiSugs = spellData.suggestions || [];
            const seen = new Set(candidates.map(c => c.name.toLowerCase()));
            for (const as of aiSugs) {
              if (as.name && !seen.has(as.name.toLowerCase())) {
                candidates.unshift(as);
                seen.add(as.name.toLowerCase());
              }
            }
          }
        } catch (e) {
          console.warn('Spellfix lookup notice:', e);
        }
      }

      if (candidates.length > 0) {
        setSimilarSuggestions(candidates);
        setDisambiguationOpen(true);
        setSuggestions([]);
        return;
      }
    } catch (err) {
      console.warn('Pre-check notice:', err);
    }

    // Direct fallback
    executeAnalysis(target);
  };

  // ─── Shared-Element Hook Transitions into Hook Tester ───────────────────────
  const handleSendSingleHookToTester = (conceptTitle, sid, hookText) => {
    if (sid === 'ALL') {
      setHooksText(`Concept: ${conceptTitle}\n${hookText}`);
    } else {
      setHooksText(`Single Hook (${conceptTitle}):\n${sid}: ${hookText}`);
    }
    scrollToSection('simulator');
  };

  const handleSendAllHooksToTester = (ideas) => {
    const lines = ideas.slice(0, 5).map((item, idx) => {
      const topHook = item.candidate_hooks?.[0]?.text || item.title;
      return `S${idx + 1}: ${topHook}`;
    });
    setHooksText(`5-Concept Showdown:\n${lines.join('\n')}`);
    scrollToSection('simulator');
  };

  const handleSendFixToTester = (fixTitle, sampleScript) => {
    setHooksText(`Viewer Friction Fix (${fixTitle}):\nS1: ${sampleScript}`);
    scrollToSection('simulator');
  };

  const handleRunSimulation = async () => {
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
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    } catch (err) {
      alert(`Simulation Notice: ${err.message}`);
    } finally {
      setSimulating(false);
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
      if (res.ok) {
        confetti({ particleCount: 45, spread: 65, origin: { y: 0.8 } });
      }
    } catch (e) {
      setPanelSendResult('error');
    } finally {
      setSendingToPanel(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--bg-canvas)] text-[var(--text-primary)] antialiased transition-colors duration-300">
      {/* ─── 01. FIXED FULL-HEIGHT TELEMETRY SIDEBAR ─────────────────────── */}
      <Sidebar
        activeSection={activeSection}
        onNavigateSection={scrollToSection}
        theme={theme}
        onToggleTheme={toggleTheme}
        user={user}
        userHistory={userHistory}
        onLoadCached={handleLoadCached}
        onOpenBridgeStore={() => {
          loadBridgeStore(user);
          setBridgeModalOpen(true);
        }}
        onOpenAuthModal={() => {
          setAuthMode('login');
          setAuthModalOpen(true);
        }}
        onSignOut={() => {
          setUser(null);
          setUserHistory([]);
        }}
      />

      {/* ─── 02. MAIN SCROLLABLE VIEWPORT CANVAS ──────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        {/* Sticky Frosted Header */}
        <Header
          activeCreator={creatorName}
          comparisonCreator={comparisonCreator}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
          onToggleMobileNav={() => setMobileNavOpen(prev => !prev)}
        />

        {/* Main Workspace Content Flow */}
        <main className="p-4 sm:p-6 md:p-8 max-w-6xl w-full mx-auto space-y-8">
          {/* Analyze Console */}
          <AnalyzeForm
            creatorName={creatorName}
            setCreatorName={setCreatorName}
            comparisonCreator={comparisonCreator}
            setComparisonCreator={setComparisonCreator}
            niche={niche}
            setNiche={setNiche}
            onAnalyze={handleAnalyze}
            onOpenCommandPalette={() => setCommandPaletteOpen(true)}
            loading={loading}
            errorBanner={errorBanner}
            onDismissError={() => setErrorBanner('')}
            presetCreators={PRESET_CREATORS}
          />

          {/* Multi-Step Footprint Crawl Sequence */}
          {loading && (
            <CrawlLoader
              statusText={statusText}
              statusStep={statusStep}
              elapsedSeconds={elapsedSeconds}
              targetCreator={creatorName}
            />
          )}

          {/* Cinematic Results Dossier Stream */}
          {intelData && (
            <div className="space-y-10 animate-cmd">
              {/* Creator Profile & KPI Strip (Signature WOW #3) */}
              <CreatorProfileModule
                intelData={intelData}
                copyData={copyData}
                onSendHooksToTester={(txt) => {
                  setHooksText(txt);
                  scrollToSection('simulator');
                }}
              />

              {/* 5 Video Ideas & 4 Tested Hooks */}
              <VideoIdeasModule
                suggestionsList={intelData.content_suggestions || []}
                onSendSingleHookToTester={handleSendSingleHookToTester}
                onSendAllHooksToTester={handleSendAllHooksToTester}
              />

              {/* Scene-by-Scene Shot-List Studio (Signature WOW #4) */}
              <ShotListStudio
                blueprints={copyData?.blueprints || []}
                onOpenTeleprompter={(script) => {
                  setTeleprompterScript(script);
                  setTeleprompterOpen(true);
                }}
              />

              {/* 5 Ways to Beat Competitor Videos */}
              <CompetitorUpgradesModule
                piracyIdeas={copyData?.piracy_ideas || []}
                onSendHooksToTester={(txt) => {
                  setHooksText(txt);
                  scrollToSection('simulator');
                }}
              />

              {/* Viewer Complaints & Friction Fixes */}
              <ViewerComplaintsModule
                complaints={intelData.viewer_complaints || []}
                fixes={intelData.improvement_suggestions || []}
                onSendFixToTester={handleSendFixToTester}
              />

              {/* Creator Style Blueprint & DNA */}
              <StyleBlueprintModule copyData={copyData} />

              {/* Video Hook Tester & Retention Waveform (Signature WOW #5) */}
              <HookTesterModule
                hooksText={hooksText}
                setHooksText={setHooksText}
                sampleSize={sampleSize}
                setSampleSize={setSampleSize}
                simulating={simulating}
                simResults={simResults}
                onRunSimulation={handleRunSimulation}
                sendingToPanel={sendingToPanel}
                panelSendResult={panelSendResult}
                onSendToPanel={handleSendToPanel}
              />

              {/* Sponsorship Rates & 100% Normalized Demographics */}
              <MonetizationAndDemographicsModule intelData={intelData} />
            </div>
          )}
        </main>
      </div>

      {/* ─── 03. GLOBAL COMMAND PALETTE (Signature WOW #1) ───────────────── */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onSelectCreator={(item) => {
          setCreatorName(item.name);
          if (item.niche) setNiche(item.niche);
          if (item.comparison_creator) setComparisonCreator(item.comparison_creator);
          executeAnalysis(item.name, item.niche || niche);
        }}
        currentQuery={creatorName}
        onQueryChange={setCreatorName}
        suggestions={suggestions}
        recentSearches={userHistory}
      />

      {/* ─── 04. GLOBAL TELEPROMPTER FULLSCREEN OVERLAY ─────────────────── */}
      <TeleprompterModal
        isOpen={teleprompterOpen}
        onClose={() => setTeleprompterOpen(false)}
        script={teleprompterScript}
      />

      {/* ─── 05. DISAMBIGUATION MODAL ────────────────────────────────────── */}
      <DisambiguationModal
        isOpen={disambiguationOpen}
        onClose={() => setDisambiguationOpen(false)}
        typedQuery={typedQuery}
        similarSuggestions={similarSuggestions}
        niche={niche}
        onConfirmSelection={(chosenName, chosenNiche) => {
          setCreatorName(chosenName);
          if (chosenNiche) setNiche(chosenNiche);
          setDisambiguationOpen(false);
          executeAnalysis(chosenName, chosenNiche);
        }}
      />

      {/* ─── 06. COSMITUDE BRIDGE STORE MODAL ────────────────────────────── */}
      <BridgeStoreModal
        isOpen={bridgeModalOpen}
        onClose={() => setBridgeModalOpen(false)}
        user={user}
        bridgeStoreData={bridgeStoreData}
        loadingBridgeStore={loadingBridgeStore}
        onRestoreSession={handleLoadCached}
      />

      {/* ─── 07. AUTHENTICATION MODAL ────────────────────────────────────── */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        authMode={authMode}
        setAuthMode={setAuthMode}
        authUsername={authUsername}
        setAuthUsername={setAuthUsername}
        authPin={authPin}
        setAuthPin={setAuthPin}
        authError={authError}
        setAuthError={setAuthError}
        onSubmit={handleAuth}
      />
    </div>
  );
}
