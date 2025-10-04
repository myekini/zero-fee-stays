import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

const Header = () => {
  return (
    <header className="w-full py-4 px-8 flex items-center justify-between">
      <div className="flex items-center gap-12">
        <h1 className="text-2xl font-bold text-foreground">FlyHigh</h1>
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="#" className="text-sm text-foreground hover:text-foreground/80 transition-colors">
            Holiday Packages
          </a>
          <a href="#" className="text-sm text-foreground hover:text-foreground/80 transition-colors">
            Flight Schedule
          </a>
          <a href="#" className="text-sm text-foreground hover:text-foreground/80 transition-colors">
            Account Settings
          </a>
          <a href="#" className="text-sm text-foreground hover:text-foreground/80 transition-colors">
            Manage Booking
          </a>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" className="text-sm">
          Register
        </Button>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-6">
          Sign In
        </Button>
        <button className="flex items-center gap-1 text-sm text-foreground">
          EN
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Header;
