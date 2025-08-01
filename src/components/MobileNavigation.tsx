import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Calendar, MessageCircle, User, Plus, Bell, Heart, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';

const MobileNavigation = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [showFAB, setShowFAB] = useState(true);
  const [notifications] = useState(3); // Mock notification count
  const [messages] = useState(2); // Mock message count

  // Hide/show FAB on scroll
  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollingUp = currentScrollY < lastScrollY;
      
      setShowFAB(scrollingUp || currentScrollY < 100);
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isMobile) return null;

  const navItems = [
    { 
      icon: Home, 
      label: 'Home', 
      path: '/',
      badge: null
    },
    { 
      icon: Search, 
      label: 'Search', 
      path: '/search',
      badge: null
    },
    { 
      icon: Heart, 
      label: 'Saved', 
      path: '/saved',
      badge: null
    },
    { 
      icon: MessageCircle, 
      label: 'Messages', 
      path: '/messages',
      badge: user ? messages : null
    },
    { 
      icon: User, 
      label: user ? 'Profile' : 'Login', 
      path: user ? '/profile' : '/auth',
      badge: null
    }
  ];

  const quickActions = [
    {
      icon: Plus,
      label: 'Add Property',
      path: '/host/properties',
      color: 'bg-primary hover:bg-primary/90'
    },
    {
      icon: Calendar,
      label: 'Book Now',
      path: '/search?action=book',
      color: 'bg-secondary hover:bg-secondary/90'
    }
  ];

  return (
    <>
      {/* Top Mobile Header with Notifications */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border safe-area-pt md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Current Location</span>
          </div>
          
          {user && (
            <Button
              size="sm"
              variant="ghost"
              className="relative h-9 w-9 rounded-full"
            >
              <Bell className="h-4 w-4" />
              {notifications > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
                >
                  {notifications}
                </Badge>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border safe-area-pb">
        <div className="flex items-center justify-around px-1 py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg touch-target transition-all duration-200 relative",
                  "min-w-[60px] min-h-[48px] justify-center",
                  "active:scale-95 hover:bg-muted/50",
                  isActive 
                    ? "text-primary bg-primary/10 scale-105" 
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              <div className="relative">
                <item.icon size={20} className={cn("transition-transform duration-200")} />
                {item.badge && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs flex items-center justify-center animate-pulse"
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-xs font-medium leading-none">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Floating Action Buttons */}
      {showFAB && user && (
        <div className="fixed bottom-20 right-4 z-40 flex flex-col gap-3">
          {quickActions.map((action, index) => (
            <Button
              key={action.path}
              size="lg"
              className={cn(
                "h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 touch-target",
                action.color,
                "transform hover:scale-110 active:scale-95"
              )}
              style={{
                animationDelay: `${index * 0.1}s`
              }}
              asChild
            >
              <NavLink to={action.path}>
                <action.icon size={20} />
                <span className="sr-only">{action.label}</span>
              </NavLink>
            </Button>
          ))}
        </div>
      )}

      {/* Main FAB for non-authenticated users */}
      {showFAB && !user && (
        <div className="fixed bottom-20 right-4 z-40">
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 touch-target bg-primary hover:bg-primary/90 transform hover:scale-110 active:scale-95"
            asChild
          >
            <NavLink to="/auth">
              <User size={24} />
              <span className="sr-only">Sign In</span>
            </NavLink>
          </Button>
        </div>
      )}

      {/* Mobile spacing for fixed headers/navigation */}
      <div className="h-16 md:h-0" /> {/* Top spacing */}
      <div className="h-20 md:h-0" /> {/* Bottom spacing */}
    </>
  );
};

export default MobileNavigation;