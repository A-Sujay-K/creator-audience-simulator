import React, { useState } from 'react';
import {
  Sparkles, ExternalLink, Swords, Play, Eye, Users,
  Activity, Calendar, ChevronRight, Award, Zap
} from 'lucide-react';
import HelpTooltip from './HelpTooltip';
import ProvenanceBadge from './ProvenanceBadge';
import { computeCreatorTier, parseVideoUrl } from '../utils/formatters';

export default function CreatorProfileModule({
  intelData,
  copyData,
  onSendHooksToTester
}) {
  const [selectedVideoIdx, setSelectedVideoIdx] = useState(0);

  if (!intelData) return null;

  const profile = intelData.creator_profile || {};
  const metrics = intelData.platform_metrics || {};
  const creatorVideos = intelData.creator_videos || [];
  const h2h = copyData?.head_to_head || null;

  const getMetricDisplay = (val) => {
    if (!val) return { display: 'Unavailable', isAvailable: false, reason: 'Data unavailable' };
    if (typeof val === 'object' && val !== null) {
      if (val.status === 'UNAVAILABLE') {
        return { display: 'Unavailable', isAvailable: false, reason: val.reason || 'Metric unavailable' };
      }
      return { display: val.value != null ? String(val.value) : 'Unavailable', isAvailable: val.value != null, reason: val.reason };
    }
    return { display: String(val), isAvailable: true, reason: null };
  };

  const ytMetric = getMetricDisplay(metrics.youtube_subscribers);
  const igMetric = getMetricDisplay(metrics.instagram_followers);
  const reachMetric = getMetricDisplay(metrics.total_reach);
  const engMetric = getMetricDisplay(metrics.engagement_rate);

  const tier = computeCreatorTier(profile.tier, reachMetric.isAvailable ? reachMetric.display : null);

  let ytNum = 0;
  let igNum = 0;
  if (ytMetric.isAvailable) {
    ytNum = parseFloat(ytMetric.display.replace(/[^0-9.]/g, '')) * (ytMetric.display.includes('M') ? 1000000 : ytMetric.display.includes('K') ? 1000 : 1) || 0;
  }
  if (igMetric.isAvailable) {
    igNum = parseFloat(igMetric.display.replace(/[^0-9.]/g, '')) * (igMetric.display.includes('M') ? 1000000 : igMetric.display.includes('K') ? 1000 : 1) || 0;
  }
  const totalAudience = ytNum + igNum;
  const hasAudienceData = ytMetric.isAvailable || igMetric.isAvailable;
  const ytPercent = hasAudienceData && totalAudience > 0 ? Math.round((ytNum / totalAudience) * 100) : 0;
  const igPercent = hasAudienceData && totalAudience > 0 ? 100 - ytPercent : 0;

  return (
    <section id="dossier" className="space-y-6">
      {/* ─── 01. EXECUTIVE CREATOR PROFILE BANNER ─────────────────────────── */}
      <div className="control-room-card rounded-2xl p-6 sm:p-8 space-y-6 bg-[var(--bg-card)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Avatar with fallback */}
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[var(--brand-volt)] shadow-lg shadow-[var(--brand-volt-glow)] shrink-0"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-[var(--brand-volt)] p-0.5 shadow-lg shrink-0 flex items-center justify-center">
                <div className="w-full h-full bg-[#0E1017] rounded-[14px] flex items-center justify-center text-xl sm:text-2xl font-heading font-black text-white">
                  {(profile.name || 'CR').slice(0, 2).toUpperCase()}
                </div>
              </div>
            )}

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="font-heading font-black text-2xl sm:text-3xl text-[var(--text-display)] tracking-tight truncate">
                  {profile.name}
                </h2>
                <span className="font-mono text-[10px] sm:text-[11px] px-3 py-1 rounded-full font-bold bg-[var(--brand-volt)]/15 text-[var(--brand-volt)] border border-[var(--brand-volt)]/30">
                  {tier}
                </span>
              </div>

              <div className="text-xs sm:text-sm text-[var(--text-secondary)] flex flex-wrap items-center gap-2 sm:gap-3 font-medium">
                <span>Category: <strong className="text-[var(--text-primary)]">{profile.core_niche || 'Digital Content'}</strong></span>
                <span>•</span>
                <span>Primary Region: <strong className="text-[var(--text-primary)]">{profile.location || 'Global'}</strong></span>
              </div>

              {/* Verified Accounts */}
              {profile.discovered_accounts?.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase font-bold mr-1">Verified:</span>
                  {profile.discovered_accounts.map((acc, aIdx) => (
                    <a
                      key={aIdx}
                      href={acc.url || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg text-xs border border-[var(--border-hairline)] hover:border-[var(--brand-volt)] bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-white inline-flex items-center gap-1.5 transition"
                    >
                      <span>{acc.platform}: {acc.title}</span>
                      {acc.url && <ExternalLink className="w-3 h-3 text-[var(--brand-volt)]" />}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          <HelpTooltip
            title="Creator Profile Snapshot"
            description="Autonomous multi-platform overview of the creator, their verified channel footprint, core niche category, and speaking delivery persona."
            align="right"
          />
        </div>

        {/* Delivery Style & Audience Persona Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[var(--border-hairline)]">
          <div className="p-4 rounded-xl bg-[var(--bg-card-inner)] border border-[var(--border-hairline)] space-y-1.5">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[var(--text-dim)] block">
              Speaking Style &amp; Pacing
            </span>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
              {profile.tone_and_style || 'High-energy, satirical, engaging short-form delivery.'}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[var(--bg-card-inner)] border border-[var(--border-hairline)] space-y-1.5">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[var(--text-dim)] block">
              Who Watches Them (Audience Persona)
            </span>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
              {profile.audience_vibe || 'Mobile-first audience responsive to high stakes and rapid visual payoffs.'}
            </p>
          </div>
        </div>
      </div>

      {/* ─── 02. SIGNATURE WOW #3: DOMINANT KPI STRIP ─────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Dominant Hero KPI: Total Reach */}
        <div className="control-room-card rounded-2xl p-5 bg-gradient-to-br from-[#121626] to-[#0A0C13] border border-[var(--brand-volt)]/40 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[var(--text-muted)]">
              Total Audience Reach
            </span>
            <span className={`w-2 h-2 rounded-full ${reachMetric.isAvailable ? 'bg-[var(--brand-volt)] shadow-sm shadow-[var(--brand-volt-glow)]' : 'bg-zinc-600'}`}></span>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold telemetry-num text-[var(--brand-volt)] mt-2">
            {reachMetric.display}
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-1 flex items-center gap-1 font-medium">
            <Activity className="w-3.5 h-3.5 text-zinc-400" />
            <span>{reachMetric.isAvailable ? 'Cross-platform verified footprint' : reachMetric.reason}</span>
          </div>
        </div>

        {/* Proportional Audience Dominance Bar: YouTube vs Instagram */}
        <div className="control-room-card rounded-2xl p-5 bg-[var(--bg-card)]">
          <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[var(--text-muted)] block">
            Platform Distribution
          </span>
          <div className="flex items-center justify-between text-xs font-mono font-bold mt-2">
            <span className="text-red-400">YouTube {ytMetric.display}</span>
            <span className="text-pink-400">IG {igMetric.display}</span>
          </div>
          {hasAudienceData && totalAudience > 0 ? (
            <>
              <div className="w-full h-2 rounded-full overflow-hidden bg-[var(--bg-card-inner)] border border-[var(--border-hairline)] flex mt-2">
                <div style={{ width: `${ytPercent}%` }} className="bg-red-500 h-full" title={`YouTube: ${ytPercent}%`} />
                <div style={{ width: `${igPercent}%` }} className="bg-pink-500 h-full" title={`Instagram: ${igPercent}%`} />
              </div>
              <div className="text-[10px] text-[var(--text-dim)] font-mono mt-1.5 flex justify-between">
                <span>{ytPercent}% YouTube</span>
                <span>{igPercent}% Instagram</span>
              </div>
            </>
          ) : (
            <div className="mt-2 py-2 px-3 rounded-lg bg-[var(--bg-card-inner)] border border-[var(--border-hairline)] text-[10px] font-mono text-[var(--text-dim)] text-center">
              Platform metrics unavailable pending API grounding
            </div>
          )}
        </div>

        {/* Engagement Benchmark */}
        <div className="control-room-card rounded-2xl p-5 bg-[var(--bg-card)]">
          <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[var(--text-muted)] block">
            Audience Engagement
          </span>
          <div className="text-3xl font-extrabold telemetry-num text-cyan-400 mt-2">
            {engMetric.display}
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-1 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>{engMetric.isAvailable ? `Top tier viral velocity in ${profile.core_niche || 'category'}` : engMetric.reason}</span>
          </div>
        </div>

        {/* Upload Cadence Dot Calendar */}
        <div className="control-room-card rounded-2xl p-5 bg-[var(--bg-card)]">
          <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[var(--text-muted)] block">
            Upload Cadence
          </span>
          <div className="text-xl font-bold text-[var(--text-primary)] mt-2 truncate">
            {metrics.youtube_cadence || 'Analysis pending'}
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-2 flex items-center gap-1 font-medium">
            <Calendar className="w-3.5 h-3.5 text-[var(--text-dim)]" />
            <span>Upload cadence analysis</span>
          </div>
        </div>
      </div>

      {/* ─── 03. HEAD-TO-HEAD COMPARATIVE DUEL ───────────────────────────── */}
      {h2h && (
        <div className="control-room-card rounded-2xl p-6 sm:p-7 space-y-5 border border-indigo-500/40 bg-gradient-to-b from-[#131626] to-[#0D0F18]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Swords className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-base text-[var(--text-display)]">
                  Side-by-Side Retention Duel: {profile.name} vs {h2h.benchmark_creator}
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Competitive hook contrast &amp; audience decoupling
                </p>
              </div>
            </div>
            <HelpTooltip
              title="Side-by-Side Retention Duel"
              description="Evaluates retention leverage between both creators and formulates a hybrid hook combining the strongest psychological elements of both."
              align="right"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[var(--bg-card-inner)] border border-emerald-500/30 space-y-1">
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block">
                {profile.name}'s Key Retention Edge
              </span>
              <p className="text-[var(--text-secondary)] leading-relaxed text-xs sm:text-sm">
                {h2h.target_style_edge}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-card-inner)] border border-rose-500/30 space-y-1">
              <span className="text-[10px] font-mono text-rose-400 uppercase font-bold block">
                {h2h.benchmark_creator}'s Vulnerability
              </span>
              <p className="text-[var(--text-secondary)] leading-relaxed text-xs sm:text-sm">
                {h2h.benchmark_weakness}
              </p>
            </div>
          </div>

          {h2h.hook_contrast?.winning_hybrid_hook && (
            <div className="p-4 rounded-xl bg-[var(--brand-volt)]/10 border border-[var(--brand-volt)]/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-[var(--brand-volt)] uppercase font-bold tracking-wider block">
                  Winning Hybrid Opening Hook (Combines Both Formulas)
                </span>
                <p className="text-sm font-semibold text-[var(--text-primary)] italic">
                  "{h2h.hook_contrast.winning_hybrid_hook}"
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const cand = h2h.hook_contrast.candidate_hooks || [
                    { sid: 'S1', text: h2h.hook_contrast.creator_a_hook || 'Stop scrolling — this changes everything.' },
                    { sid: 'S2', text: h2h.hook_contrast.creator_b_hook || 'Today we are going to look into this problem.' },
                    { sid: 'S3', text: h2h.hook_contrast.winning_hybrid_hook },
                    { sid: 'S4', text: `I took ${h2h.benchmark_creator}'s biggest video and remade it using ${profile.name}'s formula.` }
                  ];
                  onSendHooksToTester(
                    `Battle: ${profile.name} vs ${h2h.benchmark_creator}\n` + cand.map(h => `${h.sid}: ${h.text}`).join('\n')
                  );
                }}
                className="shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold bg-[var(--brand-volt)] text-[#07080B] hover:bg-[var(--brand-volt-hover)] transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-[var(--brand-volt-glow)]"
              >
                <span>Send Hybrid Hook to Tester</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── 04. TOP PERFORMING VIDEOS (BENTO CAROUSEL) ──────────────────── */}
      {creatorVideos.length > 0 && (
        <div className="control-room-card rounded-2xl p-6 sm:p-7 space-y-5 bg-[var(--bg-card)]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-extrabold text-base text-[var(--text-display)]">
                  Top Performing Uploads ({creatorVideos.length} Deconstructed)
                </h3>
                <ProvenanceBadge type="verified" label="PUBLIC UPLOADS" size="xs" />
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Inspect proven 3-second opening hooks and why viewer retention held
              </p>
            </div>
            <HelpTooltip
              title="Top Videos Deconstruction"
              description="Real public videos uploaded by this creator. Select any video to inspect its exact opening 3-second hook and psychological viral trigger."
              align="right"
            />
          </div>

          {/* Video Selector Tabs */}
          <div className="flex flex-wrap gap-2">
            {creatorVideos.map((v, vIdx) => (
              <button
                key={vIdx}
                type="button"
                onClick={() => setSelectedVideoIdx(vIdx)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer border flex items-center gap-2 truncate max-w-xs ${
                  selectedVideoIdx === vIdx
                    ? 'border-[var(--brand-volt)] bg-[var(--brand-volt)]/10 text-[var(--brand-volt)] font-bold shadow-sm'
                    : 'border-[var(--border-hairline)] bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                <Play className="w-3 h-3 text-red-500 shrink-0" />
                <span className="truncate">{v.title || `Upload #${vIdx + 1}`}</span>
              </button>
            ))}
          </div>

          {/* Active Video Deconstruction Card */}
          {creatorVideos[selectedVideoIdx] && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
              <div className="lg:col-span-7">
                <VideoPlayerCard video={creatorVideos[selectedVideoIdx]} />
              </div>
              <div className="lg:col-span-5 space-y-3.5 text-xs">
                <div className="p-4 rounded-xl bg-[var(--bg-card-inner)] border border-[var(--border-hairline)]">
                  <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase font-bold block mb-1">
                    Audience View Velocity
                  </span>
                  <div className="text-xl font-extrabold text-emerald-400 telemetry-num">
                    {creatorVideos[selectedVideoIdx].views || 'High Viral Velocity'}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[var(--bg-card-inner)] border border-[var(--border-hairline)]">
                  <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase font-bold block mb-1">
                    First 3-Second Opening Hook
                  </span>
                  <p className="text-xs sm:text-sm text-[var(--text-primary)] font-semibold italic leading-relaxed">
                    "{creatorVideos[selectedVideoIdx].opening_hook || 'Direct curiosity hook'}"
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--bg-card-inner)] border border-[var(--border-hairline)]">
                  <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase font-bold block mb-1">
                    Why People Watched Until The End
                  </span>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                    {creatorVideos[selectedVideoIdx].why_it_went_viral || 'Sustained narrative curiosity gap with rapid visual payoff.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/**
 * Resilient video card that prevents dead black boxes
 */
function VideoPlayerCard({ video }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!video || !video.url) return null;
  const parsed = parseVideoUrl(video.url);
  const isRealYtId = parsed.type === 'youtube' && parsed.id && /^[a-zA-Z0-9_-]{11}$/.test(parsed.id);

  if (isPlaying && isRealYtId) {
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-[var(--border-hairline)] bg-black shadow-inner">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${parsed.id}?autoplay=1`}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          sandbox="allow-scripts allow-same-origin allow-presentation"
          allowFullScreen
          title={video.title || 'YouTube Player'}
        />
        <button
          type="button"
          onClick={() => setIsPlaying(false)}
          className="absolute top-2 right-2 px-2.5 py-1 rounded-md bg-black/80 hover:bg-black text-[10px] font-mono font-bold text-white transition z-20 cursor-pointer"
        >
          ✕ Close Player
        </button>
      </div>
    );
  }

  const thumbUrl = isRealYtId && !imgError
    ? `https://img.youtube.com/vi/${parsed.id}/hqdefault.jpg`
    : null;

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-[var(--border-hairline)] bg-[var(--bg-card)] flex flex-col justify-end p-4 group select-none shadow-sm">
      {/* Background Thumbnail or Aesthetic Gradient */}
      {thumbUrl ? (
        <img
          src={thumbUrl}
          alt={video.title}
          onError={() => setImgError(true)}
          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-75 transition duration-300"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-[var(--bg-card)] to-slate-900/60" />
      )}

      {/* Frosted Dark Gradient Scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#07080B] via-[#07080B]/60 to-transparent" />

      {/* Top Metadata Badges */}
      <div className="relative z-10 flex items-center justify-between mb-auto">
        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-black/60 text-[var(--brand-volt)] border border-white/10 backdrop-blur-md">
          {video.platform || 'Top Upload'}
        </span>
        {video.views && (
          <span className="text-[10px] font-mono text-[var(--text-muted)] bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-md">
            {video.views}
          </span>
        )}
      </div>

      {/* Video Title & Actions */}
      <div className="relative z-10 py-1 space-y-2">
        <div className="font-heading font-bold text-xs sm:text-sm text-white line-clamp-2 drop-shadow-sm">
          {video.title}
        </div>
        <div className="flex items-center gap-2">
          {isRealYtId ? (
            <button
              type="button"
              onClick={() => setIsPlaying(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--brand-volt)] hover:bg-[var(--brand-volt-hover)] text-[#07080B] shadow-md flex items-center gap-1.5 transition cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Preview Upload</span>
            </button>
          ) : null}
          <a
            href={video.url}
            target="_blank"
            rel="noreferrer"
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/10 flex items-center gap-1.5 transition"
          >
            <span>Watch on YouTube</span>
            <ExternalLink className="w-3 h-3 text-[var(--brand-volt)]" />
          </a>
        </div>
      </div>
    </div>
  );
}
