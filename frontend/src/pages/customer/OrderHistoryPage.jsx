import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, RefreshCw } from 'lucide-react';
import { orderService } from '../../services/orderService';
import OrderCard from '../../components/order/OrderCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const navigate = useNavigate();

  const fetchOrders = () => {
    setLoading(true);
    orderService
      .getMyOrders({ page, limit: 10 })
      .then((res) => {
        if (res && res.orders) {
          setOrders(res.orders);
          setPages(res.pages || 1);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [page]);

  return (
    <div className="bg-cream-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between pb-6 border-b border-charcoal-200/80 mb-8">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-charcoal-900 flex items-center gap-2.5">
              <ShoppingBag className="w-7 h-7 text-brand-500" />
              <span>Your Orders</span>
            </h1>
            <p className="text-xs text-charcoal-500 mt-1">
              Review your past delicious cravings and track active deliveries.
            </p>
          </div>

          <button
            onClick={fetchOrders}
            className="p-2.5 bg-white border border-charcoal-200 rounded-xl text-charcoal-700 hover:bg-cream-100 transition-colors shadow-xs"
            title="Refresh Orders"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <LoadingSpinner text="Retrieving your orders..." />
        ) : orders.length === 0 ? (
          <EmptyState
            title="No orders placed yet"
            description="You haven't ordered any delicious Betasnacks yet! Explore our menu to place your very first order."
            actionText="Start Ordering Now"
            onAction={() => navigate('/menu')}
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}

            {pages > 1 && (
              <div className="pt-6 flex justify-center">
                <Pagination
                  currentPage={page}
                  totalPages={pages}
                  onPageChange={(p) => setPage(p)}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

