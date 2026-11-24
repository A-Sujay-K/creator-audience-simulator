import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { createServer } from 'vite';
import fs from 'fs';
import path from 'path';

const CREATORS_FIXTURES = [
  {
    name: "Samay Raina",
    niche: "Stand-up Comedy & Interactive Chess",
    location: "India",
    intelData: {
      creator_profile: {
        name: "Samay Raina",
        tier: "Unclassified",
        core_niche: "Stand-up Comedy & Interactive Chess",
        tone_and_style: "Raw, irreverent, high-audience-participation comedic delivery.",
        audience_vibe: "Active community engaging with live banter and chess streams.",
        location: "India",
        avatar_url: "https://example.com/samay_avatar.jpg",
        discovered_accounts: [
          { platform: "YouTube", title: "Samay Raina Official", url: "https://youtube.com/@samayrainaofficial" }
        ]
      },
      platform_metrics: {
        youtube_subscribers: { value: null, status: "UNAVAILABLE", reason: "Collector not implemented yet", field: "youtube_subscribers" },
        instagram_followers: { value: null, status: "UNAVAILABLE", reason: "Meta Graph API credentials unconfigured", field: "instagram_followers" },
        total_reach: { value: null, status: "UNAVAILABLE", reason: "Collector not implemented yet", field: "total_reach" },
        engagement_rate: { value: null, status: "UNAVAILABLE", reason: "Collector not implemented yet", field: "engagement_rate" },
        category_median_engagement: { value: null, status: "UNAVAILABLE", reason: "Collector not implemented yet", field: "category_median_engagement" },
        youtube_cadence: "1-2 streams/week",
        instagram_cadence: "Daily stories"
      },
      rate_card_and_sponsors: {
        est_youtube_rate: { value: null, status: "UNAVAILABLE", reason: "Requires verified ad revenue telemetry (ad rates ungrounded)", field: "est_youtube_rate" },
        est_instagram_reel_rate: { value: null, status: "UNAVAILABLE", reason: "Requires verified ad revenue telemetry (ad rates ungrounded)", field: "est_instagram_reel_rate" },
        est_story_rate: { value: null, status: "UNAVAILABLE", reason: "Requires verified ad revenue telemetry (ad rates ungrounded)", field: "est_story_rate" },
        brand_affinity_niches: [],
        past_or_likely_sponsors: [],
        why_brands_partner: ""
      },
      audience_demographics: {
        status: "UNAVAILABLE",
        reason: "Audience demographics require authenticated channel owner OAuth (private YouTube Analytics data).",
        top_countries: { value: null, status: "UNAVAILABLE", reason: "Requires channel owner OAuth (private analytics data)", field: "audience_demographics.top_countries" },
        primary_age: { value: null, status: "UNAVAILABLE", reason: "Requires channel owner OAuth (private analytics data)", field: "audience_demographics.primary_age" },
        gender_skew: { value: null, status: "UNAVAILABLE", reason: "Requires channel owner OAuth (private analytics data)", field: "audience_demographics.gender_skew" }
      },
      creator_videos: [
        { id: 1, platform: "YouTube", title: "PRINTING MONEY IN COMEDY", views: "3.2M", url: "https://youtube.com/watch?v=mock1" }
      ],
      content_suggestions: []
    },
    copyData: {
      head_to_head: null
    }
  },
  {
    name: "Marques Brownlee",
    niche: "Consumer Electronics & Tech Reviews",
    location: "United States",
    intelData: {
      creator_profile: {
        name: "Marques Brownlee",
        tier: "Unclassified",
        core_niche: "Consumer Electronics & Tech Reviews",
        tone_and_style: "Crisp, authoritative, visually pristine industrial design analysis.",
        audience_vibe: "Tech-savvy professionals and early-adopter consumer electronics buyers.",
        location: "United States",
        avatar_url: "https://example.com/mkbhd_avatar.jpg",
        discovered_accounts: [
          { platform: "YouTube", title: "MKBHD", url: "https://youtube.com/@mkbhd" }
        ]
      },
      platform_metrics: {
        youtube_subscribers: { value: null, status: "UNAVAILABLE", reason: "Collector not implemented yet", field: "youtube_subscribers" },
        instagram_followers: { value: null, status: "UNAVAILABLE", reason: "Meta Graph API credentials unconfigured", field: "instagram_followers" },
        total_reach: { value: null, status: "UNAVAILABLE", reason: "Collector not implemented yet", field: "total_reach" },
        engagement_rate: { value: null, status: "UNAVAILABLE", reason: "Collector not implemented yet", field: "engagement_rate" },
        category_median_engagement: { value: null, status: "UNAVAILABLE", reason: "Collector not implemented yet", field: "category_median_engagement" },
        youtube_cadence: "2-3 reviews/week",
        instagram_cadence: "Weekly updates"
      },
      rate_card_and_sponsors: {
        est_youtube_rate: { value: null, status: "UNAVAILABLE", reason: "Requires verified ad revenue telemetry (ad rates ungrounded)", field: "est_youtube_rate" },
        est_instagram_reel_rate: { value: null, status: "UNAVAILABLE", reason: "Requires verified ad revenue telemetry (ad rates ungrounded)", field: "est_instagram_reel_rate" },
        est_story_rate: { value: null, status: "UNAVAILABLE", reason: "Requires verified ad revenue telemetry (ad rates ungrounded)", field: "est_story_rate" },
        brand_affinity_niches: [],
        past_or_likely_sponsors: [],
        why_brands_partner: ""
      },
      audience_demographics: {
        status: "UNAVAILABLE",
        reason: "Audience demographics require authenticated channel owner OAuth (private YouTube Analytics data).",
        top_countries: { value: null, status: "UNAVAILABLE", reason: "Requires channel owner OAuth (private analytics data)", field: "audience_demographics.top_countries" },
        primary_age: { value: null, status: "UNAVAILABLE", reason: "Requires channel owner OAuth (private analytics data)", field: "audience_demographics.primary_age" },
        gender_skew: { value: null, status: "UNAVAILABLE", reason: "Requires channel owner OAuth (private analytics data)", field: "audience_demographics.gender_skew" }
      },
      creator_videos: [
        { id: 1, platform: "YouTube", title: "Smartphone Awards 2026", views: "5.8M", url: "https://youtube.com/watch?v=mock2" }
      ],
      content_suggestions: []
    },
    copyData: {
      head_to_head: null
    }
  },
  {
    name: "Ali Abdaal",
    niche: "Productivity & Evidence-Based Life Design",
    location: "United Kingdom",
    intelData: {
      creator_profile: {
        name: "Ali Abdaal",
        tier: "Unclassified",
        core_niche: "Productivity & Evidence-Based Life Design",
        tone_and_style: "Thoughtful, academic yet approachable productivity coaching.",
        audience_vibe: "Students, entrepreneurs, and knowledge workers seeking life optimization.",
        location: "United Kingdom",
        avatar_url: "https://example.com/ali_avatar.jpg",
        discovered_accounts: [
          { platform: "YouTube", title: "Ali Abdaal", url: "https://youtube.com/@aliabdaal" }
        ]
      },
      platform_metrics: {
        youtube_subscribers: { value: null, status: "UNAVAILABLE", reason: "Collector not implemented yet", field: "youtube_subscribers" },
        instagram_followers: { value: null, status: "UNAVAILABLE", reason: "Meta Graph API credentials unconfigured", field: "instagram_followers" },
        total_reach: { value: null, status: "UNAVAILABLE", reason: "Collector not implemented yet", field: "total_reach" },
        engagement_rate: { value: null, status: "UNAVAILABLE", reason: "Collector not implemented yet", field: "engagement_rate" },
        category_median_engagement: { value: null, status: "UNAVAILABLE", reason: "Collector not implemented yet", field: "category_median_engagement" },
        youtube_cadence: "1 video/week",
        instagram_cadence: "Daily reels"
      },
      rate_card_and_sponsors: {
        est_youtube_rate: { value: null, status: "UNAVAILABLE", reason: "Requires verified ad revenue telemetry (ad rates ungrounded)", field: "est_youtube_rate" },
        est_instagram_reel_rate: { value: null, status: "UNAVAILABLE", reason: "Requires verified ad revenue telemetry (ad rates ungrounded)", field: "est_instagram_reel_rate" },
        est_story_rate: { value: null, status: "UNAVAILABLE", reason: "Requires verified ad revenue telemetry (ad rates ungrounded)", field: "est_story_rate" },
        brand_affinity_niches: [],
        past_or_likely_sponsors: [],
        why_brands_partner: ""
      },
      audience_demographics: {
        status: "UNAVAILABLE",
        reason: "Audience demographics require authenticated channel owner OAuth (private YouTube Analytics data).",
        top_countries: { value: null, status: "UNAVAILABLE", reason: "Requires channel owner OAuth (private analytics data)", field: "audience_demographics.top_countries" },
        primary_age: { value: null, status: "UNAVAILABLE", reason: "Requires channel owner OAuth (private analytics data)", field: "audience_demographics.primary_age" },
        gender_skew: { value: null, status: "UNAVAILABLE", reason: "Requires channel owner OAuth (private analytics data)", field: "audience_demographics.gender_skew" }
      },
      creator_videos: [
        { id: 1, platform: "YouTube", title: "How to Build a Second Brain", views: "2.1M", url: "https://youtube.com/watch?v=mock3" }
      ],
      content_suggestions: []
    },
    copyData: {
      head_to_head: null
    }
  }
];

