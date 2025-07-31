import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, MapPin, Users, Search } from "lucide-react";

const SearchForm = () => {
  return (
    <div className="property-card bg-background border border-border p-6 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Location */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-card-foreground">Where</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search destinations" 
              className="input-modern pl-10 h-12"
            />
          </div>
        </div>

        {/* Check-in */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-card-foreground">Check-in</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              type="date"
              className="input-modern pl-10 h-12"
            />
          </div>
        </div>

        {/* Check-out */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-card-foreground">Check-out</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              type="date"
              className="input-modern pl-10 h-12"
            />
          </div>
        </div>

        {/* Guests */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-card-foreground">Guests</label>
          <div className="relative">
            <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Add guests" 
              className="input-modern pl-10 h-12"
            />
          </div>
        </div>
      </div>

      {/* Search Button */}
      <div className="mt-6 flex justify-center">
        <Button size="lg" className="px-12 h-12 rounded-xl font-semibold mobile-touch">
          <Search className="w-5 h-5 mr-2" />
          Search Properties
        </Button>
      </div>
    </div>
  );
};

export default SearchForm;