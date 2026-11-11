import React, { useState } from 'react';
import {
  Layers, ChevronDown, ChevronUp, Sparkles, CheckCircle2,
  Clock, Zap, Target, Palette, Volume2, Copy, Check, FileText, Camera, Image, ShieldAlert, MessageSquare
} from 'lucide-react';
import HelpTooltip from './HelpTooltip';

export default function StyleBlueprintModule({ copyData }) {
  const [expandedStep, setExpandedStep] = useState(0); // Open step 1 by default so user immediately sees the end result
  const [copiedStep, setCopiedStep] = useState(null);

  if (!copyData) return null;

  const styleDna = copyData.style_card || {};
  const creatorName = copyData.target_creator || 'This Creator';
  const nicheName = copyData.target_niche || 'Digital Content';

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(idx);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const defaultRoadmap = [
    {
      step: 1,
      title: 'Reverse-Engineer Top Hook',
      difficulty: 'Easy',
      time_estimate: '2h',
      action: `Transcribe the first 3 seconds of ${creatorName}'s top 3 uploads and mirror their exact sentence cadence, tension trigger, and visual cut rate.`,
      expected_result: '3 battle-tested, production-ready opening hook scripts with director cues matching their retention benchmark.',
      deliverable: {
        headline: 'Deconstructed Openings & 3 Ready-to-Record Mirrored Hooks',
        breakdown: [
          {
            label: 'Reverse-Engineered Pattern',
            text: '[Sensory / Audio Anomaly at 0.5s] + [High-Stakes Constraint or Personal Bet] + [Visual Jump Cut at 1.4s]'
          },
          {
            label: 'Script #1 (High-Stakes Challenge / Drop)',
            text: '"Watch what happens to this room when I drop this unreleased edit at 130 BPM." (Visual: Extreme close-up of fingers poised over cue button → snap cut to wide crowd shot holding breath).'
          },
          {
            label: 'Script #2 (Curiosity Flip / Insider Secret)',
            text: '"Nobody believed this acoustic melody could work in a club setting until this transition." (Visual: Split screen comparing original track vs. massive DAW waveform with red drop marker).'
          },
          {
            label: 'Script #3 (Social Jeopardy / Relatable Bet)',
            text: '"If the crowd doesn’t start jumping in the next 15 seconds, the promoter doesn’t pay for my flight home." (Visual: POV looking over decks into audience, countdown overlay ticking down).'
          }
        ]
      }
    },
    {
      step: 2,
      title: 'Shot Framing & B-Roll Match',
      difficulty: 'Medium',
      time_estimate: '4h',
      action: 'Film in Close and Medium alternating frames every 3 to 4 seconds to maintain kinetic momentum and eliminate early retention drop-offs.',
      expected_result: 'Frame-by-frame 60-second visual pacing matrix with focal lengths, camera movements, and audio sync markers.',
      deliverable: {
        headline: '0:00–1:00 Dynamic Shot Sequence & Rhythm Matrix',
        breakdown: [
          {
            label: '0:00–0:03 (Scene 1 - Cold Open)',
            text: 'Extreme Close-Up (ECU, 50mm f/1.8): Fingers slamming cue button on mixer. Micro push-in. SFX: Sub-bass riser building.'
          },
          {
            label: '0:03–0:07 (Scene 2 - Stakes Hook)',
            text: 'Medium Shot (MS, 24mm f/2.8): Creator looking down lens, headphones around neck, speaking hook. Handheld natural kinetic sway.'
          },
          {
            label: '0:07–0:11 (Scene 3 - Proof / Tension)',
            text: 'Over-The-Shoulder (OTS, 35mm): Camera whips into glowing screen/hardware meters peaking in the red. SFX: Accelerating snare roll.'
          },
          {
            label: '0:11–0:15 (Scene 4 - Payoff / Atmosphere)',
            text: 'Wide Shot (WS, 16mm ultra-wide): Low angle, room/stage lighting switch, crowd erupts. SFX: Sub-bass drop hits on 0:11.2.'
          },
          {
            label: '0:15–0:20 (Scene 5 - Micro-Tutorial)',
            text: 'Close-Up (CU, 35mm): Smooth tilt down from face to knobs adjusting low-pass filter with frequency visualizer graphic.'
          }
        ]
      }
    },
    {
      step: 3,
      title: 'Thumbnail Specular Contrast',
      difficulty: 'Easy',
      time_estimate: '1h',
      action: `Create a high-contrast thumbnail using ${creatorName}'s visual composition zones, rim-lighting color theory, and 3-word curiosity headline formula.`,
      expected_result: 'Complete thumbnail design blueprint with exact hex color codes, composition coordinates, and 3 tested headline variations.',
      deliverable: {
        headline: 'Thumbnail Production Canvas & 3-Word Headline Formula',
        breakdown: [
          {
            label: 'Composition Power Grid',
            text: 'Left 45%: High-emotion face cutout with sharp specular rim light. Right 55%: High-contrast curiosity anchor (e.g. glowing DAW waveform with warning sticker or highlighted equipment). Bottom-right clear for timestamp.'
          },
          {
            label: 'Lighting & Color Codes',
            text: 'Background: Deep Obsidian Navy (#080C14). Specular Rim Light: Electric Volt Lime (#C6FF00) or Hot Cyan (#00F0FF). Key Light: Crisp 5600K Daylight on face.'
          },
          {
            label: 'Tested 3-Word Headlines',
            text: 'Option A: "THEY WALKED OUT?" | Option B: "WRONG BPM DISASTER" | Option C: "NEVER PLAY THIS"'
          },
          {
            label: 'AI / Designer Prompt',
            text: '"Cinematic candid photograph of a music producer in dark neon studio, looking at camera in shock, split lighting cyan and warm amber, high specular highlights on headphones, 8k resolution, rule of thirds --ar 16:9"'
          }
        ]
      }
    },
    {
      step: 4,
      title: 'Mid-Roll Curiosity Loop',
      difficulty: 'Medium',
      time_estimate: '3h',
      action: 'Introduce a secondary question or unexpected technical hurdle at the 50% runtime mark before resolving the opening premise.',
      expected_result: 'Mid-roll re-hook script and visual pattern interrupt designed to spike retention past the 45-second audience cliff.',
      deliverable: {
        headline: '50% Runtime Retention Re-Hook Script & Audio Freeze',
        breakdown: [
          {
            label: 'The Retention Cliff',
            text: 'Audience retention naturally dips 35-40% at midpoint when viewers assume the outcome is predictable. This script prevents that drop.'
          },
          {
            label: 'The Audio/Visual Freeze (At 50% Mark)',
            text: 'Audio cuts to dead silence with a 1.2s room reverb tail. Camera crash-zooms into creator freezing with hands in the air.'
          },
          {
            label: 'The Spoken Re-Hook Dialogue',
            text: '"Wait. Right as I was about to play the drop, I realized a fatal problem. If the sound system doesn’t support sub-30Hz frequencies, this whole drop sounds like static. So I had to make an emergency call..."'
          },
          {
            label: 'On-Screen Visual Graphic',
            text: 'Flashing red diagnostic overlay showing "SUB FREQUENCY CLIPPING DETECTED" to visually validate the emergency stakes.'
          }
        ]
      }
    },
    {
      step: 5,
      title: 'Community Payoff CTA',
      difficulty: 'Easy',
      time_estimate: '30m',
      action: 'Deliver an open-ended debate question in the final 5 seconds to drive rapid comment engagement velocity in the first hour.',
      expected_result: '2 high-converting closing scripts and a pre-formatted pinned comment template engineered for algorithmic comment volume.',
      deliverable: {
        headline: 'High-Velocity Comment Traps & Pinned Comment Blueprint',
        breakdown: [
          {
            label: 'Closing Script A (The Tribal Debate Trap)',
            text: '"Be honest in the comments: would you ever drop this vocal over a Jersey beat, or did I ruin a classic? Replying to everyone for the next 60 minutes."'
          },
          {
            label: 'Closing Script B (The Download / Stems Incentive)',
            text: '"I exported the full stems and Ableton rack. If this gets 500 comments, I’ll drop the Google Drive link in the pinned comment. Which track should I flip next?"'
          },
          {
            label: 'Ready-to-Paste Pinned Comment',
            text: '"🚨 90% of you said the transition at 0:28 was illegal... but what did you think of the second drop at 0:42? Drop your timestamp rating below (1-10) 👇 (Replying to the first 50 people!)"'
          }
        ]
      }
    }
  ];

  const rawRoadmap = copyData.blueprints?.[0]?.action_roadmap || copyData.blueprints?.[0]?.steps || copyData.style_card?.clone_roadmap;
  
  // Merge default deliverables into roadmap steps if raw data lacks detailed deliverables
  const roadmap = defaultRoadmap.map((defStep, idx) => {
    if (rawRoadmap && rawRoadmap[idx]) {
      const raw = rawRoadmap[idx];
      return {
        ...defStep,
        step: raw.step || defStep.step,
        title: raw.title || defStep.title,
        action: raw.action || defStep.action,
        difficulty: raw.difficulty || defStep.difficulty,
        time_estimate: raw.time_estimate || defStep.time_estimate,
        expected_result: raw.expected_result || defStep.expected_result,
        deliverable: raw.deliverable || defStep.deliverable
      };
    }
    return defStep;
  });

  return (
    <div className="space-y-6">
      {/* ─── 01. STYLE DNA MATRIX ────────────────────────────────────────── */}
      <div className="control-room-card rounded-2xl p-6 sm:p-8 space-y-6 bg-[var(--bg-card)]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-[var(--border-hairline)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-lg text-[var(--text-display)]">
                The Creator's Secret Recipe (Style DNA)
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Core editing tempo, visual framing, and psychological retention triggers
              </p>
            </div>
          </div>
          <HelpTooltip
            title="Style DNA Architecture"
            description="Deconstructs the exact narrative rhythm, editing cuts-per-minute, visual thumbnail patterns, and psychological call-to-actions that drive this creator's retention."
            align="right"
          />
        </div>

        {/* 6-Part DNA Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[var(--bg-card-inner)] border border-[var(--border-hairline)] space-y-1.5">
            <span className="font-mono text-[10px] text-cyan-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" /> Opening Hook Strategy
            </span>
            <p className="text-[var(--text-secondary)] leading-relaxed text-xs sm:text-sm font-medium">
              {styleDna.hook_formula || 'Instant stakes or visual anomaly presented in under 2.5 seconds.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-card-inner)] border border-[var(--border-hairline)] space-y-1.5">
            <span className="font-mono text-[10px] text-indigo-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> Video Story Structure
            </span>
            <p className="text-[var(--text-secondary)] leading-relaxed text-xs sm:text-sm font-medium">
              {styleDna.content_structure || 'Fast linear progression with escalating challenges every 30 seconds.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-card-inner)] border border-[var(--border-hairline)] space-y-1.5">
            <span className="font-mono text-[10px] text-[var(--brand-volt)] uppercase font-bold tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Editing Speed &amp; Rhythm
            </span>
            <p className="text-[var(--text-secondary)] leading-relaxed text-xs sm:text-sm font-medium">
              {styleDna.editing_rhythm || 'Cut every 2.8 to 3.5 seconds with sound design punctuation on every visual change.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-card-inner)] border border-[var(--border-hairline)] space-y-1.5">
            <span className="font-mono text-[10px] text-amber-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" /> Thumbnail Design Recipe
            </span>
            <p className="text-[var(--text-secondary)] leading-relaxed text-xs sm:text-sm font-medium">
              {styleDna.thumbnail_formula || 'High-contrast facial expression + bold visual centerpiece with 2 words max.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-card-inner)] border border-[var(--border-hairline)] space-y-1.5">
            <span className="font-mono text-[10px] text-emerald-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5" /> Call-to-Action Pattern
            </span>
            <p className="text-[var(--text-secondary)] leading-relaxed text-xs sm:text-sm font-medium">
              {styleDna.cta_pattern || 'Integrated seamlessly into the climax without pausing video momentum.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-card-inner)] border border-[var(--border-hairline)] space-y-1.5">
            <span className="font-mono text-[10px] text-rose-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Viral Psychological Trigger
            </span>
            <p className="text-[var(--text-secondary)] leading-relaxed text-xs sm:text-sm font-medium">
              {styleDna.viral_trigger || 'Social validation through extreme commitment, curiosity gap, or relatable absurdity.'}
            </p>
          </div>
        </div>
      </div>

      {/* ─── 02. 5-STEP ACTION PLAN (IMPLEMENTATION ROADMAP WITH EXACT OUTPUTS) ─────────────── */}
      <div className="control-room-card rounded-2xl p-6 sm:p-8 space-y-6 bg-[var(--bg-card)]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-[var(--border-hairline)]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-black text-lg text-[var(--text-display)]">
                5-Step Action Plan to Replicate Their Success
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-[var(--brand-volt)]/10 text-[var(--brand-volt)] text-[10px] font-mono font-bold uppercase border border-[var(--brand-volt)]/20">
                Done-For-You Deliverables
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Complete production directives paired with the exact generated end results ready to execute immediately.
            </p>
          </div>
          <span className="font-mono text-xs text-[var(--brand-volt)] font-bold">
            {roadmap.length} Production Deliverables
          </span>
        </div>

        <div className="space-y-4">
          {roadmap.map((step, sIdx) => {
            const isOpen = expandedStep === sIdx;
            const diffColor = 
              step.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
              step.difficulty === 'Hard' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
              'bg-amber-500/10 text-amber-400 border-amber-500/30';

            const deliverableText = step.deliverable?.breakdown
              ? step.deliverable.breakdown.map(b => `${b.label}:\n${b.text}`).join('\n\n')
              : step.expected_result;

            return (
              <div
                key={sIdx}
                className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'border-[var(--brand-volt)]/30 bg-[var(--bg-card-inner)] shadow-lg shadow-black/20'
                    : 'border-[var(--border-hairline)] bg-[var(--bg-card-inner)] hover:border-white/10'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedStep(isOpen ? null : sIdx)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02] transition"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className={`w-7 h-7 rounded-lg border font-mono text-xs font-black flex items-center justify-center shrink-0 transition ${
                      isOpen
                        ? 'bg-[var(--brand-volt)] text-black border-[var(--brand-volt)] shadow-md shadow-[var(--brand-volt)]/20'
                        : 'bg-[var(--bg-subtle)] border-[var(--border-hairline)] text-[var(--brand-volt)]'
                    }`}>
                      {step.step || sIdx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-heading font-bold text-sm text-[var(--text-primary)]">
                          {step.title}
                        </span>
                        <span className={`font-mono text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase ${diffColor}`}>
                          {step.difficulty || 'Medium'}
                        </span>
                        <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold uppercase flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Output Ready
                        </span>
                      </div>
                      <div className="text-xs text-[var(--text-muted)] truncate mt-1">
                        {step.action}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {step.time_estimate && (
                      <span className="font-mono text-[11px] text-[var(--text-dim)] hidden sm:flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[var(--text-muted)]" /> {step.time_estimate}
                      </span>
                    )}
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-[var(--brand-volt)]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-3 space-y-4 border-t border-[var(--border-hairline)] bg-[var(--bg-subtle)]/60 text-xs">
                    {/* Directives Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-lg bg-[var(--bg-card-inner)] border border-[var(--border-hairline)] space-y-1">
                        <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold flex items-center gap-1.5">
                          <FileText className="w-3 h-3" /> Specific Production Directive
                        </span>
                        <p className="text-[var(--text-secondary)] leading-relaxed text-xs">
                          {step.action}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-lg bg-[var(--bg-card-inner)] border border-[var(--border-hairline)] space-y-1">
                        <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold flex items-center gap-1.5">
                          <Target className="w-3 h-3" /> Target Milestone / Benchmark
                        </span>
                        <p className="text-[var(--text-secondary)] leading-relaxed text-xs">
                          {step.expected_result}
                        </p>
                      </div>
                    </div>

                    {/* EXACT OUTPUT DELIVERABLE CARD */}
                    {step.deliverable && (
                      <div className="rounded-xl border border-[var(--brand-volt)]/20 bg-[var(--bg-card)]/90 p-4 sm:p-5 space-y-3.5 shadow-inner">
                        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[var(--border-hairline)]">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[var(--brand-volt)]" />
                            <span className="font-heading font-black text-xs sm:text-sm text-[var(--text-primary)]">
                              Exact Finished Output: {step.deliverable.headline}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(deliverableText, sIdx)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] border border-[var(--border-hairline)] text-[11px] font-mono text-[var(--brand-volt)] font-bold transition cursor-pointer"
                          >
                            {copiedStep === sIdx ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Deliverable</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="space-y-2.5">
                          {step.deliverable.breakdown.map((item, iIdx) => (
                            <div
                              key={iIdx}
                              className="p-3 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-hairline)] space-y-1"
                            >
                              <span className="font-mono text-[10px] text-[var(--brand-volt)] uppercase font-bold tracking-wider block">
                                ➔ {item.label}
                              </span>
                              <p className="text-[var(--text-secondary)] text-xs leading-relaxed font-sans">
                                {item.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
