import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCog, Stethoscope, HeartPulse } from 'lucide-react';
import AdminLogin from './AdminLogin';

export const RoleSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-4xl w-full mx-4">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Choose Your Role
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => navigate('/admin-login')}
            className="p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center"
          >
            <UserCog className="w-16 h-16 text-blue-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Administrator</h2>
            <p className="text-gray-600 text-center">
              Manage institution, doctors, and overall system settings
            </p>
          </button>

          <button
            onClick={() => navigate('/doctor/login')}
            className="p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center"
          >
            <Stethoscope className="w-16 h-16 text-green-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Doctor</h2>
            <p className="text-gray-600 text-center">
              Access patient records, appointments, and medical histories
            </p>
          </button>

          <button
            onClick={() => navigate('/assistant/login')}
            className="p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center"
          >
            <HeartPulse className="w-16 h-16 text-red-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Assistant</h2>
            <p className="text-gray-600 text-center">
              Support medical staff and help with patient care
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};