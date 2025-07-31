import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, MapPin, Users, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SearchForm = () => {
  const navigate = useNavigate();

  const handleSearch = () => {
    navigate('/search');
  };
  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/50 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto hover-lift">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Location */}
        <div className="space-y-2 sm:space-y-3">
          <label className="block text-sm font-semibold text-slate-700">Where</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" strokeWidth={1.5} />
            <Input 
              placeholder="Search destinations" 
              className="input-modern pl-12 h-12 sm:h-14 text-base"
            />
          </div>
        </div>

        {/* Check-in */}
        <div className="space-y-2 sm:space-y-3">
          <label className="block text-sm font-semibold text-slate-700">Check-in</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" strokeWidth={1.5} />
            <Input 
              type="date"
              className="input-modern pl-12 h-12 sm:h-14 text-base"
            />
          </div>
        </div>

        {/* Check-out */}
        <div className="space-y-2 sm:space-y-3">
          <label className="block text-sm font-semibold text-slate-700">Check-out</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" strokeWidth={1.5} />
            <Input 
              type="date"
              className="input-modern pl-12 h-12 sm:h-14 text-base"
            />
          </div>
        </div>

        {/* Guests */}
        <div className="space-y-2 sm:space-y-3">
          <label className="block text-sm font-semibold text-slate-700">Guests</label>
          <div className="relative">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" strokeWidth={1.5} />
            <Input 
              placeholder="Add guests" 
              className="input-modern pl-12 h-12 sm:h-14 text-base"
            />
          </div>
        </div>
      </div>

      {/* Search Button */}
      <div className="mt-6 sm:mt-8 lg:mt-10 flex justify-center">
        <Button onClick={handleSearch} className="btn-primary w-full sm:w-auto h-12 sm:h-14 lg:h-16 px-8 sm:px-10 lg:px-12 text-base sm:text-lg rounded-xl sm:rounded-2xl min-h-[48px]">
          <Search className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" strokeWidth={1.5} />
          <span className="font-semibold">Search Properties</span>
        </Button>
      </div>
    </div>
  );
};

export default SearchForm;