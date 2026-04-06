import { NextRequest, NextResponse } from 'next/server';
import { mockChannelPerformance, mockCampaigns } from '@/lib/mock-data';
import type { APIResponse, ChannelPerformance, Campaign } from '@/types';

export const revalidate = 14400; // 4 hours

interface GoogleAdsData {
  channel: ChannelPerformance | undefined;
  campaigns: Campaign[];
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const startDate = searchParams.get('startDate'); // YYYY-MM-DD
  const endDate = searchParams.get('endDate');      // YYYY-MM-DD

  const devToken = process.env.GA_DEV_TOKEN;
  const customerId = process.env.GA_CUSTOMER_ID;
  const managerId = process.env.GA_MANAGER_ID;

  // If credentials exist, try real Google Ads API
  if (devToken && customerId) {
    try {
      // TODO: Implement real Google Ads API call
      // Google Ads REST API requires an OAuth2 access token obtained via a refresh-token flow.
      //
      // 1. Exchange refresh token for access token:
      //    POST https://oauth2.googleapis.com/token
      //    { client_id, client_secret, refresh_token, grant_type: 'refresh_token' }
      //
      // 2. Query campaign performance:
      //    POST https://googleads.googleapis.com/v17/customers/${customerId}/googleAds:searchStream
      //    Headers:
      //      Authorization: Bearer <access_token>
      //      developer-token: ${devToken}
      //      login-customer-id: ${managerId}  (if using manager account)
      //    Body: {
      //      query: `SELECT campaign.name, campaign.id, campaign.status,
      //              metrics.cost_micros, metrics.impressions, metrics.clicks,
      //              metrics.conversions, metrics.conversions_value
      //              FROM campaign
      //              WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'`
      //    }
      //
      // 3. Transform response rows into ChannelPerformance / Campaign[] types
      //
      // For now, fall through to mock data until OAuth2 flow is implemented.
      throw new Error('Real Google Ads API not yet implemented');
    } catch (error) {
      console.warn('Google Ads API call failed, using mock data:', error);
    }
  }

  // Mock fallback
  const channelData = mockChannelPerformance.find(
    (c) => c.channelId === 'google-ads'
  );
  const campaigns = mockCampaigns.filter(
    (c) => c.channelId === 'google-ads'
  );

  const response: APIResponse<GoogleAdsData> = {
    data: { channel: channelData, campaigns },
    source: 'mock',
    lastUpdated: new Date().toISOString(),
  };

  return NextResponse.json(response);
}
