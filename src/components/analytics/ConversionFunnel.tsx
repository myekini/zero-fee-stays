import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ConversionStep {
  stage: string;
  users: number;
  conversion: number;
}

interface ConversionFunnelProps {
  data: ConversionStep[];
  title?: string;
  className?: string;
}

export const ConversionFunnel: React.FC<ConversionFunnelProps> = ({ 
  data, 
  title = "Conversion Funnel",
  className 
}) => {
  const maxUsers = Math.max(...data.map(step => step.users));

  return (
    <Card className={`card-dashboard ${className || ''}`}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((step, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{step.stage}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {step.users.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({(step.conversion * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
              
              <div className="relative">
                <Progress 
                  value={(step.users / maxUsers) * 100} 
                  className="h-6"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-medium text-primary-foreground mix-blend-difference">
                    {step.users.toLocaleString()}
                  </span>
                </div>
              </div>
              
              {index < data.length - 1 && (
                <div className="flex justify-center">
                  <div className="text-xs text-muted-foreground">
                    ↓ {((data[index + 1].users / step.users) * 100).toFixed(1)}% conversion
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};