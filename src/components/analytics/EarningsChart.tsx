import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface EarningsData {
  month: string;
  earnings: number;
}

interface EarningsChartProps {
  data: EarningsData[];
  title?: string;
  className?: string;
}

export const EarningsChart: React.FC<EarningsChartProps> = ({ 
  data, 
  title = "Earnings Trend",
  className 
}) => {
  return (
    <Card className={`card-dashboard ${className || ''}`}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="month" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))'
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Earnings']}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Line 
              type="monotone" 
              dataKey="earnings" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              dot={{ 
                fill: 'hsl(var(--primary))', 
                strokeWidth: 2, 
                r: 4,
                stroke: 'hsl(var(--background))'
              }}
              activeDot={{ 
                r: 6, 
                stroke: 'hsl(var(--primary))',
                strokeWidth: 2,
                fill: 'hsl(var(--background))'
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};