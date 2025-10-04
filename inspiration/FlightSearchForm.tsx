import { Button } from "@/components/ui/button";
import { ChevronDown, ArrowLeftRight, Calendar, ArrowRight } from "lucide-react";
import { useState } from "react";
import thumb1 from "@/assets/thumb-1.jpg";
import thumb2 from "@/assets/thumb-2.jpg";

const FlightSearchForm = () => {
  const [tripType, setTripType] = useState("Round Trip");
  const [passengers, setPassengers] = useState("02 Passengers");
  const [classType, setClassType] = useState("Business Class");

  return (
    <div className="relative">
      {/* Left thumbnail */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 hidden xl:block">
        <img src={thumb1} alt="Destination" className="w-16 h-24 object-cover rounded-lg shadow-md" />
      </div>

      {/* Right thumbnail */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 hidden xl:block">
        <img src={thumb2} alt="Destination" className="w-16 h-24 object-cover rounded-lg shadow-md" />
      </div>

      <div className="bg-card rounded-b-lg rounded-tr-lg p-8 shadow-xl">
        <div className="flex gap-6 mb-8">
          <select
            value={tripType}
            onChange={(e) => setTripType(e.target.value)}
            className="px-4 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option>Round Trip</option>
            <option>One Way</option>
            <option>Multi City</option>
          </select>

          <select
            value={passengers}
            onChange={(e) => setPassengers(e.target.value)}
            className="px-4 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option>01 Passenger</option>
            <option>02 Passengers</option>
            <option>03 Passengers</option>
            <option>04 Passengers</option>
          </select>

          <select
            value={classType}
            onChange={(e) => setClassType(e.target.value)}
            className="px-4 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option>Economy Class</option>
            <option>Premium Economy</option>
            <option>Business Class</option>
            <option>First Class</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-xs text-muted-foreground mb-2 uppercase">From</label>
              <div className="flex flex-col">
                <span className="text-2xl font-semibold text-foreground">Behance</span>
                <span className="text-xs text-muted-foreground">BHN, North America, USA</span>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <button className="p-3 rounded-full hover:bg-muted transition-colors">
                <ArrowLeftRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="flex flex-col">
              <label className="text-xs text-muted-foreground mb-2 uppercase">To</label>
              <div className="flex flex-col">
                <span className="text-2xl font-semibold text-foreground">Dribbble</span>
                <span className="text-xs text-muted-foreground">DRB, Cape Town, South Africa</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          <div className="lg:col-span-3">
            <label className="text-xs text-muted-foreground mb-2 uppercase block">Departure</label>
            <div className="flex items-center gap-2">
              <button className="text-xs text-muted-foreground hover:text-foreground">Prev</button>
              <div className="flex items-center gap-2 px-4 py-3 border border-border rounded-md bg-background">
                <span className="text-sm font-medium">Fri, 22 Mar</span>
                <Calendar className="w-4 h-4 text-muted-foreground" />
              </div>
              <button className="text-xs text-muted-foreground hover:text-foreground">Next</button>
            </div>
          </div>

          <div className="lg:col-span-3">
            <label className="text-xs text-muted-foreground mb-2 uppercase block">Return</label>
            <div className="flex items-center gap-2">
              <button className="text-xs text-muted-foreground hover:text-foreground">Prev</button>
              <div className="flex items-center gap-2 px-4 py-3 border border-border rounded-md bg-background">
                <span className="text-sm font-medium">Mon, 2 Apr</span>
                <Calendar className="w-4 h-4 text-muted-foreground" />
              </div>
              <button className="text-xs text-muted-foreground hover:text-foreground">Next</button>
            </div>
          </div>

          <div className="lg:col-span-6 flex items-end justify-end">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base font-medium w-full lg:w-auto">
              Search Flights
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightSearchForm;
