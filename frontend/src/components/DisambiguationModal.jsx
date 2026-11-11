import React from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, ArrowRight, X } from 'lucide-react';

export default function DisambiguationModal({
  isOpen,
  onClose,
  typedQuery,
  similarSuggestions = [],
  niche,
  onConfirmSelection
}) {
  if (!isOpen) return null;

  const directItem = similarSuggestions.find(s => s.is_direct_input);
  const directNiche = directItem?.niche || niche || 'Specialized Creative Media';

  const alternatives = similarSuggestions.filter(
    s => !s.is_direct_input && s.name.toLowerCase() !== typedQuery.toLowerCase()
  );

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-cmd">
      <div 
        className="relative w-full max-w-lg rounded-2xl border border-[var(--brand-volt)]/40 p-6 shadow-2xl bg-[var(--modal-bg)] overflow-hidden space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[var(--border-hairline)]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[var(--brand-volt)]/15 text-[var(--brand-volt)]">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-heading font-extrabold text-base text-[var(--text-display)]">
                Confirm Target Creator
              </h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Confirm your target creator or choose a similar verified channel:
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Featured Primary Action: The User's Entered Creator */}
        <div className="p-4 rounded-xl border-2 border-[var(--brand-volt)] bg-[var(--brand-volt)]/10 flex items-center justify-between gap-3 shadow-inner">
          <div className="space-y-1 truncate">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[var(--text-primary)] truncate">
                {typedQuery}
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--brand-volt)] text-[#07080B]">
                Direct Match
              </span>
            </div>
            <span className="text-xs text-[var(--text-secondary)] block truncate">
              {directNiche}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onConfirmSelection(typedQuery, directNiche)}
            className="shrink-0 px-4 py-2 rounded-xl text-xs font-bold bg-[var(--brand-volt)] hover:bg-[var(--brand-volt-hover)] text-[#07080B] transition flex items-center gap-1.5 shadow-md shadow-[var(--brand-volt-glow)] cursor-pointer"
          >
            <span>Analyze "{typedQuery}"</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* List of Similar Channels (if any alternatives exist) */}
        {alternatives.length > 0 && (
          <div className="space-y-2 pt-1">
            <div className="text-[11px] font-mono uppercase font-bold text-[var(--text-dim)]">
              Or Did You Mean One of These Verified Channels?
            </div>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {alternatives.map((s, idx) => (
                <div
                  key={idx}
                  onClick={() => onConfirmSelection(s.name, s.niche || niche)}
                  className="p-3 rounded-xl border border-[var(--border-hairline)] hover:border-[var(--brand-volt)] bg-[var(--bg-card)] hover:bg-white/[0.04] transition cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="space-y-0.5 min-w-0 truncate">
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-bold text-xs text-[var(--text-primary)] group-hover:text-[var(--brand-volt)] transition truncate">
                        {s.name}
                      </span>
                      {s.score && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/[0.08] text-[var(--text-dim)]">
                          {Math.round(s.score * 100)}% Match
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[var(--text-muted)] block truncate">
                      {s.niche}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="shrink-0 px-3 py-1 rounded-lg text-[11px] font-bold bg-[var(--bg-subtle)] group-hover:bg-[var(--brand-volt)] text-[var(--text-primary)] group-hover:text-[#07080B] transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>Select</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
