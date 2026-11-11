import React from 'react';
import { createPortal } from 'react-dom';
import { User, Lock, X, ArrowRight } from 'lucide-react';

export default function AuthModal({
  isOpen,
  onClose,
  authMode,
  setAuthMode,
  authUsername,
  setAuthUsername,
  authPin,
  setAuthPin,
  authError,
  setAuthError,
  onSubmit
}) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-cmd">
      <div 
        className="border border-[var(--border-subtle)] rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-5 bg-[var(--modal-bg)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-[var(--border-hairline)]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[var(--brand-volt)]/15 text-[var(--brand-volt)]">
              <User className="w-4 h-4" />
            </div>
            <h3 className="font-heading font-extrabold text-sm text-[var(--text-display)]">
              {authMode === 'login' ? 'Sign In to Workspace' : 'Create Creator Workspace'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-white text-sm cursor-pointer p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="block text-[10px] font-mono text-[var(--text-dim)] uppercase font-bold tracking-wider">
              Username
            </label>
            <input
              type="text"
              value={authUsername}
              onChange={(e) => setAuthUsername(e.target.value)}
              placeholder="e.g. asuja"
              className="w-full rounded-xl p-3 outline-none border border-[var(--border-hairline)] focus:border-[var(--brand-volt)] bg-[var(--bg-input)] text-[var(--text-primary)] transition font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-mono text-[var(--text-dim)] uppercase font-bold tracking-wider">
              Access PIN (3-4 digits)
            </label>
            <input
              type="password"
              value={authPin}
              onChange={(e) => setAuthPin(e.target.value)}
              placeholder="••••"
              className="w-full rounded-xl p-3 outline-none border border-[var(--border-hairline)] focus:border-[var(--brand-volt)] bg-[var(--bg-input)] text-[var(--text-primary)] transition font-mono tracking-widest text-center"
            />
          </div>

          {authError && (
            <div className="text-[11px] text-rose-400 font-semibold bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
              {authError}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl font-bold transition cursor-pointer bg-[var(--brand-volt)] hover:bg-[var(--brand-volt-hover)] text-[#07080B] shadow-md shadow-[var(--brand-volt-glow)] flex items-center justify-center gap-2"
          >
            <span>{authMode === 'login' ? 'Sign In' : 'Create Profile'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center pt-1 border-t border-[var(--border-hairline)]">
          <button
            type="button"
            onClick={() => {
              setAuthMode(authMode === 'login' ? 'signup' : 'login');
              setAuthError('');
            }}
            className="text-[11px] text-[var(--text-secondary)] hover:text-white cursor-pointer font-medium transition"
          >
            {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
