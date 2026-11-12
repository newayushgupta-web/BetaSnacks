import { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setSubscribed(true);
    toast.success('Welcome aboard! Your 20% discount coupon code has been sent.');
    setEmail('');
  };

  return (
    <section className="py-16 bg-cream-100/70 border-t border-charcoal-200/60">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-charcoal-900 to-charcoal-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-brand-500/20 blur-2xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7">
              <span className="text-brand-400 font-semibold text-xs tracking-wider uppercase">
                VIP Foodie Perks
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Get 20% Off Your First Betasnacks Order
              </h2>
              <p className="text-charcoal-300 text-sm mt-2 max-w-md">
                Subscribe to unlock secret chef menu drops, weekend flash deals, and earn double
                Betasnacks Reward Points on every order.
              </p>
            </div>

            <div className="md:col-span-5">
              {subscribed ? (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">
                    You're on the list! Check your inbox for code <strong>BETASNACKS20</strong>.
                  </span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="flex items-center bg-white/10 p-1.5 rounded-2xl border border-white/20 focus-within:border-brand-500 transition-colors">
                    <input
                      type="email"
                      placeholder="Enter your email address..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 text-sm text-white placeholder-charcoal-400 bg-transparent focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="bg-brand-500 hover:bg-brand-600 text-white p-2.5 rounded-xl transition-colors flex-shrink-0"
                      title="Subscribe"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[11px] text-charcoal-400 text-center">
                    No spam ever. Unsubscribe anytime with one tap.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

