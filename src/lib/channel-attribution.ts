// ---------------------------------------------------------------------------
// Channel-specific attribution models
// ---------------------------------------------------------------------------
// Each advertising platform reports conversions using its own attribution
// models and windows. This config defines what each channel actually offers
// so the dashboard can show accurate, channel-aware comparisons.
// ---------------------------------------------------------------------------

export interface AttributionModelConfig {
  key: string;
  label: string;
  description: string;
  isDefault?: boolean;
  /** Multiplier applied to base conversions for mock comparison data */
  mockMultiplier: number;
}

// ---- Google Ads ----
const GOOGLE_ADS_MODELS: AttributionModelConfig[] = [
  {
    key: 'data-driven',
    label: 'Data-Driven',
    description:
      'Machine learning assigns credit based on actual impact of each ad interaction. This is Google\'s default and recommended model.',
    isDefault: true,
    mockMultiplier: 1.0,
  },
  {
    key: 'last-click',
    label: 'Last Click',
    description:
      '100% of conversion credit goes to the final Google ad click before purchase.',
    mockMultiplier: 1.1,
  },
];

// ---- Meta Ads ----
const META_MODELS: AttributionModelConfig[] = [
  {
    key: '7d-click-1d-view',
    label: '7-Day Click + 1-Day View',
    description:
      'Meta\'s default: credit if someone clicked an ad within 7 days OR viewed (but didn\'t click) an ad within 1 day of converting.',
    isDefault: true,
    mockMultiplier: 1.0,
  },
  {
    key: '7d-click',
    label: '7-Day Click',
    description:
      'Credit only if someone clicked an ad link within 7 days of converting. No view-through credit.',
    mockMultiplier: 0.72,
  },
  {
    key: '1d-click',
    label: '1-Day Click',
    description:
      'Strictest click window — credit only if someone clicked an ad link within 24 hours of converting.',
    mockMultiplier: 0.45,
  },
  {
    key: '1d-view',
    label: '1-Day View',
    description:
      'Credit if someone saw (but didn\'t click) an ad within 24 hours of converting. View-through only.',
    mockMultiplier: 0.28,
  },
  {
    key: 'engage-through',
    label: 'Engage-Through',
    description:
      'NEW (March 2026): Counts conversions after social clicks and non-link ad interactions. Replaced the old "Engaged View" model.',
    mockMultiplier: 0.35,
  },
  {
    key: 'incremental',
    label: 'Incremental',
    description:
      'ML-based model measuring true incremental lift — what conversions would NOT have happened without this ad. Often reports fewer conversions but more accurate value.',
    mockMultiplier: 0.55,
  },
  {
    key: 'first-conversion',
    label: 'First Conversion',
    description:
      'Optimizes for and counts only first-time converters. Critical for measuring new customer acquisition, which is BICR\'s primary growth goal.',
    mockMultiplier: 0.38,
  },
];

// ---- Microsoft Ads ----
const MICROSOFT_ADS_MODELS: AttributionModelConfig[] = [
  {
    key: 'data-driven',
    label: 'Data-Driven',
    description:
      'ML-based credit assignment across touchpoints. Microsoft\'s recommended model.',
    isDefault: true,
    mockMultiplier: 1.0,
  },
  {
    key: 'last-click',
    label: 'Last Click',
    description:
      '100% of conversion credit goes to the last Microsoft ad click before purchase.',
    mockMultiplier: 1.08,
  },
  {
    key: 'last-touch',
    label: 'Last Touch',
    description:
      '100% of credit to the last Microsoft ad interaction — includes both clicks and views.',
    mockMultiplier: 1.15,
  },
];

// ---- GA4 (Google Analytics) ----
const GA4_MODELS: AttributionModelConfig[] = [
  {
    key: 'data-driven',
    label: 'Data-Driven',
    description:
      'GA4\'s default: ML assigns credit based on observed user behavior patterns across all channels.',
    isDefault: true,
    mockMultiplier: 1.0,
  },
  {
    key: 'last-click',
    label: 'Last Click',
    description:
      '100% of credit to the final non-direct touchpoint before purchase.',
    mockMultiplier: 1.05,
  },
  {
    key: 'first-click',
    label: 'First Click',
    description:
      '100% of credit to the first channel interaction that started the customer journey.',
    mockMultiplier: 0.85,
  },
];

