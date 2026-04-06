import { NextResponse } from 'next/server';
import {
  mockChannelPerformance,
  mockKPIs,
  mockGoalProgress,
  CHANNELS,
} from '@/lib/mock-data';
import type {
  APIResponse,
  ChannelPerformance,
  KPIData,
  GoalProgress,
  Channel,
} from '@/types';

export const revalidate = 14400; // 4 hours

interface OverviewData {
  kpis: KPIData[];
  channels: Channel[];
  channelPerformance: ChannelPerformance[];
  goalProgress: GoalProgress;
}

export async function GET() {
  // The overview route is a convenience aggregation endpoint.
  // In production it could call the individual channel API routes internally,
  // but for now it reads directly from the same data source (mock or future DB).
  //
  // When live API integrations are connected, this route should:
  // 1. Fetch from each channel route in parallel
  // 2. Re-aggregate KPIs from live channel data
  // 3. Pull goal progress from a persistent store (DB or sheet)

  try {
    const overviewData: OverviewData = {
      kpis: mockKPIs,
      channels: CHANNELS,
      channelPerformance: mockChannelPerformance,
      goalProgress: mockGoalProgress,
    };

    const response: APIResponse<OverviewData> = {
      data: overviewData,
      source: 'mock',
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.warn('Overview aggregation failed:', error);

    const response: APIResponse<null> = {
      data: null,
      source: 'mock',
      lastUpdated: new Date().toISOString(),
      error: 'Failed to aggregate overview data',
    };

    return NextResponse.json(response, { status: 500 });
  }
}
