import ChannelBarChart from '@/components/charts/ChannelBarChart';
import FunnelChart from '@/components/charts/FunnelChart';
import DonutChart from '@/components/charts/DonutChart';
import Tooltip from '@/components/ui/Tooltip';
import {
  mockChannelPerformance,
  mockFunnelData,
  mockFirstOrderProducts,
} from '@/lib/mock-data';

// ---------------------------------------------------------------------------
// Derive data for the page
// ---------------------------------------------------------------------------

// 1. New customers by channel (for ChannelBarChart)
const newCustomerBarData = mockChannelPerformance.map((ch) => ({
  name: ch.channelName,
  value: ch.newCustomers,
  platformReported:
    ch.platformReportedConversions !== ch.conversions
      ? Math.round(ch.platformReportedConversions * (ch.newCustomerPercent / 100))
      : undefined,
  type: ch.channelType,
}));

// 2. Organic vs Paid split
const paidNewCustomers = mockChannelPerformance
  .filter((ch) => ch.channelType === 'paid')
  .reduce((sum, ch) => sum + ch.newCustomers, 0);

const organicNewCustomers = mockChannelPerformance
  .filter((ch) => ch.channelType === 'organic')
  .reduce((sum, ch) => sum + ch.newCustomers, 0);

const totalNewCustomers = paidNewCustomers + organicNewCustomers;
const organicPct = ((organicNewCustomers / totalNewCustomers) * 100).toFixed(1);
const paidPct = ((paidNewCustomers / totalNewCustomers) * 100).toFixed(1);

// Calculate organic "value" — if organic customers cost the same as paid, what would they be worth?
const totalPaidSpend = mockChannelPerformance
  .filter((ch) => ch.channelType === 'paid')
  .reduce((sum, ch) => sum + ch.spend, 0);
const costPerPaidNewCustomer = totalPaidSpend / paidNewCustomers;
const organicEquivalentValue = organicNewCustomers * costPerPaidNewCustomer;
// For every $1 on paid, organic brings $X at $0
const organicPerPaidDollar = (organicEquivalentValue / totalPaidSpend).toFixed(2);

const organicPaidDonut = [
  { name: `Organic (${organicPct}%)`, value: organicNewCustomers, color: '#F8B457' },
  { name: `Paid (${paidPct}%)`, value: paidNewCustomers, color: '#006373' },
];

// 3. Top 3 paid channel funnels
const topPaidChannelIds = ['google-ads', 'meta', 'microsoft-ads'];

