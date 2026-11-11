import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Play, Pause, RotateCcw, FastForward, Rewind, Camera } from 'lucide-react';

export default function TeleprompterModal({
  isOpen,
  onClose,
  script = []
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(2); // 1 = slow, 2 = normal, 3 = fast
  const scrollContainerRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const scrollSpeed = speed * 0.8;
    function step() {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop += scrollSpeed;
      }
      animFrameRef.current = requestAnimationFrame(step);
    }
    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, isPlaying, speed]);

  const restartScroll = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    setIsPlaying(true);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-[#07080B] text-white flex flex-col overflow-hidden select-none">
      {/* Teleprompter Floating Control Dock */}
      <div className="h-18 px-6 border-b border-white/10 bg-black/60 backdrop-blur-xl flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
          <div>
            <div className="font-heading font-black text-sm uppercase tracking-wider text-white">
              Studio Teleprompter Active
            </div>
            <div className="text-[11px] font-mono text-zinc-400">
              Press [SPACE] to pause/resume · [ESC] to exit
            </div>
          </div>
        </div>

        {/* Playback & Speed Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={restartScroll}
            className="p-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-zinc-300 hover:text-white transition cursor-pointer"
            title="Restart from Beginning"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setSpeed(s => Math.max(1, s - 1))}
            className="p-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-zinc-300 hover:text-white transition cursor-pointer"
            title="Slow Down"
          >
            <Rewind className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 py-2 rounded-xl bg-[var(--brand-volt)] text-[#07080B] font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            type="button"
            onClick={() => setSpeed(s => Math.min(5, s + 1))}
            className="p-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-zinc-300 hover:text-white transition cursor-pointer"
            title="Speed Up"
          >
            <FastForward className="w-4 h-4" />
          </button>

          <div className="font-mono text-xs text-[var(--brand-volt)] px-2 py-1 rounded bg-white/[0.06] border border-white/10 font-bold">
            {speed}x Speed
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.08] hover:bg-red-500/20 text-zinc-300 hover:text-red-400 transition cursor-pointer ml-3"
            title="Exit Teleprompter"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Prompter Scrolling Canvas */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-6 py-20 max-w-4xl mx-auto w-full space-y-16 text-center"
      >
        <div className="text-zinc-600 font-mono text-xs uppercase tracking-widest pt-8">
          ─── SCENE-BY-SCENE FILMING PROMPTER BEGINS ───
        </div>

        {script.map((scene, idx) => (
          <div key={idx} className="space-y-4 py-6 border-b border-white/10">
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-[var(--brand-volt)]/20 text-[var(--brand-volt)] border border-[var(--brand-volt)]/40">
                SCENE #{scene.scene}
              </span>
              <span className="font-mono text-xs text-cyan-400 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                {scene.shot_type} Shot
              </span>
              <span className="font-mono text-xs text-zinc-400">
                ⏱ {scene.duration_seconds}s
              </span>
            </div>

            <div className="text-xl sm:text-2xl text-zinc-300 font-medium max-w-2xl mx-auto">
              {scene.action}
            </div>

            {scene.dialogue_or_caption && (
              <div className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-heading tracking-tight max-w-3xl mx-auto leading-tight text-[var(--brand-volt)]">
                "{scene.dialogue_or_caption}"
              </div>
            )}
          </div>
        ))}

        <div className="text-zinc-600 font-mono text-xs uppercase tracking-widest pb-32">
          ─── FILMING SCRIPT COMPLETE ───
        </div>
      </div>
    </div>,
    document.body
  );
}
