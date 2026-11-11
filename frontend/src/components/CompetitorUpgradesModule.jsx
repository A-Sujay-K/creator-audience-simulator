import React from 'react';
import { Swords, ArrowRight, Zap, Target, Sparkles } from 'lucide-react';
import HelpTooltip from './HelpTooltip';

export default function CompetitorUpgradesModule({
  piracyIdeas = [],
  onSendHooksToTester
}) {
  if (!piracyIdeas || piracyIdeas.length === 0) return null;

  return (
    <div className="control-room-card rounded-2xl p-6 sm:p-8 space-y-6 bg-[var(--bg-card)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-[var(--border-hairline)]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-black text-lg text-[var(--text-display)]">
              5 Ways to Beat Competitor Videos
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Turn competitor baselines into superior viral uploads
            </p>
          </div>
        </div>
        <HelpTooltip
          title="Competitor Upgrade Concepts"
          description="Analyzes viral videos in your category that earned millions of views, and elevates their premise with stronger hooks, faster pacing, and interactive stakes."
          align="right"
        />
      </div>

      {/* Upgrade Bento Cards */}
      <div className="space-y-4">
        {piracyIdeas.map((idea, pIdx) => (
          <div
            key={pIdx}
            className="p-5 rounded-2xl border border-[var(--border-hairline)] hover:border-[var(--border-subtle)] bg-[var(--bg-card-inner)] space-y-4 transition"
          >
            {/* Title & Estimated View Velocity */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full font-bold bg-[var(--brand-volt)]/15 text-[var(--brand-volt)] border border-[var(--brand-volt)]/30">
                  UPGRADE #{idea.id || pIdx + 1}
                </span>
                <h4 className="font-heading font-bold text-sm sm:text-base text-[var(--text-primary)]">
                  {idea.your_upgrade_title}
                </h4>
              </div>
              <span className="font-mono text-xs px-2.5 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-bold shrink-0">
                {idea.estimated_views}
              </span>
            </div>

            {/* Split Comparison: Competitor Did vs Why Yours Wins */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-hairline)] space-y-1">
                <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase font-bold tracking-wider block">
                  What The Competitor Did:
                </span>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  {idea.competitor_did}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--brand-volt)]/5 border border-[var(--brand-volt)]/20 space-y-1">
                <span className="text-[10px] font-mono text-[var(--brand-volt)] uppercase font-bold tracking-wider block">
                  Why Your Version Wins:
                </span>
                <p className="text-[var(--text-primary)] font-medium leading-relaxed">
                  {idea.why_yours_wins}
                </p>
              </div>
            </div>

            {/* Opening Hook Lines */}
            {idea.candidate_hooks?.length > 0 && (
              <div className="pt-3 border-t border-[var(--border-hairline)] space-y-2">
                <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase font-bold tracking-wider block">
                  Candidate Opening Lines:
                </span>
                <div className="space-y-1.5">
                  {idea.candidate_hooks.map((phk, phIdx) => (
                    <div
                      key={phIdx}
                      className="px-3 py-2 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-hairline)] flex items-center gap-2.5 text-xs text-[var(--text-primary)]"
                    >
                      <span className="font-mono text-[10px] px-1.5 py-0.2 rounded font-bold bg-white/[0.08] text-[var(--text-muted)]">
                        {phk.sid || `S${phIdx + 1}`}
                      </span>
                      <span className="font-medium italic">"{phk.text}"</span>
                    </div>
                  ))}
                </div>

                {/* Send Openers to Simulator */}
                <button
                  type="button"
                  onClick={() => {
                    const lines = idea.candidate_hooks.map(h => `${h.sid || 'S1'}: ${h.text}`).join('\n');
                    onSendHooksToTester(`Piracy Upgrade (${idea.your_upgrade_title}):\n${lines}`);
                  }}
                  className="mt-3 text-xs font-bold text-[var(--brand-volt)] hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Target className="w-3.5 h-3.5 text-[var(--brand-volt)]" />
                  <span>Test these openers in Video Hook Tester →</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
