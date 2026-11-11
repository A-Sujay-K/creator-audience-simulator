import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Swords, Tag, ArrowRight, RefreshCw, AlertTriangle, Search } from 'lucide-react';
import HelpTooltip from './HelpTooltip';

export default function AnalyzeForm({
  creatorName,
  setCreatorName,
  comparisonCreator,
  setComparisonCreator,
  niche,
  setNiche,
  onAnalyze,
  onOpenCommandPalette,
  loading,
  errorBanner,
  onDismissError,
  presetCreators = []
}) {
  return (
    <div className="space-y-6">
      {/* Brand Hero & Live Ticker */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-subtle)] text-xs font-mono text-[var(--text-secondary)]">
          <span className="w-2 h-2 rounded-full bg-[var(--brand-volt)] animate-pulse"></span>
          <span>HookLab Intelligence Deck v2.4</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--text-display)] leading-[1.1]">
          Decouple Viral Retention Mechanics. <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand-volt)] via-cyan-300 to-indigo-400">
            Clone Proven Growth Blueprints.
          </span>
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl leading-relaxed">
          Reverse-engineer any creator’s opening hook formulas, viewer retention drop-offs, commercial sponsorship price card, and scene-by-scene filming scripts.
        </p>
      </div>

      {/* Dismissible Error Banner */}
      {errorBanner && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-between text-xs text-rose-400 shadow-sm animate-cmd">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-semibold">{errorBanner}</span>
          </div>
          <button
            onClick={onDismissError}
            className="text-xs px-2.5 py-1 rounded-lg hover:bg-rose-500/20 font-bold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Console Container */}
      <div className="control-room-card rounded-2xl p-5 sm:p-7 space-y-6 bg-[var(--bg-card)]">
        {/* Console Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-[var(--border-hairline)]">
          <div>
            <h2 className="font-heading font-extrabold text-lg text-[var(--text-primary)]">
              Creator Telemetry Reconnaissance
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Live multi-platform crawl + neural hook decoupling
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-[11px] font-mono px-3 py-1 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-subtle)] flex items-center gap-1.5 text-[var(--text-secondary)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-volt)]"></span>
              <span>Autonomous Crawl</span>
            </div>
            <HelpTooltip
              title="How Creator Analysis Works"
              description="Enter any creator or channel name. HookLab crawls their public video footprint across platforms, calculates retention drop-offs, reverse-engineers their 3-second opening hook formula, and synthesizes 5 production-ready concepts."
              tip="Add a benchmark rival creator to run a comparative retention duel and generate winning hybrid hooks."
              align="right"
            />
          </div>
        </div>

        {/* Input Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Target Creator Field */}
          <div className="md:col-span-5 space-y-1.5">
            <label className="block text-[10px] font-mono uppercase font-bold tracking-wider text-[var(--text-muted)]">
              Creator to Study *
            </label>
            <div className="relative">
              <input
                type="text"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onAnalyze()}
                placeholder="e.g. MrBeast, CarryMinati, Aakash Dhawan"
                className="w-full rounded-xl pl-3.5 pr-10 py-3 text-xs sm:text-sm outline-none transition border border-[var(--border-hairline)] focus:border-[var(--brand-volt)] bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-dim)] font-medium"
              />
              <button
                type="button"
                onClick={onOpenCommandPalette}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--brand-volt)] hover:bg-white/[0.04] transition cursor-pointer"
                title="Open Command Palette (⌘K)"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Benchmark Rival Field */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="block text-[10px] font-mono uppercase font-bold tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
              <Swords className="w-3 h-3 text-[var(--brand-cyan)]" /> Benchmark Rival (Optional)
            </label>
            <input
              type="text"
              value={comparisonCreator}
              onChange={(e) => setComparisonCreator(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onAnalyze()}
              placeholder="e.g. Ashish Chanchlani, Ryan Trahan"
              className="w-full rounded-xl px-3.5 py-3 text-xs sm:text-sm outline-none transition border border-[var(--border-hairline)] focus:border-[var(--brand-cyan)] bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-dim)] font-medium"
            />
          </div>

          {/* Content Category Field */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="block text-[10px] font-mono uppercase font-bold tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
              <Tag className="w-3 h-3 text-[var(--brand-violet)]" /> Category (Optional)
            </label>
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onAnalyze()}
              placeholder="e.g. Comedy, Motovlog, Tech"
              className="w-full rounded-xl px-3.5 py-3 text-xs sm:text-sm outline-none transition border border-[var(--border-hairline)] focus:border-[var(--brand-violet)] bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-dim)] font-medium"
            />
          </div>
        </div>

        {/* Preset Shelf */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[10px] font-mono uppercase text-[var(--text-dim)] font-bold mr-1">
            Verified Benchmarks:
          </span>
          {presetCreators.map((p, pIdx) => (
            <button
              key={pIdx}
              type="button"
              onClick={() => {
                setCreatorName(p.name);
                if (p.niche) setNiche(p.niche);
              }}
              className="px-2.5 py-1 rounded-lg border border-[var(--border-hairline)] hover:border-[var(--brand-volt)] bg-[var(--bg-subtle)] text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer flex items-center gap-1.5"
            >
              <span className="font-semibold">{p.name}</span>
              <span className="text-[10px] text-[var(--text-dim)] font-mono">({p.niche})</span>
            </button>
          ))}
        </div>

        {/* Signature Action CTA Button */}
        <button
          type="button"
          onClick={onAnalyze}
          disabled={loading || !creatorName.trim()}
          className="w-full py-3.5 px-6 rounded-xl font-heading font-extrabold text-sm transition cursor-pointer flex items-center justify-center gap-2.5 bg-[var(--brand-volt)] hover:bg-[var(--brand-volt-hover)] text-[#07080B] shadow-lg shadow-[var(--brand-volt-glow)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-[#07080B]" />
              <span>Executing Autonomous Footprint Crawl...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-[#07080B]" />
              <span>Analyze Creator &amp; Generate Blueprint</span>
              <ArrowRight className="w-4 h-4 text-[#07080B]" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
