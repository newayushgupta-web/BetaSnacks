import { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  Users,
  Ticket,
  FolderTree,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/common/Logo';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', to: '/admin', end: true, icon: LayoutDashboard },
    { name: 'Menu & Products', to: '/admin/products', icon: UtensilsCrossed },
    { name: 'Live Orders', to: '/admin/orders', icon: ShoppingBag },
    { name: 'Customers', to: '/admin/customers', icon: Users },
    { name: 'Coupons & Promos', to: '/admin/coupons', icon: Ticket },
    { name: 'Categories', to: '/admin/categories', icon: FolderTree },
  ];

  return (
    <div className="min-h-screen bg-charcoal-100 flex flex-col md:flex-row font-body">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-charcoal-900 text-white z-30">
        <div className="flex items-center gap-2">
          <Logo size="sm" dark />
          <span className="text-xs bg-brand-500 text-white font-bold px-1.5 py-0.5 rounded">
            ADMIN
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-charcoal-300 hover:text-white"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-charcoal-900 text-cream-50 flex flex-col justify-between z-40 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Admin Brand Logo Header */}
          <div className="p-6 border-b border-charcoal-800 flex items-center justify-between">
            <div>
              <Logo size="md" dark />
              <div className="text-[11px] font-semibold text-brand-400 tracking-wider mt-1 uppercase">
                Restaurant Portal
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-charcoal-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Links */}
          <nav className="p-4 space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-brand-500 text-white shadow-md font-semibold'
                        : 'text-charcoal-300 hover:bg-charcoal-800 hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-charcoal-800 space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-charcoal-300 hover:bg-charcoal-800 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-brand-400" />
              <span>Preview Customer App</span>
            </div>
            <span>&rarr;</span>
          </Link>

          <div className="pt-2 flex items-center justify-between px-2">
            <div className="text-xs">
              <div className="font-bold text-white line-clamp-1">{user?.name || 'Administrator'}</div>
              <div className="text-[11px] text-charcoal-400">{user?.email || 'admin@betasnacks.com'}</div>
            </div>
            <button
              onClick={logout}
              className="p-2 text-charcoal-400 hover:text-rose-400 rounded-lg hover:bg-charcoal-800 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Desktop Bar */}
        <div className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-charcoal-200">
          <div>
            <h2 className="font-display font-bold text-xl text-charcoal-900">
              Betasnacks Admin Center
            </h2>
            <p className="text-xs text-charcoal-500">Live operational monitoring & catalog control</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 px-3.5 py-2 rounded-xl transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Storefront</span>
            </Link>
            <div className="h-4 w-[1px] bg-charcoal-200" />
            <span className="text-xs font-semibold text-charcoal-700 bg-cream-100 px-3 py-1.5 rounded-full border border-charcoal-200">
              Admin: {user?.name || 'Manager'}
            </span>
          </div>
        </div>

        {/* Child Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

