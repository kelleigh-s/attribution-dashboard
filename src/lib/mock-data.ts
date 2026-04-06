import type {
  Channel,
  ChannelPerformance,
  Campaign,
  GoalProgress,
  KPIData,
  FunnelStage,
  FirstOrderProduct,
  ChannelEfficiency,
} from '../types';

// ---------------------------------------------------------------------------
// 1. CHANNELS
// ---------------------------------------------------------------------------
export const CHANNELS: Channel[] = [
  { id: 'google-ads',      name: 'Google Ads',      type: 'paid',    connected: true,  phase: 1 },
  { id: 'meta',            name: 'Meta',            type: 'paid',    connected: true,  phase: 1 },
  { id: 'microsoft-ads',   name: 'Microsoft Ads',   type: 'paid',    connected: true,  phase: 1 },
  { id: 'quantcast',       name: 'Quantcast',       type: 'paid',    connected: false, phase: 2 },
  { id: 'klaviyo',         name: 'Klaviyo',         type: 'paid',    connected: false, phase: 2 },
  { id: 'attentive',       name: 'Attentive',       type: 'paid',    connected: false, phase: 2 },
  { id: 'postpilot',       name: 'PostPilot',       type: 'paid',    connected: false, phase: 2 },
  { id: 'organic-search',  name: 'Organic Search',  type: 'organic', connected: true,  phase: 1 },
  { id: 'direct',          name: 'Direct',          type: 'organic', connected: true,  phase: 1 },
  { id: 'referral',        name: 'Referral',        type: 'organic', connected: true,  phase: 1 },
  { id: 'organic-social',  name: 'Organic Social',  type: 'organic', connected: true,  phase: 1 },
];

// ---------------------------------------------------------------------------
// 2. CHANNEL PERFORMANCE  (30-day period)
// ---------------------------------------------------------------------------
// Revenue total target ~$550K-$650K/month for a $6-7M/yr e-commerce brand.
// Paid channels drive about 30% of revenue; organic search ~43-45% of new custs.
export const mockChannelPerformance: ChannelPerformance[] = [
  {
    channelId: 'google-ads',
    channelName: 'Google Ads',
    channelType: 'paid',
    spend: 15200,
    impressions: 1_840_000,
    clicks: 28_400,
    ctr: 1.54,
    cpc: 0.54,
    sessions: 26_100,
    conversions: 612,
    platformReportedConversions: 743,   // Google overclaims ~21%
    newCustomers: 318,
    revenue: 68_940,
    roas: 4.54,
    cpa: 24.84,
    newCustomerPercent: 51.96,
  },
  {
    channelId: 'meta',
    channelName: 'Meta',
    channelType: 'paid',
    spend: 12_400,
    impressions: 3_260_000,
    clicks: 19_500,
    ctr: 0.60,
    cpc: 0.64,
    sessions: 14_800,
    conversions: 384,
    platformReportedConversions: 1_152,  // Meta overclaims ~3x
    newCustomers: 211,
    revenue: 41_470,
    roas: 3.34,
    cpa: 32.29,
    newCustomerPercent: 54.95,
  },
  {
    channelId: 'microsoft-ads',
    channelName: 'Microsoft Ads',
    channelType: 'paid',
    spend: 3_100,
    impressions: 412_000,
    clicks: 5_800,
    ctr: 1.41,
    cpc: 0.53,
    sessions: 5_340,
    conversions: 148,
    platformReportedConversions: 179,
    newCustomers: 74,
    revenue: 16_280,
    roas: 5.25,
    cpa: 20.95,
    newCustomerPercent: 50.00,
  },
  {
    channelId: 'organic-search',
    channelName: 'Organic Search',
    channelType: 'organic',
    spend: 0,
    impressions: 4_100_000,
    clicks: 82_000,
    ctr: 2.00,
    cpc: 0,
    sessions: 74_600,
    conversions: 2_086,
    platformReportedConversions: 2_086,
    newCustomers: 963,
    revenue: 234_670,
    roas: 0,     // no spend
    cpa: 0,
    newCustomerPercent: 46.16,
  },
  {
    channelId: 'direct',
    channelName: 'Direct',
    channelType: 'organic',
    spend: 0,
    impressions: 0,
    clicks: 0,
    ctr: 0,
    cpc: 0,
    sessions: 38_400,
    conversions: 1_190,
    platformReportedConversions: 1_190,
    newCustomers: 298,
    revenue: 142_800,
    roas: 0,
    cpa: 0,
    newCustomerPercent: 25.04,
  },
  {
    channelId: 'referral',
    channelName: 'Referral',
    channelType: 'organic',
    spend: 0,
    impressions: 0,
    clicks: 0,
    ctr: 0,
    cpc: 0,
    sessions: 8_200,
    conversions: 246,
    platformReportedConversions: 246,
    newCustomers: 148,
    revenue: 27_060,
    roas: 0,
    cpa: 0,
    newCustomerPercent: 60.16,
  },
  {
    channelId: 'organic-social',
    channelName: 'Organic Social',
    channelType: 'organic',
    spend: 0,
    impressions: 620_000,
    clicks: 4_340,
    ctr: 0.70,
    cpc: 0,
    sessions: 3_900,
    conversions: 78,
    platformReportedConversions: 78,
    newCustomers: 47,
    revenue: 7_800,
    roas: 0,
    cpa: 0,
    newCustomerPercent: 60.26,
  },
];

