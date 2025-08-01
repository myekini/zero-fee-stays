import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const timeRange = url.searchParams.get('timeRange') || '30days';
    const currency = url.searchParams.get('currency') || 'usd';

    // Get Stripe secret key
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');

    if (!stripeSecretKey) {
      console.log('Stripe secret key not configured, returning mock data');
      
      // Return mock financial data when Stripe isn't configured
      const mockData = {
        revenue: {
          total: Math.floor(Math.random() * 50000) + 25000,
          fees: Math.floor(Math.random() * 2000) + 1000,
          net: Math.floor(Math.random() * 48000) + 24000,
          currency: currency.toUpperCase()
        },
        transactions: {
          successful: Math.floor(Math.random() * 200) + 100,
          failed: Math.floor(Math.random() * 10) + 2,
          disputed: Math.floor(Math.random() * 3) + 1,
          refunded: Math.floor(Math.random() * 5) + 1,
          successRate: 0.95 + Math.random() * 0.04
        },
        paymentMethods: {
          'card': 0.85,
          'bank_transfer': 0.10,
          'wallet': 0.05
        },
        dailyRevenue: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          amount: Math.floor(Math.random() * 2000) + 500,
          transactions: Math.floor(Math.random() * 20) + 5
        })),
        topCountries: [
          { country: 'US', revenue: Math.floor(Math.random() * 20000) + 10000, percentage: 0.45 },
          { country: 'UK', revenue: Math.floor(Math.random() * 10000) + 5000, percentage: 0.25 },
          { country: 'CA', revenue: Math.floor(Math.random() * 8000) + 4000, percentage: 0.20 },
          { country: 'AU', revenue: Math.floor(Math.random() * 3000) + 1500, percentage: 0.10 }
        ],
        disputes: {
          total: Math.floor(Math.random() * 5) + 1,
          won: Math.floor(Math.random() * 3) + 1,
          lost: Math.floor(Math.random() * 2),
          pending: Math.floor(Math.random() * 2)
        },
        note: 'This is mock data. Configure Stripe credentials to get real payment analytics.'
      };

      return new Response(JSON.stringify(mockData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Fetching Stripe analytics for ${timeRange}`);

    // Calculate date range
    const now = new Date();
    const daysBack = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : timeRange === '90days' ? 90 : 365;
    const startDate = Math.floor((now.getTime() - (daysBack * 24 * 60 * 60 * 1000)) / 1000);
    const endDate = Math.floor(now.getTime() / 1000);

    const headers = {
      'Authorization': `Bearer ${stripeSecretKey}`,
      'Content-Type': 'application/json'
    };

    // Fetch payment intents
    const paymentsResponse = await fetch(
      `https://api.stripe.com/v1/payment_intents?created[gte]=${startDate}&created[lte]=${endDate}&limit=100`,
      { headers }
    );

    if (!paymentsResponse.ok) {
      throw new Error(`Stripe API error: ${paymentsResponse.status}`);
    }

    const paymentsData = await paymentsResponse.json();

    // Fetch charges for additional details
    const chargesResponse = await fetch(
      `https://api.stripe.com/v1/charges?created[gte]=${startDate}&created[lte]=${endDate}&limit=100`,
      { headers }
    );

    const chargesData = chargesResponse.ok ? await chargesResponse.json() : { data: [] };

    // Fetch disputes
    const disputesResponse = await fetch(
      `https://api.stripe.com/v1/disputes?created[gte]=${startDate}&created[lte]=${endDate}`,
      { headers }
    );

    const disputesData = disputesResponse.ok ? await disputesResponse.json() : { data: [] };

    // Fetch refunds
    const refundsResponse = await fetch(
      `https://api.stripe.com/v1/refunds?created[gte]=${startDate}&created[lte]=${endDate}`,
      { headers }
    );

    const refundsData = refundsResponse.ok ? await refundsResponse.json() : { data: [] };

    // Process the data
    const payments = paymentsData.data || [];
    const charges = chargesData.data || [];
    const disputes = disputesData.data || [];
    const refunds = refundsData.data || [];

    // Calculate revenue metrics
    const successfulPayments = payments.filter((p: any) => p.status === 'succeeded');
    const totalRevenue = successfulPayments.reduce((sum: number, payment: any) => 
      sum + payment.amount, 0) / 100; // Convert from cents

    // Calculate fees (approximate - Stripe's fee structure is complex)
    const estimatedFees = successfulPayments.reduce((sum: number, payment: any) => {
      const amount = payment.amount / 100;
      const feeRate = 0.029; // 2.9%
      const fixedFee = 0.30; // $0.30
      return sum + (amount * feeRate) + fixedFee;
    }, 0);

    const netRevenue = totalRevenue - estimatedFees;

    // Transaction metrics
    const failedPayments = payments.filter((p: any) => p.status === 'payment_failed');
    const successRate = payments.length > 0 ? successfulPayments.length / payments.length : 0;

    // Payment method breakdown
    const paymentMethodCounts: Record<string, number> = {};
    charges.forEach((charge: any) => {
      if (charge.payment_method_details?.type) {
        const type = charge.payment_method_details.type;
        paymentMethodCounts[type] = (paymentMethodCounts[type] || 0) + 1;
      }
    });

    const totalMethods = Object.values(paymentMethodCounts).reduce((sum: number, count: number) => sum + count, 0);
    const paymentMethods: Record<string, number> = {};
    Object.entries(paymentMethodCounts).forEach(([method, count]) => {
      paymentMethods[method] = totalMethods > 0 ? count / totalMethods : 0;
    });

    // Daily revenue breakdown
    const dailyRevenue: Record<string, { amount: number; transactions: number }> = {};
    successfulPayments.forEach((payment: any) => {
      const date = new Date(payment.created * 1000).toISOString().split('T')[0];
      if (!dailyRevenue[date]) {
        dailyRevenue[date] = { amount: 0, transactions: 0 };
      }
      dailyRevenue[date].amount += payment.amount / 100;
      dailyRevenue[date].transactions += 1;
    });

    const dailyData = Object.entries(dailyRevenue).map(([date, data]) => ({
      date,
      amount: data.amount,
      transactions: data.transactions
    })).sort((a, b) => a.date.localeCompare(b.date));

    // Country breakdown (from billing address)
    const countryCounts: Record<string, number> = {};
    charges.forEach((charge: any) => {
      if (charge.billing_details?.address?.country) {
        const country = charge.billing_details.address.country;
        countryCounts[country] = (countryCounts[country] || 0) + (charge.amount / 100);
      }
    });

    const topCountries = Object.entries(countryCounts)
      .map(([country, revenue]) => ({
        country,
        revenue,
        percentage: totalRevenue > 0 ? revenue / totalRevenue : 0
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Dispute metrics
    const disputeMetrics = {
      total: disputes.length,
      won: disputes.filter((d: any) => d.status === 'won').length,
      lost: disputes.filter((d: any) => d.status === 'lost').length,
      pending: disputes.filter((d: any) => ['warning_needs_response', 'warning_under_review', 'warning_closed', 'needs_response', 'under_review'].includes(d.status)).length
    };

    const analytics = {
      revenue: {
        total: totalRevenue,
        fees: estimatedFees,
        net: netRevenue,
        currency: currency.toUpperCase()
      },
      transactions: {
        successful: successfulPayments.length,
        failed: failedPayments.length,
        disputed: disputes.length,
        refunded: refunds.length,
        successRate
      },
      paymentMethods,
      dailyRevenue: dailyData,
      topCountries,
      disputes: disputeMetrics,
      summary: {
        avgTransactionAmount: successfulPayments.length > 0 ? totalRevenue / successfulPayments.length : 0,
        totalVolume: payments.length,
        refundRate: payments.length > 0 ? refunds.length / payments.length : 0,
        disputeRate: payments.length > 0 ? disputes.length / payments.length : 0
      },
      timeRange,
      lastUpdated: new Date().toISOString()
    };

    console.log('Successfully fetched Stripe analytics data');

    return new Response(JSON.stringify(analytics), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analytics-stripe function:', error);
    
    // Return mock data on error
    const mockErrorData = {
      error: 'Failed to fetch Stripe data',
      mockData: {
        totalRevenue: Math.floor(Math.random() * 50000) + 25000,
        successfulTransactions: Math.floor(Math.random() * 200) + 100,
        processingFees: Math.floor(Math.random() * 2000) + 1000,
        successRate: 0.95 + Math.random() * 0.04,
        note: 'This is mock data. Configure Stripe credentials to get real payment analytics.'
      }
    };

    return new Response(JSON.stringify(mockErrorData), {
      status: 200, // Return 200 with mock data instead of error
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});