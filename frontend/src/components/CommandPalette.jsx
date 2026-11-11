import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, Sparkles, Check, ArrowRight, X, Clock, Video, Zap } from 'lucide-react';

export default function CommandPalette({
  isOpen,
  onClose,
  onSelectCreator,
  currentQuery = '',
  suggestions = [],
  onQueryChange,
  recentSearches = [],
  isLoading = false
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      const totalItems = suggestions.length;
      if (totalItems === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % totalItems);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + totalItems) % totalItems);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (suggestions[selectedIndex]) {
          onSelectCreator(suggestions[selectedIndex]);
          onClose();
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, suggestions, selectedIndex, onSelectCreator, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.children[selectedIndex];
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-md animate-cmd">
      <div 
        className="w-full max-w-2xl bg-[var(--modal-bg)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl shadow-black/90 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Command Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border-hairline)] bg-[var(--bg-card)]">
          <Search className="w-5 h-5 text-[var(--brand-volt)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={currentQuery}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search any creator, channel handle, or niche..."
            className="w-full bg-transparent text-sm sm:text-base text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none font-medium"
          />
          {currentQuery && (
            <button
              type="button"
              onClick={() => onQueryChange('')}
              className="p-1 rounded-md text-[var(--text-muted)] hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded border border-[var(--border-hairline)] text-[var(--text-dim)] bg-white/[0.04]">
            ESC
          </kbd>
        </div>

        {/* Suggestion & Results Stream */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-white/[0.04]">
          {suggestions.length > 0 ? (
            suggestions.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={idx}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => {
                    onSelectCreator(item);
                    onClose();
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl transition cursor-pointer ${
                    isSelected 
                      ? 'bg-[var(--brand-volt-glow)] border border-[var(--brand-volt)] text-[var(--text-primary)] shadow-sm' 
                      : 'hover:bg-white/[0.03] text-[var(--text-secondary)] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                      item.is_direct_input 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                        : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                    }`}>
                      {item.is_direct_input ? <Sparkles className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[var(--text-primary)] truncate">
                          {item.name}
                        </span>
                        {item.is_direct_input ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Direct Creator
                          </span>
                        ) : item.score ? (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-[var(--text-muted)] font-medium">
                            {Math.round(item.score * 100)}% Match
                          </span>
                        ) : null}
                      </div>
                      <span className="text-xs text-[var(--text-muted)] truncate block mt-0.5">
                        {item.niche || 'Digital Content & Strategy'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isSelected && (
                      <kbd className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] px-2 py-1 rounded bg-[var(--brand-volt)] text-[var(--bg-canvas)] font-bold">
                        ENTER ↵
                      </kbd>
                    )}
                    <ArrowRight className={`w-4 h-4 transition ${isSelected ? 'text-[var(--brand-volt)] translate-x-1' : 'text-transparent'}`} />
                  </div>
                </div>
              );
            })
          ) : currentQuery.trim().length > 0 ? (
            <div 
              onClick={() => {
                onSelectCreator({ name: currentQuery.trim(), is_direct_input: true });
                onClose();
              }}
              className="p-4 rounded-xl text-center hover:bg-white/[0.04] transition cursor-pointer border border-dashed border-[var(--border-subtle)]"
            >
              <Sparkles className="w-5 h-5 mx-auto text-[var(--brand-volt)] mb-1.5" />
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                Analyze "{currentQuery.trim()}" Directly
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Universal Creator Recognition will decouple their viral footprint on demand.
              </p>
            </div>
          ) : (
            /* Recent Searches & Preset Shelf */
            <div className="p-3 space-y-3">
              {recentSearches.length > 0 && (
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-dim)] font-bold px-2 mb-2 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> Recent Searches
                  </div>
                  <div className="space-y-1">
                    {recentSearches.slice(0, 4).map((r, rIdx) => (
                      <button
                        key={rIdx}
                        type="button"
                        onClick={() => {
                          onSelectCreator({ name: r.creator_name, comparison_creator: r.comparison_creator });
                          onClose();
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.04] flex items-center justify-between transition cursor-pointer"
                      >
                        <span className="font-medium">{r.creator_name} {r.comparison_creator ? `vs ${r.comparison_creator}` : ''}</span>
                        <span className="text-[10px] font-mono text-[var(--text-dim)]">Cached Dossier</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-dim)] font-bold px-2 mb-2 flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-[var(--brand-volt)]" /> Verified Benchmark Creators
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'CarryMinati', niche: 'Comedy & Roasts' },
                    { name: 'MrBeast', niche: 'High-Stakes Challenges' },
                    { name: 'Dhruv Rathee', niche: 'Explanatory Journalism' },
                    { name: 'Aakash Dhawan', niche: 'Motovlogging & Travel' }
                  ].map((p, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => {
                        onSelectCreator(p);
                        onClose();
                      }}
                      className="text-left p-2.5 rounded-xl border border-[var(--border-hairline)] hover:border-[var(--brand-volt)] bg-[var(--bg-card)] hover:bg-white/[0.04] transition cursor-pointer"
                    >
                      <div className="font-semibold text-xs text-[var(--text-primary)]">{p.name}</div>
                      <div className="text-[10px] text-[var(--text-muted)] truncate">{p.niche}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Command Footer */}
        <div className="px-4 py-2.5 bg-[var(--bg-card-inner)] border-t border-[var(--border-hairline)] flex items-center justify-between text-[11px] font-mono text-[var(--text-dim)]">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="text-[var(--brand-volt)] font-semibold">HookLab Command Engine</span>
        </div>
      </div>
    </div>,
    document.body
  );
}
