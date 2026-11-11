import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, X, Sparkles } from 'lucide-react';

export default function HelpTooltip({ title, description, tip, align = "right" }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') setIsOpen(false);
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative inline-flex items-center shrink-0">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs transition-all duration-200 cursor-pointer ${
          isOpen
            ? 'bg-[var(--brand-volt)] text-[var(--bg-canvas)] shadow-md shadow-[var(--brand-volt-glow)]'
            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.06] border border-transparent hover:border-[var(--border-hairline)]'
        }`}
        aria-label={title || "Module guide"}
        title={!isOpen ? "Inspect module telemetry" : undefined}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div
          role="tooltip"
          onClick={(e) => e.stopPropagation()}
          className={`absolute top-full mt-2.5 ${
            align === "left" ? "left-0" : "right-0"
          } w-72 sm:w-80 p-4 rounded-xl z-50 text-left bg-[var(--modal-bg)] text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-2xl shadow-black/80 backdrop-blur-2xl animate-cmd`}
          style={{ maxWidth: 'calc(100vw - 32px)' }}
        >
          {title && (
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.08]">
              <span className="font-heading font-semibold text-xs flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-volt)]"></span>
                {title}
              </span>
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[var(--text-muted)] hover:text-white p-1 rounded transition cursor-pointer"
                aria-label="Close guide"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
            {description}
          </p>
          {tip && (
            <div className="mt-3 pt-2.5 border-t border-white/[0.08] text-[11px] text-[var(--brand-volt)] flex items-start gap-2 font-medium bg-[var(--brand-volt-glow)] p-2.5 rounded-lg">
              <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span className="leading-normal">{tip}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
