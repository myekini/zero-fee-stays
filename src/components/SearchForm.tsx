import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, MapPin, Users, Search } from "lucide-react";

const SearchForm = () => {
  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/80 p-8 max-w-6xl mx-auto hover-lift">
      {/* Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        {/* Location Input */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-700 tracking-wide">
            Where
          </label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" strokeWidth={1.5} />
            <Input 
              placeholder="Search destinations" 
              className="input-modern pl-12 h-14 text-base font-medium placeholder:font-normal"
            />
          </div>
        </div>

        {/* Check-in Input */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-700 tracking-wide">
            Check-in
          </label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" strokeWidth={1.5} />
            <Input 
              type="date"
              className="input-modern pl-12 h-14 text-base font-medium"
            />
          </div>
        </div>

        {/* Check-out Input */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-700 tracking-wide">
            Check-out
          </label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" strokeWidth={1.5} />
            <Input 
              type="date"
              className="input-modern pl-12 h-14 text-base font-medium"
            />
          </div>
        </div>

        {/* Guests Input */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-700 tracking-wide">
            Guests
          </label>
          <div className="relative">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" strokeWidth={1.5} />
            <Input 
              placeholder="Add guests" 
              className="input-modern pl-12 h-14 text-base font-medium placeholder:font-normal"
            />
          </div>
        </div>
      </div>

      {/* Search Button */}
      <div className="mt-10 flex justify-center">
        <Button className="btn-primary h-16 px-12 text-lg font-semibold rounded-2xl group">
          <Search className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-200" strokeWidth={1.5} />
          Search Properties
        </Button>
      </div>
    </div>
  );
};

export default SearchForm;