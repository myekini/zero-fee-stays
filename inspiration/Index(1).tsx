import Header from "@/components/Header";
import BookingTabs from "@/components/BookingTabs";
import FlightSearchForm from "@/components/FlightSearchForm";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-bridge.jpg";
import dest1 from "@/assets/dest-1.jpg";
import dest2 from "@/assets/dest-2.jpg";
import dest3 from "@/assets/dest-3.jpg";
import dest4 from "@/assets/dest-4.jpg";

const Index = () => {
  const destinations = [
    { id: 1, name: "Maldives", description: "Tropical Paradise", image: dest1 },
    { id: 2, name: "Switzerland", description: "Alpine Adventure", image: dest2 },
    { id: 3, name: "Dubai", description: "Modern Marvel", image: dest3 },
    { id: 4, name: "Morocco", description: "Desert Dreams", image: dest4 },
  ];
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="relative">
        <div 
          className="w-full h-[500px] bg-cover bg-center relative"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
          
          <div className="relative container mx-auto px-8 h-full flex flex-col justify-center">
            <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-4 max-w-2xl">
              Hey Buddy! where are you <br />
              <span className="text-foreground">Flying</span> to?
            </h2>
            
            <button className="flex items-center gap-2 text-foreground hover:text-foreground/80 transition-colors text-sm font-medium">
              Explore Now
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="container mx-auto px-8 -mt-32 relative z-10">
          <BookingTabs />
          <FlightSearchForm />
        </div>

        <div className="container mx-auto px-8 mt-16 pb-16">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-foreground">Popular Destination</h3>
            <button className="text-sm font-medium text-foreground hover:text-foreground/80 underline">
              Explore All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((dest) => (
              <div key={dest.id} className="bg-card rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer group">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={dest.image} 
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-foreground mb-1">{dest.name}</h4>
                  <p className="text-sm text-muted-foreground">{dest.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
