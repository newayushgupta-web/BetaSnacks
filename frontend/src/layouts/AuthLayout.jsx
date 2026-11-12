import { Outlet, Link } from 'react-router-dom';
import Logo from '../components/common/Logo';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-100 via-cream-50 to-brand-50/30 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-body">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-block transform hover:scale-105 transition-transform">
          <Logo size="lg" />
        </Link>
        <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-brand-600">
          Snack Smart. Order Fast.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-card-hover rounded-3xl border border-charcoal-200/80">
          <Outlet />
        </div>

        <div className="text-center mt-6 text-xs text-charcoal-400">
          <span>Protected with 256-bit SSL encryption.</span>
          <br />
          <Link to="/" className="text-brand-600 font-semibold hover:underline mt-1 inline-block">
            &larr; Return to Betasnacks Home
          </Link>
        </div>
      </div>
    </div>
  );
}