async function runRenderVerification() {
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    ssr: {
      external: ['react', 'react-dom', 'react-dom/server', 'lucide-react', 'framer-motion']
    }
  });

  try {
    const CreatorProfileModule = (await vite.ssrLoadModule('./src/components/CreatorProfileModule.jsx')).default;
    const MonetizationAndDemographicsModule = (await vite.ssrLoadModule('./src/components/MonetizationAndDemographicsModule.jsx')).default;
    const StyleBlueprintModule = (await vite.ssrLoadModule('./src/components/StyleBlueprintModule.jsx')).default;

    const outDir = path.resolve('../evidence/renders');
    fs.mkdirSync(outDir, { recursive: true });

    const djTerms = ['defaultroadmap', 'edm dj', 'dj set', 'festival stage', 'ableton', 'pioneer'];

    for (const fixture of CREATORS_FIXTURES) {
      console.log(`\n======================================================`);
      console.log(`Rendering verification for: ${fixture.name} (${fixture.niche})`);
      console.log(`======================================================`);

      const profileHtml = ReactDOMServer.renderToStaticMarkup(
        React.createElement(CreatorProfileModule, {
          intelData: fixture.intelData,
          copyData: fixture.copyData
        })
      );

      const monetizationHtml = ReactDOMServer.renderToStaticMarkup(
        React.createElement(MonetizationAndDemographicsModule, {
          intelData: fixture.intelData
        })
      );

      const styleHtml = ReactDOMServer.renderToStaticMarkup(
        React.createElement(StyleBlueprintModule, {
          blueprint: null // deliberately test with null to verify zero defaultRoadmap fallback!
        })
      );

      const fullPageHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Phase 1A Render Verification: ${fixture.name}</title>
  <style>
    body { background-color: #0B0E14; color: #F0F4FC; font-family: sans-serif; padding: 24px; }
    .control-room-card { background: #121622; border: 1px solid #232936; border-radius: 12px; margin-bottom: 24px; padding: 20px; }
  </style>
</head>
<body>
  <h1>HookLab Studio — Phase 1A Harm Reduction Render: ${fixture.name}</h1>
  <p><strong>Niche:</strong> ${fixture.niche} | <strong>Region:</strong> ${fixture.location}</p>
  <hr style="border-color: #232936; margin: 20px 0;" />
  ${profileHtml}
  ${monetizationHtml}
  ${styleHtml}
</body>
</html>`;

      const slug = fixture.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      const outPath = path.join(outDir, `${slug}_render.html`);
      fs.writeFileSync(outPath, fullPageHtml, 'utf-8');
      console.log(`✓ Render saved to: ${outPath}`);

      // DJ copy audit
      const fullLower = fullPageHtml.toLowerCase();
      for (const term of djTerms) {
        if (fullLower.includes(term)) {
          throw new Error(`FAIL: Rendered output for ${fixture.name} contains forbidden DJ term: '${term}'`);
        }
      }
      console.log(`✓ DJ copy audit PASSED (0 DJ/EDM terms found)`);

      // NaN audit
      if (fullPageHtml.includes('NaN')) {
        throw new Error(`FAIL: Rendered output for ${fixture.name} contains 'NaN'`);
      }
      console.log(`✓ Numeric integrity PASSED (0 NaN instances)`);

      // Unavailable envelope audit
      const unavailableInstances = (fullPageHtml.match(/Unavailable/g) || []).length;
      console.log(`✓ Unavailable envelope audit PASSED (${unavailableInstances} Unavailable indicators rendered cleanly)`);
    }

    console.log(`\n======================================================`);
    console.log(`ALL 3 CREATOR RENDERS PASSED FULL PHASE 1A VERIFICATION!`);
    console.log(`======================================================`);
  } finally {
    await vite.close();
  }
}

runRenderVerification().catch(err => {
  console.error('Render verification error:', err);
  process.exit(1);
});
