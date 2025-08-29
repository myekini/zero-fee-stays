import {
  Facebook,
  Twitter,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Mail as MailIcon,
} from "lucide-react";
import Logo from "@/components/ui/Logo";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Logo size="sm" variant="white" type="full" />
            </div>
            <p className="text-slate-300 leading-relaxed text-sm">
              Connect directly with local hosts, keep 100% of your savings, and
              experience authentic hospitality that transforms every journey.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 bg-slate-700 hover:bg-hiddy-coral rounded-full flex items-center justify-center transition-all duration-300"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-slate-700 hover:bg-hiddy-coral rounded-full flex items-center justify-center transition-all duration-300"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-slate-700 hover:bg-hiddy-coral rounded-full flex items-center justify-center transition-all duration-300"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="mailto:hello@hiddystays.com"
                className="w-10 h-10 bg-slate-700 hover:bg-hiddy-coral rounded-full flex items-center justify-center transition-all duration-300"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="font-semibold text-lg text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/properties"
                  className="text-slate-300 hover:text-white transition-colors duration-300 text-sm"
                >
                  Browse Properties
                </Link>
              </li>
              <li>
                <Link
                  to="/host-dashboard"
                  className="text-slate-300 hover:text-white transition-colors duration-300 text-sm"
                >
                  Become a Host
                </Link>
              </li>
              <li>
                <Link
                  to="/bookings"
                  className="text-slate-300 hover:text-white transition-colors duration-300 text-sm"
                >
                  My Bookings
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="text-slate-300 hover:text-white transition-colors duration-300 text-sm"
                >
                  My Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-6">
            <h3 className="font-semibold text-lg text-white">Support</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-slate-300 hover:text-white transition-colors duration-300 text-sm"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-300 hover:text-white transition-colors duration-300 text-sm"
                >
                  Safety Guidelines
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-300 hover:text-white transition-colors duration-300 text-sm"
                >
                  Trust & Safety
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-300 hover:text-white transition-colors duration-300 text-sm"
                >
                  Contact Support
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="font-semibold text-lg text-white">Contact</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <MailIcon className="w-4 h-4 text-hiddy-coral" />
                <span className="text-slate-300 text-sm">
                  hello@hiddystays.com
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-hiddy-coral" />
                <span className="text-slate-300 text-sm">
                  +1 (555) 123-4567
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-hiddy-coral" />
                <span className="text-slate-300 text-sm">Global Community</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-slate-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm">
            © 2024 HiddyStays. All rights reserved.
          </p>
          <div className="flex space-x-8 text-sm text-slate-400 mt-4 md:mt-0">
            <a
              href="#"
              className="hover:text-white transition-colors duration-300"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="hover:text-white transition-colors duration-300"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="hover:text-white transition-colors duration-300"
            >
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
