import { Button } from "@/components/ui/button";
import { Search, Menu, User } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">B</span>
          </div>
          <span className="text-xl font-bold text-foreground">BookDirect</span>
        </div>

        {/* Navigation - Hidden on mobile */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#" className="text-foreground hover:text-primary transition-colors">
            Browse Properties
          </a>
          <a href="#" className="text-foreground hover:text-primary transition-colors">
            Host Your Property
          </a>
          <a href="#" className="text-foreground hover:text-primary transition-colors">
            How It Works
          </a>
        </nav>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="hidden md:flex">
            Become a Host
          </Button>
          <Button variant="outline" size="sm" className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span className="hidden md:inline">Sign In</span>
          </Button>
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;