import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import CartItem from '../../components/cart/CartItem';
import CartSummary from '../../components/cart/CartSummary';
import EmptyState from '../../components/common/EmptyState';

export default function CartPage() {
  const {
    items,
    subtotal,
    deliveryFee,
    tax,
    discount,
    total,
    appliedCoupon,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const navigate = useNavigate();

  if (!items || items.length === 0) {
    return (
      <div className="bg-cream-50 min-h-[75vh] py-16 flex items-center justify-center">
        <div className="max-w-md w-full px-4">
          <EmptyState
            title="Your Betasnacks Cart is Empty"
            description="Looks like you haven't added any mouthwatering snacks yet! Explore our chef-crafted burgers, loaded fries and thick craft shakes."
            actionText="Explore Delicious Menu"
            onAction={() => navigate('/menu')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-charcoal-200/80 gap-3">
          <div>
            <Link
              to="/menu"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-500 hover:text-brand-600 mb-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continue Ordering Food</span>
            </Link>
            <h1 className="font-display text-3xl font-extrabold text-charcoal-900 flex items-center gap-2">
              <ShoppingBag className="w-7 h-7 text-brand-500" />
              <span>Shopping Cart ({items.length} items)</span>
            </h1>
          </div>

          <button
            onClick={clearCart}
            className="self-start sm:self-center inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3.5 py-2 rounded-xl transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Empty Cart</span>
          </button>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item, idx) => (
              <CartItem
                key={item._id || item.product?._id || idx}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
              />
            ))}
          </div>

          {/* Bill Summary Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <CartSummary
                subtotal={subtotal}
                deliveryFee={deliveryFee}
                tax={tax}
                discount={discount}
                total={total}
                appliedCoupon={appliedCoupon}
                onApplyCoupon={applyCoupon}
                onRemoveCoupon={removeCoupon}
                onCheckout={() => navigate('/checkout')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