// ---- Klaviyo (Phase 2) ----
const KLAVIYO_MODELS: AttributionModelConfig[] = [
  {
    key: 'open-click',
    label: 'Open + Click',
    description:
      'Klaviyo\'s default: credits revenue if the recipient opened OR clicked an email within the attribution window (default 5 days for email).',
    isDefault: true,
    mockMultiplier: 1.0,
  },
  {
    key: 'click-only',
    label: 'Click-Only',
    description:
      'More conservative: credits revenue only if the recipient clicked a link in the email. Ignores opens.',
    mockMultiplier: 0.6,
  },
];

// ---- Attentive (Phase 2) ----
const ATTENTIVE_MODELS: AttributionModelConfig[] = [
  {
    key: 'click-through-30d',
    label: 'Click-Through (30-day)',
    description:
      'Attentive\'s default: credits a purchase if the customer clicked an SMS link within 30 days.',
    isDefault: true,
    mockMultiplier: 1.0,
  },
  {
    key: 'last-known-touch',
    label: 'Last-Known Touch',
    description:
      'Credits the last SMS view or click before purchase, regardless of window length.',
    mockMultiplier: 1.12,
  },
  {
    key: 'view-through',
    label: 'View-Through',
    description:
      'Credits a purchase if the customer viewed (opened) the SMS, even without clicking.',
    mockMultiplier: 1.35,
  },
];

// ---- Quantcast (Phase 2) ----
const QUANTCAST_MODELS: AttributionModelConfig[] = [
  {
    key: 'last-touch',
    label: 'Last Touch',
    description:
      'Quantcast\'s default: credits the final Quantcast ad interaction before conversion.',
    isDefault: true,
    mockMultiplier: 1.0,
  },
  {
    key: 'view-through',
    label: 'View-Through',
    description:
      'Credits a conversion after seeing (but not clicking) a display ad. Most programmatic conversions are view-through.',
    mockMultiplier: 1.8,
  },
  {
    key: 'click-through',
    label: 'Click-Through',
    description:
      'Credits a conversion only after clicking a display ad. Much stricter for programmatic.',
    mockMultiplier: 0.15,
  },
];

// ---- PostPilot (Phase 2) ----
const POSTPILOT_MODELS: AttributionModelConfig[] = [
  {
    key: 'match-back',
    label: 'Match-Back (60-day)',
    description:
      'PostPilot\'s primary model: matches mail delivery dates with recipient purchases over ~60 days.',
    isDefault: true,
    mockMultiplier: 1.0,
  },
  {
    key: 'qr-landing-page',
    label: 'QR / Landing Page',
    description:
      'Tracks direct response via custom QR codes or campaign-specific landing pages on the postcard.',
    mockMultiplier: 0.3,
  },
];

// ---- Organic channels (use GA4 models) ----
const ORGANIC_MODELS = GA4_MODELS;

// ---------------------------------------------------------------------------
// Master lookup: channel ID → attribution models
// ---------------------------------------------------------------------------
export const CHANNEL_ATTRIBUTION_MODELS: Record<string, AttributionModelConfig[]> = {
  'google-ads': GOOGLE_ADS_MODELS,
  'meta': META_MODELS,
  'microsoft-ads': MICROSOFT_ADS_MODELS,
  'quantcast': QUANTCAST_MODELS,
  'klaviyo': KLAVIYO_MODELS,
  'attentive': ATTENTIVE_MODELS,
  'postpilot': POSTPILOT_MODELS,
  'organic-search': ORGANIC_MODELS,
  'direct': ORGANIC_MODELS,
  'referral': ORGANIC_MODELS,
  'organic-social': ORGANIC_MODELS,
};

/**
 * Get attribution models for a channel. Falls back to GA4 models.
 */
export function getModelsForChannel(channelId: string): AttributionModelConfig[] {
  return CHANNEL_ATTRIBUTION_MODELS[channelId] ?? GA4_MODELS;
}

/**
 * Build mock attribution comparison data for a channel's base conversions.
 */
export function buildAttributionComparison(
  channelId: string,
  baseConversions: number
): { model: string; label: string; conversions: number; description: string; isDefault: boolean }[] {
  const models = getModelsForChannel(channelId);
  return models.map((m) => ({
    model: m.key,
    label: m.label,
    conversions: Math.round(baseConversions * m.mockMultiplier),
    description: m.description,
    isDefault: m.isDefault ?? false,
  }));
}