// ---------------------------------------------------------------------------
// 3. CAMPAIGNS
// ---------------------------------------------------------------------------
export const mockCampaigns: Campaign[] = [
  // --- Google Ads campaigns ---
  {
    id: 'goog-1', name: 'Brand - Kona Coffee',                channelId: 'google-ads',
    spend: 4_200, impressions: 520_000, clicks: 9_800, conversions: 248, platformReportedConversions: 301,
    newCustomers: 112, revenue: 27_320, roas: 6.50, cpa: 16.94, newCustomerPercent: 45.16, status: 'active',
  },
  {
    id: 'goog-2', name: 'Non-Brand - Hawaiian Coffee',        channelId: 'google-ads',
    spend: 5_100, impressions: 680_000, clicks: 9_200, conversions: 186, platformReportedConversions: 226,
    newCustomers: 118, revenue: 20_460, roas: 4.01, cpa: 27.42, newCustomerPercent: 63.44, status: 'active',
  },
  {
    id: 'goog-3', name: 'Performance Max - Subscriptions',    channelId: 'google-ads',
    spend: 3_400, impressions: 420_000, clicks: 5_600, conversions: 104, platformReportedConversions: 126,
    newCustomers: 58, revenue: 12_480, roas: 3.67, cpa: 32.69, newCustomerPercent: 55.77, status: 'active',
  },
  {
    id: 'goog-4', name: 'Shopping - Best Sellers',            channelId: 'google-ads',
    spend: 2_500, impressions: 220_000, clicks: 3_800, conversions: 74, platformReportedConversions: 90,
    newCustomers: 30, revenue: 8_680, roas: 3.47, cpa: 33.78, newCustomerPercent: 40.54, status: 'active',
  },

  // --- Meta campaigns ---
  {
    id: 'meta-1', name: 'Prospecting - Lookalike Subscribers', channelId: 'meta',
    spend: 4_800, impressions: 1_420_000, clicks: 7_100, conversions: 138, platformReportedConversions: 414,
    newCustomers: 97, revenue: 14_900, roas: 3.10, cpa: 34.78, newCustomerPercent: 70.29, status: 'active',
  },
  {
    id: 'meta-2', name: 'Retargeting - Cart Abandoners',      channelId: 'meta',
    spend: 3_200, impressions: 640_000, clicks: 5_400, conversions: 132, platformReportedConversions: 396,
    newCustomers: 26, revenue: 15_840, roas: 4.95, cpa: 24.24, newCustomerPercent: 19.70, status: 'active',
  },
  {
    id: 'meta-3', name: 'Advantage+ - Kona Peaberry Feature', channelId: 'meta',
    spend: 2_600, impressions: 780_000, clicks: 4_200, conversions: 72, platformReportedConversions: 216,
    newCustomers: 56, revenue: 6_840, roas: 2.63, cpa: 36.11, newCustomerPercent: 77.78, status: 'active',
  },
  {
    id: 'meta-4', name: 'Broad - Coffee Enthusiasts',         channelId: 'meta',
    spend: 1_800, impressions: 420_000, clicks: 2_800, conversions: 42, platformReportedConversions: 126,
    newCustomers: 32, revenue: 3_890, roas: 2.16, cpa: 42.86, newCustomerPercent: 76.19, status: 'paused',
  },

  // --- Microsoft Ads campaigns ---
  {
    id: 'msft-1', name: 'Brand - Big Island Coffee Roasters', channelId: 'microsoft-ads',
    spend: 1_100, impressions: 148_000, clicks: 2_400, conversions: 72, platformReportedConversions: 87,
    newCustomers: 28, revenue: 7_920, roas: 7.20, cpa: 15.28, newCustomerPercent: 38.89, status: 'active',
  },
  {
    id: 'msft-2', name: 'Non-Brand - Kona Coffee Online',     channelId: 'microsoft-ads',
    spend: 1_200, impressions: 164_000, clicks: 2_100, conversions: 48, platformReportedConversions: 58,
    newCustomers: 30, revenue: 5_280, roas: 4.40, cpa: 25.00, newCustomerPercent: 62.50, status: 'active',
  },
  {
    id: 'msft-3', name: 'Shopping - Hawaiian Coffee Gifts',   channelId: 'microsoft-ads',
    spend: 800, impressions: 100_000, clicks: 1_300, conversions: 28, platformReportedConversions: 34,
    newCustomers: 16, revenue: 3_080, roas: 3.85, cpa: 28.57, newCustomerPercent: 57.14, status: 'active',
  },
];

