import { Plus, Minus, Trash2 } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  const product = typeof item.product === 'object' && item.product !== null ? item.product : {};
  const name = product.name || item.name || 'Gourmet Dish';
  const image =
    product.thumbnail ||
    product.image ||
    (product.images && product.images[0]) ||
    item.image ||
    item.thumbnail ||
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400';

  const price = Number(item.price || product.price || 0);
  const isVeg = product.isVeg !== undefined ? product.isVeg : (item.isVeg !== undefined ? item.isVeg : true);
  const itemTotal = price * (item.quantity || 1);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white rounded-2xl border border-charcoal-200/80 hover:border-brand-300 transition-all gap-4">
      <div className="flex items-center gap-3.5">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-cream-100 flex-shrink-0">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`w-2.5 h-2.5 rounded-full inline-block ${
                isVeg ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-rose-500 ring-2 ring-rose-200'
              }`}
              title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
            />
            <h4 className="font-display font-bold text-charcoal-900 text-sm sm:text-base leading-snug">
              {name}
            </h4>
          </div>

          <div className="text-xs text-charcoal-500 font-medium">
            {formatPrice(price)} each
          </div>

          {item.customizations && item.customizations.length > 0 && (
            <div className="text-[11px] text-charcoal-400 mt-1">
              {item.customizations.map((c, i) => (
                <span key={i} className="inline-block mr-2 bg-cream-100 px-1.5 py-0.5 rounded">
                  {c.name}: {c.selectedOption?.label || c.option}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between w-full sm:w-auto gap-4 self-end sm:self-center">
        {/* Quantity Controls */}
        <div className="flex items-center bg-cream-50 border border-charcoal-200 rounded-xl p-1">
          <button
            onClick={() => onUpdateQuantity(item._id || product._id || item.productId, item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-charcoal-700 hover:bg-cream-100 disabled:opacity-40 transition-colors shadow-xs"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-8 text-center text-xs font-bold text-charcoal-900">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(item._id || product._id || item.productId, item.quantity + 1)}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-charcoal-700 hover:bg-cream-100 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Item Total Price */}
        <div className="font-bold text-charcoal-900 text-sm sm:text-base min-w-[70px] text-right">
          {formatPrice(itemTotal)}
        </div>

        {/* Remove Button */}
        <button
          onClick={() => onRemove(item._id || product._id || item.productId)}
          className="p-2 text-charcoal-400 hover:text-accent-500 hover:bg-rose-50 rounded-xl transition-colors"
          title="Remove from cart"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
