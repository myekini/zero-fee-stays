import { Button } from "@/components/ui/button";
import { Search, Menu, User, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-white/95 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-lg sm:text-xl">B</span>
          </div>
          <span className="font-display text-xl sm:text-2xl font-bold text-slate-900">BookDirect</span>
        </div>

        {/* Navigation - Hidden on mobile */}
        <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
          <Link to="/search" className="text-slate-600 hover:text-blue-600 transition-colors duration-200 font-medium whitespace-nowrap">
            Browse Properties
          </Link>
          <a href="#features" className="text-slate-600 hover:text-blue-600 transition-colors duration-200 font-medium whitespace-nowrap">
            How It Works
          </a>
          <a href="#contact" className="text-slate-600 hover:text-blue-600 transition-colors duration-200 font-medium whitespace-nowrap">
            Contact
          </a>
        </nav>
        {/* User Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="btn-secondary flex items-center space-x-2 h-10 sm:h-11 px-3 sm:px-4 min-h-[44px]">
                  <User className="w-4 h-4" strokeWidth={1.5} />
                  <span className="hidden sm:inline">
                    {user.user_metadata?.first_name || user.email?.split('@')[0] || 'Account'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/search">My Bookings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/admin">Admin Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button className="btn-secondary flex items-center space-x-2 h-10 sm:h-11 px-3 sm:px-4 min-h-[44px]">
                <User className="w-4 h-4" strokeWidth={1.5} />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            </Link>
          )}
          
          <Button variant="ghost" size="sm" className="lg:hidden text-slate-600 p-2 min-h-[44px] min-w-[44px]">
            <Menu className="w-5 h-5" strokeWidth={1.5} />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;