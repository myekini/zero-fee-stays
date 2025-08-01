import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart
} from 'recharts';
import {
  DollarSign,
  Users,
  Home,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Globe,
  Zap,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PlatformMetrics {
  overview: {
    totalRevenue: number;
    platformFees: number;
    totalBookings: number;
    activeHosts: number;
    activeProperties: number;
    growthRate: number;
  };
  financial: {
    platformFeeCollection: number;
    stripeFees: number;
    netRevenue: number;
    hostPayoutVolume: number;
    revenueProjection: number;
    monthlyTrend: Array<{ month: string; revenue: number; fees: number; payouts: number }>;
  };
  hosts: {
    topPerformers: Array<{ name: string; revenue: number; bookings: number; rating: number }>;
    newSignups: number;
    retentionRate: number;
    avgRevenuePerHost: number;
    churnRate: number;
    hostGrowth: Array<{ month: string; new: number; churned: number; active: number }>;
  };
  bookings: {
    volumeTrend: Array<{ date: string; bookings: number; value: number }>;
    avgBookingValue: number;
    conversionFunnel: Array<{ stage: string; users: number; conversion: number }>;
    geoDistribution: Array<{ country: string; bookings: number; revenue: number }>;
    seasonalPatterns: Array<{ month: string; bookings: number; avgValue: number }>;
  };
  technical: {
    uptime: number;
    paymentSuccessRate: number;
    errorRates: Array<{ feature: string; errorRate: number; errors: number }>;
    performance: {
      avgLoadTime: number;
      p95LoadTime: number;
    };
    userSatisfaction: number;
  };
}

const PlatformAnalytics = () => {
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30days');
  const [realTimeData, setRealTimeData] = useState({
    activeUsers: 0,
    newBookings: 0,
    revenueToday: 0,
    errorCount: 0
  });

  useEffect(() => {
    fetchPlatformMetrics();
    setupRealTimeSubscriptions();
  }, [timeRange]);

  const fetchPlatformMetrics = async () => {
    try {
      setLoading(true);

      // Fetch database metrics
      const [bookingsData, hostsData, propertiesData] = await Promise.all([
        supabase.from('bookings').select(`
          *,
          properties (
            host_id,
            title,
            location
          ),
          profiles!bookings_host_id_fkey (
            first_name,
            last_name
          )
        `),
        supabase.from('profiles').select('*').eq('is_host', true),
        supabase.from('properties').select('*').eq('is_active', true)
      ]);

      // Mock external API data (replace with real API calls)
      const mockExternalData = {
        mixpanel: {
          conversionRates: { search: 0.15, booking: 0.12, payment: 0.89 },
          userSatisfaction: 4.6,
          activeUsers: Math.floor(Math.random() * 1000) + 500
        },
        stripe: {
          processingFees: 15240.50,
          successRate: 0.984
        },
        sentry: {
          errorRates: [
            { feature: 'Booking Flow', errorRate: 0.02, errors: 23 },
            { feature: 'Payment Processing', errorRate: 0.01, errors: 8 },
            { feature: 'Search', errorRate: 0.003, errors: 5 },
            { feature: 'Authentication', errorRate: 0.005, errors: 12 }
          ],
          uptime: 99.97
        }
      };

      const processedMetrics = processPlatformData(
        bookingsData.data || [],
        hostsData.data || [],
        propertiesData.data || [],
        mockExternalData
      );

      setMetrics(processedMetrics);
    } catch (error) {
      console.error('Error fetching platform metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeSubscriptions = () => {
    // Real-time booking updates
    const bookingChannel = supabase
      .channel('platform-bookings')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'bookings'
      }, (payload) => {
        setRealTimeData(prev => ({
          ...prev,
          newBookings: prev.newBookings + 1,
          revenueToday: prev.revenueToday + Number(payload.new.total_amount)
        }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(bookingChannel);
    };
  };

  const processPlatformData = (bookings: any[], hosts: any[], properties: any[], external: any): PlatformMetrics => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Calculate platform fees (2.5%)
    const totalBookingValue = bookings.reduce((sum, booking) => sum + Number(booking.total_amount), 0);
    const platformFees = totalBookingValue * 0.025;

    // Generate monthly trends
    const monthlyTrend = Array.from({ length: 12 }, (_, i) => {
      const month = new Date(currentYear, currentMonth - i, 1);
      const monthBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.created_at);
        return bookingDate.getMonth() === month.getMonth() && 
               bookingDate.getFullYear() === month.getFullYear();
      });
      const monthRevenue = monthBookings.reduce((sum, b) => sum + Number(b.total_amount), 0);
      return {
        month: month.toLocaleString('default', { month: 'short' }),
        revenue: monthRevenue,
        fees: monthRevenue * 0.025,
        payouts: monthRevenue * 0.975
      };
    }).reverse();

    // Top performing hosts
    const hostPerformance = hosts.map(host => {
      const hostBookings = bookings.filter(b => b.host_id === host.id);
      const hostRevenue = hostBookings.reduce((sum, b) => sum + Number(b.total_amount), 0);
      return {
        name: `${host.first_name || ''} ${host.last_name || ''}`.trim() || 'Unknown',
        revenue: hostRevenue,
        bookings: hostBookings.length,
        rating: 4.5 + Math.random() * 0.5 // Mock rating
      };
    }).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

    // Geographic distribution
    const geoDistribution = properties.reduce((acc, property) => {
      const country = property.country || 'Unknown';
      const propertyBookings = bookings.filter(b => b.property_id === property.id);
      const revenue = propertyBookings.reduce((sum, b) => sum + Number(b.total_amount), 0);
      
      if (!acc[country]) {
        acc[country] = { country, bookings: 0, revenue: 0 };
      }
      acc[country].bookings += propertyBookings.length;
      acc[country].revenue += revenue;
      return acc;
    }, {} as Record<string, any>);

    return {
      overview: {
        totalRevenue: totalBookingValue,
        platformFees,
        totalBookings: bookings.length,
        activeHosts: hosts.length,
        activeProperties: properties.length,
        growthRate: 0.15 // Mock growth rate
      },
      financial: {
        platformFeeCollection: platformFees,
        stripeFees: external.stripe.processingFees,
        netRevenue: platformFees - external.stripe.processingFees,
        hostPayoutVolume: totalBookingValue * 0.975,
        revenueProjection: platformFees * 1.2,
        monthlyTrend
      },
      hosts: {
        topPerformers: hostPerformance,
        newSignups: Math.floor(hosts.length * 0.1),
        retentionRate: 0.87,
        avgRevenuePerHost: hosts.length > 0 ? totalBookingValue / hosts.length : 0,
        churnRate: 0.13,
        hostGrowth: monthlyTrend.map(m => ({
          month: m.month,
          new: Math.floor(Math.random() * 20) + 5,
          churned: Math.floor(Math.random() * 5) + 1,
          active: hosts.length + Math.floor(Math.random() * 10)
        }))
      },
      bookings: {
        volumeTrend: monthlyTrend.map(m => ({
          date: m.month,
          bookings: Math.floor(m.revenue / 200), // Estimate bookings from revenue
          value: m.revenue
        })),
        avgBookingValue: bookings.length > 0 ? totalBookingValue / bookings.length : 0,
        conversionFunnel: [
          { stage: 'Property Views', users: 50000, conversion: 1.0 },
          { stage: 'Search Results', users: 7500, conversion: 0.15 },
          { stage: 'Property Details', users: 3000, conversion: 0.4 },
          { stage: 'Booking Started', users: 900, conversion: 0.3 },
          { stage: 'Payment Completed', users: 801, conversion: 0.89 }
        ],
        geoDistribution: Object.values(geoDistribution),
        seasonalPatterns: monthlyTrend.map(m => ({
          month: m.month,
          bookings: Math.floor(m.revenue / 200),
          avgValue: m.revenue > 0 ? m.revenue / Math.max(1, Math.floor(m.revenue / 200)) : 0
        }))
      },
      technical: {
        uptime: external.sentry.uptime,
        paymentSuccessRate: external.stripe.successRate,
        errorRates: external.sentry.errorRates,
        performance: {
          avgLoadTime: 1.2,
          p95LoadTime: 2.8
        },
        userSatisfaction: external.mixpanel.userSatisfaction
      }
    };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No platform data available</p>
        </CardContent>
      </Card>
    );
  }

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Platform Analytics</h1>
          <p className="text-muted-foreground">Comprehensive platform oversight and performance metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 Days</SelectItem>
              <SelectItem value="30days">30 Days</SelectItem>
              <SelectItem value="90days">90 Days</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchPlatformMetrics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.overview.platformFees.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{(metrics.overview.growthRate * 100).toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.overview.totalBookings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {realTimeData.newBookings} new today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Hosts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.overview.activeHosts}</div>
            <p className="text-xs text-muted-foreground">
              {(metrics.hosts.retentionRate * 100).toFixed(1)}% retention rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Uptime</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.technical.uptime.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              {(metrics.technical.paymentSuccessRate * 100).toFixed(1)}% payment success
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realTimeData.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Live count
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="financial" className="space-y-4">
        <TabsList>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="hosts">Hosts</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
        </TabsList>

        <TabsContent value="financial">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Platform fees, payouts, and net revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={metrics.financial.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" fill="hsl(var(--primary))" fillOpacity={0.3} stroke="hsl(var(--primary))" name="Total Revenue" />
                    <Bar dataKey="fees" fill="hsl(var(--secondary))" name="Platform Fees" />
                    <Line type="monotone" dataKey="payouts" stroke="hsl(var(--accent))" strokeWidth={2} name="Host Payouts" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
                <CardDescription>Current period breakdown</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Platform Fees Collected</span>
                  <Badge variant="default">${metrics.financial.platformFeeCollection.toLocaleString()}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Stripe Processing Fees</span>
                  <Badge variant="secondary">${metrics.financial.stripeFees.toLocaleString()}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Net Platform Revenue</span>
                  <Badge variant="default">${metrics.financial.netRevenue.toLocaleString()}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Host Payout Volume</span>
                  <Badge variant="outline">${metrics.financial.hostPayoutVolume.toLocaleString()}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="hosts">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Hosts</CardTitle>
                <CardDescription>Revenue leaders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.hosts.topPerformers.slice(0, 8).map((host, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{host.name}</p>
                          <p className="text-xs text-muted-foreground">{host.bookings} bookings</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">${host.revenue.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">★ {host.rating.toFixed(1)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Host Growth</CardTitle>
                <CardDescription>New signups vs churn</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics.hosts.hostGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="new" fill="hsl(var(--primary))" name="New Hosts" />
                    <Bar dataKey="churned" fill="hsl(var(--destructive))" name="Churned" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bookings">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Booking Volume Trends</CardTitle>
                <CardDescription>Bookings and value over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={metrics.bookings.volumeTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="bookings" />
                    <YAxis yAxisId="value" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="bookings" dataKey="bookings" fill="hsl(var(--primary))" name="Bookings" />
                    <Line yAxisId="value" type="monotone" dataKey="value" stroke="hsl(var(--secondary))" strokeWidth={2} name="Total Value" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>User journey analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.bookings.conversionFunnel.map((stage, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{stage.stage}</span>
                        <span className="text-sm font-medium">{stage.users.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${stage.conversion * 100}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground text-right">
                        {(stage.conversion * 100).toFixed(1)}% conversion
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="technical">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Error Rates by Feature</CardTitle>
                <CardDescription>System reliability metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics.technical.errorRates}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="feature" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${(Number(value) * 100).toFixed(3)}%`, 'Error Rate']} />
                    <Bar dataKey="errorRate" fill="hsl(var(--destructive))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>System health indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Platform Uptime</span>
                  <Badge variant="default">{metrics.technical.uptime.toFixed(2)}%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Payment Success Rate</span>
                  <Badge variant="default">{(metrics.technical.paymentSuccessRate * 100).toFixed(1)}%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Avg Load Time</span>
                  <Badge variant="secondary">{metrics.technical.performance.avgLoadTime}s</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">P95 Load Time</span>
                  <Badge variant="secondary">{metrics.technical.performance.p95LoadTime}s</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">User Satisfaction</span>
                  <Badge variant="default">★ {metrics.technical.userSatisfaction}/5</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlatformAnalytics;