import React, { useState } from 'react';
import {
  DollarSign, Users, Globe, BarChart3, TrendingUp,
  Sliders, ShieldCheck, Sparkles, Award
} from 'lucide-react';
import HelpTooltip from './HelpTooltip';
import { formatCurrencyRange, normalizeCountryDemographics } from '../utils/formatters';

export default function MonetizationAndDemographicsModule({
  intelData
}) {
  const [currency, setCurrency] = useState('USD');
  const [simViews, setSimViews] = useState(500000);
  const [simCpm, setSimCpm] = useState(4.5);

  if (!intelData) return null;

  const rateCard = intelData.commercial_rate_card || {};
  const demographics = intelData.audience_demographics || {};
  const normalizedCountries = normalizeCountryDemographics(demographics.top_countries);

  // Parse simulated earnings
  const estEarnings = Math.round((simViews / 1000) * simCpm);

  return (
    <section id="reach" className="space-y-6">
      {/* ─── 01. SPONSORSHIP PRICE GUIDE (WHAT BRANDS PAY) ────────────────── */}
      <div className="control-room-card rounded-2xl p-6 sm:p-8 space-y-6 bg-[var(--bg-card)]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-[var(--border-hairline)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-xl text-[var(--text-display)]">
                Sponsorship Price Guide (What Brands Pay)
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Market rate-card estimates across dedicated YouTube videos, Instagram Reels, and stories
              </p>
            </div>
          </div>

          {/* Currency Switcher Toggle: USD vs INR */}
          <div className="flex items-center gap-3">
            <div className="flex items-center p-1 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-hairline)]">
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                  currency === 'USD'
                    ? 'bg-[var(--brand-volt)] text-[#07080B] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-white'
                }`}
              >
                USD ($)
              </button>
              <button
                type="button"
                onClick={() => setCurrency('INR')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                  currency === 'INR'
                    ? 'bg-[var(--brand-volt)] text-[#07080B] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-white'
                }`}
              >
                INR (₹)
              </button>
            </div>

            <HelpTooltip
              title="Sponsorship Pricing Guide"
              description="Calculated based on verified audience demographics, view volume, and industry CPM benchmarks. Switch currencies between USD ($) and INR (₹) seamlessly."
              align="right"
            />
          </div>
        </div>

        {/* 3 Main Rate Cards with visual indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-[var(--bg-card-inner)] border border-[var(--border-hairline)] space-y-2">
            <span className="text-[10px] font-mono text-red-400 uppercase font-bold tracking-wider block">
              Dedicated YouTube Video
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 telemetry-num">
              {formatCurrencyRange(rateCard.est_youtube_rate, currency)}
            </div>
            <span className="text-[11px] text-[var(--text-dim)] font-mono block">
              30-60s integrated or dedicated sponsorship
            </span>
          </div>

          <div className="p-5 rounded-xl bg-[var(--bg-card-inner)] border border-[var(--border-hairline)] space-y-2">
            <span className="text-[10px] font-mono text-pink-400 uppercase font-bold tracking-wider block">
              Instagram Dedicated Reel
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 telemetry-num">
              {formatCurrencyRange(rateCard.est_instagram_reel_rate, currency)}
            </div>
            <span className="text-[11px] text-[var(--text-dim)] font-mono block">
              High-retention vertical brand integration
            </span>
          </div>

          <div className="p-5 rounded-xl bg-[var(--bg-card-inner)] border border-[var(--border-hairline)] space-y-2">
            <span className="text-[10px] font-mono text-purple-400 uppercase font-bold tracking-wider block">
              Instagram Story Series
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 telemetry-num">
              {formatCurrencyRange(rateCard.est_story_rate, currency)}
            </div>
            <span className="text-[11px] text-[var(--text-dim)] font-mono block">
              3-frame sequential swipe-up series
            </span>
          </div>
        </div>

        {/* Sponsor Compatibility & Brand Value */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
          <div className="p-4 rounded-xl bg-[var(--bg-card-inner)] border border-[var(--border-hairline)] space-y-3">
            <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase font-bold tracking-wider block">
              Highest-Converting Sponsor Categories:
            </span>
            <div className="flex flex-wrap gap-2">
              {rateCard.brand_affinity_niches?.map((nch, nIdx) => (
                <span
                  key={nIdx}
                  className="px-3 py-1 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-subtle)] text-[var(--text-primary)] font-medium text-xs"
                >
                  {nch}
                </span>
              ))}
            </div>

            {rateCard.past_or_likely_sponsors?.length > 0 && (
              <div className="pt-3 border-t border-[var(--border-hairline)]">
                <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase block mb-1 font-bold">
                  Verified or Compatible Brand Partners:
                </span>
                <span className="font-semibold text-sm text-[var(--text-primary)]">
                  {rateCard.past_or_likely_sponsors.join(', ')}
                </span>
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-card-inner)] border border-[var(--border-hairline)] space-y-2">
            <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase font-bold tracking-wider block">
              Why Brands Love Sponsoring Them:
            </span>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
              {rateCard.why_brands_partner || 'Massive audience attention density, high demographic alignment, and reliable view delivery on every upload.'}
            </p>
          </div>
        </div>
      </div>

      {/* ─── 02. AUDIENCE DEMOGRAPHICS TELEMETRY (100% SUMMED) ───────────── */}
      <div className="control-room-card rounded-2xl p-6 sm:p-8 space-y-6 bg-[var(--bg-card)]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-[var(--border-hairline)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-xl text-[var(--text-display)]">
                Audience Demographics &amp; Geographic Distribution
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Accurate geographic footprint, age cohort segmentation, and gender breakdown (100% normalized)
              </p>
            </div>
          </div>
          <HelpTooltip
            title="Audience Demographics"
            description="Geographic breakdown of viewers, age cohort distribution, and gender split, normalized to 100% visual integrity."
            align="right"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Geographic Breakdown (100% normalized with Other Regions) */}
          <div className="p-5 rounded-xl bg-[var(--bg-card-inner)] border border-[var(--border-hairline)] space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase font-bold tracking-wider">
                Top Geographic Countries (100% Summed)
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">100% Total</span>
            </div>

            <div className="space-y-3">
              {normalizedCountries.map((c, cIdx) => (
                <div key={cIdx} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-[var(--text-primary)]">{c.country}</span>
                    <span className="font-mono font-bold text-[var(--brand-volt)]">{c.share}</span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden bg-[var(--bg-card)] border border-[var(--border-hairline)]">
                    <div
                      className={`h-full rounded-full ${
                        c.isRemainder ? 'bg-zinc-600' : 'bg-gradient-to-r from-indigo-500 to-[var(--brand-volt)]'
                      }`}
                      style={{ width: `${c.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Age & Gender Segmentation */}
          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-[var(--bg-card-inner)] border border-[var(--border-hairline)] space-y-2">
              <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase font-bold tracking-wider block">
                Primary Age Cohort:
              </span>
              <div className="text-2xl font-black text-[var(--text-display)] telemetry-num">
                {demographics.primary_age || '18-24 (Gen Z)'}
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                Prime commercial buying demographic with peak digital consumption
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[var(--bg-card-inner)] border border-[var(--border-hairline)] space-y-2">
              <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase font-bold tracking-wider block">
                Audience Gender Split:
              </span>
              <div className="text-2xl font-black text-cyan-400 telemetry-num">
                {demographics.gender_skew || '76% Male / 24% Female'}
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden bg-[var(--bg-card)] border border-[var(--border-hairline)] flex">
                <div className="bg-cyan-500 h-full w-[76%]" />
                <div className="bg-pink-500 h-full w-[24%]" />
              </div>
              <div className="text-[10px] font-mono text-[var(--text-dim)] flex justify-between">
                <span>Male</span>
                <span>Female</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 03. AUDIENCE SIZE & AD RATES (INTERACTIVE SIMULATOR) ────────── */}
      <div className="control-room-card rounded-2xl p-6 sm:p-8 space-y-6 bg-[var(--bg-card)]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-[var(--border-hairline)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-xl text-[var(--text-display)]">
                Audience Size &amp; Ad Rates Predictor
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Simulate potential campaign revenue across variable view delivery and CPM brackets
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Interactive Sliders */}
          <div className="md:col-span-7 space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[var(--text-muted)]">Projected Campaign Views:</span>
                <span className="font-bold text-[var(--brand-volt)]">
                  {simViews >= 1000000 ? `${(simViews / 1000000).toFixed(1)}M Views` : `${(simViews / 1000).toFixed(0)}K Views`}
                </span>
              </div>
              <input
                type="range"
                min="50000"
                max="5000000"
                step="50000"
                value={simViews}
                onChange={(e) => setSimViews(parseInt(e.target.value))}
                className="w-full accent-[var(--brand-volt)] cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[var(--text-muted)]">Estimated Niche CPM:</span>
                <span className="font-bold text-cyan-400">${simCpm.toFixed(2)} CPM</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="20.0"
                step="0.5"
                value={simCpm}
                onChange={(e) => setSimCpm(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Earnings Readout */}
          <div className="md:col-span-5 p-6 rounded-2xl bg-gradient-to-br from-[#131626] to-[#0A0C13] border border-[var(--brand-volt)]/40 shadow-xl text-center space-y-1">
            <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase font-bold tracking-wider block">
              Estimated Gross Ad Revenue
            </span>
            <div className="text-3xl sm:text-4xl font-black text-[var(--brand-volt)] telemetry-num">
              ${estEarnings.toLocaleString()}
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-1">
              Based on {simViews.toLocaleString()} views at ${simCpm.toFixed(2)} CPM
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
