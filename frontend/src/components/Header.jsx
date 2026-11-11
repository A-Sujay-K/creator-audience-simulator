import React, { useState } from 'react';
import { Search, Zap, Sun, Moon, Cpu, Menu, ShieldCheck } from 'lucide-react';

export default function Header({
  activeCreator,
  comparisonCreator,
  onOpenCommandPalette,
  theme,
  onToggleTheme,
  onToggleMobileNav
}) {
  const isDark = theme === 'dark';
  const [engineInfoOpen, setEngineInfoOpen] = useState(false);

  return (
    <header className="h-16 border-b border-[var(--border-hairline)] px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-30 glass-dock">
      {/* Left: Mobile hamburger + Context Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileNav}
          className="md:hidden p-2 rounded-lg border border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-white"
          aria-label="Toggle navigation"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <span className="font-heading font-extrabold text-sm sm:text-base tracking-tight text-[var(--text-display)]">
            HookLab Studio
          </span>
          <span className="text-[var(--text-dim)] hidden sm:inline">/</span>
          {activeCreator ? (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-subtle)] text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-volt)]"></span>
              <span className="font-bold text-[var(--text-primary)]">{activeCreator}</span>
              {comparisonCreator && (
                <>
                  <span className="text-[var(--text-dim)]">vs</span>
                  <span className="font-semibold text-[var(--brand-cyan)]">{comparisonCreator}</span>
                </>
              )}
            </div>
          ) : (
            <span className="text-xs text-[var(--text-muted)] hidden md:inline">
              Viral Pacing, Retention Decoupler &amp; Growth Studio
            </span>
          )}
        </div>
      </div>

      {/* Right: Command Bar Trigger + Telemetry Engine + Theme Button */}
      <div className="flex items-center gap-2.5">
        {/* Quick Command Palette Launcher */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--border-hairline)] hover:border-[var(--brand-volt)] bg-[var(--bg-subtle)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer shadow-xs"
        >
          <Search className="w-3.5 h-3.5 text-[var(--brand-volt)]" />
          <span className="hidden sm:inline">Search Creator</span>
          <kbd className="font-mono text-[10px] px-1.5 py-0.2 rounded border border-[var(--border-hairline)] text-[var(--text-dim)] bg-white/[0.04]">
            ⌘K
          </kbd>
        </button>

        {/* System Intelligence Telemetry Pill */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setEngineInfoOpen(!engineInfoOpen)}
            className="flex items-center gap-2 font-mono text-[11px] px-2.5 py-1.5 rounded-xl border border-[var(--border-hairline)] hover:border-[var(--border-subtle)] bg-[var(--bg-subtle)] text-[var(--text-secondary)] transition cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="hidden lg:inline font-medium">Neural Engine Active</span>
            <Cpu className="w-3.5 h-3.5 text-emerald-400 lg:hidden" />
          </button>

          {engineInfoOpen && (
            <div 
              className="absolute right-0 top-full mt-2 w-72 p-4 rounded-xl bg-[var(--modal-bg)] border border-[var(--border-subtle)] shadow-2xl shadow-black/80 z-50 text-xs text-left animate-cmd"
              onClick={() => setEngineInfoOpen(false)}
            >
              <div className="font-heading font-bold text-xs text-[var(--text-primary)] flex items-center gap-2 pb-2 mb-2 border-b border-white/[0.08]">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Distributed Telemetry Stack</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Multi-platform web scraping paired with sub-second LPU neural inference parses public video catalogs, viewer retention curves, and monetization benchmarks in real time.
              </p>
            </div>
          )}
        </div>

        {/* Theme Switcher Quick Toggle */}
        <button
          type="button"
          onClick={() => onToggleTheme(isDark ? 'light' : 'dark')}
          className="p-2 rounded-xl border border-[var(--border-hairline)] hover:border-[var(--border-subtle)] bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer"
          title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>
      </div>
    </header>
  );
}
