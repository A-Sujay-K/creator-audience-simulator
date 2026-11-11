import React from 'react';
import { RefreshCw, Globe, Users, Target, FileText, CheckCircle2 } from 'lucide-react';

export default function CrawlLoader({
  statusText,
  statusStep = 1,
  elapsedSeconds = 0,
  targetCreator = ''
}) {
  const steps = [
    { num: 1, label: 'Footprint Discovery', icon: Globe, desc: 'Scanning YouTube & Instagram video catalog' },
    { num: 2, label: 'Audience & Rate Card', icon: Users, desc: 'Profiling demographics, engagement & CPM value' },
    { num: 3, label: 'Hook Decoupler', icon: Target, desc: 'Deconstructing 3-second opening hook formulas' },
    { num: 4, label: 'Production Synthesis', icon: FileText, desc: 'Generating 5 video concepts & shooting scripts' }
  ];

  const progressPercent = Math.min(96, Math.max(12, statusStep * 24 + Math.min(15, elapsedSeconds)));

  return (
    <div className="control-room-card rounded-2xl p-6 md:p-8 space-y-6 border border-[var(--brand-volt)]/30 bg-gradient-to-b from-[#101420] to-[#0A0C13] shadow-2xl animate-cmd">
      {/* Header telemetry */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--brand-volt)]/10 border border-[var(--brand-volt)]/30 flex items-center justify-center text-[var(--brand-volt)] shrink-0">
            <RefreshCw className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <div className="font-heading font-extrabold text-sm sm:text-base text-[var(--text-display)]">
              Autonomous Intelligence Crawl
            </div>
            <div className="text-xs text-[var(--brand-volt)] font-medium mt-0.5">
              {statusText || `Profiling footprint for ${targetCreator}...`}
            </div>
          </div>
        </div>

        <div className="text-right font-mono text-xs text-[var(--text-muted)] shrink-0">
          <span className="font-bold text-[var(--text-primary)]">{elapsedSeconds}s</span> elapsed · ~30s estimated
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full h-2 rounded-full overflow-hidden bg-[var(--bg-card-inner)] border border-[var(--border-hairline)] relative">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-[var(--brand-volt)] transition-all duration-700 ease-out shadow-sm shadow-[var(--brand-volt-glow)]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 4 Phase Nodes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {steps.map((st) => {
          const isDone = statusStep > st.num;
          const isCurrent = statusStep === st.num;
          const Icon = st.icon;

          return (
            <div
              key={st.num}
              className={`p-3.5 rounded-xl border transition-all duration-300 ${
                isDone
                  ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-400'
                  : isCurrent
                  ? 'border-[var(--brand-volt)] bg-[var(--brand-volt)]/10 text-[var(--text-primary)] shadow-md shadow-[var(--brand-volt-glow)]'
                  : 'border-[var(--border-hairline)] bg-[var(--bg-card-inner)] text-[var(--text-muted)] opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                  Phase {st.num}
                </span>
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : isCurrent ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[var(--brand-volt)]" />
                ) : (
                  <Icon className="w-3.5 h-3.5 text-[var(--text-dim)]" />
                )}
              </div>
              <div className="font-semibold text-xs text-[var(--text-primary)]">
                {st.label}
              </div>
              <div className="text-[10px] text-[var(--text-dim)] mt-1 line-clamp-2 leading-relaxed">
                {st.desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
