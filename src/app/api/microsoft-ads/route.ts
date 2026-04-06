import { NextRequest, NextResponse } from 'next/server';
import { mockChannelPerformance, mockCampaigns } from '@/lib/mock-data';
import type { APIResponse, ChannelPerformance, Campaign } from '@/types';

export const revalidate = 14400; // 4 hours

interface MicrosoftAdsData {
  channel: ChannelPerformance | undefined;
  campaigns: Campaign[];
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const startDate = searchParams.get('startDate'); // YYYY-MM-DD
  const endDate = searchParams.get('endDate');      // YYYY-MM-DD

  const accountId = process.env.MS_ACCOUNT_ID;
  const clientId = process.env.MS_CLIENT_ID;
  const clientSecret = process.env.MS_CLIENT_SECRET;
  const customerId = process.env.MS_CUSTOMER_ID;
  const devToken = process.env.MS_DEV_TOKEN;
  const refreshToken = process.env.MS_REFRESH_TOKEN;

  // If credentials exist, try real Microsoft Advertising API
  if (accountId && clientId && devToken && refreshToken) {
    try {
      // TODO: Implement real Microsoft Advertising API call
      //
      // Microsoft Ads uses a two-step process:
      //
      // 1. Obtain OAuth2 access token:
      //    POST https://login.microsoftonline.com/common/oauth2/v2.0/token
      //    Body: {
      //      client_id: ${clientId},
      //      client_secret: ${clientSecret},
      //      refresh_token: ${refreshToken},
      //      grant_type: 'refresh_token',
      //      scope: 'https://ads.microsoft.com/msads.manage'
      //    }
      //
      // 2. Submit a reporting request (REST v13):
      //    POST https://reporting.api.bingads.microsoft.com/Reporting/v13/GenerateReport
      //    Headers:
      //      Authorization: Bearer <access_token>
      //      DeveloperToken: ${devToken}
      //      CustomerId: ${customerId}
      //      AccountId: ${accountId}
      //    Body: CampaignPerformanceReportRequest with columns:
      //      CampaignName, CampaignId, CampaignStatus,
      //      Spend, Impressions, Clicks, Conversions, Revenue
      //      for date range ${startDate} to ${endDate}
      //
      // 3. Poll for report completion, download CSV, parse into our types
      //
      // The reporting API is async (submit -> poll -> download).
      // For now, fall through to mock data.
      throw new Error('Real Microsoft Ads API not yet implemented');
    } catch (error) {
      console.warn('Microsoft Ads API call failed, using mock data:', error);
    }
  }

  // Mock fallback
  const channelData = mockChannelPerformance.find(
    (c) => c.channelId === 'microsoft-ads'
  );
  const campaigns = mockCampaigns.filter(
    (c) => c.channelId === 'microsoft-ads'
  );

  const response: APIResponse<MicrosoftAdsData> = {
    data: { channel: channelData, campaigns },
    source: 'mock',
    lastUpdated: new Date().toISOString(),
  };

  return NextResponse.json(response);
}
