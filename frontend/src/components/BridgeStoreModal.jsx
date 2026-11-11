import React from 'react';
import { createPortal } from 'react-dom';
import { Cloud, Database, RefreshCw, X, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function BridgeStoreModal({
  isOpen,
  onClose,
  user,
  bridgeStoreData,
  loadingBridgeStore,
  onRestoreSession
}) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-cmd">
      <div 
        className="relative w-full max-w-2xl max-h-[85vh] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-2xl flex flex-col bg-[var(--modal-bg)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[var(--border-hairline)]">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                <Cloud className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-black text-lg text-[var(--text-display)]">
                Cosmitude Bridge History &amp; User Store
              </h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Isolated cloud storage and synchronization under Cosmitude forum set <strong>{bridgeStoreData?.bridge_set || `Set_${user}`}</strong>.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Set & Sync Status Badge */}
        <div className="my-4 p-3.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 flex items-center justify-between text-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase font-bold">Bridge Isolated Namespace</span>
            <div className="font-mono font-bold text-indigo-400">{bridgeStoreData?.bridge_set || `Set_${user}`}</div>
          </div>
          <div className="text-right space-y-0.5">
            <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase font-bold">Set Status</span>
            <div className="flex items-center gap-1.5 justify-end text-emerald-400 font-semibold font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{bridgeStoreData?.bridge_sync?.status === 'active' ? 'Active on Bridge' : 'Provisioned'}</span>
            </div>
          </div>
        </div>

        {/* Stored Sessions Content */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1">
          {loadingBridgeStore ? (
            <div className="text-center py-12 text-[var(--text-muted)] text-xs">
              <RefreshCw className="w-5 h-5 mx-auto animate-spin mb-2 text-indigo-400" />
              Loading stored Bridge dossiers...
            </div>
          ) : !bridgeStoreData?.bridge_store || Object.keys(bridgeStoreData.bridge_store).length === 0 ? (
            <div className="text-center py-12 space-y-2 text-[var(--text-muted)] text-xs border border-dashed border-[var(--border-subtle)] rounded-xl">
              <Database className="w-8 h-8 mx-auto opacity-30 text-indigo-400" />
              <p className="font-semibold text-[var(--text-primary)]">No Dossiers Stored Yet in Bridge Store</p>
              <p className="text-[11px] text-[var(--text-dim)] max-w-sm mx-auto">
                When you analyze creators while signed in as @{user}, your dossiers and blueprints are securely stored here and synced to Cosmitude Bridge.
              </p>
            </div>
          ) : (
            Object.entries(bridgeStoreData.bridge_store).map(([creatorKey, sessions]) => (
              <div key={creatorKey} className="p-4 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-card)] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-[var(--text-primary)] capitalize">
                    {creatorKey.replace(/_/g, ' ')}
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-[var(--text-dim)]">
                    {Array.isArray(sessions) ? `${sessions.length} Session(s)` : '1 Session'}
                  </span>
                </div>

                <div className="space-y-2">
                  {(Array.isArray(sessions) ? sessions : [sessions]).map((s, sIdx) => (
                    <div key={s.session_id || sIdx} className="p-3 rounded-lg bg-[var(--bg-card-inner)] border border-[var(--border-hairline)] flex items-center justify-between gap-3 text-xs">
                      <div className="space-y-0.5 truncate">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[var(--text-primary)]">{s.niche || 'Digital Content'}</span>
                          {s.comparison_creator && (
                            <span className="text-[10px] text-[var(--text-dim)]">vs {s.comparison_creator}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-[var(--text-dim)] font-mono">
                          <span>Saved: {s.stored_at ? new Date(s.stored_at).toLocaleDateString() : 'Recent'}</span>
                          <span>•</span>
                          <span>{s.content_ideas_count || 0} Ideas</span>
                          <span>•</span>
                          <span>{s.hooks_generated || 0} Hooks</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onRestoreSession(s.creator_name, s.comparison_creator || '');
                          onClose();
                        }}
                        className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer flex items-center gap-1"
                      >
                        <span>Restore Run</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-[var(--border-hairline)] flex items-center justify-between text-xs text-[var(--text-dim)]">
          <span className="font-mono text-[11px]">Synced with Cosmitude Bridge Gateway</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[var(--border-hairline)] hover:bg-white/[0.04] text-[var(--text-primary)] font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
