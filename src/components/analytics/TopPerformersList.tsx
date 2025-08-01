import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TopPerformerData {
  id: string;
  name: string;
  revenue: number;
  bookings: number;
  rating: number;
  growthRate?: number;
}

interface TopPerformersListProps {
  performers: TopPerformerData[];
  title?: string;
  limit?: number;
  className?: string;
}

export const TopPerformersList: React.FC<TopPerformersListProps> = ({ 
  performers, 
  title = "Top Performers",
  limit = 10,
  className 
}) => {
  const displayedPerformers = performers.slice(0, limit);

  return (
    <Card className={`card-dashboard ${className || ''}`}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedPerformers.map((performer, index) => (
            <div key={performer.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{performer.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {performer.bookings} bookings • ★ {performer.rating.toFixed(1)}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">
                  ${performer.revenue.toLocaleString()}
                </p>
                {performer.growthRate !== undefined && (
                  <Badge 
                    variant={performer.growthRate >= 0 ? "default" : "secondary"}
                    className={
                      performer.growthRate >= 0
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300'
                    }
                  >
                    {performer.growthRate >= 0 ? '+' : ''}{performer.growthRate.toFixed(1)}%
                  </Badge>
                )}
              </div>
            </div>
          ))}
          
          {displayedPerformers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No performance data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};