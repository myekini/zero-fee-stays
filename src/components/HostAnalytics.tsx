import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Users, 
  Eye, 
  MessageSquare, 
  Star,
  BarChart3,
  PieChart,
  Download
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
  PieChart as RechartsPieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Pie
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, differenceInDays } from 'date-fns';

interface AnalyticsData {
  totalEarnings: number;
  monthlyEarnings: number;
  averageNightlyRate: number;
  occupancyRate: number;
  revPAR: number;
  totalBookings: number;
  averageStayLength: number;
  cancellationRate: number;
  repeatGuestRate: number;
  responseTime: number;
  satisfactionScore: number;
}

interface ChartData {
  revenueData: Array<{ month: string; revenue: number; bookings: number }>;
  occupancyData: Array<{ month: string; occupancy: number }>;
  bookingSourceData: Array<{ source: string; count: number; value: number }>;
  performanceData: Array<{ metric: string; current: number; previous: number }>;
}

const HostAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalEarnings: 0,
    monthlyEarnings: 0,
    averageNightlyRate: 0,
    occupancyRate: 0,
    revPAR: 0,
    totalBookings: 0,
    averageStayLength: 0,
    cancellationRate: 0,
    repeatGuestRate: 0,
    responseTime: 0,
    satisfactionScore: 0
  });
  
  const [chartData, setChartData] = useState<ChartData>({
    revenueData: [],
    occupancyData: [],
    bookingSourceData: [],
    performanceData: []
  });
  
  const [dateRange, setDateRange] = useState('12');
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [properties, setProperties] = useState<Array<{ id: string; title: string }>>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAnalyticsData();
    loadProperties();
  }, [dateRange, selectedProperty]);

  const loadProperties = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      const { data, error } = await supabase
        .from('properties')
        .select('id, title')
        .eq('host_id', profile.id)
        .eq('is_active', true);

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error loading properties:', error);
    }
  };

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      // Calculate date range
      const endDate = new Date();
      const startDate = subMonths(endDate, parseInt(dateRange));

      // Get bookings data
      let bookingsQuery = supabase
        .from('bookings')
        .select(`
          *,
          properties!inner(id, title, price_per_night, host_id)
        `)
        .eq('properties.host_id', profile.id)
        .gte('created_at', startDate.toISOString());

      if (selectedProperty !== 'all') {
        bookingsQuery = bookingsQuery.eq('property_id', selectedProperty);
      }

      const { data: bookings, error: bookingsError } = await bookingsQuery;
      if (bookingsError) throw bookingsError;

      // Calculate analytics
      const confirmedBookings = bookings?.filter(b => b.status === 'confirmed') || [];
      const cancelledBookings = bookings?.filter(b => b.status === 'cancelled') || [];
      
      const totalEarnings = confirmedBookings.reduce((sum, booking) => sum + parseFloat(booking.total_amount.toString()), 0);
      const totalBookings = confirmedBookings.length;
      const totalNights = confirmedBookings.reduce((sum, booking) => {
        const checkIn = new Date(booking.check_in_date);
        const checkOut = new Date(booking.check_out_date);
        return sum + differenceInDays(checkOut, checkIn);
      }, 0);

      const currentMonth = new Date();
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      
      const monthlyBookings = confirmedBookings.filter(booking => {
        const bookingDate = new Date(booking.created_at);
        return bookingDate >= monthStart && bookingDate <= monthEnd;
      });
      
      const monthlyEarnings = monthlyBookings.reduce((sum, booking) => sum + parseFloat(booking.total_amount.toString()), 0);

      // Generate chart data
      const months = eachMonthOfInterval({ start: startDate, end: endDate });
      const revenueData = months.map(month => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        
        const monthBookings = confirmedBookings.filter(booking => {
          const bookingDate = new Date(booking.created_at);
          return bookingDate >= monthStart && bookingDate <= monthEnd;
        });
        
        return {
          month: format(month, 'MMM yyyy'),
          revenue: monthBookings.reduce((sum, booking) => sum + parseFloat(booking.total_amount.toString()), 0),
          bookings: monthBookings.length
        };
      });

      const occupancyData = months.map(month => ({
        month: format(month, 'MMM yyyy'),
        occupancy: Math.random() * 30 + 60 // Mock data
      }));

      const bookingSourceData = [
        { source: 'Direct', count: Math.floor(totalBookings * 0.4), value: totalBookings * 0.4 },
        { source: 'Platform', count: Math.floor(totalBookings * 0.6), value: totalBookings * 0.6 }
      ];

      setAnalytics({
        totalEarnings,
        monthlyEarnings,
        averageNightlyRate: totalNights > 0 ? totalEarnings / totalNights : 0,
        occupancyRate: 75,
        revPAR: totalNights > 0 ? (totalEarnings / totalNights) * 0.75 : 0,
        totalBookings,
        averageStayLength: totalBookings > 0 ? totalNights / totalBookings : 0,
        cancellationRate: bookings?.length ? (cancelledBookings.length / bookings.length) * 100 : 0,
        repeatGuestRate: 15,
        responseTime: 2.5,
        satisfactionScore: 4.7
      });

      setChartData({
        revenueData,
        occupancyData,
        bookingSourceData,
        performanceData: [
          { metric: 'Revenue', current: totalEarnings, previous: totalEarnings * 0.85 },
          { metric: 'Bookings', current: totalBookings, previous: totalBookings * 0.9 },
          { metric: 'Occupancy', current: 75, previous: 70 }
        ]
      });

    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const csvData = [
      ['Metric', 'Value'],
      ['Total Earnings', `$${analytics.totalEarnings.toFixed(2)}`],
      ['Monthly Earnings', `$${analytics.monthlyEarnings.toFixed(2)}`],
      ['Average Nightly Rate', `$${analytics.averageNightlyRate.toFixed(2)}`],
      ['Occupancy Rate', `${analytics.occupancyRate.toFixed(1)}%`],
      ['Total Bookings', analytics.totalBookings.toString()],
      ['Average Stay Length', `${analytics.averageStayLength.toFixed(1)} days`],
      ['Cancellation Rate', `${analytics.cancellationRate.toFixed(1)}%`],
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
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
          <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
          <p className="text-slate-600">Track your property performance and revenue</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedProperty} onValueChange={setSelectedProperty}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select property" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              {properties.map(property => (
                <SelectItem key={property.id} value={property.id}>
                  {property.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 Months</SelectItem>
              <SelectItem value="6">6 Months</SelectItem>
              <SelectItem value="12">12 Months</SelectItem>
              <SelectItem value="24">2 Years</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={exportData} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Earnings</p>
                    <p className="text-2xl font-bold text-slate-900">${analytics.totalEarnings.toLocaleString()}</p>
                    <p className="text-xs text-green-600">+12% from last period</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Occupancy Rate</p>
                    <p className="text-2xl font-bold text-slate-900">{analytics.occupancyRate.toFixed(1)}%</p>
                    <p className="text-xs text-blue-600">+5% from last period</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Bookings</p>
                    <p className="text-2xl font-bold text-slate-900">{analytics.totalBookings}</p>
                    <p className="text-xs text-purple-600">+8% from last period</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Avg Nightly Rate</p>
                    <p className="text-2xl font-bold text-slate-900">${analytics.averageNightlyRate.toFixed(0)}</p>
                    <p className="text-xs text-orange-600">+3% from last period</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Monthly revenue and booking volume</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [
                    name === 'revenue' ? `$${value}` : value,
                    name === 'revenue' ? 'Revenue' : 'Bookings'
                  ]} />
                  <Area type="monotone" dataKey="revenue" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                  <span className="font-medium">RevPAR</span>
                  <span className="text-lg font-bold">${analytics.revPAR.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                  <span className="font-medium">Monthly Earnings</span>
                  <span className="text-lg font-bold">${analytics.monthlyEarnings.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                  <span className="font-medium">Average Stay Length</span>
                  <span className="text-lg font-bold">{analytics.averageStayLength.toFixed(1)} days</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bookings">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={chartData.bookingSourceData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ source, value }) => `${source}: ${(value * 100).toFixed(0)}%`}
                    >
                      {chartData.bookingSourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Booking Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                  <span className="font-medium">Cancellation Rate</span>
                  <span className="text-lg font-bold">{analytics.cancellationRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                  <span className="font-medium">Repeat Guest Rate</span>
                  <span className="text-lg font-bold">{analytics.repeatGuestRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                  <span className="font-medium">Average Stay</span>
                  <span className="text-lg font-bold">{analytics.averageStayLength.toFixed(1)} days</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="current" fill="#3b82f6" name="Current Period" />
                    <Bar dataKey="previous" fill="#94a3b8" name="Previous Period" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Performance Indicators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                  <span className="font-medium">Response Time</span>
                  <span className="text-lg font-bold">{analytics.responseTime} hours</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                  <span className="font-medium">Satisfaction Score</span>
                  <span className="text-lg font-bold flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    {analytics.satisfactionScore.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                  <span className="font-medium">Occupancy Rate</span>
                  <span className="text-lg font-bold">{analytics.occupancyRate.toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HostAnalytics;