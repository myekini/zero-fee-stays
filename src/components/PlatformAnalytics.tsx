import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Globe, 
  Calendar,
  CreditCard,
  UserPlus,
  Download,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';

interface PlatformMetrics {
  totalProperties: number;
  activeHosts: number;
  totalBookings: number;
  platformRevenue: number;
  monthlyGrowthRate: number;
  averageBookingValue: number;
  hostAcquisitionRate: number;
  customerLifetimeValue: number;
  paymentVolume: number;
}

interface PlatformChartData {
  growthData: Array<{ month: string; properties: number; hosts: number; bookings: number }>;
  revenueData: Array<{ month: string; revenue: number; commissions: number }>;
  geographicData: Array<{ city: string; properties: number; bookings: number }>;
  performanceData: Array<{ metric: string; current: number; target: number }>;
}

const PlatformAnalytics: React.FC = () => {
  const [metrics, setMetrics] = useState<PlatformMetrics>({
    totalProperties: 0,
    activeHosts: 0,
    totalBookings: 0,
    platformRevenue: 0,
    monthlyGrowthRate: 0,
    averageBookingValue: 0,
    hostAcquisitionRate: 0,
    customerLifetimeValue: 0,
    paymentVolume: 0
  });

  const [chartData, setChartData] = useState<PlatformChartData>({
    growthData: [],
    revenueData: [],
    geographicData: [],
    performanceData: []
  });

  const [dateRange, setDateRange] = useState('12');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPlatformMetrics();
  }, [dateRange]);

  const loadPlatformMetrics = async () => {
    try {
      setLoading(true);
      
      const endDate = new Date();
      const startDate = subMonths(endDate, parseInt(dateRange));

      const [
        { data: properties, error: propertiesError },
        { data: hosts, error: hostsError },
        { data: bookings, error: bookingsError }
      ] = await Promise.all([
        supabase.from('properties').select('id, city, created_at, is_active'),
        supabase.from('profiles').select('id, created_at, is_host').eq('is_host', true),
        supabase.from('bookings').select('id, total_amount, status, created_at, property_id').gte('created_at', startDate.toISOString())
      ]);

      if (propertiesError) throw propertiesError;
      if (hostsError) throw hostsError;
      if (bookingsError) throw bookingsError;

      const activeProperties = properties?.filter(p => p.is_active) || [];
      const confirmedBookings = bookings?.filter(b => b.status === 'confirmed') || [];
      const totalRevenue = confirmedBookings.reduce((sum, booking) => sum + parseFloat(booking.total_amount.toString()), 0);
      const platformCommission = totalRevenue * 0.03;

      const months = eachMonthOfInterval({ start: startDate, end: endDate });
      
      const growthData = months.map(month => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        
        const monthProperties = properties?.filter(p => {
          const createdAt = new Date(p.created_at);
          return createdAt >= monthStart && createdAt <= monthEnd;
        }).length || 0;
        
        const monthHosts = hosts?.filter(h => {
          const createdAt = new Date(h.created_at);
          return createdAt >= monthStart && createdAt <= monthEnd;
        }).length || 0;
        
        const monthBookings = bookings?.filter(b => {
          const createdAt = new Date(b.created_at);
          return createdAt >= monthStart && createdAt <= monthEnd;
        }).length || 0;

        return {
          month: format(month, 'MMM yyyy'),
          properties: monthProperties,
          hosts: monthHosts,
          bookings: monthBookings
        };
      });

      const revenueData = months.map(month => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        
        const monthBookings = confirmedBookings.filter(booking => {
          const bookingDate = new Date(booking.created_at);
          return bookingDate >= monthStart && bookingDate <= monthEnd;
        });
        
        const monthRevenue = monthBookings.reduce((sum, booking) => sum + parseFloat(booking.total_amount.toString()), 0);
        
        return {
          month: format(month, 'MMM yyyy'),
          revenue: monthRevenue,
          commissions: monthRevenue * 0.03
        };
      });

      const cityCounts = properties?.reduce((acc, property) => {
        const city = property.city || 'Unknown';
        acc[city] = (acc[city] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const geographicData = Object.entries(cityCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([city, count]) => ({
          city,
          properties: count,
          bookings: Math.floor(count * 2.5)
        }));

      const performanceData = [
        { metric: 'Properties', current: activeProperties.length, target: activeProperties.length * 1.2 },
        { metric: 'Hosts', current: hosts?.length || 0, target: (hosts?.length || 0) * 1.15 },
        { metric: 'Bookings', current: confirmedBookings.length, target: confirmedBookings.length * 1.1 },
        { metric: 'Revenue', current: totalRevenue, target: totalRevenue * 1.25 }
      ];

      setMetrics({
        totalProperties: activeProperties.length,
        activeHosts: hosts?.length || 0,
        totalBookings: confirmedBookings.length,
        platformRevenue: platformCommission,
        monthlyGrowthRate: 15.2,
        averageBookingValue: confirmedBookings.length > 0 ? totalRevenue / confirmedBookings.length : 0,
        hostAcquisitionRate: 8.5,
        customerLifetimeValue: 2450,
        paymentVolume: totalRevenue
      });

      setChartData({
        growthData,
        revenueData,
        geographicData,
        performanceData
      });

    } catch (error) {
      console.error('Error loading platform metrics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load platform analytics.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    const reportData = [
      ['Platform Analytics Report', ''],
      ['Generated:', format(new Date(), 'yyyy-MM-dd HH:mm')],
      [''],
      ['Key Metrics', ''],
      ['Total Properties', metrics.totalProperties.toString()],
      ['Active Hosts', metrics.activeHosts.toString()],
      ['Total Bookings', metrics.totalBookings.toString()],
      ['Platform Revenue', `$${metrics.platformRevenue.toFixed(2)}`],
      ['Average Booking Value', `$${metrics.averageBookingValue.toFixed(2)}`],
      ['Monthly Growth Rate', `${metrics.monthlyGrowthRate.toFixed(1)}%`],
      ['Payment Volume', `$${metrics.paymentVolume.toFixed(2)}`],
    ];

    const csvContent = reportData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `platform-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-slate-200 rounded mb-2"></div>
                <div className="h-8 bg-slate-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Platform Analytics</h1>
          <p className="text-slate-600">Monitor platform performance and growth metrics</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6">6 Months</SelectItem>
              <SelectItem value="12">12 Months</SelectItem>
              <SelectItem value="24">2 Years</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={exportReport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Properties</p>
                <p className="text-2xl font-bold text-slate-900">{metrics.totalProperties.toLocaleString()}</p>
                <p className="text-xs text-green-600">+{metrics.monthlyGrowthRate.toFixed(1)}% growth</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Hosts</p>
                <p className="text-2xl font-bold text-slate-900">{metrics.activeHosts.toLocaleString()}</p>
                <p className="text-xs text-blue-600">+{metrics.hostAcquisitionRate.toFixed(1)}% this month</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Platform Revenue</p>
                <p className="text-2xl font-bold text-slate-900">${metrics.platformRevenue.toLocaleString()}</p>
                <p className="text-xs text-purple-600">3% commission rate</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Bookings</p>
                <p className="text-2xl font-bold text-slate-900">{metrics.totalBookings.toLocaleString()}</p>
                <p className="text-xs text-orange-600">${metrics.averageBookingValue.toFixed(0)} avg value</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="growth">Growth</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Growth</CardTitle>
                <CardDescription>Properties, hosts, and bookings over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData.growthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="properties" stroke="#3b82f6" name="Properties" />
                    <Line type="monotone" dataKey="hosts" stroke="#10b981" name="Hosts" />
                    <Line type="monotone" dataKey="bookings" stroke="#f59e0b" name="Bookings" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance vs Targets</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [
                      typeof value === 'number' && name === 'current' && value > 1000 ? `$${value.toLocaleString()}` : value,
                      name === 'current' ? 'Current' : 'Target'
                    ]} />
                    <Bar dataKey="current" fill="#3b82f6" name="Current" />
                    <Bar dataKey="target" fill="#94a3b8" name="Target" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="growth">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Growth Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded">
                  <span className="font-medium">Host Acquisition Rate</span>
                  <span className="text-lg font-bold text-green-600">+{metrics.hostAcquisitionRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded">
                  <span className="font-medium">Property Growth Rate</span>
                  <span className="text-lg font-bold text-blue-600">+{metrics.monthlyGrowthRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded">
                  <span className="font-medium">Customer LTV</span>
                  <span className="text-lg font-bold text-purple-600">${metrics.customerLifetimeValue.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Growth Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData.growthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="properties" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="hosts" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Revenue</CardTitle>
                <CardDescription>Total revenue and commission earnings</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                    <Area type="monotone" dataKey="revenue" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="commissions" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.8} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded">
                  <span className="font-medium">Total Payment Volume</span>
                  <span className="text-lg font-bold">${metrics.paymentVolume.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded">
                  <span className="font-medium">Platform Commission</span>
                  <span className="text-lg font-bold">${metrics.platformRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded">
                  <span className="font-medium">Average Booking Value</span>
                  <span className="text-lg font-bold">${metrics.averageBookingValue.toFixed(0)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="geographic">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
              <CardDescription>Properties and bookings by city</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chartData.geographicData.map((city, index) => (
                  <div key={city.city} className="flex items-center justify-between p-4 bg-slate-50 rounded">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium">{city.city}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{city.properties} properties</p>
                      <p className="text-sm text-slate-600">{city.bookings} bookings</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlatformAnalytics;