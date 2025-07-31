import { Button } from "@/components/ui/button";
import { Search, Menu, User } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-white/95 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-5 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-xl">B</span>
          </div>
          <span className="font-display text-2xl font-bold text-slate-900">BookDirect</span>
        </div>

        {/* Navigation - Hidden on mobile */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors duration-200 font-medium">
            Browse Properties
          </a>
          <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors duration-200 font-medium">
            Host Your Property
          </a>
          <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors duration-200 font-medium">
            How It Works
          </a>
        </nav>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="hidden md:flex text-slate-600 hover:text-blue-600 font-medium">
            Become a Host
          </Button>
          <Button className="btn-secondary flex items-center space-x-2 h-11">
            <User className="w-4 h-4" strokeWidth={1.5} />
            <span className="hidden md:inline">Sign In</span>
          </Button>
          <Button variant="ghost" size="sm" className="md:hidden text-slate-600">
            <Menu className="w-5 h-5" strokeWidth={1.5} />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;