import React from 'react';
import {
  CreditCard, CheckCircle, Star, Zap, ArrowRight,
  BarChart2, Users, MessageSquare, Shield,
} from 'lucide-react';
import { initialPlans } from '../data/mockSeedData';

function PlanCard({ plan, isCurrentPlan }) {
  return (
    <div className={`relative bg-white rounded-2xl border shadow-card p-6 flex flex-col transition hover:shadow-card-md ${
      plan.popular ? 'border-wa-teal ring-2 ring-wa-teal/20' : 'border-gray-100'
    } ${isCurrentPlan ? 'bg-green-50/30' : ''}`}>
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="flex items-center gap-1 px-3 py-1 bg-wa-teal text-white text-[11px] font-bold rounded-full shadow-sm">
            <Star className="w-3 h-3" /> Most Popular
          </span>
        </div>
      )}

      <div className="mb-5">
        <h3 className="font-extrabold text-gray-900 text-base">{plan.name}</h3>
        <div className="flex items-end gap-1 mt-2">
          <span className="text-3xl font-extrabold text-gray-900">{plan.price}</span>
          <span className="text-sm text-gray-400 mb-1">{plan.period}</span>
        </div>
      </div>

      <ul className="space-y-2.5 mb-6 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-wa-green shrink-0 mt-0.5" />
            <span className="text-xs text-gray-600 leading-relaxed">{f}</span>
          </li>
        ))}
      </ul>

      <button
        disabled={isCurrentPlan}
        className={`w-full py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 ${
          isCurrentPlan
            ? 'bg-green-50 border border-green-200 text-green-700 cursor-default'
            : plan.popular
            ? 'bg-wa-teal hover:bg-wa-dark text-white shadow-wa-green'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`}
      >
        {isCurrentPlan ? (
          <>
            <CheckCircle className="w-4 h-4" /> Current Plan
          </>
        ) : (
          <>
            Upgrade to {plan.name}
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}

export default function PayPage() {
  const plans = initialPlans || [
    {
      id: 'starter',
      name: 'Starter',
      price: '$29',
      period: '/month',
      features: [
        '5,000 WhatsApp Conversations/mo',
        '1 WhatsApp Channel (WABA)',
        '2 Team Agent Seats',
        'Standard Template Manager',
        'Basic Broadcasts',
        'Email Support',
      ],
      popular: false,
    },
    {
      id: 'growth',
      name: 'Growth',
      price: '$79',
      period: '/month',
      features: [
        '25,000 WhatsApp Conversations/mo',
        '2 WhatsApp Channels (WABA)',
        '10 Team Agent Seats',
        'Dynamic Message Templates',
        'High-Speed Broadcast Engine',
        'Visual Automation Flow Engine',
        'CSV Importer & Error Inspector',
        'Priority 24/7 Support',
      ],
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$199',
      period: '/month',
      features: [
        '100,000+ WhatsApp Conversations/mo',
        'Unlimited WhatsApp Channels',
        'Unlimited Agent Seats',
        'Custom API Webhooks & Integrations',
        'Dedicated Meta WABA Tier Escalation',
        'Multi-Tenant White-Labeling',
        'Dedicated Account Manager',
      ],
      popular: false,
    },
  ];

  const currentPlanId = 'growth'; // This would come from the account's subscription

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-wa-teal/10 text-wa-teal text-xs font-bold rounded-full mb-3">
          <Zap className="w-3.5 h-3.5" />
          Billing & Plans
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900">Choose the right plan for your business</h1>
        <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
          All plans include access to the Meta Cloud API, team inbox, templates, and analytics. No setup fees.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isCurrentPlan={plan.id === currentPlanId}
          />
        ))}
      </div>

      {/* Feature Comparison */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 mb-6">
        <h2 className="font-bold text-gray-900 text-sm mb-5">All plans include</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: MessageSquare, label: 'Unified Team Inbox', desc: 'Centralized chat for all agents' },
            { icon: BarChart2, label: 'Real-Time Analytics', desc: 'Delivery & read rate dashboard' },
            { icon: Shield, label: 'Data Encryption', desc: 'End-to-end encrypted messages' },
            { icon: Users, label: 'Role-Based Access', desc: 'Admin, Agent, Viewer roles' },
          ].map((f) => (
            <div key={f.label} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
              <div className="w-8 h-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center shrink-0">
                <f.icon className="w-4 h-4 text-wa-teal" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800">{f.label}</p>
                <p className="text-[11px] text-gray-400">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invoice History Placeholder */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
        <h2 className="font-bold text-gray-900 text-sm mb-4">Invoice History</h2>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <CreditCard className="w-10 h-10 text-gray-200 mb-3" />
          <p className="text-xs text-gray-400">No invoices yet. Upgrade to a paid plan to see billing history.</p>
        </div>
      </div>
    </div>
  );
}
