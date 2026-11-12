import { Link } from 'react-router-dom';
import { Globe, MessageCircle, Share2, Mail, Phone, MapPin, Heart } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-charcoal-900 text-cream-50 pt-16 pb-8 border-t border-charcoal-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-charcoal-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <Logo size="lg" dark />
            </Link>
            <p className="text-charcoal-300 text-sm max-w-sm leading-relaxed">
              Snack Smart. Order Fast. We serve chef-curated artisanal gourmet burgers, loaded fries,
              wood-fired pizzas, and thick craft shakes delivered piping hot to your doorstep.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a
                href="#social"
                className="w-9 h-9 rounded-full bg-charcoal-800 flex items-center justify-center text-charcoal-300 hover:text-white hover:bg-brand-500 transition-colors"
                aria-label="Instagram"
              >
                <Share2 className="w-4 h-4" />
              </a>
              <a
                href="#social"
                className="w-9 h-9 rounded-full bg-charcoal-800 flex items-center justify-center text-charcoal-300 hover:text-white hover:bg-brand-500 transition-colors"
                aria-label="Community"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="#social"
                className="w-9 h-9 rounded-full bg-charcoal-800 flex items-center justify-center text-charcoal-300 hover:text-white hover:bg-brand-500 transition-colors"
                aria-label="Website"
              >
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4 text-base tracking-wide">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm text-charcoal-300">
              <li>
                <Link to="/" className="hover:text-brand-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/menu" className="hover:text-brand-400 transition-colors">
                  Explore Menu
                </Link>
              </li>
              <li>
                <Link to="/menu?filter=bestseller" className="hover:text-brand-400 transition-colors">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link to="/menu?filter=special" className="hover:text-brand-400 transition-colors">
                  Today's Offers
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-brand-400 transition-colors">
                  My Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4 text-base tracking-wide">
              Customer Support
            </h3>
            <ul className="space-y-2.5 text-sm text-charcoal-300">
              <li>
                <Link to="/orders" className="hover:text-brand-400 transition-colors">
                  Track Orders
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-brand-400 transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-brand-400 transition-colors">
                  Saved Dishes
                </Link>
              </li>
              <li>
                <span className="text-charcoal-400 cursor-pointer hover:text-brand-400">
                  Terms & Conditions
                </span>
              </li>
              <li>
                <span className="text-charcoal-400 cursor-pointer hover:text-brand-400">
                  Privacy Policy
                </span>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4 text-base tracking-wide">
              Contact Us
            </h3>
            <ul className="space-y-3 text-sm text-charcoal-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                <span>124 Food Street, Cyber Hub, Bengaluru, 560001</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-500 flex-shrink-0" />
                <span>+91 (800) 843-2382</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-500 flex-shrink-0" />
                <span>support@betasnacks.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-charcoal-400 gap-4">
          <p>© {new Date().getFullYear()} Betasnacks Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-accent-500 fill-accent-500" /> for food & tech lovers.
          </p>
        </div>
      </div>
    </footer>
  );
}
