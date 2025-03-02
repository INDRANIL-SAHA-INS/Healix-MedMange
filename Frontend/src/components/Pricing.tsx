import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { PurchaseForm } from './pricing/PurchaseForm';

const Pricing = () => {
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: string } | null>(null);

  const plans = [
    {
      name: "Basic",
      price: "299",
      features: [
        "Up to 10 doctors",
        "Basic patient management",
        "Appointment scheduling",
        "Email support",
        "Standard security features",
      ],
      cta: "Start with Basic"
    },
    {
      name: "Professional",
      price: "599",
      features: [
        "Up to 50 doctors",
        "Advanced patient management",
        "Telemedicine integration",
        "Priority support",
        "Advanced analytics",
        "Custom branding"
      ],
      cta: "Go Professional",
      highlighted: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      features: [
        "Unlimited doctors",
        "Full feature access",
        "24/7 premium support",
        "Custom integrations",
        "Dedicated account manager",
        "On-premise deployment option"
      ],
      cta: "Contact Sales"
    }
  ];

  return (
    <div id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Choose the perfect plan for your healthcare institution
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`flex flex-col rounded-lg shadow-lg overflow-hidden ${
                plan.highlighted
                  ? 'border-2 border-blue-600 transform scale-105'
                  : 'border border-gray-200'
              }`}
            >
              <div className="px-6 py-8 bg-white">
                <h3 className="text-2xl font-semibold text-gray-900">{plan.name}</h3>
                <p className="mt-4">
                  <span className="text-4xl font-extrabold text-gray-900">${plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-base font-medium text-gray-500">/month</span>}
                </p>
                <button
                  onClick={() => setSelectedPlan({ name: plan.name, price: plan.price })}
                  className={`mt-8 w-full rounded-md px-4 py-2 text-sm font-semibold ${
                    plan.highlighted
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-800 text-white hover:bg-gray-900'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
              <div className="flex-1 px-6 pt-6 pb-8 bg-gray-50">
                <ul className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 shrink-0" />
                      <span className="ml-3 text-base text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedPlan && (
        <PurchaseForm
          selectedPlan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
        />
      )}
    </div>
  );
};

export default Pricing;