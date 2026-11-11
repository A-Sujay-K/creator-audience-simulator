import React, { useState } from 'react';
import {
  Flame, Target, ExternalLink, Play, Copy, Check,
  Zap, Users, Swords, ChevronRight, Sparkles
} from 'lucide-react';
import HelpTooltip from './HelpTooltip';
import { parseVideoUrl } from '../utils/formatters';

export default function VideoIdeasModule({
  suggestionsList = [],
  onSendSingleHookToTester,
  onSendAllHooksToTester
}) {
  const [selectedConceptIdx, setSelectedConceptIdx] = useState(0);
  const [copiedKey, setCopiedKey] = useState(null);

  if (!suggestionsList || suggestionsList.length === 0) return null;

  const activeConcept = suggestionsList[selectedConceptIdx] || suggestionsList[0];

  const copyText = (txt, key) => {
    navigator.clipboard.writeText(txt);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const archetypes = [
    { label: 'INCIDENT / HIGH STAKES', badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    { label: 'CURIOSITY GAP', badge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' },
    { label: 'AUDIENCE REACTION', badge: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' },
    { label: 'BENCHMARK CHALLENGE', badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    { label: 'PATTERN INTERRUPT', badge: 'bg-[var(--brand-volt)]/15 text-[var(--brand-volt)] border-[var(--brand-volt)]/30' }
  ];

  return (
    <section id="ideas" className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--brand-volt)]/10 border border-[var(--brand-volt)]/30 flex items-center justify-center text-[var(--brand-volt)]">
            <Flame className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h3 className="font-heading font-black text-xl text-[var(--text-display)]">
              5 Ready-to-Make Video Concepts with 4 Opening Hooks
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Engineered for short-form retention pacing with playable reference benchmarks
            </p>
          </div>
          <HelpTooltip
            title="5 Viral Video Concepts"
            description="Custom video angles designed using the creator's viral mechanics. Each video idea includes 4 tested opening hook styles (Incident, Curiosity, Shock, Contrarian)."
            tip="Click 'Test All 5 in Hook Tester' to score candidate openers against simulated viewers."
            align="right"
          />
        </div>

        {/* Global Action: Test All 5 Concepts */}
        <button
          type="button"
          onClick={() => onSendAllHooksToTester(suggestionsList)}
          className="px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] hover:border-[var(--brand-volt)] bg-[var(--bg-card)] hover:bg-white/[0.04] text-xs font-bold text-[var(--text-primary)] transition cursor-pointer flex items-center gap-2 shadow-sm"
        >
          <Target className="w-3.5 h-3.5 text-[var(--brand-volt)]" />
          <span>Test All 5 in Hook Tester →</span>
        </button>
      </div>

      {/* Segmented Concept Switcher Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {suggestionsList.map((item, idx) => {
          const isSelected = idx === selectedConceptIdx;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedConceptIdx(idx)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 border flex items-center gap-2 ${
                isSelected
                  ? 'border-[var(--brand-volt)] bg-[var(--brand-volt)]/15 text-[var(--brand-volt)] shadow-md shadow-[var(--brand-volt-glow)]'
                  : 'border-[var(--border-hairline)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-white'
              }`}
            >
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/40">
                #{item.id || idx + 1}
              </span>
              <span className="truncate max-w-[180px]">{item.title}</span>
            </button>
          );
        })}
      </div>

      {/* Active Concept Dossier Card */}
      {activeConcept && (
        <div className="control-room-card rounded-2xl p-6 sm:p-8 space-y-6 bg-[var(--bg-card)]">
          {/* Concept Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[var(--border-hairline)]">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-[var(--brand-volt)]/20 text-[var(--brand-volt)] border border-[var(--brand-volt)]/30">
                  CONCEPT #{activeConcept.id || selectedConceptIdx + 1}
                </span>
                <span className="text-xs font-mono text-[var(--text-muted)]">
                  {activeConcept.trending_topic}
                </span>
              </div>
              <h4 className="font-heading font-black text-xl sm:text-2xl text-[var(--text-display)]">
                {activeConcept.title}
              </h4>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                {activeConcept.why_it_works}
              </p>
            </div>

            <div className="text-right shrink-0 p-3 rounded-xl bg-[var(--bg-card-inner)] border border-[var(--border-hairline)]">
              <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase font-bold block">
                Estimated View Velocity
              </span>
              <span className="text-xl font-black text-emerald-400 telemetry-num mt-0.5 block">
                {activeConcept.estimated_views}
              </span>
            </div>
          </div>

          {/* Psychology & Strategic Intelligence Badges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {activeConcept.target_audience_appeal && (
              <div className="p-3.5 rounded-xl bg-[var(--bg-card-inner)] border border-[var(--border-hairline)] space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Target Demographic
                </span>
                <p className="text-xs text-[var(--text-secondary)] leading-snug font-medium">
                  {activeConcept.target_audience_appeal}
                </p>
              </div>
            )}
            {activeConcept.audience_sentiment_reaction && (
              <div className="p-3.5 rounded-xl bg-[var(--bg-card-inner)] border border-[var(--border-hairline)] space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" /> Audience Reaction
                </span>
                <p className="text-xs text-[var(--text-secondary)] leading-snug font-medium">
                  {activeConcept.audience_sentiment_reaction}
                </p>
              </div>
            )}
            {activeConcept.benchmark_differentiation && (
              <div className="p-3.5 rounded-xl bg-[var(--bg-card-inner)] border border-[var(--border-hairline)] space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Swords className="w-3.5 h-3.5" /> Benchmark Counter
                </span>
                <p className="text-xs text-[var(--text-secondary)] leading-snug font-medium">
                  {activeConcept.benchmark_differentiation}
                </p>
              </div>
            )}
          </div>

          {/* Reference Benchmark Video: Balanced Layout (No Dead Black Box!) */}
          {activeConcept.reference_video && (
            <div className="p-5 rounded-xl bg-[var(--bg-card-inner)] border border-[var(--border-hairline)] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[10px] text-[var(--text-dim)] uppercase font-bold flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-red-500" /> Reference Format Benchmark: {activeConcept.reference_video.title} ({activeConcept.reference_video.creator || 'Benchmark'})
                </span>
                <span className="font-mono text-[9px] px-2 py-0.5 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-subtle)] text-[var(--text-dim)]">
                  {activeConcept.reference_video.platform || 'Video'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                <div className="md:col-span-6">
                  <BenchmarkPlayer refVideo={activeConcept.reference_video} />
                </div>
                <div className="md:col-span-6 space-y-2 text-xs">
                  <span className="text-[10px] font-mono text-[var(--brand-volt)] uppercase font-bold tracking-wider block">
                    Strategic Retention Rationale
                  </span>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
                    {activeConcept.reference_video.why_reference || 'Demonstrates category retention pacing, emotional stakes, and curiosity payoff.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 5 Hook Archetypes Matrix */}
          <div className="space-y-3 pt-3 border-t border-[var(--border-hairline)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-[10px] font-mono uppercase font-bold text-[var(--text-muted)] block">
                5 Tested Opening Hook Styles (First 3 Seconds):
              </span>
              <span className="text-[10px] font-mono text-[var(--text-dim)]">
                Incident · Curiosity Gap · Audience Reaction · Benchmark Challenge · Pattern Interrupt
              </span>
            </div>

            <div className="space-y-2.5">
              {activeConcept.candidate_hooks?.map((hk, hIdx) => {
                const arch = archetypes[hIdx % archetypes.length];
                const key = `hook-${selectedConceptIdx}-${hIdx}`;
                const isCopied = copiedKey === key;

                return (
                  <div
                    key={hIdx}
                    className="p-3.5 rounded-xl border border-[var(--border-hairline)] hover:border-[var(--border-subtle)] bg-[var(--bg-card-inner)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-md font-bold bg-white/[0.06] text-[var(--text-primary)]">
                          {hk.sid || `S${hIdx + 1}`}
                        </span>
                        <span className={`font-mono text-[9px] px-2 py-0.5 rounded-md border font-bold uppercase tracking-wider ${arch.badge}`}>
                          {hk.archetype || arch.label}
                        </span>
                        {hk.hook_technique && (
                          <span className="text-[10px] font-mono text-[var(--text-dim)]">
                            · {hk.hook_technique}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] italic leading-relaxed">
                        "{hk.text}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onSendSingleHookToTester(activeConcept.title, hk.sid || `S${hIdx + 1}`, hk.text)}
                        className="px-3 py-1.5 rounded-lg border border-[var(--border-hairline)] hover:border-[var(--brand-volt)] bg-[var(--bg-subtle)] text-xs font-bold text-[var(--text-primary)] hover:text-[var(--brand-volt)] transition cursor-pointer flex items-center gap-1.5"
                        title="Simulate retention curve for this single hook"
                      >
                        <Zap className="w-3.5 h-3.5 text-[var(--brand-volt)]" />
                        <span>Test</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => copyText(hk.text, key)}
                        className="p-2 rounded-lg border border-[var(--border-hairline)] hover:border-[var(--border-subtle)] bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-white transition cursor-pointer"
                        title="Copy opening hook text"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Test All 5 hooks for this specific concept */}
            <button
              type="button"
              onClick={() => {
                const lines = activeConcept.candidate_hooks?.map((h, i) => `${h.sid || `S${i + 1}`}: ${h.text}`).join('\n') || '';
                onSendSingleHookToTester(activeConcept.title, 'ALL', lines);
              }}
              className="mt-2 text-xs font-bold text-[var(--brand-volt)] hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <span>Test all 5 opening hooks for Idea #{activeConcept.id || selectedConceptIdx + 1} in Hook Tester</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

/**
 * Benchmark Player that guarantees zero dead black boxes
 */
function BenchmarkPlayer({ refVideo }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!refVideo || !refVideo.url) return null;
  const parsed = parseVideoUrl(refVideo.url);
  const isRealYtId = parsed.type === 'youtube' && parsed.id && /^[a-zA-Z0-9_-]{11}$/.test(parsed.id);

  if (isPlaying && isRealYtId) {
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-[var(--border-hairline)] bg-black shadow-inner">
        <iframe
          src={`https://www.youtube.com/embed/${parsed.id}?autoplay=1`}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={refVideo.title || 'YouTube Benchmark'}
        />
        <button
          type="button"
          onClick={() => setIsPlaying(false)}
          className="absolute top-2 right-2 px-2.5 py-1 rounded-md bg-black/80 hover:bg-black text-[10px] font-mono font-bold text-white transition z-20 cursor-pointer"
        >
          ✕ Close Player
        </button>
      </div>
    );
  }

  const thumbUrl = isRealYtId && !imgError
    ? `https://img.youtube.com/vi/${parsed.id}/hqdefault.jpg`
    : null;

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-[var(--border-hairline)] bg-[var(--bg-card)] flex flex-col justify-end p-4 group select-none shadow-sm">
      {/* Background Thumbnail or Aesthetic Gradient */}
      {thumbUrl ? (
        <img
          src={thumbUrl}
          alt={refVideo.title}
          onError={() => setImgError(true)}
          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-75 transition duration-300"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-[var(--bg-card)] to-slate-900/60" />
      )}

      {/* Frosted Dark Gradient Scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#07080B] via-[#07080B]/60 to-transparent" />

      {/* Top Metadata Badges */}
      <div className="relative z-10 flex items-center justify-between mb-auto">
        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-black/60 text-[var(--brand-volt)] border border-white/10 backdrop-blur-md">
          {refVideo.platform || 'Reference Format'}
        </span>
        {refVideo.creator && (
          <span className="text-[10px] font-mono text-[var(--text-muted)] bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-md">
            {refVideo.creator}
          </span>
        )}
      </div>

      {/* Center Play Button for real playable videos or external link */}
      <div className="relative z-10 py-1 space-y-2">
        <div className="font-heading font-bold text-xs sm:text-sm text-white line-clamp-2 drop-shadow-sm">
          {refVideo.title}
        </div>
        <div className="flex items-center gap-2">
          {isRealYtId ? (
            <button
              type="button"
              onClick={() => setIsPlaying(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--brand-volt)] hover:bg-[var(--brand-volt-hover)] text-[#07080B] shadow-md flex items-center gap-1.5 transition cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Preview Benchmark</span>
            </button>
          ) : null}
          <a
            href={refVideo.url}
            target="_blank"
            rel="noreferrer"
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/10 flex items-center gap-1.5 transition"
          >
            <span>Open Reference</span>
            <ExternalLink className="w-3 h-3 text-[var(--brand-volt)]" />
          </a>
        </div>
      </div>
    </div>
  );
}