// ---------------------------------------------------------------------------
// 4. GOAL PROGRESS  (Q1 2026 rock: grow new online customers by 20%)
// ---------------------------------------------------------------------------
// Baseline: ~24,000 new online customers in 2025. Target: 28,800 for 2026.
// Through end of March (Q1 complete): should be ~25% of way to the 4,800 net new.
export const mockGoalProgress: GoalProgress = {
  currentNewCustomers: 6_480,        // new online customers YTD (Jan-Mar 2026)
  targetNewCustomers: 28_800,        // full-year target
  percentComplete: 22.5,             // 6,480 / 28,800
  projectedYearEnd: 25_920,          // current pace annualized
  gapToGoal: 2_880,                  // 28,800 - 25,920
  onTrack: false,                    // slightly behind pace
};

// ---------------------------------------------------------------------------
// 5. KPI CARDS  (executive overview, 30-day period)
// ---------------------------------------------------------------------------
export const mockKPIs: KPIData[] = [
  {
    label: 'Total Revenue',
    value: 539_020,
    change: 8.4,
    tooltip: 'Total attributed revenue across all channels for the selected period.',
    format: 'currency',
  },
  {
    label: 'New Customers',
    value: 2_059,
    change: 12.1,
    tooltip: 'Unique first-time purchasers attributed across all channels.',
    format: 'number',
  },
  {
    label: 'Blended ROAS',
    value: 17.56,
    change: 5.2,
    tooltip: 'Total revenue / total paid ad spend across Google, Meta, and Microsoft.',
    format: 'number',
  },
  {
    label: 'Cost per New Customer',
    value: 14.91,
    change: -6.3,
    tooltip: 'Total paid spend / total new customers (all channels, paid + organic).',
    format: 'currency',
  },
  {
    label: 'Paid Ad Spend',
    value: 30_700,
    change: 2.8,
    tooltip: 'Combined monthly spend across Google Ads, Meta, and Microsoft Ads.',
    format: 'currency',
  },
  {
    label: 'Conversion Rate',
    value: 2.78,
    change: 0.3,
    tooltip: 'Total orders / total sessions across all channels.',
    format: 'percent',
  },
];

// ---------------------------------------------------------------------------
// 6. FUNNEL DATA  (by channel, 30-day period)
// ---------------------------------------------------------------------------
export const mockFunnelData: Record<string, FunnelStage[]> = {
  'google-ads': [
    { stage: 'Impressions',   count: 1_840_000, dropOffPercent: 0 },
    { stage: 'Clicks',        count: 28_400,    dropOffPercent: 98.46 },
    { stage: 'Sessions',      count: 26_100,    dropOffPercent: 8.10 },
    { stage: 'Add to Cart',   count: 2_350,     dropOffPercent: 91.00 },
    { stage: 'Purchase',      count: 612,       dropOffPercent: 73.96 },
  ],
  'meta': [
    { stage: 'Impressions',   count: 3_260_000, dropOffPercent: 0 },
    { stage: 'Clicks',        count: 19_500,    dropOffPercent: 99.40 },
    { stage: 'Sessions',      count: 14_800,    dropOffPercent: 24.10 },
    { stage: 'Add to Cart',   count: 1_480,     dropOffPercent: 90.00 },
    { stage: 'Purchase',      count: 384,       dropOffPercent: 74.05 },
  ],
  'microsoft-ads': [
    { stage: 'Impressions',   count: 412_000,   dropOffPercent: 0 },
    { stage: 'Clicks',        count: 5_800,     dropOffPercent: 98.59 },
    { stage: 'Sessions',      count: 5_340,     dropOffPercent: 7.93 },
    { stage: 'Add to Cart',   count: 534,       dropOffPercent: 90.00 },
    { stage: 'Purchase',      count: 148,       dropOffPercent: 72.28 },
  ],
  'organic-search': [
    { stage: 'Impressions',   count: 4_100_000, dropOffPercent: 0 },
    { stage: 'Clicks',        count: 82_000,    dropOffPercent: 98.00 },
    { stage: 'Sessions',      count: 74_600,    dropOffPercent: 9.02 },
    { stage: 'Add to Cart',   count: 5_970,     dropOffPercent: 92.00 },
    { stage: 'Purchase',      count: 2_086,     dropOffPercent: 65.05 },
  ],
  'direct': [
    { stage: 'Impressions',   count: 0,         dropOffPercent: 0 },
    { stage: 'Clicks',        count: 0,         dropOffPercent: 0 },
    { stage: 'Sessions',      count: 38_400,    dropOffPercent: 0 },
    { stage: 'Add to Cart',   count: 3_840,     dropOffPercent: 90.00 },
    { stage: 'Purchase',      count: 1_190,     dropOffPercent: 69.01 },
  ],
  'referral': [
    { stage: 'Impressions',   count: 0,         dropOffPercent: 0 },
    { stage: 'Clicks',        count: 0,         dropOffPercent: 0 },
    { stage: 'Sessions',      count: 8_200,     dropOffPercent: 0 },
    { stage: 'Add to Cart',   count: 738,       dropOffPercent: 91.00 },
    { stage: 'Purchase',      count: 246,       dropOffPercent: 66.67 },
  ],
  'organic-social': [
    { stage: 'Impressions',   count: 620_000,   dropOffPercent: 0 },
    { stage: 'Clicks',        count: 4_340,     dropOffPercent: 99.30 },
    { stage: 'Sessions',      count: 3_900,     dropOffPercent: 10.14 },
    { stage: 'Add to Cart',   count: 312,       dropOffPercent: 92.00 },
    { stage: 'Purchase',      count: 78,        dropOffPercent: 75.00 },
  ],
};

