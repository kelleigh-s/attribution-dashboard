import { NextRequest, NextResponse } from 'next/server';
import { mockEfficiency, mockChannelPerformance } from '@/lib/mock-data';
import type { APIResponse, ChannelEfficiency } from '@/types';

export const revalidate = 14400; // 4 hours

interface BudgetScenarioInput {
  channelId: string;
  spendAdjustment: number; // percentage change, e.g. +10 or -15
}

interface BudgetProjection {
  channelId: string;
  channelName: string;
  currentSpend: number;
  projectedSpend: number;
  currentNewCustomers: number;
  projectedNewCustomers: number;
  currentROAS: number;
  projectedROAS: number;
  currentRevenue: number;
  projectedRevenue: number;
}

interface BudgetData {
  efficiency: ChannelEfficiency[];
  projections?: BudgetProjection[];
  totalCurrentSpend?: number;
  totalProjectedSpend?: number;
  totalCurrentRevenue?: number;
  totalProjectedRevenue?: number;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Parse optional scenario adjustments from query params
  // Format: adjustments=google-ads:10,meta:-5,microsoft-ads:15
  const adjustmentsParam = searchParams.get('adjustments');

  try {
    const efficiency = mockEfficiency;

    // If no scenario adjustments requested, return base efficiency data
    if (!adjustmentsParam) {
      const response: APIResponse<BudgetData> = {
        data: { efficiency },
        source: 'mock',
        lastUpdated: new Date().toISOString(),
      };

      return NextResponse.json(response);
    }

    // Parse scenario adjustments
    const adjustments: BudgetScenarioInput[] = adjustmentsParam
      .split(',')
      .map((pair) => {
        const [channelId, pctStr] = pair.split(':');
        return {
          channelId: channelId.trim(),
          spendAdjustment: parseFloat(pctStr) || 0,
        };
      })
      .filter((a) => a.channelId);

    // Build projections based on historical efficiency ratios
    // Assumption: diminishing returns — doubling spend does NOT double results.
    // We apply a square-root scaling factor for increases and linear for decreases.
    const projections: BudgetProjection[] = [];
    let totalCurrentSpend = 0;
    let totalProjectedSpend = 0;
    let totalCurrentRevenue = 0;
    let totalProjectedRevenue = 0;

    for (const channel of mockChannelPerformance) {
      // Only project paid channels (organic has no spend to adjust)
      if (channel.channelType !== 'paid') continue;

      const adjustment = adjustments.find(
        (a) => a.channelId === channel.channelId
      );
      const pctChange = adjustment ? adjustment.spendAdjustment / 100 : 0;

      const currentSpend = channel.spend;
      const projectedSpend = currentSpend * (1 + pctChange);

      // Scale factor: sqrt for increases (diminishing returns), linear for decreases
      let scaleFactor: number;
      if (pctChange >= 0) {
        scaleFactor = Math.sqrt(1 + pctChange);
      } else {
        scaleFactor = 1 + pctChange; // linear decline
      }

      const projectedNewCustomers = Math.round(
        channel.newCustomers * scaleFactor
      );
      const projectedRevenue = Math.round(channel.revenue * scaleFactor);
      const projectedROAS =
        projectedSpend > 0
          ? Math.round((projectedRevenue / projectedSpend) * 100) / 100
          : 0;

      totalCurrentSpend += currentSpend;
      totalProjectedSpend += projectedSpend;
      totalCurrentRevenue += channel.revenue;
      totalProjectedRevenue += projectedRevenue;

      projections.push({
        channelId: channel.channelId,
        channelName: channel.channelName,
        currentSpend,
        projectedSpend: Math.round(projectedSpend),
        currentNewCustomers: channel.newCustomers,
        projectedNewCustomers,
        currentROAS: channel.roas,
        projectedROAS,
        currentRevenue: channel.revenue,
        projectedRevenue,
      });
    }

    const response: APIResponse<BudgetData> = {
      data: {
        efficiency,
        projections,
        totalCurrentSpend: Math.round(totalCurrentSpend),
        totalProjectedSpend: Math.round(totalProjectedSpend),
        totalCurrentRevenue: Math.round(totalCurrentRevenue),
        totalProjectedRevenue: Math.round(totalProjectedRevenue),
      },
      source: 'mock',
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.warn('Budget optimization calculation failed:', error);

    const response: APIResponse<BudgetData> = {
      data: { efficiency: mockEfficiency },
      source: 'mock',
      lastUpdated: new Date().toISOString(),
      error: 'Failed to calculate budget projections',
    };

    return NextResponse.json(response, { status: 500 });
  }
}
