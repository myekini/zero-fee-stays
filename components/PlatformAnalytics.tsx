import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Building,
  Calendar,
  Globe,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Target,
} from "lucide-react";
import { usePlatformAnalytics } from "@/hooks/usePlatformAnalytics";

const PlatformAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState("30days");
  const { data: analytics, isLoading, error } = usePlatformAnalytics(timeRange);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading platform analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive">
            Error loading analytics: {error.message}
          </p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">No analytics data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Platform Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into platform performance
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="365days">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Platform Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analytics.overview.totalPlatformRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +{analytics.overview.platformGrowthRate}% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bookings
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.overview.totalBookings.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              ${analytics.overview.avgBookingValue.toFixed(0)} avg booking value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Hosts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.overview.activeHosts.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +{analytics.hosts.newThisMonth} new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Properties
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.overview.activeProperties.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.hosts.retentionRate}% host retention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="financial" className="space-y-4">
        <TabsList>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="hosts">Host Performance</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
        </TabsList>

        {/* Financial Analytics */}
        <TabsContent value="financial" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Revenue Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Platform Fees</span>
                    <span className="font-medium">
                      ${analytics.financial.platformFees.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Stripe Fees</span>
                    <span className="font-medium">
                      ${analytics.financial.stripeFees.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Host Payouts</span>
                    <span className="font-medium">
                      ${analytics.financial.hostPayouts.toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Net Revenue</span>
                      <span>
                        ${analytics.financial.netRevenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Profit Margin</span>
                    <span>{analytics.financial.profitMargin}%</span>
                  </div>
                  <Progress
                    value={analytics.financial.profitMargin}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Projections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Projected Monthly Revenue
                    </p>
                    <p className="text-2xl font-bold">
                      $
                      {analytics.financial.projectedMonthlyRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Growth Trajectory
                    </p>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">
                        +{analytics.overview.platformGrowthRate}% monthly
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Key Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Average Booking Value
                    </p>
                    <p className="text-xl font-semibold">
                      ${analytics.overview.avgBookingValue.toFixed(0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Booking Value
                    </p>
                    <p className="text-xl font-semibold">
                      ${analytics.overview.totalBookingValue.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Revenue per Host
                    </p>
                    <p className="text-xl font-semibold">
                      ${analytics.hosts.avgRevenuePerHost.toFixed(0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Host Performance */}
        <TabsContent value="hosts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Hosts</CardTitle>
              <CardDescription>
                Hosts with highest revenue and booking performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.hosts.topPerformers
                  .slice(0, 10)
                  .map((host, index) => (
                    <div
                      key={host.hostId}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{host.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {host.email}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ${host.totalRevenue.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {host.totalBookings} bookings •{" "}
                          {host.activeProperties} properties
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Geography */}
        <TabsContent value="geography" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Geographic Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.geography.topCountries.map((country, index) => (
                    <div
                      key={country.country}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-primary"></div>
                        <span className="font-medium">{country.country}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ${country.revenue.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {country.properties} properties • {country.bookings}{" "}
                          bookings
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Market Share
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.geography.distribution
                    .slice(0, 5)
                    .map((region) => (
                      <div key={region.country} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{region.country}</span>
                          <span>
                            {(
                              (region.revenue /
                                analytics.overview.totalPlatformRevenue) *
                              100
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                        <Progress
                          value={
                            (region.revenue /
                              analytics.overview.totalPlatformRevenue) *
                            100
                          }
                          className="h-2"
                        />
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Monthly Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.trends.monthly.slice(-6).map((month) => (
                    <div
                      key={`${month.month}-${month.year}`}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {month.month} {month.year}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {month.totalBookings} bookings • {month.newHosts} new
                          hosts
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ${month.totalRevenue.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ${month.platformFees.toLocaleString()} fees
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Conversion Funnel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.trends.conversionFunnel.map((stage) => (
                    <div key={stage.stage} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{stage.stage}</span>
                        <span>{stage.users.toLocaleString()} users</span>
                      </div>
                      <div className="space-y-1">
                        <Progress value={stage.conversion} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {stage.conversion}% conversion rate
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Technical */}
        <TabsContent value="technical" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  System Uptime
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.technical.systemUptime}%
                </div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Avg Response Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.technical.avgResponseTime}ms
                </div>
                <p className="text-xs text-muted-foreground">API endpoints</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Error Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.technical.errorRate}%
                </div>
                <p className="text-xs text-muted-foreground">Last 24 hours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Active Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.technical.activeUsers}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently online
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Last Updated */}
      <div className="text-center text-sm text-muted-foreground">
        Last updated: {new Date(analytics.lastUpdated).toLocaleString()}
      </div>
    </div>
  );
};

export default PlatformAnalytics;
