import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Heart, Search, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';

const Saved: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Saved Properties</h1>
            <p className="text-muted-foreground">Your favorite properties for future bookings</p>
          </div>

          {/* Saved Properties */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Saved Properties</CardTitle>
              <CardDescription>Properties you've marked as favorites</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No saved properties yet</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Start browsing properties and save your favorites for easy access
                </p>
                <Link to="/search">
                  <Button>
                    <Search className="h-4 w-4 mr-2" />
                    Browse Properties
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <Search className="h-8 w-8 mx-auto text-primary mb-3" />
                  <h3 className="font-semibold mb-2">Discover Properties</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Browse our curated collection of unique properties
                  </p>
                  <Link to="/search">
                    <Button variant="outline" size="sm">Explore</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <MapPin className="h-8 w-8 mx-auto text-primary mb-3" />
                  <h3 className="font-semibold mb-2">Search by Location</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Find properties in your preferred destinations
                  </p>
                  <Link to="/search?location=true">
                    <Button variant="outline" size="sm">Search</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <Heart className="h-8 w-8 mx-auto text-primary mb-3" />
                  <h3 className="font-semibold mb-2">Get Recommendations</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Personalized suggestions based on your preferences
                  </p>
                  <Button variant="outline" size="sm">Coming Soon</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Saved;