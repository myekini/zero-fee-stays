"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  Search,
  Calendar,
  MessageCircle,
  User,
  Plus,
  Bell,
  Heart,
  MapPin,
  Settings,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";

const MobileNavigation = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [showFAB, setShowFAB] = useState(true);
  const [showSpeedDial, setShowSpeedDial] = useState(false);
  const [notifications] = useState(3); // Mock notification count
  const [messages] = useState(2); // Mock message count
  const [activeTab, setActiveTab] = useState("/");
  const fabRef = useRef<HTMLButtonElement>(null);

  // Update active tab based on pathname
  useEffect(() => {
    setActiveTab(pathname);
  }, [pathname]);

  // Hide/show FAB on scroll with improved logic
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrollingUp = currentScrollY < lastScrollY;
          const atTop = currentScrollY < 100;

          setShowFAB(scrollingUp || atTop);
          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Haptic feedback function
  const triggerHaptic = () => {
    if ("vibrate" in navigator) {
      navigator.vibrate(10);
    }
  };

  // Handle FAB click with haptic feedback
  const handleFABClick = () => {
    triggerHaptic();
    setShowSpeedDial(!showSpeedDial);
  };

  // Handle navigation with haptic feedback
  const handleNavigation = () => {
    triggerHaptic();
  };

  if (!isMobile) return null;

  const navItems = [
    {
      icon: Home,
      label: "Home",
      path: "/",
      badge: null,
    },
    {
      icon: Search,
      label: "Search",
      path: "/search",
      badge: null,
    },
    {
      icon: Heart,
      label: "Saved",
      path: "/saved",
      badge: null,
    },
    {
      icon: Calendar,
      label: "Bookings",
      path: "/bookings",
      badge: null,
    },
    {
      icon: MessageCircle,
      label: "Messages",
      path: "/messages",
      badge: user ? messages : null,
    },
    {
      icon: User,
      label: user ? "Profile" : "Login",
      path: user ? "/profile" : "/auth",
      badge: null,
    },
  ];

  const speedDialActions = [
    {
      icon: Plus,
      label: "Add Property",
      path: "/host-dashboard",
      color: "bg-brand-600 hover:bg-brand-700",
      delay: 0,
    },
    {
      icon: Calendar,
      label: "Book Now",
      path: "/search",
      color: "bg-accent-500 hover:bg-accent-600",
      delay: 0.1,
    },
    {
      icon: BookOpen,
      label: "My Bookings",
      path: "/bookings",
      color: "bg-brand-500 hover:bg-brand-600",
      delay: 0.2,
    },
    {
      icon: TrendingUp,
      label: "Host Dashboard",
      path: "/host-dashboard",
      color: "bg-brand-600 hover:bg-brand-700",
      delay: 0.3,
    },
  ];

  return (
    <>
      {/* Enhanced Top Mobile Header with Notifications */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border safe-area-pt md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <MapPin className="h-4 w-4 text-muted-foreground animate-pulse" />
<div className="absolute -top-1 -right-1 h-2 w-2 bg-brand-500 rounded-full animate-ping"></div>
            </div>
            <span className="text-sm font-medium">Current Location</span>
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <Button
                size="sm"
                variant="ghost"
                className="relative h-9 w-9 rounded-full touch-target"
                onClick={triggerHaptic}
              >
                <Bell className="h-4 w-4" />
                {notifications > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center animate-bounce"
                  >
                    {notifications}
                  </Badge>
                )}
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="h-9 w-9 rounded-full touch-target"
              onClick={triggerHaptic}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      {/* Enhanced Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border safe-area-pb">
        <div className="flex items-center justify-around px-1 py-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              onClick={handleNavigation}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg touch-target transition-all duration-300 relative group",
                "min-w-[60px] min-h-[48px] justify-center",
                "active:scale-95 hover:bg-muted/50",
                activeTab === item.path
                  ? "text-primary bg-primary/10 scale-105"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <item.icon
                  size={20}
                  className={cn(
                    "transition-all duration-300",
                    activeTab === item.path && "animate-bounce"
                  )}
                />
                {item.badge && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs flex items-center justify-center animate-pulse"
                  >
                    {item.badge}
                  </Badge>
                )}
                {/* Active indicator */}
                {activeTab === item.path && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full animate-ping"></div>
                )}
              </div>
              <span className="text-xs font-medium leading-none transition-all duration-300">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </nav>
      {/* Enhanced Floating Action Button with Speed Dial */}
      {showFAB && user && (
        <div className="fixed bottom-20 right-4 z-40 flex flex-col gap-3">
          {/* Speed Dial Actions */}
          {showSpeedDial &&
            speedDialActions.map((action, index) => (
              <div
                key={action.path}
                className="flex items-center gap-2"
                style={{
                  animationDelay: `${action.delay}s`,
                  animation: "slideInLeft 0.3s ease-out forwards",
                }}
              >
                <span className="text-xs font-medium text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full">
                  {action.label}
                </span>
                <Button
                  size="lg"
                  className={cn(
                    "h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 touch-target",
                    action.color,
                    "transform hover:scale-110 active:scale-95"
                  )}
                  asChild
                >
                  <Link href={action.path} onClick={handleNavigation}>
                    <action.icon size={20} />
                    <span className="sr-only">{action.label}</span>
                  </Link>
                </Button>
              </div>
            ))}

          {/* Main FAB */}
          <Button
            ref={fabRef}
            size="lg"
            onClick={handleFABClick}
            className={cn(
              "h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 touch-target bg-primary hover:bg-primary/90",
              "transform hover:scale-110 active:scale-95",
              showSpeedDial && "rotate-45"
            )}
          >
            <Plus size={24} />
            <span className="sr-only">Quick Actions</span>
          </Button>
        </div>
      )}
      {/* Main FAB for non-authenticated users */}
      {showFAB && !user && (
        <div className="fixed bottom-20 right-4 z-40">
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 touch-target bg-primary hover:bg-primary/90 transform hover:scale-110 active:scale-95"
            asChild
          >
            <Link href="/auth" onClick={handleNavigation}>
              <User size={24} />
              <span className="sr-only">Sign In</span>
            </Link>
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
