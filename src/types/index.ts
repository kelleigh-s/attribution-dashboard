// Date range for global controls
export type DateRange = '7d' | '30d' | '90d' | 'custom';
export type AttributionModel = 'data-driven' | 'last-click' | 'first-click' | 'linear';
export type CustomerFilter = 'all' | 'new';

export interface GlobalFilters {
  dateRange: DateRange;
  customStart?: string;
  customEnd?: string;
  attributionModel: AttributionModel;
  customerFilter: CustomerFilter;
}

// Channel types
export type ChannelType = 'paid' | 'organic';
export interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  connected: boolean;
  phase: 1 | 2;
}

// KPI data
export interface KPIData {
  label: string;
  value: string | number;
  change?: number; // percent change from prior period
  tooltip: string;
  format?: 'number' | 'currency' | 'percent';
}

// Channel performance
export interface ChannelPerformance {
  channelId: string;
  channelName: string;
  channelType: ChannelType;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  sessions: number;
  conversions: number;
  platformReportedConversions: number;
  newCustomers: number;
  revenue: number;
  roas: number;
  cpa: number;
  newCustomerPercent: number;
}

// Campaign data
export interface Campaign {
  id: string;
  name: string;
  channelId: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  platformReportedConversions: number;
  newCustomers: number;
  revenue: number;
  roas: number;
  cpa: number;
  newCustomerPercent: number;
  status: 'active' | 'paused' | 'ended';
}

// Shopify order data
export interface ShopifyOrder {
  orderId: string;
  customerId: string;
  email: string;
  createdAt: string;
  totalPrice: number;
  isFirstOrder: boolean;
  lineItems: { productTitle: string; quantity: number; price: number }[];
}

// Goal tracking
export interface GoalProgress {
  currentNewCustomers: number;
  targetNewCustomers: number;
  percentComplete: number;
  projectedYearEnd: number;
  gapToGoal: number;
  onTrack: boolean;
}

// Budget efficiency
export interface ChannelEfficiency {
  channelId: string;
  channelName: string;
  monthlySpend: number;
  newCustomers: number;
  costPerNewCustomer: number;
  roas: number;
  assistedValue: number;
  efficiencyScore: number;
  rank: 'top' | 'mid' | 'bottom';
}

// API response wrapper
export interface APIResponse<T> {
  data: T;
  source: 'live' | 'mock' | 'cached';
  lastUpdated: string;
  error?: string;
}

// Funnel data
export interface FunnelStage {
  stage: string;
  count: number;
  dropOffPercent: number;
}

// Product in first orders
export interface FirstOrderProduct {
  productTitle: string;
  count: number;
  percent: number;
}
