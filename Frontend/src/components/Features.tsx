import React from 'react';
import { ClipboardList, UserPlus, BarChart, Lock, Video, Database } from 'lucide-react';
import { FeatureCard } from './ui/FeatureCard';

const Features = () => {
  const features = [
    {
      icon: <ClipboardList className="h-6 w-6" />,
      title: "Patient Records Management",
      description: "Securely store and manage patient records with easy access and updates."
    },
    {
      icon: <UserPlus className="h-6 w-6" />,
      title: "Doctor Onboarding",
      description: "Streamlined invitation and registration process for medical staff."
    },
    {
      icon: <BarChart className="h-6 w-6" />,
      title: "Analytics & Reporting",
      description: "Comprehensive insights and exportable reports for better decision making."
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: "Advanced Security",
      description: "Multi-factor authentication and encrypted data storage."
    },
    {
      icon: <Video className="h-6 w-6" />,
      title: "Telemedicine Ready",
      description: "Built-in support for virtual consultations and remote care."
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: "EMR Integration",
      description: "Seamless integration with existing Electronic Medical Record systems."
    }
  ];

  return (
    <div id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Comprehensive Healthcare Management
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Everything you need to manage your healthcare institution efficiently.
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;