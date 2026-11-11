import React, { useState } from 'react';
import {
  Layers, ChevronDown, ChevronUp, Sparkles, CheckCircle2,
  Clock, Zap, Target, Palette, Volume2
} from 'lucide-react';
import HelpTooltip from './HelpTooltip';

export default function StyleBlueprintModule({ copyData }) {
  const [expandedStep, setExpandedStep] = useState(null);

  if (!copyData) return null;

  const styleDna = copyData.style_card || {};
  const roadmap = copyData.blueprints?.[0]?.action_roadmap || copyData.blueprints?.[0]?.steps || [
    { step: 1, title: 'Reverse-Engineer Top Hook', difficulty: 'Easy', time_estimate: '2h', action: 'Transcribe the first 3 seconds of their top 3 videos and mirror the sentence cadence.', expected_result: 'High initial retention curve matching their baseline.' },
    { step: 2, title: 'Shot Framing & B-Roll Match', difficulty: 'Medium', time_estimate: '4h', action: 'Film in Close and Medium alternating frames every 3 to 4 seconds to maintain visual momentum.', expected_result: 'Eliminates viewer drop-off within the first 15 seconds.' },
    { step: 3, title: 'Thumbnail Specular Contrast', difficulty: 'Easy', time_estimate: '1h', action: 'Create a high-contrast thumbnail using their color theory and 3-word headline formula.', expected_result: 'CTR uplift above category average (8-12%).' },
    { step: 4, title: 'Mid-Roll Curiosity Loop', difficulty: 'Medium', time_estimate: '3h', action: 'Introduce a secondary question at the 50% runtime mark before resolving the opening premise.', expected_result: 'Watch-time completion percentage over 65%.' },
    { step: 5, title: 'Community Payoff CTA', difficulty: 'Easy', time_estimate: '30m', action: 'Deliver an open-ended question in the final 5 seconds to drive comment engagement velocity.', expected_result: 'Boosts algorithmic comment-to-view ratio.' }
  ];

  return (
    <div className="space-y-6">
      {/* ─── 01. STYLE DNA MATRIX ────────────────────────────────────────── */}
      <div className="control-room-card rounded-2xl p-6 sm:p-8 space-y-6 bg-[var(--bg-card)]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-[var(--border-hairline)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-lg text-[var(--text-display)]">
                The Creator's Secret Recipe (Style DNA)
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Core editing tempo, visual framing, and psychological retention triggers
              </p>
            </div>
          </div>
          <HelpTooltip
            title="Style DNA Architecture"
            description="Deconstructs the exact narrative rhythm, editing cuts-per-minute, visual thumbnail patterns, and psychological call-to-actions that drive this creator's retention."
            align="right"
          />
        </div>

        {/* 6-Part DNA Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[var(--bg-card-inner)] border border-[var(--border-hairline)] space-y-1.5">
            <span className="font-mono text-[10px] text-cyan-400 uppercase font-bold tracking-wider block flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" /> Opening Hook Strategy
            </span>
            <p className="text-[var(--text-secondary)] leading-relaxed text-xs sm:text-sm font-medium">
              {styleDna.hook_formula || 'Instant stakes or visual anomaly presented in under 2.5 seconds.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-card-inner)] border border-[var(--border-hairline)] space-y-1.5">
            <span className="font-mono text-[10px] text-indigo-400 uppercase font-bold tracking-wider block flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> Video Story Structure
            </span>
            <p className="text-[var(--text-secondary)] leading-relaxed text-xs sm:text-sm font-medium">
              {styleDna.content_structure || 'Fast linear progression with escalating challenges every 30 seconds.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-card-inner)] border border-[var(--border-hairline)] space-y-1.5">
            <span className="font-mono text-[10px] text-[var(--brand-volt)] uppercase font-bold tracking-wider block flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Editing Speed &amp; Rhythm
            </span>
            <p className="text-[var(--text-secondary)] leading-relaxed text-xs sm:text-sm font-medium">
              {styleDna.editing_rhythm || 'Cut every 2.8 to 3.5 seconds with sound design punctuation on every visual change.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-card-inner)] border border-[var(--border-hairline)] space-y-1.5">
            <span className="font-mono text-[10px] text-amber-400 uppercase font-bold tracking-wider block flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" /> Thumbnail Design Recipe
            </span>
            <p className="text-[var(--text-secondary)] leading-relaxed text-xs sm:text-sm font-medium">
              {styleDna.thumbnail_formula || 'High-contrast facial expression + bold visual centerpiece with 2 words max.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-card-inner)] border border-[var(--border-hairline)] space-y-1.5">
            <span className="font-mono text-[10px] text-emerald-400 uppercase font-bold tracking-wider block flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5" /> Call-to-Action Pattern
            </span>
            <p className="text-[var(--text-secondary)] leading-relaxed text-xs sm:text-sm font-medium">
              {styleDna.cta_pattern || 'Integrated seamlessly into the climax without pausing video momentum.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-card-inner)] border border-[var(--border-hairline)] space-y-1.5">
            <span className="font-mono text-[10px] text-rose-400 uppercase font-bold tracking-wider block flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Viral Psychological Trigger
            </span>
            <p className="text-[var(--text-secondary)] leading-relaxed text-xs sm:text-sm font-medium">
              {styleDna.viral_trigger || 'Social validation through extreme commitment, curiosity gap, or relatable absurdity.'}
            </p>
          </div>
        </div>
      </div>

      {/* ─── 02. 5-STEP ACTION PLAN (IMPLEMENTATION ROADMAP) ─────────────── */}
      <div className="control-room-card rounded-2xl p-6 sm:p-8 space-y-6 bg-[var(--bg-card)]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-[var(--border-hairline)]">
          <div>
            <h3 className="font-heading font-black text-lg text-[var(--text-display)]">
              5-Step Action Plan to Replicate Their Success
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Follow these production milestones to match this creator’s viral retention standards
            </p>
          </div>
          <span className="font-mono text-xs text-[var(--brand-volt)] font-bold">
            {roadmap.length} Production Milestones
          </span>
        </div>

        <div className="space-y-3">
          {roadmap.map((step, sIdx) => {
            const isOpen = expandedStep === sIdx;
            const diffColor = 
              step.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
              step.difficulty === 'Hard' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
              'bg-amber-500/10 text-amber-400 border-amber-500/30';

            return (
              <div
                key={sIdx}
                className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-card-inner)] overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => setExpandedStep(isOpen ? null : sIdx)}
                  className="w-full text-left p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02] transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-hairline)] font-mono text-xs font-bold text-[var(--brand-volt)] flex items-center justify-center shrink-0">
                      {step.step || sIdx + 1}
                    </span>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[var(--text-primary)]">
                          {step.title}
                        </span>
                        <span className={`font-mono text-[9px] px-2 py-0.2 rounded-full border font-bold uppercase ${diffColor}`}>
                          {step.difficulty || 'Medium'}
                        </span>
                      </div>
                      <div className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                        {step.action}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {step.time_estimate && (
                      <span className="font-mono text-[11px] text-[var(--text-dim)] hidden sm:inline">
                        ⏱ {step.time_estimate}
                      </span>
                    )}
                    {isOpen ? <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 space-y-3 border-t border-[var(--border-hairline)] bg-[var(--bg-subtle)] text-xs">
                    <div>
                      <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase font-bold block mb-1">
                        Specific Production Directive:
                      </span>
                      <p className="text-[var(--text-secondary)] leading-relaxed">
                        {step.action}
                      </p>
                    </div>
                    {step.expected_result && (
                      <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
                        <strong>Expected Outcome:</strong> {step.expected_result}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
