import SearchForm from "./SearchForm";
import heroImage from "@/assets/hero-property.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-16" style={{ background: 'var(--gradient-hero)' }}>
      {/* Subtle Background Image Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Beautiful vacation rental property" 
          className="w-full h-full object-cover opacity-5"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 text-center">
        <div className="max-w-5xl mx-auto space-y-8 sm:space-y-12">
          {/* Hero Text */}
          <div className="space-y-6 sm:space-y-8">
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-slate-900 leading-tight tracking-tight">
              Book Direct,
              <span className="block text-transparent bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text">
                Pay Less
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal px-4 sm:px-0">
              Zero platform fees. Direct connections between hosts and guests. 
              The future of vacation rentals is here.
            </p>
          </div>

          {/* Search Form */}
          <div className="relative px-2 sm:px-0">
            <SearchForm />
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 px-4 sm:px-0">
            <div className="flex items-center space-x-2 sm:space-x-3 bg-white/80 backdrop-blur-sm px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-white/50 shadow-sm min-h-[44px]">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse flex-shrink-0"></div>
              <span className="font-medium text-slate-700 text-sm whitespace-nowrap">0% Platform Fees</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 bg-white/80 backdrop-blur-sm px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-white/50 shadow-sm min-h-[44px]">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse flex-shrink-0"></div>
              <span className="font-medium text-slate-700 text-sm whitespace-nowrap">Direct Host Contact</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 bg-white/80 backdrop-blur-sm px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-white/50 shadow-sm min-h-[44px]">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse flex-shrink-0"></div>
              <span className="font-medium text-slate-700 text-sm whitespace-nowrap">Secure Payments</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;