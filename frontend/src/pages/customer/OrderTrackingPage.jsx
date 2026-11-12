import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Phone,
  Bike,
  Sparkles,
  ShieldCheck,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { io } from 'socket.io-client';
import { orderService } from '../../services/orderService';
import { SOCKET_URL } from '../../config/api';
import { formatPrice, formatDate, getOrderStatusColor } from '../../utils/formatters';
import { ORDER_STATUS_LABELS } from '../../utils/constants';
import OrderStatusTimeline from '../../components/order/OrderStatusTimeline';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function OrderTrackingPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = () => {
    orderService
      .getOrder(id)
      .then((res) => {
        if (res && res.order) setOrder(res.order);
      })
      .catch((err) => toast.error(err.message || 'Error loading order'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();

    // Socket.io real-time listener
    const socket = io(SOCKET_URL, { withCredentials: true });
    socket.emit('join-order-room', id);

    socket.on('order-status-update', (data) => {
      toast.success(`Order Status Updated: ${ORDER_STATUS_LABELS[data.status] || data.status}`);
      setOrder((prev) => (prev ? { ...prev, status: data.status, statusHistory: data.statusHistory } : prev));
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      await orderService.cancelOrder(id);
      toast.success('Order has been cancelled.');
      fetchOrder();
    } catch (err) {
      toast.error(err.message || 'Could not cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage text="Locating your food order..." />;
  }

  if (!order) {
    return (
      <div className="py-20 text-center">
        <p className="text-charcoal-600">Order not found.</p>
        <Link to="/orders" className="text-brand-600 font-bold mt-2 inline-block">
          View All Orders &rarr;
        </Link>
      </div>
    );
  }

  const canCancel = ['placed', 'confirmed'].includes(order.status);

  return (
    <div className="bg-cream-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              to="/orders"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-500 hover:text-brand-600 mb-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Order History</span>
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-charcoal-900">
                Order #{order.orderNumber || order._id?.substring(0, 8).toUpperCase()}
              </h1>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${getOrderStatusColor(order.status)}`}>
                {ORDER_STATUS_LABELS[order.status] || order.status}
              </span>
            </div>
            <p className="text-xs text-charcoal-400 mt-1">
              Placed on {formatDate(order.createdAt)} &bull; {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchOrder}
              className="p-2.5 bg-white border border-charcoal-200 rounded-xl text-charcoal-700 hover:bg-cream-100 transition-colors shadow-xs"
              title="Refresh status"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {canCancel && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="px-4 py-2 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold transition-colors"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
          </div>
        </div>

        {/* Live Timeline Component */}
        <OrderStatusTimeline currentStatus={order.status} />

        {/* Realistic Delivery Map & Rider Simulator */}
        <div className="bg-white rounded-3xl p-6 border border-charcoal-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bike className="w-5 h-5 text-brand-500" />
              <h3 className="font-display font-bold text-lg text-charcoal-900">
                Live Rider GPS Tracking
              </h3>
            </div>
            <span className="text-[11px] bg-brand-50 text-brand-700 border border-brand-200 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>LIVE SATELLITE RADAR</span>
            </span>
          </div>

          {/* Interactive Map Visual */}
          <div className="h-48 sm:h-64 rounded-2xl bg-cream-200 relative overflow-hidden flex items-center justify-center border border-charcoal-200">
            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#1c1917_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Restaurant Marker */}
            <div className="absolute left-1/4 top-1/2 -translate-y-1/2 text-center">
              <div className="w-10 h-10 rounded-full bg-charcoal-900 text-white flex items-center justify-center shadow-lg ring-4 ring-white mx-auto">
                <ChefHat className="w-5 h-5 text-brand-400" />
              </div>
              <div className="text-[10px] font-bold text-charcoal-800 mt-1 bg-white/90 px-1.5 py-0.5 rounded shadow-xs">
                Betasnacks Kitchen
              </div>
            </div>

            {/* Path Line */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <line
                x1="25%"
                y1="50%"
                x2="75%"
                y2="50%"
                stroke="#F97316"
                strokeWidth="3"
                strokeDasharray="6 6"
              />
            </svg>

            {/* Customer Marker */}
            <div className="absolute right-1/4 top-1/2 -translate-y-1/2 text-center">
              <div className="w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-lg ring-4 ring-white mx-auto">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="text-[10px] font-bold text-charcoal-800 mt-1 bg-white/90 px-1.5 py-0.5 rounded shadow-xs">
                Your Delivery Spot
              </div>
            </div>

            {/* Moving Rider Icon */}
            <div
              className={`absolute top-1/2 -translate-y-1/2 text-center transition-all duration-1000 ${
                order.status === 'out-for-delivery'
                  ? 'left-1/2 animate-bounce'
                  : order.status === 'delivered'
                  ? 'right-1/4'
                  : 'left-1/4'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md ring-2 ring-white">
                <Bike className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-charcoal-600 gap-2">
            <div>
              Estimated Delivery: <strong>~25-30 mins</strong> &bull; Rider assigned upon food preparation.
            </div>
            <div className="text-charcoal-400 text-[11px]">
              Distinguished demo simulation with live WebSocket status synchronization.
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Items Summary */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-charcoal-200/80 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-lg text-charcoal-900 border-b border-charcoal-100 pb-3">
              Ordered Dishes ({order.items?.length || 0})
            </h3>
            <div className="divide-y divide-charcoal-100">
              {order.items?.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-cream-100 overflow-hidden flex-shrink-0">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-charcoal-900">
                        {item.name}
                      </div>
                      <div className="text-xs text-charcoal-500">
                        Qty: {item.quantity} &times; {formatPrice(item.price)}
                      </div>
                    </div>
                  </div>
                  <div className="font-bold text-sm text-charcoal-900">
                    {formatPrice((item.price || 0) * (item.quantity || 1))}
                  </div>
                </div>
              ))}
            </div>

            {/* Bill breakdown */}
            <div className="pt-4 border-t border-charcoal-200 space-y-2 text-xs text-charcoal-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-charcoal-900">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>{order.deliveryFee === 0 ? 'FREE' : formatPrice(order.deliveryFee)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST Tax (5%)</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount Applied</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-charcoal-100 text-sm font-extrabold text-charcoal-900">
                <span>Total Amount Paid</span>
                <span className="text-brand-600 font-display text-lg">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address & Rider Info */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-charcoal-200/80 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-base text-charcoal-900 border-b border-charcoal-100 pb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-500" />
                <span>Delivery Address</span>
              </h3>
              <div className="text-xs text-charcoal-700 leading-relaxed space-y-1">
                <div className="font-bold text-sm text-charcoal-900">{order.deliveryAddress?.name}</div>
                <div>{order.deliveryAddress?.street}</div>
                <div>
                  {order.deliveryAddress?.city}, {order.deliveryAddress?.state} - {order.deliveryAddress?.pincode}
                </div>
                <div className="flex items-center gap-1 text-charcoal-500 pt-1">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{order.deliveryAddress?.phone}</span>
                </div>
                {order.deliveryInstructions && (
                  <div className="mt-2 p-2.5 rounded-xl bg-cream-50 text-[11px] text-charcoal-600 border border-charcoal-200">
                    <strong>Note:</strong> {order.deliveryInstructions}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

