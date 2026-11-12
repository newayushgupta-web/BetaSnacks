import { Check, Clock, ChefHat, Package, Bike, CheckCircle2, XCircle } from 'lucide-react';
import { ORDER_STATUS_LABELS } from '../../utils/constants';

export default function OrderStatusTimeline({ currentStatus = 'placed' }) {
  if (currentStatus === 'cancelled') {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3">
        <XCircle className="w-8 h-8 text-rose-600 flex-shrink-0" />
        <div>
          <h4 className="font-bold text-base">This Order Was Cancelled</h4>
          <p className="text-xs text-rose-600">If you paid online, your refund will be credited in 3-5 business days.</p>
        </div>
      </div>
    );
  }

  const steps = [
    { key: 'placed', label: ORDER_STATUS_LABELS.placed, icon: Clock },
    { key: 'confirmed', label: ORDER_STATUS_LABELS.confirmed, icon: Check },
    { key: 'preparing', label: ORDER_STATUS_LABELS.preparing, icon: ChefHat },
    { key: 'ready', label: ORDER_STATUS_LABELS.ready, icon: Package },
    { key: 'out-for-delivery', label: ORDER_STATUS_LABELS['out-for-delivery'], icon: Bike },
    { key: 'delivered', label: ORDER_STATUS_LABELS.delivered, icon: CheckCircle2 },
  ];

  const statusOrder = ['placed', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered'];
  const currentIndex = statusOrder.indexOf(currentStatus);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-charcoal-200/80 shadow-sm">
      <h3 className="font-display font-bold text-xl text-charcoal-900 mb-6">
        Live Order Tracker
      </h3>

      {/* Desktop Horizontal Stepper */}
      <div className="hidden sm:flex items-center justify-between relative">
        <div className="absolute top-5 left-6 right-6 h-1 bg-charcoal-200 -z-0">
          <div
            className="h-full bg-brand-500 transition-all duration-700"
            style={{
              width: `${(Math.max(0, currentIndex) / (statusOrder.length - 1)) * 100}%`,
            }}
          />
        </div>

        {steps.map((step, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10 text-center">
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                  isCurrent
                    ? 'bg-brand-500 text-white ring-4 ring-brand-100 shadow-md scale-110'
                    : isDone
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white text-charcoal-400 border-2 border-charcoal-200'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`mt-2.5 text-xs font-semibold max-w-[80px] leading-tight ${
                  isCurrent
                    ? 'text-brand-600 font-bold'
                    : isDone
                    ? 'text-charcoal-900'
                    : 'text-charcoal-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile Vertical Stepper */}
      <div className="sm:hidden space-y-4">
        {steps.map((step, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isCurrent
                    ? 'bg-brand-500 text-white ring-2 ring-brand-200'
                    : isDone
                    ? 'bg-emerald-500 text-white'
                    : 'bg-cream-100 text-charcoal-400 border border-charcoal-200'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <span
                  className={`text-sm font-semibold ${
                    isCurrent
                      ? 'text-brand-600'
                      : isDone
                      ? 'text-charcoal-900'
                      : 'text-charcoal-400'
                  }`}
                >
                  {step.label}
                </span>
                {isCurrent && (
                  <span className="ml-2 text-[10px] bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-bold">
                    In Progress
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

