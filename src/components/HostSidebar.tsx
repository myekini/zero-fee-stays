import React from 'react';
import { Home, Calendar, MessageSquare, DollarSign, Building, Settings, PlusCircle, BarChart3 } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

const hostNavItems = [
  { title: 'Dashboard', url: '/host/dashboard', icon: Home },
  { title: 'Properties', url: '/host/properties', icon: Building },
  { title: 'Bookings', url: '/host/bookings', icon: Calendar },
  { title: 'Messages', url: '/host/messages', icon: MessageSquare },
  { title: 'Earnings', url: '/host/earnings', icon: DollarSign },
  { title: 'Analytics', url: '/host/analytics', icon: BarChart3 },
  { title: 'Settings', url: '/host/settings', icon: Settings },
];

const quickActions = [
  { title: 'Add Property', url: '/host/properties/new', icon: PlusCircle },
];

export function HostSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const isExpanded = hostNavItems.some((item) => isActive(item.url));
  
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'bg-primary/10 text-primary font-medium border-r-2 border-primary' : 'hover:bg-muted/50';

  return (
    <Sidebar className="w-60" collapsible="icon">
      <SidebarTrigger className="m-2 self-end" />

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Host Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {hostNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Actions */}
        <SidebarGroup>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickActions.map((action) => (
                <SidebarMenuItem key={action.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={action.url} className="text-primary hover:bg-primary/10">
                      <action.icon className="mr-2 h-4 w-4" />
                      <span>{action.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}