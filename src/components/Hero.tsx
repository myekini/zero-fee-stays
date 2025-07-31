import SearchForm from "./SearchForm";
import heroImage from "@/assets/hero-property.jpg";

const Hero = () => {
  return (
    <section className="hero-section relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Modern Gradient Background */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, white 50%, #ecfdf5 100%)'
        }}
      />
      
      {/* Subtle Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Beautiful vacation rental property" 
          className="w-full h-full object-cover opacity-[0.03]"
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8">
        {/* Hero Content */}
        <div className="text-center space-y-12 pt-20 pb-16">
          {/* Hero Text Section */}
          <div className="space-y-8 max-w-5xl mx-auto">
            <h1 className="hero-title font-display text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-slate-900 leading-none tracking-tight">
              Book Direct,
              <span className="block text-transparent bg-gradient-to-r from-blue-600 via-blue-700 to-emerald-600 bg-clip-text">
                Pay Less
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl lg:text-3xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-normal">
              Zero platform fees. Direct connections between hosts and guests.
              <span className="block mt-2">The future of vacation rentals is here.</span>
            </p>
          </div>

          {/* Search Form Container */}
          <div className="relative max-w-6xl mx-auto">
            <SearchForm />
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-8 pt-8">
            <div className="flex items-center space-x-3 bg-white/90 backdrop-blur-sm px-6 py-4 rounded-2xl border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="font-semibold text-slate-800 text-sm lg:text-base">0% Platform Fees</span>
            </div>
            
            <div className="flex items-center space-x-3 bg-white/90 backdrop-blur-sm px-6 py-4 rounded-2xl border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="font-semibold text-slate-800 text-sm lg:text-base">Direct Host Contact</span>
            </div>
            
            <div className="flex items-center space-x-3 bg-white/90 backdrop-blur-sm px-6 py-4 rounded-2xl border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="font-semibold text-slate-800 text-sm lg:text-base">Secure Payments</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;