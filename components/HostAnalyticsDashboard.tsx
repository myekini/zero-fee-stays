"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Users,
  Star,
  Home,
  Eye,
  Activity,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useHostAnalytics } from "@/hooks/useHostAnalytics";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface HostAnalyticsDashboardProps {
  hostId: string;
}

const COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export function HostAnalyticsDashboard({ hostId }: HostAnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState("30days");
  const { data: analytics, isLoading, error } = useHostAnalytics(hostId, timeRange);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Activity className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Failed to Load Analytics
          </h3>
          <p className="text-muted-foreground">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No Analytics Data
          </h3>
          <p className="text-muted-foreground">
            Start getting bookings to see your analytics dashboard
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-8">
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-light text-slate-900 tracking-tight">
            Analytics Overview
          </h2>
          <p className="text-slate-600 font-light mt-2">
            Performance insights and trends for your properties
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="90days">Last 90 Days</SelectItem>
            <SelectItem value="12months">Last 12 Months</SelectItem>
            <SelectItem value="ytd">Year to Date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <Badge variant="outline" className="text-green-600 border-green-200">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +8%
                </Badge>
              </div>
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wide mb-1">
                Total Earnings
              </p>
              <p className="text-3xl font-light text-slate-900 tracking-tight">
                {formatCurrency(analytics.summary.totalEarnings)}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Avg: {formatCurrency(analytics.summary.avgBookingValue)} per booking
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-emerald-600" />
                </div>
                <Badge variant="outline" className="text-green-600 border-green-200">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12%
                </Badge>
              </div>
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wide mb-1">
                Total Bookings
              </p>
              <p className="text-3xl font-light text-slate-900 tracking-tight">
                {analytics.summary.totalBookings}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                {analytics.summary.confirmedBookings} confirmed
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
                <Badge variant="outline" className="text-green-600 border-green-200">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +5%
                </Badge>
              </div>
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wide mb-1">
                Occupancy Rate
              </p>
              <p className="text-3xl font-light text-slate-900 tracking-tight">
                {formatPercent(analytics.summary.occupancyRate)}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Across {analytics.summary.activeProperties} properties
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-amber-600" />
                </div>
                <Badge variant="outline" className="text-green-600 border-green-200">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +15%
                </Badge>
              </div>
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wide mb-1">
                Total Guests
              </p>
              <p className="text-3xl font-light text-slate-900 tracking-tight">
                {analytics.guests.totalGuests}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                {analytics.guests.repeatGuests} repeat guests
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Revenue Trend Chart */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-light text-slate-900 tracking-tight">
            Revenue Trend
          </CardTitle>
          <CardDescription className="text-slate-600 font-light">
            Monthly earnings and booking volume over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.trends.monthlyEarnings}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="month"
                stroke="#64748b"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                yAxisId="left"
                stroke="#0ea5e9"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `$${value}`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#10b981"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
                formatter={(value: any, name: string) => {
                  if (name === 'earnings') return [formatCurrency(value), 'Revenue'];
                  return [value, 'Bookings'];
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="earnings"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={{ fill: '#0ea5e9', r: 4 }}
                activeDot={{ r: 6 }}
                name="Revenue"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="bookings"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
                name="Bookings"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Projected Monthly Revenue</p>
                <p className="text-2xl font-semibold text-slate-900">
                  {formatCurrency(analytics.trends.projectedMonthlyEarnings)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600 mb-1">vs Last Period</p>
                <div className="flex items-center gap-1 text-green-600">
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="font-semibold">+8%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Properties */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-light text-slate-900 tracking-tight">
              Property Performance
            </CardTitle>
            <CardDescription className="text-slate-600 font-light">
              Revenue and bookings by property
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.properties.performance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="title"
                  stroke="#64748b"
                  style={{ fontSize: '11px' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                  formatter={(value: any) => formatCurrency(value)}
                />
                <Bar dataKey="revenue" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Guest Statistics */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-light text-slate-900 tracking-tight">
              Guest Insights
            </CardTitle>
            <CardDescription className="text-slate-600 font-light">
              Guest behavior and satisfaction metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-slate-600" />
                    <p className="text-sm text-slate-600 font-medium">Total Guests</p>
                  </div>
                  <p className="text-2xl font-semibold text-slate-900">
                    {analytics.guests.totalGuests}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-amber-500" />
                    <p className="text-sm text-slate-600 font-medium">Avg Rating</p>
                  </div>
                  <p className="text-2xl font-semibold text-slate-900">
                    {analytics.guests.avgRating.toFixed(1)}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-slate-700">Repeat Guests</p>
                  <Badge variant="outline" className="bg-white">
                    {((analytics.guests.repeatGuests / analytics.guests.totalGuests) * 100).toFixed(0)}%
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-white rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${(analytics.guests.repeatGuests / analytics.guests.totalGuests) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">
                    {analytics.guests.repeatGuests} / {analytics.guests.totalGuests}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 font-medium mb-2">Avg Stay Duration</p>
                <p className="text-2xl font-semibold text-slate-900">
                  {analytics.guests.avgStayDuration.toFixed(1)} nights
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performer Highlight */}
      {analytics.properties.topPerformer && (
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-0 shadow-lg text-white">
          <CardContent className="p-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium mb-4">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span>Top Performer</span>
                </div>
                <h3 className="text-2xl font-light mb-2 tracking-tight">
                  {analytics.properties.topPerformer.title}
                </h3>
                <div className="grid grid-cols-4 gap-6 mt-6">
                  <div>
                    <p className="text-sm text-white/60 mb-1">Revenue</p>
                    <p className="text-xl font-semibold">
                      {formatCurrency(analytics.properties.topPerformer.revenue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60 mb-1">Bookings</p>
                    <p className="text-xl font-semibold">
                      {analytics.properties.topPerformer.bookings}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60 mb-1">Views</p>
                    <p className="text-xl font-semibold">
                      {analytics.properties.topPerformer.views}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60 mb-1">Conversion</p>
                    <p className="text-xl font-semibold">
                      {formatPercent(analytics.properties.topPerformer.conversionRate)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-24 h-24 bg-white/10 rounded-2xl flex items-center justify-center">
                <Home className="w-12 h-12 text-white/80" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
