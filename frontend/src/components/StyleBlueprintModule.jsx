import React, { useState } from 'react';
import {
  Layers, ChevronDown, ChevronUp, Sparkles, CheckCircle2,
  Clock, Zap, Target, Palette, Volume2, Copy, Check, FileText, Camera, Image, ShieldAlert, MessageSquare
} from 'lucide-react';
import HelpTooltip from './HelpTooltip';

export default function StyleBlueprintModule({ copyData }) {
  const [expandedStep, setExpandedStep] = useState(0); // Open step 1 by default so user immediately sees the end result
  const [copiedStep, setCopiedStep] = useState(null);

  if (!copyData) return null;

  const styleDna = copyData.style_card || {};
  const creatorName = copyData.target_creator || 'This Creator';
  const nicheName = copyData.target_niche || 'Digital Content';

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(idx);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const rawRoadmap = copyData.blueprints?.[0]?.action_roadmap || copyData.blueprints?.[0]?.steps || copyData.style_card?.clone_roadmap;
  const roadmap = Array.isArray(rawRoadmap) ? rawRoadmap : [];

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
            <span className="font-mono text-[10px] text-cyan-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" /> Opening Hook Strategy
            </span>
            <p className="text-[var(--text-secondary)] leading-relaxed text-xs sm:text-sm font-medium">
              {styleDna.hook_formula || 'Instant stakes or visual anomaly presented in under 2.5 seconds.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-card-inner)] border border-[var(--border-hairline)] space-y-1.5">
            <span className="font-mono text-[10px] text-indigo-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> Video Story Structure
            </span>
            <p className="text-[var(--text-secondary)] leading-relaxed text-xs sm:text-sm font-medium">
              {styleDna.content_structure || 'Fast linear progression with escalating challenges every 30 seconds.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-card-inner)] border border-[var(--border-hairline)] space-y-1.5">
            <span className="font-mono text-[10px] text-[var(--brand-volt)] uppercase font-bold tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Editing Speed &amp; Rhythm
            </span>
            <p className="text-[var(--text-secondary)] leading-relaxed text-xs sm:text-sm font-medium">
              {styleDna.editing_rhythm || 'Cut every 2.8 to 3.5 seconds with sound design punctuation on every visual change.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-card-inner)] border border-[var(--border-hairline)] space-y-1.5">
            <span className="font-mono text-[10px] text-amber-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" /> Thumbnail Design Recipe
            </span>
            <p className="text-[var(--text-secondary)] leading-relaxed text-xs sm:text-sm font-medium">
              {styleDna.thumbnail_formula || 'High-contrast facial expression + bold visual centerpiece with 2 words max.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-card-inner)] border border-[var(--border-hairline)] space-y-1.5">
            <span className="font-mono text-[10px] text-emerald-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5" /> Call-to-Action Pattern
            </span>
            <p className="text-[var(--text-secondary)] leading-relaxed text-xs sm:text-sm font-medium">
              {styleDna.cta_pattern || 'Integrated seamlessly into the climax without pausing video momentum.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-card-inner)] border border-[var(--border-hairline)] space-y-1.5">
            <span className="font-mono text-[10px] text-rose-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Viral Psychological Trigger
            </span>
            <p className="text-[var(--text-secondary)] leading-relaxed text-xs sm:text-sm font-medium">
              {styleDna.viral_trigger || 'Social validation through extreme commitment, curiosity gap, or relatable absurdity.'}
            </p>
          </div>
        </div>
      </div>

      {/* ─── 02. 5-STEP ACTION PLAN (IMPLEMENTATION ROADMAP WITH EXACT OUTPUTS) ─────────────── */}
      <div className="control-room-card rounded-2xl p-6 sm:p-8 space-y-6 bg-[var(--bg-card)]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-[var(--border-hairline)]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-black text-lg text-[var(--text-display)]">
                {roadmap.length > 0 ? `${roadmap.length}-Step Action Plan` : 'Action Plan'}
              </h3>
              {roadmap.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[var(--brand-volt)]/10 text-[var(--brand-volt)] text-[10px] font-mono font-bold uppercase border border-[var(--brand-volt)]/20">
                  Execution Steps
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Production directives grounded in the creator's verified format.
            </p>
          </div>
          {roadmap.length > 0 && (
            <span className="font-mono text-xs text-[var(--brand-volt)] font-bold">
              {roadmap.length} Steps
            </span>
          )}
        </div>

        {roadmap.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-[var(--bg-card-inner)] border border-[var(--border-hairline)] space-y-2">
            <Layers className="w-8 h-8 mx-auto text-[var(--text-dim)]" />
            <p className="text-sm font-semibold text-[var(--text-secondary)]">Action Roadmap Not Available</p>
            <p className="text-xs text-[var(--text-muted)]">No verified execution roadmap was returned for this creator profile.</p>
          </div>
        ) : (
          <div className="space-y-4">
          {roadmap.map((step, sIdx) => {
            const isOpen = expandedStep === sIdx;
            const diffColor = 
              step.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
              step.difficulty === 'Hard' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
              'bg-amber-500/10 text-amber-400 border-amber-500/30';

            const deliverableText = step.deliverable?.breakdown
              ? step.deliverable.breakdown.map(b => `${b.label}:\n${b.text}`).join('\n\n')
              : step.expected_result;

            return (
              <div
                key={sIdx}
                className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'border-[var(--brand-volt)]/30 bg-[var(--bg-card-inner)] shadow-lg shadow-black/20'
                    : 'border-[var(--border-hairline)] bg-[var(--bg-card-inner)] hover:border-white/10'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedStep(isOpen ? null : sIdx)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02] transition"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className={`w-7 h-7 rounded-lg border font-mono text-xs font-black flex items-center justify-center shrink-0 transition ${
                      isOpen
                        ? 'bg-[var(--brand-volt)] text-black border-[var(--brand-volt)] shadow-md shadow-[var(--brand-volt)]/20'
                        : 'bg-[var(--bg-subtle)] border-[var(--border-hairline)] text-[var(--brand-volt)]'
                    }`}>
                      {step.step || sIdx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-heading font-bold text-sm text-[var(--text-primary)]">
                          {step.title}
                        </span>
                        <span className={`font-mono text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase ${diffColor}`}>
                          {step.difficulty || 'Medium'}
                        </span>
                        <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold uppercase flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Action Item
                        </span>
                      </div>
                      <div className="text-xs text-[var(--text-muted)] truncate mt-1">
                        {step.action}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {step.time_estimate && (
                      <span className="font-mono text-[11px] text-[var(--text-dim)] hidden sm:flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[var(--text-muted)]" /> {step.time_estimate}
                      </span>
                    )}
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-[var(--brand-volt)]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-3 space-y-4 border-t border-[var(--border-hairline)] bg-[var(--bg-subtle)]/60 text-xs">
                    {/* Directives Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-lg bg-[var(--bg-card-inner)] border border-[var(--border-hairline)] space-y-1">
                        <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold flex items-center gap-1.5">
                          <FileText className="w-3 h-3" /> Specific Production Directive
                        </span>
                        <p className="text-[var(--text-secondary)] leading-relaxed text-xs">
                          {step.action}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-lg bg-[var(--bg-card-inner)] border border-[var(--border-hairline)] space-y-1">
                        <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold flex items-center gap-1.5">
                          <Target className="w-3 h-3" /> Target Milestone / Benchmark
                        </span>
                        <p className="text-[var(--text-secondary)] leading-relaxed text-xs">
                          {step.expected_result}
                        </p>
                      </div>
                    </div>

                    {/* EXACT OUTPUT DELIVERABLE CARD */}
                    {step.deliverable && (
                      <div className="rounded-xl border border-[var(--brand-volt)]/20 bg-[var(--bg-card)]/90 p-4 sm:p-5 space-y-3.5 shadow-inner">
                        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[var(--border-hairline)]">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[var(--brand-volt)]" />
                            <span className="font-heading font-black text-xs sm:text-sm text-[var(--text-primary)]">
                              Exact Finished Output: {step.deliverable.headline}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(deliverableText, sIdx)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] border border-[var(--border-hairline)] text-[11px] font-mono text-[var(--brand-volt)] font-bold transition cursor-pointer"
                          >
                            {copiedStep === sIdx ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Deliverable</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="space-y-2.5">
                          {step.deliverable.breakdown.map((item, iIdx) => (
                            <div
                              key={iIdx}
                              className="p-3 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-hairline)] space-y-1"
                            >
                              <span className="font-mono text-[10px] text-[var(--brand-volt)] uppercase font-bold tracking-wider block">
                                ➔ {item.label}
                              </span>
                              <p className="text-[var(--text-secondary)] text-xs leading-relaxed font-sans">
                                {item.text}
                              </p>
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
        )}
      </div>
    </div>
  );
}