// 4. First order products — transform for horizontal bar chart
const productBarData = mockFirstOrderProducts.map((p) => ({
  name: p.productTitle,
  value: p.count,
  type: 'paid' as const, // using teal color for all
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fmtNumber(n: number): string {
  return n.toLocaleString('en-US');
}

function fmtCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

// ---------------------------------------------------------------------------
// PAGE COMPONENT
// ---------------------------------------------------------------------------
export default function AcquisitionPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* ----------------------------------------------------------------- */}
      {/* Page Header                                                        */}
      {/* ----------------------------------------------------------------- */}
      <header>
        <h1 className="text-3xl font-bold text-[#434C53] tracking-tight">
          Where New Customers Come From
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          New customer acquisition analysis
        </p>
      </header>

      {/* ----------------------------------------------------------------- */}
      {/* Section 1: New Customer Acquisition by Channel                     */}
      {/* ----------------------------------------------------------------- */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-semibold text-[#434C53]">
            New Customer Acquisition by Channel
          </h2>
          <Tooltip content="Shows how many first-time purchasers each channel brought in during the selected period. GA4 data-driven attribution is used for all channels." />
        </div>
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
          <ChannelBarChart
            data={newCustomerBarData}
            metric="New Customers"
            showOverclaim
          />
          <p className="mt-4 text-xs text-gray-500 bg-gray-50 rounded-md p-3 leading-relaxed">
            <span className="font-semibold text-[#434C53]">What this means:</span>{' '}
            This chart ranks every channel by how many brand-new customers it brought in. Organic Search
            leads by a wide margin, followed by Google Ads and Direct. Faded bars show what each ad
            platform <em>claims</em> it drove — the gap between that and the solid bar is the overclaim.
          </p>
          <p className="mt-2 text-xs text-amber-600 italic">
            Coming in Phase 2: Assisted conversion data will show which channels help even when they
            do not get last-click credit.
          </p>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Section 2: New Customer Funnel by Channel (Top 3 Paid)             */}
      {/* ----------------------------------------------------------------- */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-semibold text-[#434C53]">
            New Customer Funnel by Channel
          </h2>
          <Tooltip content="Shows the step-by-step journey from ad impression to purchase for each paid channel. Red bars highlight stages where more than 70% of people drop off." />
        </div>
        <p className="text-sm text-gray-500 mb-4">
          How each paid channel moves people from seeing an ad to making a purchase.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {topPaidChannelIds.map((channelId) => {
            const stages = mockFunnelData[channelId];
            const channel = mockChannelPerformance.find((ch) => ch.channelId === channelId);
            return (
              <div
                key={channelId}
                className="bg-white rounded-lg border border-gray-100 shadow-sm p-6"
              >
                <FunnelChart
                  stages={stages}
                  channelName={channel?.channelName ?? channelId}
                />
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-gray-500 bg-gray-50 rounded-md p-3 leading-relaxed">
          <span className="font-semibold text-[#434C53]">What this means:</span>{' '}
          These funnels show where people drop off between seeing an ad and buying. The biggest
          drop-off for all three channels is from &quot;Add to Cart&quot; to &quot;Purchase&quot; — about 72-74%
          of people who add an item to their cart do not complete checkout. This is the biggest
          opportunity to recover lost sales.
        </p>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Section 3: Organic vs Paid Split                                   */}
      {/* ----------------------------------------------------------------- */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-semibold text-[#434C53]">
            Organic vs. Paid Split
          </h2>
          <Tooltip content="Shows what percentage of new customers come from paid advertising versus free (organic) channels like search, direct visits, referrals, and social." />
        </div>
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
          <div className="max-w-md mx-auto">
            <DonutChart
              data={organicPaidDonut}
              title="New Customers: Organic vs. Paid"
              centerLabel={`${fmtNumber(totalNewCustomers)} total`}
            />
          </div>

          {/* Organic value callout */}
          <div className="mt-6 bg-[#F8B457]/10 border border-[#F8B457]/30 rounded-lg p-4 text-center">
            <p className="text-sm text-[#434C53] leading-relaxed">
              For every <span className="font-bold">$1</span> spent on paid advertising, organic channels
              bring in <span className="font-bold text-[#006373]">${organicPerPaidDollar}</span> worth
              of new customers at <span className="font-bold">$0 cost</span>.
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Organic value calculated using the average paid cost per new customer ({fmtCurrency(costPerPaidNewCustomer)})
              applied to {fmtNumber(organicNewCustomers)} organic new customers = {fmtCurrency(organicEquivalentValue)} in equivalent value.
            </p>
          </div>

          <p className="mt-4 text-xs text-gray-500 bg-gray-50 rounded-md p-3 leading-relaxed">
            <span className="font-semibold text-[#434C53]">What this means:</span>{' '}
            {organicPct}% of new customers come from organic channels (primarily search) that cost nothing in
            ad spend. Paid channels account for {paidPct}%. This ratio suggests the brand has strong
            organic visibility, but there may be room to amplify it further through SEO investment.
          </p>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Section 4: Top Products in First Orders                            */}
      {/* ----------------------------------------------------------------- */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-semibold text-[#434C53]">
            Top Products in First Orders
          </h2>
          <Tooltip content="Shows which products appear most often in the very first order from a new customer. This helps identify which products are best at converting browsers into buyers." />
        </div>
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
          <ChannelBarChart
            data={productBarData}
            metric="First Orders"
          />
          <p className="mt-4 text-xs text-gray-500 bg-gray-50 rounded-md p-3 leading-relaxed">
            <span className="font-semibold text-[#434C53]">What this means:</span>{' '}
            Kona Peaberry is the number one product that converts new customers, appearing in{' '}
            {mockFirstOrderProducts[0].percent}% of first orders. Ka&#699;u Morning Glory and Hawaiian
            Harmony round out the top three. The Explorers Club Subscription is also a strong entry
            point, driving {mockFirstOrderProducts[4].percent}% of first orders directly into the
            subscription funnel.
          </p>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Section 5: Phase 2 Callout                                         */}
      {/* ----------------------------------------------------------------- */}
      <section className="pb-8">
        <div className="rounded-lg p-6 border border-[#C3E3F2]" style={{ backgroundColor: '#C3E3F2' }}>
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-[#006373] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-[#006373] mb-2">
                Coming in Phase 2
              </h3>
              <p className="text-sm text-[#434C53] leading-relaxed">
                First-touch vs. last-touch breakdown, time to first purchase analysis, and assisted
                conversion data. These features require BigQuery integration, which is currently in
                progress.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
