import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  LineChart,
  Line,
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
  Legend
} from 'recharts';
import {
  DollarSign,
  Calendar,
  Home,
  Users,
  TrendingUp,
  TrendingDown,
  Eye,
  Star,
  Repeat,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AnalyticsData {
  earnings: {
    totalMonth: number;
    totalAllTime: number;
    averagePerBooking: number;
    projectedMonthly: number;
    trend: Array<{ month: string; amount: number }>;
  };
  bookings: {
    totalMonth: number;
    occupancyRate: number;
    averageDuration: number;
    conversionRate: number;
    upcoming: number;
    trend: Array<{ date: string; bookings: number }>;
  };
  properties: {
    mostPopular: string;
    revenueByProperty: Array<{ name: string; revenue: number; bookings: number }>;
    viewsByProperty: Array<{ name: string; views: number; bookings: number }>;
  };
  guests: {
    averageRating: number;
    repeatGuestRate: number;
    commonDuration: number;
    popularDays: Array<{ day: string; bookings: number }>;
  };
}

const HostAnalytics = () => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6months');

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, timeRange]);

  const fetchAnalytics = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get host profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // Fetch bookings data
      const { data: bookings } = await supabase
        .from('bookings')
        .select(`
          *,
          properties (
            id,
            title,
            price_per_night
          )
        `)
        .eq('host_id', profile.id);

      // Fetch properties data
      const { data: properties } = await supabase
        .from('properties')
        .select('*')
        .eq('host_id', profile.id);

      // Process data into analytics format
      const processedData = processAnalyticsData(bookings || [], properties || []);
      setAnalyticsData(processedData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (bookings: any[], properties: any[]): AnalyticsData => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter current month bookings
    const currentMonthBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.created_at);
      return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
    });

    // Calculate earnings
    const totalMonthEarnings = currentMonthBookings.reduce((sum, booking) => sum + Number(booking.total_amount), 0);
    const totalAllTimeEarnings = bookings.reduce((sum, booking) => sum + Number(booking.total_amount), 0);
    const averagePerBooking = bookings.length > 0 ? totalAllTimeEarnings / bookings.length : 0;

    // Generate earnings trend (last 6 months)
    const earningsTrend = Array.from({ length: 6 }, (_, i) => {
      const month = new Date(currentYear, currentMonth - i, 1);
      const monthBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.created_at);
        return bookingDate.getMonth() === month.getMonth() && bookingDate.getFullYear() === month.getFullYear();
      });
      return {
        month: month.toLocaleString('default', { month: 'short' }),
        amount: monthBookings.reduce((sum, booking) => sum + Number(booking.total_amount), 0)
      };
    }).reverse();

    // Calculate property performance
    const propertyRevenue = properties.map(property => {
      const propertyBookings = bookings.filter(b => b.property_id === property.id);
      const revenue = propertyBookings.reduce((sum, booking) => sum + Number(booking.total_amount), 0);
      return {
        name: property.title,
        revenue,
        bookings: propertyBookings.length,
        views: Math.floor(Math.random() * 1000) + 100 // Mock data - replace with real analytics
      };
    });

    const mostPopularProperty = propertyRevenue.reduce((max, property) => 
      property.bookings > max.bookings ? property : max, propertyRevenue[0] || { name: 'No properties', bookings: 0, revenue: 0, views: 0 });

    // Calculate guest insights
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
    const averageDuration = confirmedBookings.length > 0 
      ? confirmedBookings.reduce((sum, booking) => {
          const checkIn = new Date(booking.check_in_date);
          const checkOut = new Date(booking.check_out_date);
          return sum + (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24);
        }, 0) / confirmedBookings.length
      : 0;

    // Popular check-in days
    const dayCount = confirmedBookings.reduce((acc, booking) => {
      const day = new Date(booking.check_in_date).toLocaleDateString('en-US', { weekday: 'short' });
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const popularDays = Object.entries(dayCount).map(([day, bookings]) => ({ day, bookings: Number(bookings) }));

    return {
      earnings: {
        totalMonth: totalMonthEarnings,
        totalAllTime: totalAllTimeEarnings,
        averagePerBooking,
        projectedMonthly: totalMonthEarnings * (30 / now.getDate()),
        trend: earningsTrend
      },
      bookings: {
        totalMonth: currentMonthBookings.length,
        occupancyRate: 0.75, // Mock data - calculate from availability
        averageDuration,
        conversionRate: 0.12, // Mock data - from analytics
        upcoming: bookings.filter(b => new Date(b.check_in_date) > now).length,
        trend: [] // Mock data
      },
      properties: {
        mostPopular: mostPopularProperty.name,
        revenueByProperty: propertyRevenue,
        viewsByProperty: propertyRevenue.map(p => ({ name: p.name, views: p.views, bookings: p.bookings }))
      },
      guests: {
        averageRating: 4.7, // Mock data
        repeatGuestRate: 0.23, // Mock data
        commonDuration: Math.round(averageDuration),
        popularDays
      }
    };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
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

  if (!analyticsData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No analytics data available</p>
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
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your property performance and earnings</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1month">1 Month</SelectItem>
            <SelectItem value="3months">3 Months</SelectItem>
            <SelectItem value="6months">6 Months</SelectItem>
            <SelectItem value="1year">1 Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analyticsData.earnings.totalMonth.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Projected: ${analyticsData.earnings.projectedMonthly.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(analyticsData.bookings.occupancyRate * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.bookings.totalMonth} bookings this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Per Booking</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analyticsData.earnings.averagePerBooking.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.bookings.averageDuration.toFixed(1)} avg nights
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Bookings</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.bookings.upcoming}</div>
            <p className="text-xs text-muted-foreground">
              {(analyticsData.guests.repeatGuestRate * 100).toFixed(1)}% repeat guests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="earnings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="guests">Guests</TabsTrigger>
        </TabsList>

        <TabsContent value="earnings">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Earnings Trend</CardTitle>
                <CardDescription>Monthly earnings over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.earnings.trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Earnings']} />
                    <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Property</CardTitle>
                <CardDescription>Performance breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.properties.revenueByProperty}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" />
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
                <CardTitle>Booking Performance</CardTitle>
                <CardDescription>Key booking metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Conversion Rate</span>
                  <Badge variant="secondary">{(analyticsData.bookings.conversionRate * 100).toFixed(1)}%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Average Duration</span>
                  <Badge variant="secondary">{analyticsData.bookings.averageDuration.toFixed(1)} nights</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Occupancy Rate</span>
                  <Badge variant="secondary">{(analyticsData.bookings.occupancyRate * 100).toFixed(1)}%</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Popular Check-in Days</CardTitle>
                <CardDescription>Guest preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.guests.popularDays}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="hsl(var(--secondary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="properties">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Property Performance</CardTitle>
                <CardDescription>Bookings vs Views</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.properties.viewsByProperty}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="views" fill="hsl(var(--muted))" name="Views" />
                    <Bar dataKey="bookings" fill="hsl(var(--primary))" name="Bookings" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performer</CardTitle>
                <CardDescription>Most popular property</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Home className="h-12 w-12 mx-auto text-primary mb-2" />
                  <h3 className="text-lg font-semibold">{analyticsData.properties.mostPopular}</h3>
                  <p className="text-sm text-muted-foreground">Highest booking rate</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="guests">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Guest Insights</CardTitle>
                <CardDescription>Customer behavior patterns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Average Rating
                  </span>
                  <Badge variant="secondary">{analyticsData.guests.averageRating}/5</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <Repeat className="h-4 w-4" />
                    Repeat Guests
                  </span>
                  <Badge variant="secondary">{(analyticsData.guests.repeatGuestRate * 100).toFixed(1)}%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Common Stay
                  </span>
                  <Badge variant="secondary">{analyticsData.guests.commonDuration} nights</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Sources</CardTitle>
                <CardDescription>Analytics integration status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database Analytics</span>
                  <Badge variant="default">Connected</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Mixpanel Integration</span>
                  <Badge variant="secondary">Setup Required</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Google Analytics</span>
                  <Badge variant="secondary">Setup Required</Badge>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  Configure External Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HostAnalytics;