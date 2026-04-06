import { NextRequest, NextResponse } from 'next/server';
import { mockFirstOrderProducts } from '@/lib/mock-data';
import type { APIResponse, FirstOrderProduct } from '@/types';

export const revalidate = 14400; // 4 hours

interface ShopifyOrderSummary {
  totalOrders: number;
  firstTimeOrders: number;
  firstTimePercent: number;
  averageOrderValue: number;
  firstTimeAOV: number;
  topFirstOrderProducts: FirstOrderProduct[];
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const startDate = searchParams.get('startDate'); // YYYY-MM-DD
  const endDate = searchParams.get('endDate');      // YYYY-MM-DD

  const token = process.env.SHOPIFY_TOKEN;
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;

  // If credentials exist, try real Shopify Admin API
  if (token && storeDomain) {
    try {
      // Build date filter for orders
      const createdAtMin = startDate
        ? `${startDate}T00:00:00-10:00`
        : undefined;
      const createdAtMax = endDate
        ? `${endDate}T23:59:59-10:00`
        : undefined;

      // Fetch orders (paginated — initial page)
      let url = `https://${storeDomain}/admin/api/2024-10/orders.json?status=any&limit=250`;
      if (createdAtMin) url += `&created_at_min=${createdAtMin}`;
      if (createdAtMax) url += `&created_at_max=${createdAtMax}`;

      const allOrders: ShopifyOrderRaw[] = [];
      let nextPageUrl: string | null = url;

      // Paginate through all orders for the period
      while (nextPageUrl) {
        const fetchUrl: string = nextPageUrl;
        const res: Response = await fetch(fetchUrl, {
          headers: {
            'X-Shopify-Access-Token': token,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          const errorBody = await res.text();
          throw new Error(`Shopify API ${res.status}: ${errorBody}`);
        }

        const json = await res.json();
        allOrders.push(...(json.orders || []));

        // Parse Link header for pagination
        const linkHeader: string = res.headers.get('Link') || '';
        const nextMatch: RegExpMatchArray | null = linkHeader.match(
          /<([^>]+)>;\s*rel="next"/
        );
        nextPageUrl = nextMatch ? nextMatch[1] : null;

        // Safety: cap at 10 pages (2500 orders) to prevent runaway
        if (allOrders.length >= 2500) break;
      }

      // Determine first-time buyers by finding customers with order_number === 1
      // or by checking customer.orders_count === 1
      const totalOrders = allOrders.length;
      let firstTimeCount = 0;
      let totalRevenue = 0;
      let firstTimeRevenue = 0;
      const productCounts: Record<string, number> = {};

      for (const order of allOrders) {
        const price = parseFloat(order.total_price) || 0;
        totalRevenue += price;

        const isFirstOrder =
          order.customer?.orders_count === 1 ||
          order.order_number === 1;

        if (isFirstOrder) {
          firstTimeCount++;
          firstTimeRevenue += price;

          // Track products in first orders
          for (const item of order.line_items || []) {
            const title = item.title || 'Unknown';
            productCounts[title] = (productCounts[title] || 0) + item.quantity;
          }
        }
      }

      // Build top first-order products
      const sortedProducts = Object.entries(productCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 12);

      const totalProductCount = sortedProducts.reduce(
        (sum, [, count]) => sum + count,
        0
      );

      const topFirstOrderProducts: FirstOrderProduct[] = sortedProducts.map(
        ([productTitle, count]) => ({
          productTitle,
          count,
          percent:
            totalProductCount > 0
              ? Math.round((count / totalProductCount) * 10000) / 100
              : 0,
        })
      );

      const summary: ShopifyOrderSummary = {
        totalOrders,
        firstTimeOrders: firstTimeCount,
        firstTimePercent:
          totalOrders > 0
            ? Math.round((firstTimeCount / totalOrders) * 10000) / 100
            : 0,
        averageOrderValue:
          totalOrders > 0
            ? Math.round((totalRevenue / totalOrders) * 100) / 100
            : 0,
        firstTimeAOV:
          firstTimeCount > 0
            ? Math.round((firstTimeRevenue / firstTimeCount) * 100) / 100
            : 0,
        topFirstOrderProducts,
      };

      const response: APIResponse<ShopifyOrderSummary> = {
        data: summary,
        source: 'live',
        lastUpdated: new Date().toISOString(),
      };

      return NextResponse.json(response);
    } catch (error) {
      console.warn('Shopify API call failed, using mock data:', error);
    }
  }

  // Mock fallback
  const summary: ShopifyOrderSummary = {
    totalOrders: 4_744,
    firstTimeOrders: 2_059,
    firstTimePercent: 43.4,
    averageOrderValue: 113.62,
    firstTimeAOV: 98.45,
    topFirstOrderProducts: mockFirstOrderProducts,
  };

  const response: APIResponse<ShopifyOrderSummary> = {
    data: summary,
    source: 'mock',
    lastUpdated: new Date().toISOString(),
  };

  return NextResponse.json(response);
}

// ---------------------------------------------------------------------------
// Raw Shopify order shape (subset of fields we use)
// ---------------------------------------------------------------------------
interface ShopifyOrderRaw {
  id: number;
  order_number: number;
  total_price: string;
  created_at: string;
  customer?: {
    id: number;
    orders_count: number;
  };
  line_items?: {
    title: string;
    quantity: number;
    price: string;
  }[];
}
