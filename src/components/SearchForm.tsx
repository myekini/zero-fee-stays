import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, MapPin, Users, Search } from "lucide-react";

const SearchForm = () => {
  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/50 p-8 max-w-5xl mx-auto hover-lift">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Location */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-700">Where</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" strokeWidth={1.5} />
            <Input 
              placeholder="Search destinations" 
              className="input-modern pl-12 h-14 text-base"
            />
          </div>
        </div>

        {/* Check-in */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-700">Check-in</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" strokeWidth={1.5} />
            <Input 
              type="date"
              className="input-modern pl-12 h-14 text-base"
            />
          </div>
        </div>

        {/* Check-out */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-700">Check-out</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" strokeWidth={1.5} />
            <Input 
              type="date"
              className="input-modern pl-12 h-14 text-base"
            />
          </div>
        </div>

        {/* Guests */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-700">Guests</label>
          <div className="relative">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" strokeWidth={1.5} />
            <Input 
              placeholder="Add guests" 
              className="input-modern pl-12 h-14 text-base"
            />
          </div>
        </div>
      </div>

      {/* Search Button */}
      <div className="mt-10 flex justify-center">
        <Button className="btn-primary h-16 px-12 text-lg rounded-2xl">
          <Search className="w-6 h-6 mr-3" strokeWidth={1.5} />
          Search Properties
        </Button>
      </div>
    </div>
  );
};

export default SearchForm;