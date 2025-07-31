import React, { useEffect, useState } from 'react';
import { 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  Star, 
  Bell, 
  Eye,
  MessageSquare,
  CheckCircle,
  Clock,
  PlusCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import HostLayout from '@/components/HostLayout';

interface DashboardStats {
  totalEarnings: number;
  activeBookings: number;
  occupancyRate: number;
  averageRating: number;
  totalProperties: number;
  pendingBookings: number;
}

interface RecentActivity {
  id: string;
  type: 'booking' | 'message' | 'review';
  title: string;
  description: string;
  time: string;
  status?: string;
}

const HostDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalEarnings: 0,
    activeBookings: 0,
    occupancyRate: 0,
    averageRating: 0,
    totalProperties: 0,
    pendingBookings: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      // Mock data for demo - in real app, fetch from Supabase
      setStats({
        totalEarnings: 4250.00,
        activeBookings: 12,
        occupancyRate: 78,
        averageRating: 4.8,
        totalProperties: 3,
        pendingBookings: 5
      });

      setRecentActivity([
        {
          id: '1',
          type: 'booking',
          title: 'New Booking Request',
          description: 'Sarah Johnson wants to book Ocean View Apartment for 3 nights',
          time: '2 hours ago',
          status: 'pending'
        },
        {
          id: '2',
          type: 'message',
          title: 'Guest Message',
          description: 'Question about check-in time for Downtown Loft',
          time: '4 hours ago'
        },
        {
          id: '3',
          type: 'review',
          title: 'New Review',
          description: '5-star review for Mountain Cabin - "Amazing stay!"',
          time: '1 day ago'
        },
        {
          id: '4',
          type: 'booking',
          title: 'Booking Confirmed',
          description: 'Payment received for Beach House reservation',
          time: '2 days ago',
          status: 'confirmed'
        }
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Calendar className="w-4 h-4" />;
      case 'message':
        return <MessageSquare className="w-4 h-4" />;
      case 'review':
        return <Star className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  if (loading) {
    return (
      <HostLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading dashboard...</p>
          </div>
        </div>
      </HostLayout>
    );
  }

  return (
    <HostLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome back!</h1>
            <p className="text-slate-600">Here's what's happening with your properties today.</p>
          </div>
          <Link to="/host/properties/new">
            <Button className="btn-primary mt-4 sm:mt-0">
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Property
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-slate-900">${stats.totalEarnings.toLocaleString()}</p>
                  <p className="text-xs text-green-600 mt-1">+12% from last month</p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Active Bookings</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.activeBookings}</p>
                  <p className="text-xs text-blue-600 mt-1">{stats.pendingBookings} pending approval</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Occupancy Rate</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.occupancyRate}%</p>
                  <p className="text-xs text-purple-600 mt-1">+5% from last month</p>
                </div>
                <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Average Rating</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.averageRating}</p>
                  <p className="text-xs text-orange-600 mt-1">From {stats.totalProperties} properties</p>
                </div>
                <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Star className="h-4 w-4 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Common tasks to manage your properties</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/host/bookings" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Pending Bookings ({stats.pendingBookings})
                </Button>
              </Link>
              
              <Link to="/host/messages" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Respond to Messages
                </Button>
              </Link>
              
              <Link to="/host/properties" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Eye className="w-4 h-4 mr-2" />
                  Update Property Availability
                </Button>
              </Link>
              
              <Link to="/host/analytics" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Performance Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <CardDescription>Latest updates from your properties</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
                    <div className="flex-shrink-0 h-8 w-8 bg-slate-100 rounded-lg flex items-center justify-center">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                        {activity.status && (
                          <Badge className={`text-xs ${getStatusColor(activity.status)}`}>
                            {activity.status}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">{activity.description}</p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        {activity.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-200">
                <Link to="/host/activity">
                  <Button variant="ghost" className="w-full text-center">
                    View All Activity
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </HostLayout>
  );
};

export default HostDashboard;