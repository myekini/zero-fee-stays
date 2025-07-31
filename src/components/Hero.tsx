import SearchForm from "./SearchForm";
import heroImage from "@/assets/hero-property.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-primary/95 via-primary to-secondary/90">
      {/* Background Image with better overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Beautiful vacation rental property" 
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/70 to-secondary/60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Text */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              Book Direct,
              <span className="block text-transparent bg-gradient-to-r from-white to-secondary-light bg-clip-text drop-shadow-lg">
                Pay Less
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/95 max-w-3xl mx-auto leading-relaxed">
              Zero platform fees. Direct connections between hosts and guests. 
              The future of vacation rentals is here.
            </p>
          </div>

          {/* Search Form */}
          <SearchForm />

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 text-white/90 text-sm md:text-base">
            <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
              <span className="font-medium">0% Platform Fees</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
              <span className="font-medium">Direct Host Contact</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
              <span className="font-medium">Secure Payments</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;