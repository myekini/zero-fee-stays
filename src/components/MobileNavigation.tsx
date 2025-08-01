import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Calendar, MessageCircle, User, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const MobileNavigation = () => {
  const isMobile = useIsMobile();
  const [showFAB, setShowFAB] = useState(true);

  if (!isMobile) return null;

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: Calendar, label: 'Bookings', path: '/bookings' },
    { icon: MessageCircle, label: 'Messages', path: '/messages' },
    { icon: User, label: 'Profile', path: '/profile' }
  ];

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border safe-area-pb">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg touch-target transition-colors",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )
              }
            >
              <item.icon size={20} />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Floating Action Button */}
      {showFAB && (
        <div className="fixed bottom-20 right-4 z-40">
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 touch-target"
            onClick={() => {
              // Navigate to add property or quick action
              window.location.href = '/host/properties';
            }}
          >
            <Plus size={24} />
          </Button>
        </div>
      )}

      {/* Bottom padding for fixed navigation */}
      <div className="h-20 md:h-0" />
    </>
  );
};

export default MobileNavigation;