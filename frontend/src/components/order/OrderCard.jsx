import { Link } from 'react-router-dom';
import { ChevronRight, Package, Clock } from 'lucide-react';
import { formatPrice, formatDate, getOrderStatusColor } from '../../utils/formatters';
import { ORDER_STATUS_LABELS } from '../../utils/constants';

export default function OrderCard({ order }) {
  const statusLabel = ORDER_STATUS_LABELS[order.status] || order.status;
  const statusColor = getOrderStatusColor(order.status);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-charcoal-200/80 hover:shadow-card transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-charcoal-100 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm text-charcoal-900">
              #{order.orderNumber || order._id?.substring(0, 8).toUpperCase()}
            </span>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${statusColor}`}>
              {statusLabel}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-charcoal-400 mt-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Placed on {formatDate(order.createdAt)}</span>
          </div>
        </div>

        <div className="text-right sm:self-center">
          <div className="font-display font-extrabold text-lg text-charcoal-900">
            {formatPrice(order.total)}
          </div>
          <div className="text-[11px] text-charcoal-400 uppercase font-semibold">
            {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}
          </div>
        </div>
      </div>

      {/* Items Preview */}
      <div className="py-4 space-y-2">
        {order.items?.slice(0, 3).map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs text-charcoal-600">
            <div className="flex items-center gap-2">
              <span className="font-bold text-charcoal-900">{item.quantity}x</span>
              <span className="line-clamp-1">{item.name || item.product?.name}</span>
            </div>
            <span className="font-semibold text-charcoal-700">
              {formatPrice((item.price || 0) * (item.quantity || 1))}
            </span>
          </div>
        ))}
        {order.items?.length > 3 && (
          <div className="text-[11px] text-charcoal-400 italic">
            +{order.items.length - 3} more delicious item(s)
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-charcoal-100 flex items-center justify-between">
        <div className="text-xs text-charcoal-500">
          Delivery to: <span className="font-semibold text-charcoal-800">{order.deliveryAddress?.city || 'Address'}</span>
        </div>
        <Link
          to={`/orders/${order._id}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-xl transition-colors"
        >
          <span>Track Live</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

