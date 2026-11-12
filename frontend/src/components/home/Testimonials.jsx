import { Star, Quote } from 'lucide-react';

export default function Testimonials() {
  const reviews = [
    {
      name: 'Rohan Mehra',
      role: 'Tech Lead @ Bangalore',
      comment:
        'The Truffle Chicken Burger arrived steaming hot within 22 minutes! The bun was still buttery and soft, not soggy at all. Betasnacks is hands down our office lunch default.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80',
    },
    {
      name: 'Ananya Deshmukh',
      role: 'Food Blogger & Creator',
      comment:
        'The Loaded Monster Fries are pure culinary art! Real aged melted cheddar, pickled jalapeños and crispy fried onions. Live order tracking kept me updated at every prep step.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&q=80',
    },
    {
      name: 'Vikramaditya Roy',
      role: 'Product Designer',
      comment:
        'Flawless UI, super crisp checkout and the Dum Biryani was restaurant-grade with generous saffron and tender meat. The coupon code BETASNACKS20 worked seamlessly!',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80',
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-brand-600 font-semibold text-xs tracking-wider uppercase">
            Testimonials
          </span>
          <h2 className="font-display text-3xl font-extrabold text-charcoal-900 mt-1">
            Loved by Over 10,000+ Happy Foodies
          </h2>
          <p className="text-charcoal-500 text-sm mt-1">
            See genuine stories from everyday customers who count on Betasnacks daily.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-cream-50 p-8 rounded-3xl border border-charcoal-200/70 relative flex flex-col justify-between hover:shadow-card transition-all"
            >
              <Quote className="w-8 h-8 text-brand-300 mb-4" />

              <p className="text-sm text-charcoal-700 leading-relaxed italic mb-6">
                "{rev.comment}"
              </p>

              <div>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={rev.avatar}
                    alt={rev.name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-brand-500/30"
                  />
                  <div>
                    <div className="font-bold text-sm text-charcoal-900">{rev.name}</div>
                    <div className="text-xs text-charcoal-500">{rev.role}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

