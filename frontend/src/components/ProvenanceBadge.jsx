import React, { useState } from 'react';
import { ShieldCheck, Calculator, Sparkles, Info } from 'lucide-react';

/**
 * ProvenanceBadge component
 * Enforces product integrity by clearly labeling every metric and dataset as:
 * - VERIFIED (official public API / playable video / verified subscriber count)
 * - CALCULATED (mathematically derived from verified public reach x niche CPM benchmarks)
 * - AI-ESTIMATE (synthesized via LLM models or synthetic audience persona simulations)
 */
export default function ProvenanceBadge({ type = 'verified', label, size = 'sm' }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const configs = {
    verified: {
      title: 'Verified Platform Data',
      desc: 'Extracted directly from official public platform APIs, verified YouTube oEmbed, or authentic channel footprints.',
      tag: 'VERIFIED',
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
      icon: ShieldCheck
    },
    calculated: {
      title: 'Calculated Market Benchmark',
      desc: 'Derived mathematically using creator audience scale, verified engagement rates, and standardized niche CPM multipliers.',
      tag: 'CALCULATED',
      bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25',
      icon: Calculator
    },
    estimate: {
      title: 'AI-Synthesized Projection',
      desc: 'Generated via synthetic audience persona simulations or LLM intelligence models. Represents a statistical projection rather than verified private analytics.',
      tag: 'AI-ESTIMATE',
      bg: 'bg-purple-500/10 text-purple-400 border-purple-500/25',
      icon: Sparkles
    }
  };

  const cfg = configs[type] || configs.verified;
  const Icon = cfg.icon;

  const isXs = size === 'xs';

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className={`inline-flex items-center gap-1 font-mono font-bold tracking-wider uppercase rounded-md border transition cursor-pointer select-none ${
          isXs ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]'
        } ${cfg.bg}`}
      >
        <Icon className={isXs ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
        <span>{label || cfg.tag}</span>
        <Info className={isXs ? 'w-2 h-2 opacity-60' : 'w-2.5 h-2.5 opacity-60'} />
      </button>

      {showTooltip && (
        <div className="absolute bottom-full left-0 mb-2 w-56 p-2.5 rounded-xl bg-[var(--modal-bg,#0d0f18)] border border-[var(--border-subtle,#202333)] shadow-2xl z-50 text-left pointer-events-none">
          <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold text-white">
            <Icon className="w-3.5 h-3.5 text-[var(--brand-volt,#bef264)]" />
            <span>{cfg.title}</span>
          </div>
          <p className="text-[10px] text-[var(--text-secondary,#94a3b8)] leading-relaxed">
            {cfg.desc}
          </p>
        </div>
      )}
    </div>
  );
}
