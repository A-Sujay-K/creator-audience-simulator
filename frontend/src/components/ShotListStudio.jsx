import React, { useState } from 'react';
import {
  FileText, Play, Copy, Check, Tv, Camera, Mic,
  Maximize2, Clock, CheckSquare, Square, Download
} from 'lucide-react';
import HelpTooltip from './HelpTooltip';

export default function ShotListStudio({
  blueprints = [],
  onOpenTeleprompter
}) {
  const [copied, setCopied] = useState(false);
  const [checkedGear, setCheckedGear] = useState({});

  if (!blueprints || blueprints.length === 0) return null;

  const script = blueprints[0]?.shooting_script || [];
  const gear = blueprints[0]?.equipment_needed || [];

  // Calculate total runtime in seconds
  const totalRuntimeSeconds = script.reduce((acc, row) => acc + (parseFloat(row.duration_seconds) || 0), 0);
  const minutes = Math.floor(totalRuntimeSeconds / 60);
  const seconds = totalRuntimeSeconds % 60;
  const runtimeFormatted = `${minutes > 0 ? `${minutes}m ` : ''}${seconds}s`;

  // Detect whether ANY row has a dialogue/voiceover string
  const hasDialogue = script.some(r => r.dialogue_or_caption && r.dialogue_or_caption.trim().length > 0);

  const toggleGear = (item) => {
    setCheckedGear(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const copyScriptText = () => {
    const text = script.map(r => 
      `Scene ${r.scene} [${r.shot_type}] (${r.duration_seconds}s): ${r.action}${r.dialogue_or_caption ? ` | Line: "${r.dialogue_or_caption}"` : ''}`
    ).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="blueprints" className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-black text-xl text-[var(--text-display)]">
              Scene-by-Scene Video Shooting Script ("Shot-List Studio")
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Production filming directives with shot framing, duration pacing, and teleprompter mode
            </p>
          </div>
          <HelpTooltip
            title="Shot-List Studio & Teleprompter"
            description="Complete filming breakdown specifying camera framing, on-screen actions, and audio cues per scene. Launch Teleprompter mode for high-contrast on-set filming."
            tip="Total video duration is dynamically synchronized with the creator's viral pacing."
            align="right"
          />
        </div>

        {/* Global Script Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyScriptText}
            className="px-3.5 py-2 rounded-xl border border-[var(--border-hairline)] hover:border-[var(--brand-volt)] bg-[var(--bg-card)] text-xs font-semibold text-[var(--text-secondary)] hover:text-white transition cursor-pointer flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Script' : 'Copy Script'}</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenTeleprompter(script)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-[#07080B] transition cursor-pointer flex items-center gap-2 shadow-md shadow-cyan-500/20"
          >
            <Tv className="w-3.5 h-3.5 text-[#07080B]" />
            <span>Teleprompter Mode</span>
          </button>
        </div>
      </div>

      <div className="control-room-card rounded-2xl p-6 sm:p-8 space-y-6 bg-[var(--bg-card)]">
        {/* Runtime Badge Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--border-hairline)] text-xs">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-[var(--text-dim)] uppercase font-bold">
              Total Target Runtime:
            </span>
            <span className="font-mono font-bold text-sm text-[var(--brand-volt)] px-2.5 py-0.5 rounded-lg bg-[var(--brand-volt)]/10 border border-[var(--brand-volt)]/30">
              {runtimeFormatted} (Short-Form Pacing)
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--text-dim)]">
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            <span>{script.length} Master Scenes</span>
          </div>
        </div>

        {/* Horizontal Storyboard Timeline */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase font-bold tracking-wider block">
            Visual Storyboard Timeline:
          </span>
          <div className="w-full h-8 rounded-xl overflow-hidden bg-[var(--bg-card-inner)] border border-[var(--border-hairline)] flex">
            {script.map((row, idx) => {
              const weight = (parseFloat(row.duration_seconds) || 3) / (totalRuntimeSeconds || 1);
              const colors = ['bg-indigo-500', 'bg-cyan-500', 'bg-blue-600', 'bg-violet-500', 'bg-emerald-500'];
              const bg = colors[idx % colors.length];

              return (
                <div
                  key={idx}
                  style={{ width: `${Math.max(8, weight * 100)}%` }}
                  className={`${bg} h-full border-r border-black/30 flex items-center justify-center text-[10px] font-mono font-bold text-white transition hover:opacity-90 relative group`}
                  title={`Scene ${row.scene}: ${row.action} (${row.duration_seconds}s)`}
                >
                  <span className="truncate px-1">S{row.scene} ({row.duration_seconds}s)</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Script Table — Dynamically Hides Dialogue Column If Empty! */}
        <div className="overflow-x-auto rounded-xl border border-[var(--border-hairline)]">
          <table className="w-full text-left text-xs divide-y divide-[var(--border-hairline)]">
            <thead className="font-mono text-[10px] uppercase tracking-wider bg-[var(--bg-card-inner)] text-[var(--text-dim)]">
              <tr>
                <th className="p-3.5">Scene</th>
                <th className="p-3.5">Camera Framing</th>
                <th className="p-3.5">On-Screen Action &amp; Directives</th>
                {hasDialogue && <th className="p-3.5">Dialogue / Spoken Line</th>}
                <th className="p-3.5 text-right">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-hairline)] bg-[var(--bg-card)]">
              {script.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-white/[0.02] transition">
                  <td className="p-3.5 font-mono text-[var(--brand-volt)] font-bold">
                    #{row.scene}
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-white/[0.06] border border-[var(--border-hairline)] text-[var(--text-primary)]">
                      {row.shot_type}
                    </span>
                  </td>
                  <td className="p-3.5 text-[var(--text-primary)] font-medium leading-relaxed">
                    {row.action}
                  </td>
                  {hasDialogue && (
                    <td className="p-3.5 font-semibold text-[var(--text-primary)] italic">
                      {row.dialogue_or_caption ? `"${row.dialogue_or_caption}"` : <span className="text-[var(--text-dim)] font-mono text-[10px]">Visual scene (no voiceover)</span>}
                    </td>
                  )}
                  <td className="p-3.5 font-mono text-[var(--text-muted)] font-bold text-right">
                    {row.duration_seconds}s
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Gear & Shoot-Day Checklist */}
        {gear.length > 0 && (
          <div className="pt-4 border-t border-[var(--border-hairline)] space-y-3">
            <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase font-bold tracking-wider block">
              Shoot-Day Gear Checklist (Click to mark packed):
            </span>
            <div className="flex flex-wrap gap-2.5">
              {gear.map((item, gIdx) => {
                const isChecked = !!checkedGear[item];
                return (
                  <button
                    key={gIdx}
                    type="button"
                    onClick={() => toggleGear(item)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition cursor-pointer flex items-center gap-2 ${
                      isChecked
                        ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 line-through opacity-75'
                        : 'border-[var(--border-hairline)] bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-white'
                    }`}
                  >
                    {isChecked ? (
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-[var(--text-dim)] shrink-0" />
                    )}
                    <span>{item}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
