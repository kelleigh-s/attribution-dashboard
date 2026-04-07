import { NextRequest, NextResponse } from 'next/server';
import { mockChannelPerformance, mockCampaigns } from '@/lib/mock-data';
import type { APIResponse, ChannelPerformance, Campaign } from '@/types';

export const revalidate = 14400; // 4 hours

interface MetaAdsData {
  channel: ChannelPerformance | undefined;
  campaigns: Campaign[];
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const startDate = searchParams.get('startDate'); // YYYY-MM-DD
  const endDate = searchParams.get('endDate');      // YYYY-MM-DD

  const appId = process.env.META_APP_ID;
  const adAccountId = process.env.META_AD_ACCOUNT_ID;
  const appSecret = process.env.META_APP_SECRET;
  const accessToken = process.env.META_ACCESS_TOKEN;

  // If credentials exist, try real Meta Marketing API
  if (accessToken && adAccountId) {
    try {
      const datePreset = 'last_30d';
      const fields = [
        'campaign_name',
        'campaign_id',
        'spend',
        'impressions',
        'clicks',
        'cpm',
        'cpc',
        'reach',
        'actions',
        'action_values',
      ].join(',');

      // Build URL with date params or preset
      // adAccountId already includes the "act_" prefix from .env.local
      let url = `https://graph.facebook.com/v21.0/${adAccountId}/insights?access_token=${accessToken}&fields=${fields}&level=campaign`;

      if (startDate && endDate) {
        url += `&time_range={"since":"${startDate}","until":"${endDate}"}`;
      } else {
        url += `&date_preset=${datePreset}`;
      }

      const res = await fetch(url);

      if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(`Meta API ${res.status}: ${errorBody}`);
      }

      const json = await res.json();
      const campaignRows = json.data || [];

      // Transform Meta API response into our types
      let totalSpend = 0;
      let totalImpressions = 0;
      let totalClicks = 0;
      let totalConversions = 0;
      let totalRevenue = 0;

      const campaigns: Campaign[] = campaignRows.map(
        (row: Record<string, unknown>) => {
          const spend = parseFloat(row.spend as string) || 0;
          const impressions = parseInt(row.impressions as string, 10) || 0;
          const clicks = parseInt(row.clicks as string, 10) || 0;

          // Extract purchases from actions array
          const actions = (row.actions as Array<{ action_type: string; value: string }>) || [];
          const actionValues = (row.action_values as Array<{ action_type: string; value: string }>) || [];

          const purchaseAction = actions.find(
            (a) => a.action_type === 'purchase' || a.action_type === 'omni_purchase'
          );
          const purchaseValue = actionValues.find(
            (a) => a.action_type === 'purchase' || a.action_type === 'omni_purchase'
          );

          const conversions = purchaseAction
            ? parseInt(purchaseAction.value, 10)
            : 0;
          const revenue = purchaseValue
            ? parseFloat(purchaseValue.value)
            : 0;

          totalSpend += spend;
          totalImpressions += impressions;
          totalClicks += clicks;
          totalConversions += conversions;
          totalRevenue += revenue;

          return {
            id: row.campaign_id as string,
            name: row.campaign_name as string,
            channelId: 'meta',
            spend,
            impressions,
            clicks,
            conversions,
            platformReportedConversions: conversions, // Meta's own count
            newCustomers: 0, // Meta doesn't differentiate; Shopify data needed
            revenue,
            roas: spend > 0 ? revenue / spend : 0,
            cpa: conversions > 0 ? spend / conversions : 0,
            newCustomerPercent: 0, // Requires Shopify cross-reference
            status: 'active' as const,
          };
        }
      );

      const ctr = totalImpressions > 0
        ? (totalClicks / totalImpressions) * 100
        : 0;
      const cpc = totalClicks > 0 ? totalSpend / totalClicks : 0;

      const channel: ChannelPerformance = {
        channelId: 'meta',
        channelName: 'Meta',
        channelType: 'paid',
        spend: totalSpend,
        impressions: totalImpressions,
        clicks: totalClicks,
        ctr,
        cpc,
        sessions: totalClicks, // Approximate; GA4 would have true sessions
        conversions: totalConversions,
        platformReportedConversions: totalConversions,
        newCustomers: 0, // Requires Shopify cross-reference
        revenue: totalRevenue,
        roas: totalSpend > 0 ? totalRevenue / totalSpend : 0,
        cpa: totalConversions > 0 ? totalSpend / totalConversions : 0,
        newCustomerPercent: 0,
      };

      const response: APIResponse<MetaAdsData> = {
        data: { channel, campaigns },
        source: 'live',
        lastUpdated: new Date().toISOString(),
      };

      return NextResponse.json(response);
    } catch (error) {
      console.warn('Meta Marketing API call failed, using mock data:', error);
    }
  }

  // Mock fallback
  const channelData = mockChannelPerformance.find(
    (c) => c.channelId === 'meta'
  );
  const campaignData = mockCampaigns.filter(
    (c) => c.channelId === 'meta'
  );

  const response: APIResponse<MetaAdsData> = {
    data: { channel: channelData, campaigns: campaignData },
    source: 'mock',
    lastUpdated: new Date().toISOString(),
  };

  return NextResponse.json(response);
}
