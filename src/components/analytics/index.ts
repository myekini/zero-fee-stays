// Analytics Components
export { MetricCard } from './MetricCard';
export { EarningsChart } from './EarningsChart';
export { PropertyPerformanceTable } from './PropertyPerformanceTable';
export { BookingTrendsChart } from './BookingTrendsChart';
export { ConversionFunnel } from './ConversionFunnel';
export { TopPerformersList } from './TopPerformersList';
export { TrendChart } from './TrendChart';

// Types
export interface MetricCardData {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  trend?: Array<{ value: number }>;
}

export interface EarningsData {
  month: string;
  earnings: number;
}

export interface PropertyData {
  id: string;
  name: string;
  views: number;
  bookings: number;
  revenue: number;
  conversionRate: number;
}

export interface BookingData {
  date: string;
  bookings: number;
  revenue: number;
}

export interface ConversionStep {
  stage: string;
  users: number;
  conversion: number;
}

export interface TopPerformerData {
  id: string;
  name: string;
  revenue: number;
  bookings: number;
  rating: number;
  growthRate?: number;
}