// ---------------------------------------------------------------------------
// 7. FIRST-ORDER PRODUCTS  (top products appearing in first-time orders)
// ---------------------------------------------------------------------------
export const mockFirstOrderProducts: FirstOrderProduct[] = [
  { productTitle: 'Kona Peaberry',                      count: 412, percent: 20.01 },
  { productTitle: "Ka\u02BBu Morning Glory",            count: 298, percent: 14.47 },
  { productTitle: 'Hawaiian Harmony',                   count: 247, percent: 12.00 },
  { productTitle: 'Kona Bloom',                         count: 223, percent: 10.83 },
  { productTitle: 'Explorers Club Subscription',        count: 189, percent: 9.18 },
  { productTitle: 'Wai Meli Morning',                   count: 164, percent: 7.97 },
  { productTitle: "Ka\u02BBu Darkwood",                 count: 132, percent: 6.41 },
  { productTitle: 'Kona Moon',                          count: 118, percent: 5.73 },
  { productTitle: "Barrel Aged Ka\u02BBu",              count: 96,  percent: 4.66 },
  { productTitle: 'Espresso Bites - Classic',           count: 72,  percent: 3.50 },
  { productTitle: 'Roasters Club Subscription',         count: 58,  percent: 2.82 },
  { productTitle: "M\u0101maki Tea",                    count: 50,  percent: 2.43 },
];

// ---------------------------------------------------------------------------
// 8. CHANNEL EFFICIENCY  (budget optimizer, 30-day period)
// ---------------------------------------------------------------------------
export const mockEfficiency: ChannelEfficiency[] = [
  {
    channelId: 'organic-search',
    channelName: 'Organic Search',
    monthlySpend: 0,
    newCustomers: 963,
    costPerNewCustomer: 0,
    roas: 0,
    assistedValue: 42_300,
    efficiencyScore: 98,
    rank: 'top',
  },
  {
    channelId: 'direct',
    channelName: 'Direct',
    monthlySpend: 0,
    newCustomers: 298,
    costPerNewCustomer: 0,
    roas: 0,
    assistedValue: 18_600,
    efficiencyScore: 95,
    rank: 'top',
  },
  {
    channelId: 'microsoft-ads',
    channelName: 'Microsoft Ads',
    monthlySpend: 3_100,
    newCustomers: 74,
    costPerNewCustomer: 41.89,
    roas: 5.25,
    assistedValue: 5_240,
    efficiencyScore: 82,
    rank: 'top',
  },
  {
    channelId: 'google-ads',
    channelName: 'Google Ads',
    monthlySpend: 15_200,
    newCustomers: 318,
    costPerNewCustomer: 47.80,
    roas: 4.54,
    assistedValue: 14_820,
    efficiencyScore: 76,
    rank: 'mid',
  },
  {
    channelId: 'referral',
    channelName: 'Referral',
    monthlySpend: 0,
    newCustomers: 148,
    costPerNewCustomer: 0,
    roas: 0,
    assistedValue: 8_100,
    efficiencyScore: 74,
    rank: 'mid',
  },
  {
    channelId: 'meta',
    channelName: 'Meta',
    monthlySpend: 12_400,
    newCustomers: 211,
    costPerNewCustomer: 58.77,
    roas: 3.34,
    assistedValue: 9_870,
    efficiencyScore: 61,
    rank: 'mid',
  },
  {
    channelId: 'organic-social',
    channelName: 'Organic Social',
    monthlySpend: 0,
    newCustomers: 47,
    costPerNewCustomer: 0,
    roas: 0,
    assistedValue: 2_340,
    efficiencyScore: 48,
    rank: 'bottom',
  },
];
