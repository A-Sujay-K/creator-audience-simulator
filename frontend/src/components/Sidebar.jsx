import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, Flame, Layers, ShieldAlert, Target, TrendingUp,
  Cloud, Sun, Moon, LogOut, User, Database, ChevronRight, Activity
} from 'lucide-react';

export const NAVIGATION_SECTIONS = [
  { id: 'dossier', label: 'Creator Profile & KPI Strip', icon: Sparkles, group: 'Intelligence' },
  { id: 'ideas', label: '5 Video Ideas & Hooks', icon: Flame, badge: '5', group: 'Intelligence' },
  { id: 'blueprints', label: 'Shot-List Studio & Style DNA', icon: Layers, group: 'Intelligence' },
  { id: 'friction', label: 'Viewer Friction & Drop-offs', icon: ShieldAlert, group: 'Optimization' },
  { id: 'simulator', label: 'Video Hook Tester', icon: Target, group: 'Optimization' },
  { id: 'reach', label: 'Sponsorship & Demographics', icon: TrendingUp, group: 'Optimization' }
];

export default function Sidebar({
  activeSection,
  onNavigateSection,
  theme,
  onToggleTheme,
  user,
  userHistory = [],
  onLoadCached,
  onOpenBridgeStore,
  onOpenAuthModal,
  onSignOut,
  bridgeSyncStatus = 'active'
}) {
  const isDark = theme === 'dark';

  return (
    <aside className="w-64 fixed left-0 top-0 bottom-0 h-screen z-40 bg-[var(--bg-sidebar)] flex flex-col justify-between border-r border-[var(--border-hairline)] select-none hidden md:flex">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-[var(--border-hairline)] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-[var(--brand-volt)] to-cyan-400 p-[1.5px] shadow-lg shadow-black/50 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-[#0A0C12] rounded-[10px] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                <path d="M6 5v14M18 5v14M6 12h12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-extrabold text-sm tracking-tight text-[var(--text-display)]">
                HookLab
              </span>
            </div>
            <div className="text-[10px] text-[var(--text-dim)] font-mono">Control Room OS</div>
          </div>
        </div>
      </div>

      {/* Internal Scrollable Content (Nav & Saved Searches) */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-6">
        {/* Navigation Sections */}
        {['Intelligence', 'Optimization'].map(group => (
          <div key={group} className="space-y-1">
            <div className="px-2.5 mb-2 text-[9px] font-mono uppercase font-bold tracking-wider text-[var(--text-dim)]">
              {group === 'Intelligence' ? 'Dossier & Synthesis' : 'Retention & Monetization'}
            </div>
            <nav className="space-y-1">
              {NAVIGATION_SECTIONS.filter(s => s.group === group).map(sec => {
                const Icon = sec.icon;
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => onNavigateSection(sec.id)}
                    className={`w-full relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                      isActive
                        ? 'text-[var(--text-primary)] font-semibold'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.03]'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-sidebar-pill"
                        className="absolute inset-0 bg-white/[0.08] border border-[var(--border-subtle)] rounded-xl"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                    <div className="relative z-10 flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-[var(--brand-volt)]' : 'text-[var(--text-muted)]'
                      }`} />
                      <span className="truncate">{sec.label}</span>
                    </div>
                    {sec.badge && (
                      <span className="relative z-10 text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold bg-[var(--brand-volt)] text-[var(--bg-canvas)]">
                        {sec.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}

        {/* Saved Searches Drawer */}
        {user && userHistory.length > 0 && (
          <div className="pt-4 border-t border-[var(--border-hairline)] space-y-2">
            <div className="px-2 text-[9px] font-mono uppercase tracking-wider text-[var(--text-dim)] font-bold">
              Saved Creator Dossiers
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
              {userHistory.slice(0, 5).map((h, idx) => (
                <button
                  key={h.id || idx}
                  type="button"
                  onClick={() => onLoadCached(h.creator_name, h.comparison_creator || '')}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.04] truncate flex items-center justify-between transition cursor-pointer"
                >
                  <span className="truncate">{h.creator_name} {h.comparison_creator ? `vs ${h.comparison_creator}` : ''}</span>
                  <ChevronRight className="w-3 h-3 text-[var(--text-dim)] shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Cosmitude Bridge Store Launcher */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onOpenBridgeStore}
            className="w-full p-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/15 text-indigo-300 text-xs font-semibold flex items-center justify-between transition cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition" />
              <span>Cosmitude Bridge</span>
            </div>
            <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Synced
            </span>
          </button>
        </div>
      </div>

      {/* Pinned Bottom Deck: Single Theme Toggle & User Auth */}
      <div className="p-3.5 border-t border-[var(--border-hairline)] space-y-3 shrink-0 bg-[var(--bg-sidebar)]">
        {/* Consolidated Theme Toggle */}
        <div className="flex items-center justify-between p-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-hairline)]">
          <span className="text-xs font-medium px-2 text-[var(--text-secondary)]">Theme</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onToggleTheme('light')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                !isDark 
                  ? 'bg-white shadow-sm text-indigo-600 font-bold' 
                  : 'text-[var(--text-muted)] hover:text-white'
              }`}
            >
              <Sun className="w-3 h-3" />
              <span>Light</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleTheme('dark')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
                isDark 
                  ? 'bg-white/[0.10] shadow-sm text-[var(--brand-volt)] font-bold' 
                  : 'text-[var(--text-muted)] hover:text-black'
              }`}
            >
              <Moon className="w-3 h-3" />
              <span>Dark</span>
            </button>
          </div>
        </div>

        {/* Real User Account Block */}
        {user ? (
          <div className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-hairline)] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-7 h-7 rounded-lg bg-[var(--brand-volt)] text-[var(--bg-canvas)] font-bold font-mono text-xs flex items-center justify-center shrink-0">
                {user.charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-[var(--text-primary)] truncate">@{user}</div>
                <div className="text-[10px] font-mono text-[var(--brand-emerald)] flex items-center gap-1">
                  <Activity className="w-2.5 h-2.5" /> Workspace Active
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onSignOut}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="w-full py-2.5 px-3 rounded-xl border border-[var(--border-subtle)] hover:border-[var(--brand-volt)] bg-[var(--bg-card)] text-xs font-semibold text-[var(--text-primary)] hover:text-[var(--brand-volt)] flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In / Create Account</span>
          </button>
        )}
      </div>
    </aside>
  );
}
