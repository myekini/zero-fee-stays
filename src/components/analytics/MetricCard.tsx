import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendChart } from './TrendChart';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  trend?: Array<{ value: number }>;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  icon, 
  trend,
  className 
}) => {
  return (
    <Card className={`card-dashboard ${className || ''}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-muted-foreground font-medium text-sm">{title}</h3>
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            {icon}
          </div>
        </div>
        
        <div className="flex items-end justify-between">
          <div className="flex-1">
            <p className="text-2xl font-bold text-foreground mb-1">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            
            {change !== undefined && (
              <p className={`text-sm font-medium ${
                change >= 0 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-rose-600 dark:text-rose-400'
              }`}>
                {change >= 0 ? '+' : ''}{change.toFixed(1)}% from last month
              </p>
            )}
          </div>
          
          {trend && trend.length > 0 && (
            <div className="w-16 h-8 ml-4">
              <TrendChart data={trend} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};