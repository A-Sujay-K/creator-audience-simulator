import React from 'react';
import { ShieldAlert, CheckCircle2, ArrowRight, Zap, AlertTriangle, TrendingDown } from 'lucide-react';
import HelpTooltip from './HelpTooltip';

export default function ViewerComplaintsModule({
  complaints = [],
  fixes = [],
  onSendFixToTester
}) {
  if (!complaints || complaints.length === 0) return null;

  return (
    <section id="friction" className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-black text-xl text-[var(--text-display)]">
              Viewer Friction &amp; Sentiment Drop-offs
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Audience retention friction mined from public comments and drop-off analytics
            </p>
          </div>
        </div>
        <HelpTooltip
          title="Viewer Friction & Sentiment Analytics"
          description="Identifies recurring viewer fatigue factors (e.g. overstimulation, repetitive story structure, pacing lags) and provides immediate editorial fixes."
          align="right"
        />
      </div>

      {/* Main Complaints & Paired Fixes Container */}
      <div className="control-room-card rounded-2xl p-6 sm:p-8 space-y-6 bg-[var(--bg-card)]">
        {/* Sentiment Telemetry Gauge */}
        <div className="p-4 rounded-xl bg-[var(--bg-card-inner)] border border-[var(--border-hairline)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase font-bold tracking-wider block">
              Audience Retention Friction Index
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-rose-400 font-mono">28.4% Friction Risk</span>
              <span className="text-xs text-[var(--text-muted)]">· {complaints.length} recurring friction vectors mapped</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="text-[var(--text-secondary)]">Drop-off Risk</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-[var(--text-secondary)]">Engineered Fixes</span>
            </div>
          </div>
        </div>

        {/* Complaints Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {complaints.map((c, cIdx) => {
            const isCommon = (c.frequency || '').toLowerCase().includes('common');
            return (
              <div
                key={cIdx}
                className="p-4.5 rounded-xl border border-[var(--border-hairline)] hover:border-rose-500/40 bg-[var(--bg-card-inner)] space-y-3 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-heading font-bold text-sm text-[var(--text-primary)]">
                    {c.complaint}
                  </h4>
                  <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full font-bold border shrink-0 ${
                    isCommon
                      ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                      : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  }`}>
                    {c.frequency || 'Occasional'}
                  </span>
                </div>

                {c.example_quote && (
                  <p className="text-xs text-[var(--text-secondary)] italic leading-relaxed bg-[var(--bg-subtle)] p-2.5 rounded-lg border border-[var(--border-hairline)]">
                    "{c.example_quote}"
                  </p>
                )}

                {c.channel_impact && (
                  <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5 font-medium">
                    <TrendingDown className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Impact: {c.channel_impact}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Actionable Fixes Section */}
        {fixes.length > 0 && (
          <div className="pt-6 border-t border-[var(--border-hairline)] space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h4 className="font-heading font-black text-base text-[var(--text-display)]">
                How to Fix These Viewer Drop-offs in Your Videos
              </h4>
            </div>

            <div className="space-y-3">
              {fixes.map((f, fIdx) => (
                <div
                  key={fIdx}
                  className="p-4 rounded-xl border border-[var(--border-hairline)] hover:border-emerald-500/30 bg-[var(--bg-card-inner)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition"
                >
                  <div className="space-y-1 flex-1">
                    <div className="font-mono text-[10px] text-emerald-400 uppercase font-bold tracking-wider">
                      {f.title || `Editorial Directive #${fIdx + 1}`}
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {f.actionable_fix}
                    </p>
                    {f.sample_script && (
                      <div className="text-xs font-semibold text-[var(--text-primary)] italic pt-1">
                        "{f.sample_script}"
                      </div>
                    )}
                  </div>

                  {f.sample_script && (
                    <button
                      type="button"
                      onClick={() => onSendFixToTester(f.title, f.sample_script)}
                      className="shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold border border-[var(--border-hairline)] hover:border-[var(--brand-volt)] bg-[var(--bg-subtle)] text-[var(--text-primary)] hover:text-[var(--brand-volt)] transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5 text-[var(--brand-volt)]" />
                      <span>Test Fix in Hook Tester →</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
