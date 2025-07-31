import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { HostSidebar } from '@/components/HostSidebar';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HostLayoutProps {
  children: React.ReactNode;
}

const HostLayout: React.FC<HostLayoutProps> = ({ children }) => {
  const { user, loading, signOut } = useAuth();
  const [isHost, setIsHost] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is a host (you can implement this logic based on your requirements)
    // For now, we'll assume any authenticated user can be a host
    if (user) {
      setIsHost(true);
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
      });
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: 'Sign Out Error',
        description: 'There was an error signing out. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!user) {
    return <Navigate to="/host/auth" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-slate-50">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 h-14 flex items-center justify-between bg-white border-b border-slate-200 px-4 z-40">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-lg font-semibold text-slate-900">Host Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
              <User className="w-4 h-4" />
              <span>{user.email}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="text-slate-600 hover:text-slate-900"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </header>

        {/* Sidebar */}
        <HostSidebar />

        {/* Main Content */}
        <main className="flex-1 pt-14 p-6">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default HostLayout;