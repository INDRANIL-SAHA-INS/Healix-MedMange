import React from 'react';
import { Shield, Users, Calendar } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
}

const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  return (
    <div className="pt-20 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Streamline Your Healthcare</span>
            <span className="block text-blue-600">Institution Management</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Comprehensive platform for managing doctors, appointments, and patient data with enterprise-grade security and compliance.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <button 
                onClick={onGetStarted}
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
              >
                Start Free Trial
              </button>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <button className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
            <Shield className="h-12 w-12 text-blue-600" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">HIPAA Compliant</h3>
            <p className="mt-2 text-base text-gray-500 text-center">
              Enterprise-grade security with full HIPAA and GDPR compliance.
            </p>
          </div>
          <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
            <Users className="h-12 w-12 text-blue-600" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Doctor Management</h3>
            <p className="mt-2 text-base text-gray-500 text-center">
              Efficiently manage your medical staff and their schedules.
            </p>
          </div>
          <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
            <Calendar className="h-12 w-12 text-blue-600" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Smart Scheduling</h3>
            <p className="mt-2 text-base text-gray-500 text-center">
              Automated appointment management and reminders.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;