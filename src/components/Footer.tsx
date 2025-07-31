import { Facebook, Twitter, Instagram, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">B</span>
              </div>
              <span className="text-xl font-bold">BookDirect</span>
            </div>
            <p className="text-background/80">
              The zero-fee vacation rental platform connecting hosts and guests directly.
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 text-background/60 hover:text-background cursor-pointer" />
              <Twitter className="w-5 h-5 text-background/60 hover:text-background cursor-pointer" />
              <Instagram className="w-5 h-5 text-background/60 hover:text-background cursor-pointer" />
              <Mail className="w-5 h-5 text-background/60 hover:text-background cursor-pointer" />
            </div>
          </div>

          {/* For Guests */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">For Guests</h3>
            <ul className="space-y-2 text-background/80">
              <li><a href="#" className="hover:text-background">Search Properties</a></li>
              <li><a href="#" className="hover:text-background">How to Book</a></li>
              <li><a href="#" className="hover:text-background">Guest Reviews</a></li>
              <li><a href="#" className="hover:text-background">Travel Insurance</a></li>
            </ul>
          </div>

          {/* For Hosts */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">For Hosts</h3>
            <ul className="space-y-2 text-background/80">
              <li><a href="#" className="hover:text-background">List Your Property</a></li>
              <li><a href="#" className="hover:text-background">Host Dashboard</a></li>
              <li><a href="#" className="hover:text-background">Pricing Tools</a></li>
              <li><a href="#" className="hover:text-background">Host Community</a></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Support</h3>
            <ul className="space-y-2 text-background/80">
              <li><a href="#" className="hover:text-background">Help Center</a></li>
              <li><a href="#" className="hover:text-background">Contact Us</a></li>
              <li><a href="#" className="hover:text-background">Safety</a></li>
              <li><a href="#" className="hover:text-background">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-background/20 flex flex-col md:flex-row justify-between items-center">
          <p className="text-background/60 text-sm">
            © 2024 BookDirect. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm text-background/60 mt-4 md:mt-0">
            <a href="#" className="hover:text-background">Privacy Policy</a>
            <a href="#" className="hover:text-background">Terms</a>
            <a href="#" className="hover:text-background">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;