import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Bell,
  User,
  Menu,
  X,
  Heart,
  LogOut,
  MapPin,
  ChevronDown,
  Search,
  Sparkles,
  ShieldCheck,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useNotifications } from '../../context/NotificationContext';
import { productService } from '../../services/productService';
import { formatPrice } from '../../utils/formatters';
import Logo from './Logo';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount, subtotal } = useCart();
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentLocation, setCurrentLocation] = useState('Indiranagar, Bengaluru');

  const userMenuRef = useRef(null);
  const notifRef = useRef(null);
  const locationRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (locationRef.current && !locationRef.current.contains(e.target)) setLocationOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/menu?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { to: '/', label: 'Home', end: true },
    { to: '/menu', label: 'Explore Menu' },
    { to: '/menu?filter=special', label: 'Daily Deals' },
  ];

  const locationsList = [
    'Indiranagar, Bengaluru',
    'Koramangala, Bengaluru',
    'HSR Layout, Bengaluru',
    'Whitefield, Bengaluru',
    'Cyber City, Gurugram',
    'Bandra West, Mumbai',
  ];

  return (
    <>
      <nav
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-charcoal-200/70 py-3'
            : 'bg-white border-b border-charcoal-100 py-3.5 sm:py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-6 lg:gap-10">
            {/* Left: Brand Logo & Delivery Locality */}
            <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
              <Link to="/" className="flex-shrink-0 transition-transform hover:scale-[1.02]">
                <Logo size="md" />
              </Link>

              {/* Delivery Location Selector */}
              <div className="hidden lg:block relative" ref={locationRef}>
                <button
                  type="button"
                  onClick={() => setLocationOpen(!locationOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cream-50 hover:bg-cream-100 border border-charcoal-200/60 transition-colors text-left"
                >
                  <MapPin className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
                  <div className="flex flex-col text-[11px] leading-tight">
                    <span className="text-[10px] text-charcoal-400 font-semibold uppercase tracking-wider">
                      Deliver to
                    </span>
                    <span className="font-bold text-charcoal-800 line-clamp-1 max-w-[130px]">
                      {currentLocation}
                    </span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-charcoal-400 ml-0.5" />
                </button>

                {locationOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-charcoal-200/80 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="text-xs font-bold text-charcoal-900 pb-2 border-b border-charcoal-100 mb-2">
                      Select Delivery Locality
                    </div>
                    <div className="space-y-1">
                      {locationsList.map((loc) => (
                        <button
                          key={loc}
                          onClick={() => {
                            setCurrentLocation(loc);
                            setLocationOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                            currentLocation === loc
                              ? 'bg-brand-50 text-brand-600 font-bold'
                              : 'text-charcoal-700 hover:bg-cream-50'
                          }`}
                        >
                          <span>{loc}</span>
                          {currentLocation === loc && (
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Middle: Clean, Spacious Navigation Links */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `text-sm font-semibold transition-colors py-1 relative ${
                      isActive
                        ? 'text-brand-500 font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-brand-500 after:rounded-full'
                        : 'text-charcoal-700 hover:text-brand-500'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* Right: Actions & Clean Login / Profile Button */}
            <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
              {/* Search Icon Trigger */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-xl text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-100 transition-colors"
                title="Search Dishes"
                aria-label="Search Dishes"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Wishlist Icon */}
              <Link
                to="/wishlist"
                className="hidden sm:flex p-2 rounded-xl text-charcoal-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Saved Dishes"
              >
                <Heart className="w-4 h-4" />
              </Link>

              {/* Notifications Dropdown */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => {
                    setNotifOpen(!notifOpen);
                    if (!notifOpen && unreadCount > 0) markAllRead();
                  }}
                  className="p-2 rounded-xl text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-100 relative transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-white animate-pulse" />
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-3xl shadow-xl border border-charcoal-200/80 p-4 z-50 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between pb-3 border-b border-charcoal-100 mb-2">
                      <span className="font-bold text-xs text-charcoal-900">Notifications</span>
                      <span className="text-[10px] text-brand-600 font-semibold">Real-time updates</span>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 4).map((n, i) => (
                          <div key={i} className="p-2.5 rounded-xl bg-cream-50 text-xs">
                            <div className="font-semibold text-charcoal-900">{n.title}</div>
                            <div className="text-charcoal-500 text-[11px] mt-0.5">{n.message}</div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-xs text-charcoal-400">
                          All caught up! No new notifications.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Cart Pill with Live Total Price */}
              <Link
                to="/cart"
                className="flex items-center gap-2 bg-charcoal-900 hover:bg-black text-white px-3 sm:px-3.5 py-2 rounded-xl shadow-xs transition-all transform active:scale-95"
              >
                <div className="relative">
                  <ShoppingBag className="w-4 h-4 text-brand-400" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-brand-500 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-charcoal-900">
                      {cartCount}
                    </span>
                  )}
                </div>
                <div className="hidden sm:flex flex-col text-left leading-none">
                  <span className="text-[10px] text-charcoal-300 font-semibold uppercase tracking-wider">
                    {cartCount === 0 ? 'Cart' : `${cartCount} Item${cartCount > 1 ? 's' : ''}`}
                  </span>
                  {subtotal > 0 && (
                    <span className="font-bold text-xs text-white mt-0.5">
                      {formatPrice(subtotal)}
                    </span>
                  )}
                </div>
              </Link>

              {/* User Profile When Logged In OR Single Clean "Login" Button When Logged Out */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-charcoal-200/80 hover:bg-cream-50 transition-colors"
                    title="Open user menu"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-500 to-amber-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="hidden md:inline font-bold text-xs text-charcoal-800 line-clamp-1 max-w-[90px]">
                      {user?.name?.split(' ')[0] || 'Account'}
                    </span>
                    <ChevronDown className="w-3 h-3 text-charcoal-400 hidden sm:inline" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-3xl shadow-xl border border-charcoal-200/80 p-2 z-50 animate-in fade-in duration-150">
                      <div className="px-3 py-2.5 border-b border-charcoal-100">
                        <div className="font-bold text-xs text-charcoal-900">{user?.name || 'Customer'}</div>
                        <div className="text-[11px] text-charcoal-400 truncate">{user?.email || ''}</div>
                        <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 text-[10px] font-bold">
                          <Sparkles className="w-3 h-3 text-brand-500" />
                          <span>{user?.rewardPoints || 0} Reward Points</span>
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-charcoal-700 hover:bg-cream-50 transition-colors"
                        >
                          <span>Track Orders</span>
                          <ArrowRight className="w-3 h-3 text-charcoal-400" />
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-charcoal-700 hover:bg-cream-50 transition-colors"
                        >
                          <span>My Account & Addresses</span>
                          <ArrowRight className="w-3 h-3 text-charcoal-400" />
                        </Link>

                        {user?.role === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-brand-600 bg-brand-50/70 hover:bg-brand-50 transition-colors my-1"
                          >
                            <span>Restaurant Admin Portal</span>
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>

                      <div className="pt-1.5 border-t border-charcoal-100">
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold text-rose-600 bg-rose-50/70 hover:bg-rose-100 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Log Out</span>
                          </span>
                          <span className="text-[10px] text-rose-400 font-normal">Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Single Clean Login Button */
                <Link
                  to="/auth/login"
                  className="px-5 py-2 sm:py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs sm:text-sm shadow-sm transition-all transform active:scale-95"
                >
                  Login
                </Link>
              )}

              {/* Mobile Menu Hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-xl text-charcoal-700 hover:bg-cream-100 transition-colors"
                aria-label="Toggle Menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="md:hidden border-t border-charcoal-100 bg-white/95 backdrop-blur-md px-4 pt-3 pb-6 animate-in slide-in-from-top-2 duration-150">
            <div className="space-y-1 pb-4 border-b border-charcoal-100">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-brand-50 text-brand-600 font-bold'
                        : 'text-charcoal-700 hover:bg-cream-50'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              <Link
                to="/wishlist"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold text-charcoal-700 hover:bg-cream-50"
              >
                <span>Saved Wishlist</span>
                <Heart className="w-4 h-4 text-charcoal-400" />
              </Link>
            </div>

            <div className="pt-4 space-y-3">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-4 py-2 bg-cream-50 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-brand-500 text-white font-bold flex items-center justify-center">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-sm text-charcoal-900 truncate">{user.name}</div>
                      <div className="text-xs text-charcoal-500 truncate">{user.email}</div>
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-charcoal-700 hover:bg-cream-50"
                  >
                    My Account Profile
                  </Link>

                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-2.5 rounded-xl text-sm font-bold text-brand-600 bg-brand-50 hover:bg-brand-100"
                    >
                      Restaurant Admin Portal
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-50 text-rose-600 font-bold text-sm hover:bg-rose-100 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              ) : (
                /* Single Clean Login for Mobile */
                <Link
                  to="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full flex items-center justify-center py-3 rounded-xl bg-brand-500 text-white font-bold text-sm hover:bg-brand-600 shadow-sm transition-all"
                >
                  Login / Create Account
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Global Instant Search Overlay Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/60 backdrop-blur-xs flex items-start justify-center pt-20 px-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-5 shadow-2xl border border-charcoal-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-charcoal-100">
              <span className="font-bold text-xs text-charcoal-400 uppercase tracking-wider">
                Instant Dish Search
              </span>
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1 rounded-lg text-charcoal-400 hover:text-charcoal-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="mt-4">
              <div className="flex items-center bg-cream-50 rounded-2xl border border-charcoal-200 p-1.5 focus-within:ring-2 focus-within:ring-brand-500">
                <Search className="w-5 h-5 text-brand-500 ml-2.5 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Type e.g. Truffle burger, Margherita, Loaded fries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full px-3 py-2 bg-transparent text-sm text-charcoal-900 placeholder-charcoal-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
