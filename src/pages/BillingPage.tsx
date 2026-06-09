import { CreditCard, Check, Sparkles, Zap, Users, Building } from 'lucide-react';
import clsx from 'clsx';
import { PRICING_PLANS } from '../types';

const PLAN_ICONS = { free: Sparkles, pro: Zap, team: Users, enterprise: Building };

export function BillingPage() {
  const currentPlan = 'free';

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-surface-800">
        <h2 className="text-lg font-semibold text-surface-100 flex items-center gap-2">
          <CreditCard size={20} className="text-primary-400" /> Billing & Plans
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto">
          {/* Current plan */}
          <div className="bg-surface-900 border border-surface-800 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-400">Current Plan</p>
                <h3 className="text-xl font-bold text-surface-100 mt-1">Free</h3>
              </div>
              <div className="text-right">
                <p className="text-sm text-surface-400">Monthly usage</p>
                <p className="text-lg font-semibold text-surface-200 mt-1">0 / 50 messages</p>
              </div>
            </div>
            <div className="w-full bg-surface-800 rounded-full h-2 mt-4">
              <div className="bg-primary-500 rounded-full h-2" style={{ width: '0%' }} />
            </div>
          </div>

          {/* Pricing plans */}
          <h3 className="text-lg font-semibold text-surface-100 mb-4">Upgrade Your Plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRICING_PLANS.map(plan => {
              const Icon = PLAN_ICONS[plan.id];
              const isCurrent = plan.id === currentPlan;
              const isPopular = plan.id === 'pro';
              return (
                <div key={plan.id} className={clsx(
                  'relative bg-surface-900 border rounded-xl p-5 transition-all',
                  isPopular ? 'border-primary-500' : 'border-surface-800',
                  !isCurrent && 'hover:border-surface-700'
                )}>
                  {isPopular && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs font-semibold bg-primary-600 text-white px-3 py-0.5 rounded-full">Popular</span>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <Icon size={20} className="text-primary-400" />
                    <h4 className="text-base font-semibold text-surface-200">{plan.name}</h4>
                  </div>
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-surface-100">${plan.price}</span>
                    <span className="text-sm text-surface-500">/mo</span>
                  </div>
                  <ul className="space-y-2 mb-5">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-surface-400">
                        <Check size={14} className="text-success-400 flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button className={clsx('w-full py-2 rounded-lg text-sm font-medium transition-colors',
                    isCurrent
                      ? 'bg-surface-800 text-surface-500 cursor-default'
                      : plan.id === 'pro'
                        ? 'bg-primary-600 hover:bg-primary-500 text-white'
                        : 'bg-surface-800 hover:bg-surface-700 text-surface-300'
                  )}>
                    {isCurrent ? 'Current Plan' : 'Upgrade'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
