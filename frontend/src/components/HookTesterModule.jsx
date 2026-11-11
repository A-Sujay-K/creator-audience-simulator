import React from 'react';
import { Target, RefreshCw, Zap, Share2, CheckCircle, AlertTriangle, Play, Flame } from 'lucide-react';
import HelpTooltip from './HelpTooltip';
import ProvenanceBadge from './ProvenanceBadge';

export default function HookTesterModule({
  hooksText,
  setHooksText,
  sampleSize,
  setSampleSize,
  simulating,
  simResults,
  onRunSimulation,
  sendingToPanel,
  panelSendResult,
  onSendToPanel
}) {
  return (
    <section id="simulator" className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--brand-volt)]/10 border border-[var(--brand-volt)]/30 flex items-center justify-center text-[var(--brand-volt)]">
            <Target className="w-5 h-5 text-[var(--brand-volt)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-black text-xl text-[var(--text-display)]">
                Video Hook Tester &amp; Retention Waveform
              </h3>
              <ProvenanceBadge type="estimate" label="SYNTHETIC AUDIENCE SIMULATION" size="xs" />
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Monte Carlo neural simulation scoring viewer retention and clickbait risk across thousands of viewers
            </p>
          </div>
        </div>
        <HelpTooltip
          title="Video Hook Tester"
          description="Type or paste your candidate opening 3-second lines. HookLab tests them against simulated algorithmic viewer cohorts and calculates expected watch-through velocity, scroll-away risk, and clickbait sensitivity."
          tip="You can send any generated hook directly into this tester from the other modules above."
          align="right"
        />
      </div>

      <div className="control-room-card rounded-2xl p-6 sm:p-8 space-y-6 bg-[var(--bg-card)]">
        {/* Input Box & Controls */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-mono text-[var(--text-dim)] uppercase font-bold tracking-wider block">
              Candidate Opening Hooks (One per line or formatted as S1, S2...):
            </label>
            <span className="font-mono text-xs text-[var(--brand-volt)]">
              Simulate against {sampleSize} AI Viewers
            </span>
          </div>

          <textarea
            rows={5}
            value={hooksText}
            onChange={(e) => setHooksText(e.target.value)}
            placeholder="S1: Stop scrolling — this single mistake costs you 50% watch time.&#10;S2: I tested 100 opening lines so you never make this mistake.&#10;S3: The audience comments on this controversy are wild.&#10;S4: Every creator tells you to buy this gear. They are lying.&#10;S5: Before they delete this video, watch what broke at 2:15."
            className="w-full rounded-xl p-4 text-xs sm:text-sm outline-none transition border border-[var(--border-hairline)] focus:border-[var(--brand-volt)] bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-dim)] font-mono leading-relaxed"
          />

          {/* Sample Size Slider & Action Button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-1">
            <div className="flex items-center gap-3 text-xs w-full sm:w-auto">
              <span className="font-mono text-[10px] text-[var(--text-dim)] uppercase font-bold shrink-0">
                Cohort Size:
              </span>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={sampleSize}
                onChange={(e) => setSampleSize(parseInt(e.target.value))}
                className="w-36 accent-[var(--brand-volt)] cursor-pointer"
              />
              <span className="font-mono font-bold text-[var(--text-primary)] min-w-[3rem]">
                {sampleSize} viewers
              </span>
            </div>

            <button
              type="button"
              onClick={onRunSimulation}
              disabled={simulating || !hooksText.trim()}
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 bg-[var(--brand-volt)] text-[#07080B] hover:bg-[var(--brand-volt-hover)] shadow-md shadow-[var(--brand-volt-glow)] disabled:opacity-50"
            >
              {simulating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Simulating Viewer Reactions...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>Run Retention Simulation</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Simulation Waveform Results */}
        {simResults?.items && (
          <div className="space-y-5 pt-4 border-t border-[var(--border-hairline)] animate-cmd">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-heading font-black text-base text-[var(--text-display)]">
                  Simulated Audience Retention Curves
                </h4>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Comparative performance scored across {simResults.sample_size || sampleSize} simulated viewer profiles
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">
                Simulation Finished
              </span>
            </div>

            {/* Results Table */}
            <div className="overflow-x-auto rounded-xl border border-[var(--border-hairline)]">
              <table className="w-full text-left text-xs divide-y divide-[var(--border-hairline)]">
                <thead className="font-mono text-[10px] uppercase tracking-wider bg-[var(--bg-card-inner)] text-[var(--text-dim)]">
                  <tr>
                    <th className="p-3.5">ID</th>
                    <th className="p-3.5">Tested Hook Text</th>
                    <th className="p-3.5">Score</th>
                    <th className="p-3.5 text-emerald-400">Loved %</th>
                    <th className="p-3.5 text-rose-400">Skipped %</th>
                    <th className="p-3.5">Clickbait Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-hairline)] bg-[var(--bg-card)]">
                  {simResults.items.map((r, rIdx) => (
                    <tr key={rIdx} className="hover:bg-white/[0.02] transition">
                      <td className="p-3.5 font-mono text-[var(--brand-volt)] font-bold">{r.sid}</td>
                      <td className="p-3.5 font-medium text-[var(--text-primary)] max-w-md">{r.hook_text}</td>
                      <td className="p-3.5 font-mono font-black text-sm text-[var(--text-display)]">
                        {r.score.toFixed(2)}
                      </td>
                      <td className="p-3.5 font-mono text-emerald-400 font-bold">
                        {(r.best * 100).toFixed(0)}%
                      </td>
                      <td className="p-3.5 font-mono text-rose-400 font-bold">
                        {(r.worst * 100).toFixed(0)}%
                      </td>
                      <td className="p-3.5 font-mono text-[var(--text-muted)]">
                        {(r.clickbait * 100).toFixed(0)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Deploy to Live Cosmitude Human Panel */}
            <div className="p-5 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-400 uppercase tracking-wider">
                    Ground Truth Validation
                  </span>
                  <span className="text-[10px] text-[var(--text-dim)] font-mono">ParallelHookStudy Protocol</span>
                </div>
                <h5 className="font-bold text-sm text-[var(--text-primary)]">
                  Deploy ParallelHookStudy to Real Human Viewers
                </h5>
                <p className="text-xs text-[var(--text-secondary)]">
                  Automatically dispatch these candidate hooks to panel members on Cosmitude Bridge to verify simulation accuracy with real human survey ratings.
                </p>
                {panelSendResult === 'success' && (
                  <div className="text-xs text-emerald-400 font-semibold pt-1 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Successfully dispatched study to live Cosmitude Bridge forum!</span>
                  </div>
                )}
                {panelSendResult === 'error' && (
                  <div className="text-xs text-rose-400 font-semibold pt-1 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Failed to post to panel. Ensure server and Bridge collector are active.</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={onSendToPanel}
                disabled={sendingToPanel || !hooksText.trim()}
                className="shrink-0 px-5 py-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 disabled:opacity-50"
              >
                {sendingToPanel ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deploying Study...</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Post Study to Users ↗</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
