import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Phone, ArrowRight, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      const msg = 'Please enter both email and password.';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    if (mode === 'register') {
      if (!name.trim()) {
        const msg = 'Please enter your Full Name to create your account.';
        setErrorMsg(msg);
        toast.error(msg);
        return;
      }
      if (password.length < 6) {
        const msg = 'Password must be at least 6 characters long.';
        setErrorMsg(msg);
        toast.error(msg);
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const loggedUser = await login(email, password, name.trim());
        toast.success(`Welcome back, ${loggedUser.name}!`);
        if (loggedUser.role === 'admin') {
          navigate('/admin');
        } else {
          navigate(from, { replace: true });
        }
      } else {
        const newUser = await register({ name: name.trim(), email, password, phone: phone.trim() });
        toast.success(`Welcome to Betasnacks, ${newUser.name}!`);
        navigate(from, { replace: true });
      }
    } catch (err) {
      const rawMsg = err.response?.data?.message || err.message || 'Authentication failed. Please check your details.';
      setErrorMsg(rawMsg);
      toast.error(rawMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoName, demoEmail, demoPass) => {
    setName(demoName);
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg('');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center">
        <h2 className="font-display font-extrabold text-2xl text-charcoal-900">
          {mode === 'login' ? 'Sign In to Betasnacks' : 'Create Free Account'}
        </h2>
        <p className="text-xs text-charcoal-500 mt-1">
          {mode === 'login'
            ? 'Enjoy live tracking, saved delivery spots and rewards.'
            : 'Join thousands of foodies and get 20% OFF your first order!'}
        </p>
      </div>

      {from.includes('checkout') && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900 font-medium">
          <strong>Almost there!</strong> Please sign in to finalize your delicious food order.
        </div>
      )}

      {/* Mode Switcher Tabs (Login vs Register Card) */}
      <div className="flex bg-cream-100 p-1 rounded-2xl border border-charcoal-200/60">
        <button
          type="button"
          onClick={() => handleModeChange('login')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            mode === 'login'
              ? 'bg-white text-charcoal-900 shadow-sm'
              : 'text-charcoal-600 hover:text-charcoal-900'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => handleModeChange('register')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            mode === 'register'
              ? 'bg-white text-charcoal-900 shadow-sm'
              : 'text-charcoal-600 hover:text-charcoal-900'
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Prominent Error Banner when password is wrong or user not found */}
      {errorMsg && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-3.5 text-xs text-red-800 flex items-start gap-2.5 shadow-sm animate-shake">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1.5">
            <p className="font-bold text-red-900">{errorMsg}</p>
            {errorMsg.toLowerCase().includes('no account found') && mode === 'login' && (
              <button
                type="button"
                onClick={() => handleModeChange('register')}
                className="inline-flex items-center gap-1 text-[11px] font-extrabold text-brand-600 underline hover:text-brand-700"
              >
                Click here to Create Account with this email &rarr;
              </button>
            )}
            {errorMsg.toLowerCase().includes('already exists') && mode === 'register' && (
              <button
                type="button"
                onClick={() => handleModeChange('login')}
                className="inline-flex items-center gap-1 text-[11px] font-extrabold text-brand-600 underline hover:text-brand-700"
              >
                Click here to Sign In instead &rarr;
              </button>
            )}
          </div>
        </div>
      )}

      {/* Demo Credentials Pill */}
      {mode === 'login' && (
        <div className="bg-brand-50/70 border border-brand-200 rounded-2xl p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-brand-800">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Quick Demo 1-Click Sign In:</span>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleDemoFill('Admin Chef', 'admin@betasnacks.com', 'Admin@123')}
              className="px-3 py-1 bg-white hover:bg-brand-100 rounded-lg border border-brand-300 font-bold text-brand-900 transition-colors"
            >
              Admin Demo
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('Ayush Gupta', 'customer@betasnacks.com', 'Password123!')}
              className="px-3 py-1 bg-white hover:bg-brand-100 rounded-lg border border-brand-300 font-bold text-brand-900 transition-colors"
            >
              Customer Demo
            </button>
          </div>
        </div>
      )}

      {/* Main Auth Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Name Field */}
        <div>
          <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
            Your Full Name {mode === 'login' ? '(Optional sync)' : '*'}
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ayush Gupta"
              required={mode === 'register'}
              className="w-full pl-10 pr-4 py-2.5 bg-cream-50 border border-charcoal-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
            />
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              required
              className="w-full pl-10 pr-4 py-2.5 bg-cream-50 border border-charcoal-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
            />
          </div>
        </div>

        {/* Phone Field (if registering) */}
        {mode === 'register' && (
          <div>
            <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
              Contact Phone (Optional)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full pl-10 pr-4 py-2.5 bg-cream-50 border border-charcoal-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>
          </div>
        )}

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider">
              Password *
            </label>
            {mode === 'register' && (
              <span className="text-[10px] text-charcoal-400 font-medium">Min 6 characters</span>
            )}
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'register' ? 'Create a secure password (min 6 chars)' : 'Enter your account password'}
              required
              className="w-full pl-10 pr-4 py-2.5 bg-cream-50 border border-charcoal-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In to Account' : 'Create Free Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Footer Toggle Text */}
      <div className="text-center pt-2 border-t border-charcoal-100">
        <p className="text-xs text-charcoal-500">
          {mode === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => handleModeChange('register')}
                className="font-bold text-brand-600 hover:underline"
              >
                Create Account Free
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => handleModeChange('login')}
                className="font-bold text-brand-600 hover:underline"
              >
                Sign In
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
