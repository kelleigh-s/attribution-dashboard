import KPICard from '@/components/ui/KPICard';
import ChannelBarChart from '@/components/charts/ChannelBarChart';
import GoalProgressBar from '@/components/charts/GoalProgressBar';
import ChannelFlowDiagram from '@/components/charts/ChannelFlowDiagram';
import {
  mockKPIs,
  mockChannelPerformance,
  mockGoalProgress,
} from '@/lib/mock-data';

// ---------------------------------------------------------------------------
// Derive executive KPI values from mock data
// ---------------------------------------------------------------------------
const totalNewCustomers = mockChannelPerformance.reduce(
  (sum, ch) => sum + ch.newCustomers,
  0
);
const totalRevenue = mockChannelPerformance.reduce(
  (sum, ch) => sum + ch.revenue,
  0
);
const totalNewCustomerRevenue = mockChannelPerformance.reduce(
  (sum, ch) => sum + ch.revenue * (ch.newCustomerPercent / 100),
  0
);
const totalSpend = mockChannelPerformance.reduce(
  (sum, ch) => sum + ch.spend,
  0
);
const blendedROAS = totalRevenue / totalSpend;
const costPerNewCustomer = totalSpend / totalNewCustomers;

// Top channel by new customers
const topChannel = [...mockChannelPerformance].sort(
  (a, b) => b.newCustomers - a.newCustomers
)[0];
const topChannelPct = ((topChannel.newCustomers / totalNewCustomers) * 100).toFixed(1);

// New vs returning revenue split
const newRevenuePct = ((totalNewCustomerRevenue / totalRevenue) * 100).toFixed(1);
const returningRevenuePct = (100 - parseFloat(newRevenuePct)).toFixed(1);

// Goal progress: what percentage of the annual target have we reached?
const goalPct = ((totalNewCustomers / mockGoalProgress.targetNewCustomers) * 100).toFixed(1);

// Helpers
function fmtCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

function fmtNumber(n: number): string {
  return n.toLocaleString('en-US');
}

// ---------------------------------------------------------------------------
// Build the 6 KPI card definitions
// ---------------------------------------------------------------------------
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
    tooltip: 'Total revenue divided by total paid ad spend across Google, Meta, and Microsoft.',
  },
  {
    label: 'Cost per New Customer',
    value: fmtCurrency(costPerNewCustomer),
    change: -6.3,
    tooltip: 'Total paid spend divided by total new customers (all channels, paid + organic). Lower is better.',
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

// ---------------------------------------------------------------------------
// Build bar chart data (new customers per channel)
// ---------------------------------------------------------------------------
const barChartData = mockChannelPerformance.map((ch) => ({
  name: ch.channelName,
  value: ch.newCustomers,
  platformReported:
    ch.platformReportedConversions !== ch.conversions
      ? Math.round(
          ch.platformReportedConversions * (ch.newCustomerPercent / 100)
        )
      : undefined,
  type: ch.channelType,
}));

// ---------------------------------------------------------------------------
// Build flow diagram data (top 5 by new customers)
// ---------------------------------------------------------------------------
const flowChannels = [...mockChannelPerformance]
  .sort((a, b) => b.newCustomers - a.newCustomers)
  .slice(0, 5)
  .map((ch) => ({
    name: ch.channelName,
    newCustomers: ch.newCustomers,
    percentTotal: (ch.newCustomers / totalNewCustomers) * 100,
    aov: ch.revenue / ch.conversions,
    type: ch.channelType,
  }));

// ---------------------------------------------------------------------------
// Insight callouts
// ---------------------------------------------------------------------------
const insights = [
  {
    title: 'Meta Overclaim Alert',
    body: 'Meta is claiming 3x more conversions than GA4 attributes to it. Platform-reported: 1,152 vs. actual: 384.',
  },
  {
    title: 'Organic Search Dominance',
    body: 'Organic search drives 46% of new customers at $0 cost -- the single most valuable acquisition channel.',
  },
  {
    title: 'Microsoft Ads Efficiency',
    body: 'Microsoft Ads has the lowest cost per new customer among paid channels at $20.95, with a 5.25x ROAS.',
  },
];

// ---------------------------------------------------------------------------
// PAGE COMPONENT
// ---------------------------------------------------------------------------
export default function Home() {
  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* ----------------------------------------------------------------- */}
      {/* Page Header                                                        */}
      {/* ----------------------------------------------------------------- */}
      <header>
        <h1 className="text-3xl font-bold text-[#434C53] tracking-tight">
          The Big Picture
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Executive overview of marketing attribution
        </p>
      </header>

      {/* ----------------------------------------------------------------- */}
      {/* KPI Cards (6 cards, 3-col grid)                                    */}
      {/* ----------------------------------------------------------------- */}
      <section>
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

      {/* ----------------------------------------------------------------- */}
      {/* Channel Bar Chart                                                  */}
      {/* ----------------------------------------------------------------- */}
      <section>
        <h2 className="text-xl font-semibold text-[#434C53] mb-4">
          Where New Customers Come From
        </h2>
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
          <ChannelBarChart
            data={barChartData}
            metric="New Customers"
            showOverclaim
          />
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Goal Progress                                                      */}
      {/* ----------------------------------------------------------------- */}
      <section>
        <h2 className="text-xl font-semibold text-[#434C53] mb-4">
          2026 Goal: 20% New Customer Growth
        </h2>
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
          <GoalProgressBar
            current={mockGoalProgress.currentNewCustomers}
            target={mockGoalProgress.targetNewCustomers}
            projected={mockGoalProgress.projectedYearEnd}
            label="New Online Customers YTD vs. 2026 Target"
          />
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Key Insight Callouts                                               */}
      {/* ----------------------------------------------------------------- */}
      <section>
        <h2 className="text-xl font-semibold text-[#434C53] mb-4">
          Key Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((insight) => (
            <div
              key={insight.title}
              className="rounded-lg p-5 border border-[#C3E3F2]"
              style={{ backgroundColor: '#C3E3F2' }}
            >
              <h3 className="text-sm font-semibold text-[#006373] mb-2">
                {insight.title}
              </h3>
              <p className="text-sm text-[#434C53] leading-relaxed">
                {insight.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Channel Flow Diagram                                               */}
      {/* ----------------------------------------------------------------- */}
      <section className="pb-8">
        <h2 className="text-xl font-semibold text-[#434C53] mb-4">
          How Channels Lead to Purchases
        </h2>
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
          <ChannelFlowDiagram channels={flowChannels} />
        </div>
      </section>
    </div>
  );
}
