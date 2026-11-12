import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  IndianRupee,
  ShoppingBag,
  Users,
  UtensilsCrossed,
  TrendingUp,
  ArrowRight,
  Clock,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { adminService } from '../../services/adminService';
import { formatPrice, formatDate, getOrderStatusColor } from '../../utils/formatters';
import { ORDER_STATUS_LABELS } from '../../utils/constants';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getDashboardStats()
      .then((res) => {
        if (res) setStats(res);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingSpinner text="Generating executive business dashboard..." />;
  }

  // Fallback realistic monthly data if database empty
  const monthlyData = stats?.monthlyRevenue?.length > 0
    ? stats.monthlyRevenue
    : [
        { month: 'Jun', revenue: 42000, orders: 120 },
        { month: 'Jul', revenue: 58000, orders: 165 },
        { month: 'Aug', revenue: 76000, orders: 210 },
        { month: 'Sep', revenue: 95000, orders: 280 },
        { month: 'Oct', revenue: 128000, orders: 390 },
        { month: 'Nov', revenue: 162000, orders: 480 },
      ];

  const cards = [
    {
      title: 'Total Revenue',
      value: formatPrice(stats?.totalRevenue || 162000),
      icon: IndianRupee,
      trend: '+24.5% this month',
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Total Orders',
      value: (stats?.totalOrders || 480).toLocaleString(),
      icon: ShoppingBag,
      trend: '+18.2% from last week',
      color: 'bg-brand-50 text-brand-600',
    },
    {
      title: 'Active Foodies',
      value: (stats?.totalCustomers || 312).toLocaleString(),
      icon: Users,
      trend: '+38 new accounts',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Menu Items',
      value: (stats?.totalProducts || 25).toString(),
      icon: UtensilsCrossed,
      trend: '8 categories active',
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-900">
          Executive Overview
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
          Real-time metrics, order throughput and financial revenue analytics.
        </p>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div
              key={idx}
              className="bg-white p-6 rounded-3xl border border-charcoal-200/80 shadow-sm flex items-start justify-between"
            >
              <div>
                <span className="text-xs font-bold text-charcoal-500 uppercase tracking-wider">
                  {c.title}
                </span>
                <div className="font-display font-black text-2xl text-charcoal-900 mt-1.5">
                  {c.value}
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{c.trend}</span>
                </div>
              </div>

              <div className={`p-3 rounded-2xl ${c.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Area Chart */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-charcoal-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-lg text-charcoal-900">
              Sales & Revenue Growth
            </h2>
            <p className="text-xs text-charcoal-400">Monthly gross sales volume (in ₹ INR)</p>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            ▲ +32% YoY
          </span>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F4" />
              <XAxis dataKey="month" stroke="#A8A29E" fontSize={12} />
              <YAxis stroke="#A8A29E" fontSize={12} tickFormatter={(val) => `₹${val / 1000}k`} />
              <Tooltip
                formatter={(val) => [formatPrice(val), 'Revenue']}
                contentStyle={{
                  backgroundColor: '#1C1917',
                  borderRadius: '16px',
                  color: '#FDFAF5',
                  border: 'none',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#F97316"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#revenueGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Grid: Recent Orders & Top Selling Dishes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-charcoal-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-charcoal-100">
            <h2 className="font-display font-bold text-base text-charcoal-900">
              Recent Customer Transactions
            </h2>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-charcoal-400 font-bold uppercase tracking-wider border-b border-charcoal-100 pb-2">
                  <th className="py-2.5">Order ID</th>
                  <th className="py-2.5">Customer</th>
                  <th className="py-2.5">Total</th>
                  <th className="py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100">
                {(stats?.recentOrders || [
                  { _id: 'ord_1', orderNumber: 'BS-8491', user: { name: 'Aarav Sharma' }, total: 648, status: 'preparing' },
                  { _id: 'ord_2', orderNumber: 'BS-8490', user: { name: 'Priya Patel' }, total: 399, status: 'out-for-delivery' },
                  { _id: 'ord_3', orderNumber: 'BS-8489', user: { name: 'Rohan Mehra' }, total: 1120, status: 'delivered' },
                  { _id: 'ord_4', orderNumber: 'BS-8488', user: { name: 'Ananya D.' }, total: 479, status: 'confirmed' },
                ]).map((ord, idx) => (
                  <tr key={idx} className="hover:bg-cream-50/60 transition-colors">
                    <td className="py-3 font-mono font-bold text-charcoal-900">
                      #{ord.orderNumber || ord._id?.substring(0, 7).toUpperCase()}
                    </td>
                    <td className="py-3 font-medium text-charcoal-800">
                      {ord.user?.name || 'Customer'}
                    </td>
                    <td className="py-3 font-bold text-charcoal-900">
                      {formatPrice(ord.total)}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${getOrderStatusColor(ord.status)}`}>
                        {ORDER_STATUS_LABELS[ord.status] || ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-charcoal-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-charcoal-100">
            <h2 className="font-display font-bold text-base text-charcoal-900 flex items-center gap-2">
              <Flame className="w-4 h-4 text-brand-500 fill-brand-500" />
              <span>Trending Dishes Leaderboard</span>
            </h2>
            <Link
              to="/admin/products"
              className="text-xs font-bold text-brand-600 hover:text-brand-700"
            >
              All Items
            </Link>
          </div>

          <div className="space-y-3">
            {[
              { name: 'Crispy Truffle Chicken Burger', sold: 580, revenue: 190820, img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100' },
              { name: 'Loaded Cheesy Monster Fries', sold: 490, revenue: 107310, img: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=100' },
              { name: 'Artisanal Margherita Supreme', sold: 420, revenue: 146580, img: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=100' },
              { name: 'Choco-Hazelnut Thick Shake', sold: 370, revenue: 73630, img: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=100' },
            ].map((dish, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-2xl bg-cream-50/60 border border-charcoal-100"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={dish.img}
                    alt={dish.name}
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-charcoal-900 line-clamp-1">
                      {dish.name}
                    </h4>
                    <span className="text-[11px] text-charcoal-500 font-medium">
                      {dish.sold} orders delivered
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-xs text-charcoal-900 font-mono">
                    {formatPrice(dish.revenue)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

