import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PropertyData {
  id: string;
  name: string;
  views: number;
  bookings: number;
  revenue: number;
  conversionRate: number;
}

interface PropertyPerformanceTableProps {
  properties: PropertyData[];
  title?: string;
  className?: string;
}

export const PropertyPerformanceTable: React.FC<PropertyPerformanceTableProps> = ({ 
  properties, 
  title = "Property Performance",
  className 
}) => {
  return (
    <Card className={`card-dashboard ${className || ''}`}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-muted-foreground font-medium text-sm">
                  Property
                </th>
                <th className="text-right py-3 px-2 text-muted-foreground font-medium text-sm">
                  Views
                </th>
                <th className="text-right py-3 px-2 text-muted-foreground font-medium text-sm">
                  Bookings
                </th>
                <th className="text-right py-3 px-2 text-muted-foreground font-medium text-sm">
                  Revenue
                </th>
                <th className="text-right py-3 px-2 text-muted-foreground font-medium text-sm">
                  Conv. Rate
                </th>
              </tr>
            </thead>
            <tbody>
              {properties.map((property) => (
                <tr key={property.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-2 font-medium text-foreground">
                    <div className="max-w-[200px] truncate" title={property.name}>
                      {property.name}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right text-muted-foreground">
                    {property.views.toLocaleString()}
                  </td>
                  <td className="py-3 px-2 text-right text-muted-foreground">
                    {property.bookings.toLocaleString()}
                  </td>
                  <td className="py-3 px-2 text-right font-medium text-foreground">
                    ${property.revenue.toLocaleString()}
                  </td>
                  <td className="py-3 px-2 text-right">
                    <Badge 
                      variant={property.conversionRate >= 10 ? "default" : "secondary"}
                      className={
                        property.conversionRate >= 10 
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-300'
                      }
                    >
                      {property.conversionRate.toFixed(1)}%
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {properties.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No property data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};