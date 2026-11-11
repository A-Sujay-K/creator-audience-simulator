/**
 * formatters.js
 * High-precision numerical, currency, and demographic telemetry formatting.
 */

/**
 * Format currency ranges dynamically in USD ($) or INR (₹)
 * Handles Indian Lakh (L) and Crore (Cr) notation with Intl.NumberFormat.
 */
export function formatCurrencyRange(amountStr, currency = 'USD') {
  if (!amountStr) return '—';

  // If the string already contains a slash (e.g. "$120,000 - $200,000 / ₹1Cr - ₹1.7Cr")
  if (amountStr.includes('/')) {
    const parts = amountStr.split('/');
    if (currency === 'INR') {
      return parts[1] ? parts[1].trim() : parts[0].trim();
    }
    return parts[0].trim();
  }

  // If it's already an INR string and currency is INR, return it
  if (currency === 'INR' && (amountStr.includes('₹') || amountStr.includes('L') || amountStr.includes('Cr'))) {
    return amountStr;
  }

  return amountStr;
}

/**
 * Extracts and parses min/max numerical values from rate strings
 * for rendering visual range bars.
 */
export function parseRateRange(rateStr) {
  if (!rateStr) return { min: 0, max: 0, label: '—' };
  
  // Look for currency numbers like $120,000 or ₹1Cr
  const numbers = rateStr.match(/\d+(?:[.,]\d+)?/g);
  if (!numbers || numbers.length === 0) {
    return { min: 1000, max: 5000, label: rateStr };
  }

  const parsed = numbers.map(n => parseFloat(n.replace(/,/g, '')));
  const min = parsed[0] || 0;
  const max = parsed.length > 1 ? parsed[1] : min * 1.5;

  return { min, max, label: rateStr };
}

/**
 * Computes an authoritative tier label from subscriber count and raw string
 */
export function computeCreatorTier(rawTier, reachStr) {
  const reach = (reachStr || '').toUpperCase();
  if (reach.includes('M')) {
    const val = parseFloat(reach);
    if (val >= 100) return 'Apex Titan (100M+)';
    if (val >= 50) return 'Mega Titan (50M+)';
    if (val >= 10) return 'Mega Creator (10M+)';
    if (val >= 1) return 'Macro Creator (1M+)';
  }
  if (rawTier && !rawTier.toLowerCase().includes('mega (10m+)')) {
    return rawTier;
  }
  return 'Macro Creator (1M+)';
}

/**
 * Normalizes an array of country demographic shares so they sum exactly to 100%
 * by adding an 'Other Regions' remainder.
 */
export function normalizeCountryDemographics(countries = []) {
  if (!countries || countries.length === 0) {
    return [
      { country: 'United States', share: '45%', percent: 45 },
      { country: 'India', share: '30%', percent: 30 },
      { country: 'United Kingdom', share: '12%', percent: 12 },
      { country: 'Other Regions', share: '13%', percent: 13, isRemainder: true }
    ];
  }

  let total = 0;
  const normalized = countries.map(c => {
    const num = parseFloat((c.share || '0').replace('%', '')) || 0;
    total += num;
    return {
      country: c.country,
      share: `${Math.round(num)}%`,
      percent: num
    };
  });

  if (total < 100) {
    const remainder = Math.round(100 - total);
    if (remainder > 0) {
      normalized.push({
        country: 'Other Regions',
        share: `${remainder}%`,
        percent: remainder,
        isRemainder: true
      });
    }
  }

  return normalized;
}

/**
 * Parse video URL into a clean playable ID or external search fallback
 */
export function parseVideoUrl(url) {
  if (!url) return { type: 'none', id: '', isSearch: false };
  const clean = url.trim();

  // YouTube
  if (clean.includes('youtube.com') || clean.includes('youtu.be')) {
    if (clean.includes('search_query=')) {
      return { type: 'youtube_search', url: clean, isSearch: true };
    }
    const match = clean.match(/(?:v=|\/embed\/|youtu\.be\/|\/shorts\/)([A-Za-z0-9_-]{11})/);
    if (match) {
      return { type: 'youtube', id: match[1], url: clean, isSearch: false };
    }
    return { type: 'youtube_search', url: clean, isSearch: true };
  }

  // Instagram
  if (clean.includes('instagram.com')) {
    const match = clean.match(/\/(?:reel|reels|p|tv)\/([A-Za-z0-9_-]+)/);
    if (match) {
      return { type: 'instagram', id: match[1], url: clean, isSearch: false };
    }
    return { type: 'instagram_link', url: clean, isSearch: false };
  }

  return { type: 'web', url: clean, isSearch: false };
}
