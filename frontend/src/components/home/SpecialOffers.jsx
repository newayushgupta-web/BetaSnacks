import { useNavigate } from 'react-router-dom';
import { Tag, Sparkles, ArrowRight, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function SpecialOffers() {
  const [copiedCode, setCopiedCode] = useState('');
  const navigate = useNavigate();

  const offers = [
    {
      code: 'BETASNACKS20',
      discount: '20% OFF',
      title: 'First Bite Welcome Deal',
      desc: 'Valid on your first order above ₹249. Maximum discount up to ₹100.',
      bg: 'from-orange-500 to-amber-500',
      tag: 'WELCOME BONUS',
    },
    {
      code: 'FLAT50',
      discount: 'FLAT ₹50 OFF',
      title: 'Crispy Midnight Craving',
      desc: 'Instant ₹50 deduction on all gourmet burgers, loaded fries and wraps.',
      bg: 'from-rose-500 to-orange-500',
      tag: 'DAILY SPECIAL',
    },
    {
      code: 'FEAST100',
      discount: 'FLAT ₹100 OFF',
      title: 'Weekend Group Feast',
      desc: 'Order family-sized pizzas and biryani boxes above ₹599 to save big.',
      bg: 'from-charcoal-900 to-charcoal-800',
      tag: 'PARTY PACK',
    },
  ];

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code ${code} copied!`);
    setTimeout(() => setCopiedCode(''), 3000);
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-600 text-xs font-semibold uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>Exclusive Savings</span>
          </div>
          <h2 className="font-display text-3xl font-extrabold text-charcoal-900">
            Today's Special Offers & Coupons
          </h2>
          <p className="text-charcoal-500 text-sm mt-1">
            Apply these limited-time promotional voucher codes at checkout to unlock instant discounts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <div
              key={offer.code}
              className={`rounded-3xl p-6 text-white bg-gradient-to-br ${offer.bg} shadow-lg relative overflow-hidden flex flex-col justify-between`}
            >
              <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />

              <div>
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-bold tracking-wider uppercase mb-3">
                  {offer.tag}
                </div>
                <div className="font-display text-3xl font-black tracking-tight">{offer.discount}</div>
                <h3 className="font-bold text-lg text-white mt-1">{offer.title}</h3>
                <p className="text-xs text-white/80 mt-2 leading-relaxed">{offer.desc}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between">
                <div className="bg-white/15 px-3 py-1.5 rounded-xl border border-white/30 flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-white" />
                  <span className="font-mono font-bold text-sm tracking-wide">{offer.code}</span>
                </div>
                <button
                  onClick={() => handleCopy(offer.code)}
                  className="p-2 rounded-xl bg-white text-charcoal-900 hover:bg-cream-100 transition-colors shadow-sm"
                  title="Copy Code"
                >
                  {copiedCode === offer.code ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={() => navigate('/menu')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            <span>Order now to use your discount</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

