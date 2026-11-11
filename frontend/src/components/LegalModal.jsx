import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Shield, FileText, Cpu, X, Trash2, AlertTriangle } from 'lucide-react';

export default function LegalModal({
  isOpen,
  onClose,
  initialTab = 'privacy',
  currentUser,
  onDeleteAccount
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-cmd">
      <div 
        className="border border-[var(--border-subtle)] rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5 bg-[var(--modal-bg)] max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-[var(--border-hairline)] shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[var(--brand-volt)]/15 text-[var(--brand-volt)]">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-base text-[var(--text-display)]">
                Trust, Compliance & Privacy Center
              </h3>
              <p className="text-[11px] text-[var(--text-muted)] font-mono">
                HookLab Studio Data Rights & AI Transparency
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-white text-sm cursor-pointer p-1.5 rounded-lg hover:bg-white/[0.05]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-[var(--border-hairline)] pb-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'privacy'
                ? 'bg-[var(--brand-volt)] text-[#07080B] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Privacy Policy</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'terms'
                ? 'bg-[var(--brand-volt)] text-[#07080B] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Terms of Use</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ai'
                ? 'bg-[var(--brand-volt)] text-[#07080B] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>AI & Methodology</span>
          </button>

          {currentUser && (
            <button
              type="button"
              onClick={() => setActiveTab('account')}
              className={`ml-auto px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'account'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-rose-400 hover:text-rose-300'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Data Deletion</span>
            </button>
          )}
        </div>

        {/* Tab Content (Scrollable) */}
        <div className="overflow-y-auto space-y-4 text-xs text-[var(--text-secondary)] leading-relaxed pr-1 flex-1">
          {activeTab === 'privacy' && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-[var(--text-primary)]">1. User Privacy & Data Protection</h4>
              <p>
                HookLab Studio is built with privacy-by-design principles. User access PINs are protected using salted PBKDF2-HMAC-SHA256 (100,000 rounds) with cryptographically random salts. We never store plain text passwords.
              </p>
              <h4 className="font-bold text-sm text-[var(--text-primary)]">2. Public Information & Research Scope</h4>
              <p>
                All creator research, upload titles, views, and transcripts are indexed strictly from publicly available web sources (such as public YouTube searches, official oEmbed endpoints, and public social bios). We do not access private creator studio accounts or non-public personal information.
              </p>
              <h4 className="font-bold text-sm text-[var(--text-primary)]">3. Data Retention & Isolation</h4>
              <p>
                Each user workspace is cryptographically isolated. Your searches, notes, and custom hook tests remain strictly private to your account. We do not sell or monetize personal creator research data.
              </p>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-[var(--text-primary)]">1. Permitted Workspace Use</h4>
              <p>
                HookLab Studio provides strategic intelligence for independent content creators, producers, and editors. You agree to use the research outputs, style formulas, and video ideas ethically and in compliance with intellectual property and platform policies.
              </p>
              <h4 className="font-bold text-sm text-[var(--text-primary)]">2. No Guarantee of Algorithm Distribution</h4>
              <p>
                While our Hook Simulator models are calibrated against empirical audience engagement patterns, HookLab Studio does not guarantee specific YouTube or Instagram algorithm view counts, follower gains, or commercial sponsorship commitments.
              </p>
              <h4 className="font-bold text-sm text-[var(--text-primary)]">3. Platform Compliance & Embeds</h4>
              <p>
                All embedded preview players utilize YouTube's privacy-enhanced domain (youtube-nocookie.com) under sandbox constraints respecting content creator rights and platform terms of service.
              </p>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-[var(--text-primary)]">1. Synthetic Audience Persona Simulation</h4>
              <p>
                HookLab Simulator runs candidate video hooks through synthetic persona profiles varying across age brackets, attention spans, and regional interests. Scoring follows an anti-sycophancy model grounded in real-world viewer swipe velocities.
              </p>
              <h4 className="font-bold text-sm text-[var(--text-primary)]">2. Transparency & Provenance Badges</h4>
              <p>
                Every metric in the UI displays an explicit provenance badge:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong className="text-emerald-400">VERIFIED:</strong> Direct public platform data (oEmbed videos, verified subscribers, active URLs).</li>
                <li><strong className="text-cyan-400">CALCULATED:</strong> Mathematically derived using audience scale and verified industry CPM benchmarks.</li>
                <li><strong className="text-purple-400">AI-ESTIMATE:</strong> Projections synthesized via LLMs or synthetic audience simulations.</li>
              </ul>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-4 p-4 rounded-xl bg-rose-500/5 border border-rose-500/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-rose-300">Permanent Account & Data Erasure</h4>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    In compliance with GDPR and CCPA Right to be Forgotten regulations, you can permanently delete your workspace profile, cached searches, and Cosmitude Bridge store dossiers.
                  </p>
                </div>
              </div>

              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white transition cursor-pointer flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Request Full Account Deletion</span>
                </button>
              ) : (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2">
                  <p className="text-xs text-rose-200 font-semibold">
                    Are you sure? This will permanently delete your user profile and all saved dossiers.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteAccount();
                        onClose();
                      }}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition cursor-pointer"
                    >
                      Yes, Delete My Data Permanently
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-white transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[var(--border-hairline)] flex justify-between items-center shrink-0">
          <span className="text-[10px] font-mono text-[var(--text-dim)]">
            HookLab Studio • Production Security & Trust Compliance
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[var(--bg-subtle)] text-[var(--text-primary)] hover:text-white transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
