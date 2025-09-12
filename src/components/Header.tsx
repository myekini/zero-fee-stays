import { Button } from "@/components/ui/button";
import { Search, Menu, User, LogOut, X, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import Logo from "@/components/ui/Logo";

const Header = () => {
  const { user, authUser, signOut, hasPermission } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // Close mobile menu if open
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <>
      <header className={`sticky-nav ${isScrolled ? "scrolled" : ""}`}>
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Logo size="md" variant="primary" type="full" />
          </div>

          {/* Navigation - Hidden on mobile */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            <Link
              to="/search"
              className="text-warm-gray-600 hover:text-hiddy-sage transition-all duration-300 font-medium whitespace-nowrap relative group"
            >
              Browse Properties
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-hiddy-sage transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <a
              href="#features"
              className="text-warm-gray-600 hover:text-hiddy-sage transition-all duration-300 font-medium whitespace-nowrap relative group"
            >
              How It Works
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-hiddy-sage transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a
              href="#contact"
              className="text-warm-gray-600 hover:text-hiddy-sage transition-all duration-300 font-medium whitespace-nowrap relative group"
            >
              Contact
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-hiddy-sage transition-all duration-300 group-hover:w-full"></span>
            </a>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="btn-secondary flex items-center space-x-2 h-10 sm:h-11 px-3 sm:px-4 min-h-[44px] hover:scale-105 transition-transform duration-200">
                    <User className="w-4 h-4" strokeWidth={1.5} />
                    <span className="hidden sm:inline">
                      {user.user_metadata?.first_name ||
                        user.email?.split("@")[0] ||
                        "Account"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glassmorphism">
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/bookings">My Bookings</Link>
                  </DropdownMenuItem>
                  {hasPermission("host") && (
                    <DropdownMenuItem asChild>
                      <Link to="/host-dashboard">Host Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  {hasPermission("admin") && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center">
                          <Shield className="w-4 h-4 mr-2" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button className="btn-secondary flex items-center space-x-2 h-10 sm:h-11 px-3 sm:px-4 min-h-[44px] hover:scale-105 transition-transform duration-200">
                  <User className="w-4 h-4" strokeWidth={1.5} />
                  <span className="hidden sm:inline">Sign In</span>
                </Button>
              </Link>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-slate-600 p-2 min-h-[44px] min-w-[44px] hover:bg-slate-100 transition-colors duration-200"
              onClick={toggleMobileMenu}
            >
              <Menu className="w-5 h-5" strokeWidth={1.5} />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu lg:hidden" onClick={toggleMobileMenu}>
          <div
            className="mobile-menu-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <Logo size="sm" variant="primary" type="full" />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2"
                  onClick={toggleMobileMenu}
                >
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </Button>
              </div>

              <nav className="space-y-4">
                <Link
                  to="/search"
                  className="block py-3 px-4 text-slate-700 hover:text-hiddy-coral hover:bg-slate-50 rounded-lg transition-all duration-200"
                  onClick={toggleMobileMenu}
                >
                  Browse Properties
                </Link>
                <a
                  href="#features"
                  className="block py-3 px-4 text-slate-700 hover:text-hiddy-coral hover:bg-slate-50 rounded-lg transition-all duration-200"
                  onClick={toggleMobileMenu}
                >
                  How It Works
                </a>
                <a
                  href="#contact"
                  className="block py-3 px-4 text-slate-700 hover:text-hiddy-coral hover:bg-slate-50 rounded-lg transition-all duration-200"
                  onClick={toggleMobileMenu}
                >
                  Contact
                </a>
              </nav>

              <div className="mt-8 pt-6 border-t border-slate-200">
                {user ? (
                  <div className="space-y-3">
                    <div className="px-4 py-2 text-sm text-slate-600">
                      Welcome,{" "}
                      {user.user_metadata?.first_name ||
                        user.email?.split("@")[0] ||
                        "User"}
                    </div>
                    <Link
                      to="/profile"
                      className="block py-3 px-4 text-slate-700 hover:text-hiddy-coral hover:bg-slate-50 rounded-lg transition-all duration-200"
                      onClick={toggleMobileMenu}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/bookings"
                      className="block py-3 px-4 text-slate-700 hover:text-hiddy-coral hover:bg-slate-50 rounded-lg transition-all duration-200"
                      onClick={toggleMobileMenu}
                    >
                      My Bookings
                    </Link>
                    {hasPermission("host") && (
                      <Link
                        to="/host-dashboard"
                        className="block py-3 px-4 text-slate-700 hover:text-hiddy-coral hover:bg-slate-50 rounded-lg transition-all duration-200"
                        onClick={toggleMobileMenu}
                      >
                        Host Dashboard
                      </Link>
                    )}
                    {hasPermission("admin") && (
                      <Link
                        to="/admin"
                        className="block py-3 px-4 text-slate-700 hover:text-hiddy-coral hover:bg-slate-50 rounded-lg transition-all duration-200"
                        onClick={toggleMobileMenu}
                      >
                        <div className="flex items-center">
                          <Shield className="w-4 h-4 mr-2" />
                          Admin Dashboard
                        </div>
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left py-3 px-4 text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link to="/auth">
                    <Button
                      className="w-full btn-primary"
                      onClick={toggleMobileMenu}
                    >
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
