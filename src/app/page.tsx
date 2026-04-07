'use client';

import { useState, useEffect } from 'react';
import KPICard from '@/components/ui/KPICard';
import ChannelBarChart from '@/components/charts/ChannelBarChart';
import GoalProgressBar from '@/components/charts/GoalProgressBar';
import ChannelFlowDiagram from '@/components/charts/ChannelFlowDiagram';
import DataSourceStatus, {
  type ChannelSourceInfo,
} from '@/components/ui/DataSourceStatus';
import {
  mockChannelPerformance,
  mockGoalProgress,
} from '@/lib/mock-data';
import type { ChannelPerformance } from '@/types';

// ---------------------------------------------------------------------------
// Paid channel API endpoints
// ---------------------------------------------------------------------------
const PAID_CHANNEL_ROUTES = [
  { route: '/api/google-ads', channelId: 'google-ads', channelName: 'Google Ads' },
  { route: '/api/meta-ads', channelId: 'meta', channelName: 'Meta' },
  { route: '/api/microsoft-ads', channelId: 'microsoft-ads', channelName: 'Microsoft Ads' },
] as const;

// ---------------------------------------------------------------------------
// Merge live channel data with mock, keeping mock values for fields
// that the live API can't populate (e.g. newCustomers requires Shopify)
// ---------------------------------------------------------------------------
function mergeChannel(
  mock: ChannelPerformance,
  live: ChannelPerformance
): ChannelPerformance {
  return {
    channelId: mock.channelId,
    channelName: mock.channelName,
    channelType: mock.channelType,
    spend: live.spend,
    impressions: live.impressions,
    clicks: live.clicks,
    ctr: live.ctr,
    cpc: live.cpc,
    sessions: live.sessions || mock.sessions,
    conversions: live.conversions,
    platformReportedConversions: live.platformReportedConversions,
    revenue: live.revenue,
    roas: live.roas,
    cpa: live.cpa,
    // Ad platforms don't differentiate new vs. returning — keep mock values
    newCustomers: live.newCustomers > 0 ? live.newCustomers : mock.newCustomers,
    newCustomerPercent:
      live.newCustomerPercent > 0
        ? live.newCustomerPercent
        : mock.newCustomerPercent,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fmtCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

function fmtNumber(n: number): string {
  return n.toLocaleString('en-US');
}

// ---------------------------------------------------------------------------
// Inline source tag (small badge next to section headers)
// ---------------------------------------------------------------------------
function SourceTag({ source }: { source: 'live' | 'mock' | 'mixed' }) {
  const config = {
    live: {
      label: 'Live Data',
      bg: 'bg-green-50',
      text: 'text-[#639922]',
      dot: 'bg-[#639922]',
    },
    mock: {
      label: 'Estimated',
      bg: 'bg-amber-50',
      text: 'text-[#b58a1b]',
      dot: 'bg-[#F8B457]',
    },
    mixed: {
      label: 'Partial Live',
      bg: 'bg-blue-50',
      text: 'text-[#006373]',
      dot: 'bg-[#006373]',
    },
  }[source];

  return (
    <span
      className={`inline-flex items-center gap-1 ${config.bg} ${config.text} text-[10px] font-medium px-1.5 py-0.5 rounded-full`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------
function LoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-pulse">
      <div>
        <div className="h-8 bg-gray-200 rounded w-48 mb-2" />
        <div className="h-4 bg-gray-100 rounded w-72" />
      </div>
      <div className="h-12 bg-gray-100 rounded-lg" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 bg-gray-100 rounded-lg" />
        ))}
      </div>
      <div className="h-64 bg-gray-100 rounded-lg" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE COMPONENT
// ---------------------------------------------------------------------------
export default function Home() {
  const [channels, setChannels] =
    useState<ChannelPerformance[]>(mockChannelPerformance);
  const [sources, setSources] = useState<ChannelSourceInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch all paid channel APIs + Shopify in parallel
        const [paidResults, shopifyResult] = await Promise.all([
          Promise.allSettled(
            PAID_CHANNEL_ROUTES.map(({ route }) =>
              fetch(route).then((r) => r.json())
            )
          ),
          fetch('/api/shopify')
            .then((r) => r.json())
            .catch(() => null),
        ]);

        const merged = [...mockChannelPerformance];
        const channelSources: ChannelSourceInfo[] = [];

        // Process each paid channel response
        for (let i = 0; i < PAID_CHANNEL_ROUTES.length; i++) {
          const { channelId, channelName } = PAID_CHANNEL_ROUTES[i];
          const result = paidResults[i];

          if (
            result.status === 'fulfilled' &&
            result.value?.data?.channel
          ) {
            const { source, lastUpdated, data } = result.value;

            if (source === 'live' && data.channel) {
              const mockIdx = merged.findIndex(
                (c) => c.channelId === channelId
              );
              if (mockIdx !== -1) {
                merged[mockIdx] = mergeChannel(
                  merged[mockIdx],
                  data.channel
                );
              }
            }

            channelSources.push({
              channelId,
              channelName,
              source: source as 'live' | 'mock',
              lastUpdated,
            });
          } else {
            channelSources.push({
              channelId,
              channelName,
              source: 'mock',
              lastUpdated: new Date().toISOString(),
            });
          }
        }

        // Add Shopify source status
        if (shopifyResult) {
          channelSources.push({
            channelId: 'shopify',
            channelName: 'Shopify Orders',
            source: (shopifyResult.source as 'live' | 'mock') ?? 'mock',
            lastUpdated: shopifyResult.lastUpdated ?? new Date().toISOString(),
          });
        }

        // Organic channels have no API routes — always mock
        for (const ch of mockChannelPerformance) {
          if (ch.channelType === 'organic') {
            channelSources.push({
              channelId: ch.channelId,
              channelName: ch.channelName,
              source: 'mock',
              lastUpdated: new Date().toISOString(),
            });
          }
        }

        setChannels(merged);
        setSources(channelSources);
      } catch {
        // Total failure — use all mock
        setSources(
          mockChannelPerformance.map((ch) => ({
            channelId: ch.channelId,
            channelName: ch.channelName,
            source: 'mock' as const,
            lastUpdated: new Date().toISOString(),
          }))
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <LoadingSkeleton />;

  // -----------------------------------------------------------------------
  // Derive KPIs from (possibly live) channel data
  // -----------------------------------------------------------------------
  const totalNewCustomers = channels.reduce(
    (sum, ch) => sum + ch.newCustomers,
    0
  );
  const totalRevenue = channels.reduce((sum, ch) => sum + ch.revenue, 0);
  const totalNewCustomerRevenue = channels.reduce(
    (sum, ch) => sum + ch.revenue * (ch.newCustomerPercent / 100),
    0
  );
  const totalSpend = channels.reduce((sum, ch) => sum + ch.spend, 0);
  const blendedROAS = totalSpend > 0 ? totalRevenue / totalSpend : 0;
  const costPerNewCustomer =
    totalNewCustomers > 0 ? totalSpend / totalNewCustomers : 0;

  const topChannel = [...channels].sort(
    (a, b) => b.newCustomers - a.newCustomers
  )[0];
  const topChannelPct = (
    (topChannel.newCustomers / totalNewCustomers) *
    100
  ).toFixed(1);

  const newRevenuePct = (
    (totalNewCustomerRevenue / totalRevenue) *
    100
  ).toFixed(1);
  const returningRevenuePct = (100 - parseFloat(newRevenuePct)).toFixed(
    1
  );

  const goalPct = (
    (totalNewCustomers / mockGoalProgress.targetNewCustomers) *
    100
  ).toFixed(1);

  // -----------------------------------------------------------------------
  // Determine section-level data source status
  // -----------------------------------------------------------------------
  const hasAnyLive = sources.some((s) => s.source === 'live');
  const allChannelsLive = sources
    .filter((s) => s.channelId !== 'shopify')
    .every((s) => s.source === 'live');
  const kpiSource: 'live' | 'mock' | 'mixed' = allChannelsLive
    ? 'live'
    : hasAnyLive
      ? 'mixed'
      : 'mock';

  // -----------------------------------------------------------------------
  // KPI card definitions
  // -----------------------------------------------------------------------
  const kpiCards = [
    {
      label: 'New Customers Acquired',
      value: fmtNumber(totalNewCustomers),
      change: 12.1,
      tooltip: `${fmtNumber(totalNewCustomers)} first-time purchasers this period. ${goalPct}% toward the 20% annual growth goal (${fmtNumber(mockGoalProgress.targetNewCustomers)} target).`,
    },
    {
      label: 'Total Revenue',
      value: fmtCurrency(totalRevenue),
      change: 8.4,
      tooltip: `${fmtCurrency(totalNewCustomerRevenue)} of total revenue came from new customers.`,
    },
    {
      label: 'Blended ROAS',
      value: `${blendedROAS.toFixed(2)}x`,
      change: 5.2,
      tooltip:
        'Total revenue divided by total paid ad spend across Google, Meta, and Microsoft.',
    },
    {
      label: 'Cost per New Customer',
      value: fmtCurrency(costPerNewCustomer),
      change: -6.3,
      tooltip:
        'Total paid spend divided by total new customers (all channels, paid + organic). Lower is better.',
    },
    {
      label: 'Top Acquisition Channel',
      value: topChannel.channelName,
      tooltip: `${topChannel.channelName} drives ${topChannelPct}% of all new customers (${fmtNumber(topChannel.newCustomers)} this period).`,
    },
    {
      label: 'Revenue: New vs. Returning',
      value: `${newRevenuePct}% / ${returningRevenuePct}%`,
      tooltip: `${newRevenuePct}% of revenue from new customers, ${returningRevenuePct}% from returning customers.`,
    },
  ];

  // -----------------------------------------------------------------------
  // Bar chart data (new customers per channel)
  // -----------------------------------------------------------------------
  const barChartData = channels.map((ch) => ({
    name: ch.channelName,
    value: ch.newCustomers,
    platformReported:
      ch.platformReportedConversions !== ch.conversions
        ? Math.round(
            ch.platformReportedConversions *
              (ch.newCustomerPercent / 100)
          )
        : undefined,
    type: ch.channelType,
  }));

  // -----------------------------------------------------------------------
  // Flow diagram data (top 5 by new customers)
  // -----------------------------------------------------------------------
  const flowChannels = [...channels]
    .sort((a, b) => b.newCustomers - a.newCustomers)
    .slice(0, 5)
    .map((ch) => ({
      name: ch.channelName,
      newCustomers: ch.newCustomers,
      percentTotal: (ch.newCustomers / totalNewCustomers) * 100,
      aov: ch.conversions > 0 ? ch.revenue / ch.conversions : 0,
      type: ch.channelType,
    }));

  // -----------------------------------------------------------------------
  // Dynamic insights based on which sources are live
  // -----------------------------------------------------------------------
  const liveChannelNames = sources
    .filter((s) => s.source === 'live')
    .map((s) => s.channelName);

  const insights: { title: string; body: string; type: 'live' | 'mock' }[] = [];

  if (liveChannelNames.length > 0) {
    insights.push({
      title: 'Live Data Connected',
      body: `Real-time data flowing from: ${liveChannelNames.join(', ')}. Spend, revenue, and conversion metrics for ${liveChannelNames.length === 1 ? 'this source' : 'these sources'} reflect actual platform data.`,
      type: 'live',
    });
  }

  insights.push({
    title: 'Organic Search Dominance',
    body: 'Organic search drives 46% of new customers at $0 cost — the single most valuable acquisition channel.',
    type: 'mock',
  });

  if (insights.length < 3) {
    insights.push({
      title: 'New Customer Attribution Gap',
      body: "Ad platforms don't report new vs. returning customers. The new-customer breakdown currently uses estimates. Connect GA4 + Shopify cross-referencing to close this gap.",
      type: 'mock',
    });
  }

  if (insights.length < 3) {
    insights.push({
      title: 'Microsoft Ads Efficiency',
      body: 'Microsoft Ads has the lowest cost per new customer among paid channels at $20.95, with a 5.25x ROAS.',
      type: 'mock',
    });
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Page Header */}
      <header>
        <h1 className="text-3xl font-bold text-[#434C53] tracking-tight">
          The Big Picture
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Executive overview of marketing attribution
        </p>
      </header>

      {/* Data Source Status (collapsible) */}
      <DataSourceStatus sources={sources} />

      {/* KPI Cards */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
            Key Metrics
          </h2>
          <SourceTag source={kpiSource} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpiCards.map((kpi) => (
            <KPICard
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              change={kpi.change}
              tooltip={kpi.tooltip}
            />
          ))}
        </div>
      </section>

      {/* Channel Bar Chart */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-semibold text-[#434C53]">
            Where New Customers Come From
          </h2>
          <SourceTag source={kpiSource} />
        </div>
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
          <ChannelBarChart
            data={barChartData}
            metric="New Customers"
            showOverclaim
          />
        </div>
      </section>

      {/* Goal Progress */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-semibold text-[#434C53]">
            2026 Goal: 20% New Customer Growth
          </h2>
          <SourceTag source="mock" />
        </div>
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
          <GoalProgressBar
            current={mockGoalProgress.currentNewCustomers}
            target={mockGoalProgress.targetNewCustomers}
            projected={mockGoalProgress.projectedYearEnd}
            label="New Online Customers YTD vs. 2026 Target"
          />
        </div>
      </section>

      {/* Key Insights */}
      <section>
        <h2 className="text-xl font-semibold text-[#434C53] mb-4">
          Key Insights
        </h2>
        <div
          className={`grid grid-cols-1 gap-4 ${
            insights.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'
          }`}
        >
          {insights.map((insight) => (
            <div
              key={insight.title}
              className="rounded-lg p-5 border"
              style={{
                backgroundColor:
                  insight.type === 'live'
                    ? 'rgba(99,153,34,0.06)'
                    : '#C3E3F2',
                borderColor:
                  insight.type === 'live'
                    ? 'rgba(99,153,34,0.2)'
                    : '#C3E3F2',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <h3
                  className="text-sm font-semibold"
                  style={{
                    color:
                      insight.type === 'live' ? '#639922' : '#006373',
                  }}
                >
                  {insight.title}
                </h3>
                <SourceTag source={insight.type} />
              </div>
              <p className="text-sm text-[#434C53] leading-relaxed">
                {insight.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Channel Flow Diagram */}
      <section className="pb-8">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-semibold text-[#434C53]">
            How Channels Lead to Purchases
          </h2>
          <SourceTag source={kpiSource} />
        </div>
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
          <ChannelFlowDiagram channels={flowChannels} />
        </div>
      </section>
    </div>
  );
}
