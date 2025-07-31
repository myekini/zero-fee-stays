import { Button } from "@/components/ui/button";
import { Search, Home } from "lucide-react";
import SearchForm from "./SearchForm";

const Hero = () => {
  return (
    <section className="hero-gradient py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Hero Text */}
          <div className="space-y-4">
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground leading-tight">
              Book Direct,{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Save More
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Zero platform fees. Direct connections between hosts and guests. 
              The future of vacation rentals is here.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="hover-lift font-semibold mobile-touch">
              <Search className="mr-2 h-5 w-5" />
              Find Properties
            </Button>
            <Button variant="secondary" size="lg" className="hover-lift font-semibold mobile-touch">
              <Home className="mr-2 h-5 w-5" />
              List Your Property
            </Button>
          </div>

          {/* Search Form */}
          <SearchForm />

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-muted-foreground text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span>0% Platform Fees</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span>Direct Host Contact</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span>Secure Payments</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;