import { useState } from 'react';
import { Tag, ArrowRight, CheckCircle2, X, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/formatters';
import { FREE_DELIVERY_THRESHOLD } from '../../utils/constants';

export default function CartSummary({
  subtotal = 0,
  deliveryFee = 0,
  tax = 0,
  discount = 0,
  total = 0,
  appliedCoupon = null,
  onApplyCoupon,
  onRemoveCoupon,
  onCheckout,
  checkoutDisabled = false,
  isCheckoutPage = false,
}) {
  const { user } = useAuth();
  const [couponCode, setCouponCode] = useState('');
  const amountToFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);

  const handleApply = (e) => {
    e.preventDefault();
    if (couponCode.trim()) {
      onApplyCoupon(couponCode.trim().toUpperCase());
      setCouponCode('');
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-charcoal-200/80 shadow-sm space-y-5">
      <h3 className="font-display font-bold text-lg text-charcoal-900 border-b border-charcoal-100 pb-3">
        Order Bill Details
      </h3>

      {/* Free delivery progress bar */}
      <div className="bg-cream-50 p-3.5 rounded-2xl border border-charcoal-200/60">
        {amountToFreeDelivery > 0 ? (
          <div>
            <div className="text-xs text-charcoal-700 font-medium">
              Add <span className="font-bold text-brand-600">{formatPrice(amountToFreeDelivery)}</span> more to unlock <span className="font-bold text-emerald-600">FREE Delivery!</span>
            </div>
            <div className="w-full bg-charcoal-200 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-brand-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100)}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Hurray! You unlocked FREE express delivery</span>
          </div>
        )}
      </div>

      {/* Coupon Application Box */}
      {!isCheckoutPage && (
        <div>
          {appliedCoupon ? (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold tracking-wide uppercase">
                  {appliedCoupon.code || 'COUPON APPLIED'}
                </span>
                <span className="text-xs text-emerald-600 font-medium">
                  (-{formatPrice(discount)})
                </span>
              </div>
              <button
                onClick={onRemoveCoupon}
                className="text-emerald-700 hover:text-emerald-950 p-1 rounded-lg"
                title="Remove coupon"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleApply} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Coupon (e.g. BETASNACKS20)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="w-full px-3.5 py-2 text-xs uppercase font-mono tracking-wider border border-charcoal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-charcoal-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-colors flex-shrink-0"
              >
                Apply
              </button>
            </form>
          )}
        </div>
      )}

      {/* Line Items */}
      <div className="space-y-2.5 text-sm text-charcoal-600 pt-2 border-t border-charcoal-100">
        <div className="flex justify-between">
          <span>Items Subtotal</span>
          <span className="font-semibold text-charcoal-900">{formatPrice(subtotal)}</span>
        </div>

        <div className="flex justify-between">
          <span>Delivery Partner Fee</span>
          <span>
            {deliveryFee === 0 ? (
              <span className="text-emerald-600 font-bold uppercase text-xs">FREE</span>
            ) : (
              <span className="font-semibold text-charcoal-900">{formatPrice(deliveryFee)}</span>
            )}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Restaurant GST & Packaging (5%)</span>
          <span className="font-semibold text-charcoal-900">{formatPrice(tax)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-emerald-600 font-semibold">
            <span>Coupon Discount</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
      </div>

      {/* Grand Total */}
      <div className="pt-3 border-t border-charcoal-200 flex justify-between items-baseline">
        <div>
          <div className="font-bold text-base text-charcoal-900">To Pay</div>
          <div className="text-[11px] text-charcoal-400">Inclusive of all taxes</div>
        </div>
        <div className="font-display font-extrabold text-2xl text-brand-600">
          {formatPrice(total)}
        </div>
      </div>

      {/* Checkout CTA button */}
      {!isCheckoutPage && onCheckout && (
        <div className="space-y-3">
          {!user && (
            <div className="p-3 rounded-2xl bg-brand-50/80 border border-brand-200/60 text-xs text-charcoal-700 leading-relaxed">
              <span className="font-bold text-brand-700 block">Sign In Required to Place Order:</span>
              Please sign in or register to track your rider live & earn reward points.
            </div>
          )}

          <button
            onClick={onCheckout}
            disabled={checkoutDisabled || subtotal <= 0}
            className="w-full py-4 rounded-2xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-base shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 transform active:scale-98"
          >
            {user ? (
              <>
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-5 h-5" />
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Sign In / Register to Order</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

