import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface TrendChartProps {
  data: Array<{ value: number }>;
  color?: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({ 
  data, 
  color = 'hsl(var(--primary))' 
}) => {
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke={color} 
          strokeWidth={2}
          dot={false}
          strokeDasharray="none"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};