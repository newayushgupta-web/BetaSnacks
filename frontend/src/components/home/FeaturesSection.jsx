import { Zap, ShieldCheck, MapPin, Award } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: <Zap className="w-6 h-6 text-brand-500" />,
      title: 'Lightning 30-Min Delivery',
      desc: 'Smart thermal packaging keeps fries crispy, burgers piping hot and shakes icy cold.',
    },
    {
      icon: <Award className="w-6 h-6 text-brand-500" />,
      title: 'Chef-Curated Freshness',
      desc: '100% real dairy cheese, organic locally sourced produce and preservative-free patties.',
    },
    {
      icon: <MapPin className="w-6 h-6 text-brand-500" />,
      title: 'Live Order Tracking',
      desc: 'Real-time WebSocket status updates from chef prep to your doorstep in real time.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-brand-500" />,
      title: 'Secure Online Payments',
      desc: 'Zero-friction checkout with UPI, Cards, NetBanking via Razorpay and Cash on Delivery.',
    },
  ];

  return (
    <section className="py-16 bg-cream-50 border-t border-charcoal-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-brand-600 font-semibold text-xs tracking-wider uppercase">
            The Betasnacks Difference
          </span>
          <h2 className="font-display text-3xl font-extrabold text-charcoal-900 mt-1">
            Why Foodies Love Ordering With Us
          </h2>
          <p className="text-charcoal-500 text-sm mt-1">
            We built Betasnacks from the ground up for food quality, speed and seamless modern tech.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-7 rounded-3xl border border-charcoal-200/60 shadow-sm hover:shadow-card hover:border-brand-300 transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="font-display font-bold text-lg text-charcoal-900 mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-charcoal-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

