import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, MapPin, Users, Search } from "lucide-react";

const SearchForm = () => {
  return (
    <div className="bg-background/95 backdrop-blur-md rounded-3xl shadow-2xl border border-border/50 p-8 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Location */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Where</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search destinations" 
              className="pl-10 h-12 border-border focus:ring-primary"
            />
          </div>
        </div>

        {/* Check-in */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Check-in</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              type="date"
              className="pl-10 h-12 border-border focus:ring-primary"
            />
          </div>
        </div>

        {/* Check-out */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Check-out</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              type="date"
              className="pl-10 h-12 border-border focus:ring-primary"
            />
          </div>
        </div>

        {/* Guests */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Guests</label>
          <div className="relative">
            <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Add guests" 
              className="pl-10 h-12 border-border focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Search Button */}
      <div className="mt-8 flex justify-center">
        <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary-hover text-primary-foreground px-16 h-14 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <Search className="w-6 h-6 mr-3" />
          Search Properties
        </Button>
      </div>
    </div>
  );
};

export default SearchForm;