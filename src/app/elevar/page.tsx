'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import Tooltip from '@/components/ui/Tooltip';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ElevarOrder {
  orderId: string;
  orderDate: string;
  email: string;
  revenue: number;
  source: string;
  medium: string;
  campaign: string;
  channel: string;       // Elevar's assigned channel grouping
  isNewCustomer: boolean;
  shopifyMatch: 'matched' | 'unmatched' | 'pending';
}

// ---------------------------------------------------------------------------
// Mock Elevar data (shown before upload replaces it)
// ---------------------------------------------------------------------------
const mockElevarOrders: ElevarOrder[] = [
  { orderId: '#BICR-4821', orderDate: '2026-03-28', email: 'j***@gmail.com', revenue: 89.00, source: 'google', medium: 'cpc', campaign: 'Brand - Kona Coffee', channel: 'Paid Search', isNewCustomer: true, shopifyMatch: 'matched' },
  { orderId: '#BICR-4822', orderDate: '2026-03-28', email: 'k***@yahoo.com', revenue: 124.50, source: 'facebook', medium: 'paid', campaign: 'Prospecting - Lookalike', channel: 'Paid Social', isNewCustomer: true, shopifyMatch: 'matched' },
  { orderId: '#BICR-4823', orderDate: '2026-03-28', email: 's***@icloud.com', revenue: 67.00, source: 'google', medium: 'organic', campaign: '(not set)', channel: 'Organic Search', isNewCustomer: false, shopifyMatch: 'matched' },
  { orderId: '#BICR-4824', orderDate: '2026-03-27', email: 'a***@gmail.com', revenue: 156.00, source: 'klaviyo', medium: 'email', campaign: 'March Coffee Drop', channel: 'Email', isNewCustomer: false, shopifyMatch: 'matched' },
  { orderId: '#BICR-4825', orderDate: '2026-03-27', email: 'm***@outlook.com', revenue: 94.00, source: 'bing', medium: 'cpc', campaign: 'Non-Brand - Kona Coffee Online', channel: 'Paid Search', isNewCustomer: true, shopifyMatch: 'matched' },
  { orderId: '#BICR-4826', orderDate: '2026-03-27', email: 'r***@gmail.com', revenue: 212.00, source: 'facebook', medium: 'paid', campaign: 'Retargeting - Cart Abandoners', channel: 'Paid Social', isNewCustomer: false, shopifyMatch: 'matched' },
  { orderId: '#BICR-4827', orderDate: '2026-03-26', email: 'b***@hotmail.com', revenue: 78.50, source: '(direct)', medium: '(none)', campaign: '(not set)', channel: 'Direct', isNewCustomer: false, shopifyMatch: 'matched' },
  { orderId: '#BICR-4828', orderDate: '2026-03-26', email: 'l***@gmail.com', revenue: 145.00, source: 'google', medium: 'cpc', campaign: 'Shopping - Best Sellers', channel: 'Paid Search', isNewCustomer: true, shopifyMatch: 'matched' },
  { orderId: '#BICR-4829', orderDate: '2026-03-26', email: 'n***@aol.com', revenue: 52.00, source: 'instagram', medium: 'organic', campaign: '(not set)', channel: 'Organic Social', isNewCustomer: true, shopifyMatch: 'unmatched' },
  { orderId: '#BICR-4830', orderDate: '2026-03-25', email: 'c***@gmail.com', revenue: 189.00, source: 'attentive', medium: 'sms', campaign: 'Flash Sale', channel: 'SMS', isNewCustomer: false, shopifyMatch: 'matched' },
  { orderId: '#BICR-4831', orderDate: '2026-03-25', email: 'p***@proton.me', revenue: 98.00, source: 'google', medium: 'organic', campaign: '(not set)', channel: 'Organic Search', isNewCustomer: true, shopifyMatch: 'matched' },
  { orderId: '#BICR-4832', orderDate: '2026-03-25', email: 'w***@gmail.com', revenue: 67.00, source: 'facebook', medium: 'paid', campaign: 'Advantage+ - Kona Peaberry', channel: 'Paid Social', isNewCustomer: true, shopifyMatch: 'matched' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fmtCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------
export default function ElevarPage() {
  const [orders, setOrders] = useState<ElevarOrder[]>(mockElevarOrders);
  const [isUploaded, setIsUploaded] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [filterChannel, setFilterChannel] = useState('all');
  const [filterCustomer, setFilterCustomer] = useState<'all' | 'new' | 'returning'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse uploaded Elevar CSV
  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.trim().split('\n');
      if (lines.length < 2) return;

      const headerRow = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, '').toLowerCase());
      const dataRows = lines.slice(1);

      // Try to map common Elevar export column names
      const getIdx = (names: string[]) =>
        headerRow.findIndex((h) => names.includes(h));

      const orderIdx = getIdx(['order id', 'order_id', 'orderid', 'transaction_id']);
      const dateIdx = getIdx(['date', 'order_date', 'created_at', 'timestamp']);
      const emailIdx = getIdx(['email', 'customer_email']);
      const revenueIdx = getIdx(['revenue', 'total', 'value', 'order_total']);
      const sourceIdx = getIdx(['source', 'utm_source', 'traffic_source']);
      const mediumIdx = getIdx(['medium', 'utm_medium']);
      const campaignIdx = getIdx(['campaign', 'utm_campaign']);
      const channelIdx = getIdx(['channel', 'channel_grouping', 'default_channel_grouping']);
      const newCustIdx = getIdx(['new_customer', 'is_new_customer', 'first_order']);

      const parsed: ElevarOrder[] = dataRows
        .map((line) => {
          const cells = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
          return {
            orderId: orderIdx >= 0 ? cells[orderIdx] : '',
            orderDate: dateIdx >= 0 ? cells[dateIdx] : '',
            email: emailIdx >= 0 ? maskEmail(cells[emailIdx]) : '',
            revenue: revenueIdx >= 0 ? parseFloat(cells[revenueIdx]) || 0 : 0,
            source: sourceIdx >= 0 ? cells[sourceIdx] : '(unknown)',
            medium: mediumIdx >= 0 ? cells[mediumIdx] : '(unknown)',
            campaign: campaignIdx >= 0 ? cells[campaignIdx] : '(not set)',
            channel: channelIdx >= 0 ? cells[channelIdx] : inferChannel(
              sourceIdx >= 0 ? cells[sourceIdx] : '',
              mediumIdx >= 0 ? cells[mediumIdx] : ''
            ),
            isNewCustomer: newCustIdx >= 0
              ? ['true', '1', 'yes', 'new'].includes(cells[newCustIdx]?.toLowerCase())
              : false,
            shopifyMatch: 'pending' as const,
          };
        })
        .filter((o) => o.orderId);

      setOrders(parsed);
      setIsUploaded(true);
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  // Filtered orders
  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (filterChannel !== 'all' && o.channel !== filterChannel) return false;
      if (filterCustomer === 'new' && !o.isNewCustomer) return false;
      if (filterCustomer === 'returning' && o.isNewCustomer) return false;
      return true;
    });
  }, [orders, filterChannel, filterCustomer]);

  // Channel breakdown
  const channelBreakdown = useMemo(() => {
    const map = new Map<string, { orders: number; revenue: number; newCustomers: number }>();
    orders.forEach((o) => {
      const entry = map.get(o.channel) || { orders: 0, revenue: 0, newCustomers: 0 };
      entry.orders++;
      entry.revenue += o.revenue;
      if (o.isNewCustomer) entry.newCustomers++;
      map.set(o.channel, entry);
    });
    return Array.from(map.entries())
      .map(([channel, data]) => ({ channel, ...data }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [orders]);

  // Unique channels for filter
  const uniqueChannels = useMemo(
    () => [...new Set(orders.map((o) => o.channel))].sort(),
    [orders]
  );

  // Summary stats
  const totalOrders = filtered.length;
  const totalRevenue = filtered.reduce((s, o) => s + o.revenue, 0);
  const newCustomers = filtered.filter((o) => o.isNewCustomer).length;
  const matchRate = orders.length > 0
    ? Math.round((orders.filter((o) => o.shopifyMatch === 'matched').length / orders.length) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold text-[#434C53] tracking-tight">
          Elevar Attribution
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Server-side order attribution matched against Shopify
        </p>
      </header>

      {/* Upload Zone */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-semibold text-[#434C53]">Upload Elevar Data</h2>
          <Tooltip content="Export your Elevar order data as CSV. Elevar captures server-side attribution that bypasses ad blockers and iOS privacy restrictions, giving you more accurate source data than browser-based tracking." />
        </div>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragOver
              ? 'border-[#006373] bg-[#006373]/5'
              : 'border-gray-300 hover:border-[#006373]/50 hover:bg-gray-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
            className="hidden"
          />
          <svg
            className="w-8 h-8 text-gray-400 mx-auto mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <p className="text-sm font-medium text-[#434C53]">
            {isUploaded ? 'Upload new Elevar export to replace current data' : 'Drop Elevar CSV export here, or click to browse'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Expected columns: Order ID, Date, Email, Revenue, Source, Medium, Campaign, Channel, New Customer
          </p>
        </div>
      </section>

      {/* Summary KPIs */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500 mb-1">Total Orders</p>
            <p className="text-2xl font-bold text-[#434C53]">{totalOrders}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-[#434C53]">{fmtCurrency(totalRevenue)}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500 mb-1">New Customers</p>
            <p className="text-2xl font-bold text-[#006373]">{newCustomers}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {totalOrders > 0 ? Math.round((newCustomers / totalOrders) * 100) : 0}% of orders
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500 mb-1">Shopify Match Rate</p>
            <p className={`text-2xl font-bold ${matchRate >= 90 ? 'text-[#639922]' : matchRate >= 70 ? 'text-[#F8B457]' : 'text-[#E24B4A]'}`}>
              {matchRate}%
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {orders.filter((o) => o.shopifyMatch === 'matched').length} of {orders.length} matched
            </p>
          </div>
        </div>
      </section>

      {/* Channel Breakdown */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-semibold text-[#434C53]">
            Where New Customers Actually Came From
          </h2>
          <Tooltip content="This shows Elevar's server-side attribution — which channel truly drove each order. Compare this to what each ad platform self-reports to see the real picture." />
        </div>
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-[#434C53]">Channel</th>
                <th className="text-right px-4 py-3 font-medium text-[#434C53]">Orders</th>
                <th className="text-right px-4 py-3 font-medium text-[#434C53]">Revenue</th>
                <th className="text-right px-4 py-3 font-medium text-[#434C53]">New Customers</th>
                <th className="text-right px-4 py-3 font-medium text-[#434C53]">New Cust %</th>
              </tr>
            </thead>
            <tbody>
              {channelBreakdown.map((row) => (
                <tr key={row.channel} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-[#434C53]">{row.channel}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{row.orders}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{fmtCurrency(row.revenue)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{row.newCustomers}</td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {row.orders > 0 ? Math.round((row.newCustomers / row.orders) * 100) : 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-gray-500 bg-gray-50 rounded-md p-3 leading-relaxed">
          <span className="font-semibold text-[#434C53]">What this means:</span>{' '}
          This table uses Elevar&apos;s server-side tracking to show which channel each order truly came from.
          Unlike browser-based tracking (GA4), Elevar captures attribution even when ad blockers or
          iOS privacy settings block standard tracking pixels.
        </p>
      </section>

      {/* Filters */}
      <section>
        <div className="flex flex-wrap gap-3 items-center">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Channel</label>
            <select
              value={filterChannel}
              onChange={(e) => setFilterChannel(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#434C53] focus:outline-none focus:ring-2 focus:ring-[#006373]/30"
            >
              <option value="all">All Channels</option>
              {uniqueChannels.map((ch) => (
                <option key={ch} value={ch}>{ch}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Customer Type</label>
            <select
              value={filterCustomer}
              onChange={(e) => setFilterCustomer(e.target.value as 'all' | 'new' | 'returning')}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#434C53] focus:outline-none focus:ring-2 focus:ring-[#006373]/30"
            >
              <option value="all">All Customers</option>
              <option value="new">New Customers Only</option>
              <option value="returning">Returning Only</option>
            </select>
          </div>
        </div>
      </section>

      {/* Order-Level Detail Table */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-semibold text-[#434C53]">Order-Level Attribution</h2>
          <Tooltip content="Each row is a single order with Elevar's attributed source. Match status shows whether this order ID was found in Shopify. Matched orders confirm the attribution; unmatched orders may indicate tracking gaps." />
        </div>
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-[#434C53]">Order</th>
                <th className="text-left px-4 py-3 font-medium text-[#434C53]">Date</th>
                <th className="text-right px-4 py-3 font-medium text-[#434C53]">Revenue</th>
                <th className="text-left px-4 py-3 font-medium text-[#434C53]">Source / Medium</th>
                <th className="text-left px-4 py-3 font-medium text-[#434C53]">Campaign</th>
                <th className="text-left px-4 py-3 font-medium text-[#434C53]">Channel</th>
                <th className="text-center px-4 py-3 font-medium text-[#434C53]">Type</th>
                <th className="text-center px-4 py-3 font-medium text-[#434C53]">Shopify</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.orderId} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-[#434C53]">{order.orderId}</td>
                  <td className="px-4 py-3 text-gray-600">{order.orderDate}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{fmtCurrency(order.revenue)}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {order.source} / {order.medium}
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">
                    {order.campaign}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#006373]/10 text-[#006373]">
                      {order.channel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        order.isNewCustomer
                          ? 'bg-[#F8B457]/20 text-[#db704f]'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {order.isNewCustomer ? 'New' : 'Returning'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        order.shopifyMatch === 'matched'
                          ? 'bg-[#639922]'
                          : order.shopifyMatch === 'unmatched'
                          ? 'bg-[#E24B4A]'
                          : 'bg-gray-300'
                      }`}
                      title={
                        order.shopifyMatch === 'matched'
                          ? 'Matched in Shopify'
                          : order.shopifyMatch === 'unmatched'
                          ? 'Not found in Shopify'
                          : 'Pending match'
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-[#639922]" />
            Matched in Shopify
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-[#E24B4A]" />
            Not found in Shopify
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-gray-300" />
            Pending match
          </div>
        </div>
      </section>

      {/* Explanation */}
      <section className="pb-8">
        <div className="rounded-lg p-5 border border-[#C3E3F2]" style={{ backgroundColor: '#C3E3F2' }}>
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-[#006373] mt-0.5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-[#006373] mb-1">
                Why Elevar Matters
              </h3>
              <p className="text-sm text-[#434C53] leading-relaxed">
                Standard browser-based tracking (GA4, Meta Pixel) misses 15-30% of conversions
                due to ad blockers, iOS privacy settings, and cookie restrictions. Elevar uses
                server-side tracking to capture these missed conversions and attribute them to the
                correct source. By matching Elevar order IDs to Shopify, this dashboard shows you
                where customers <em>actually</em> came from — not just what the ad platforms claim.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------
function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;
  const [local, domain] = email.split('@');
  return `${local.charAt(0)}***@${domain}`;
}

function inferChannel(source: string, medium: string): string {
  const s = source.toLowerCase();
  const m = medium.toLowerCase();

  if (m === 'cpc' || m === 'paid' || m === 'ppc') {
    if (s.includes('facebook') || s.includes('instagram') || s.includes('meta')) return 'Paid Social';
    return 'Paid Search';
  }
  if (m === 'email') return 'Email';
  if (m === 'sms') return 'SMS';
  if (m === 'organic' && (s.includes('google') || s.includes('bing'))) return 'Organic Search';
  if (m === 'organic' || s.includes('instagram') || s.includes('facebook')) return 'Organic Social';
  if (s === '(direct)' || m === '(none)') return 'Direct';
  if (m === 'referral') return 'Referral';
  return 'Other';
}
