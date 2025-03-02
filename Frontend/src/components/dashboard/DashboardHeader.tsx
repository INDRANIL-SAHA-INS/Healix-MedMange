import React from 'react';
import { LogOut } from 'lucide-react';

interface DashboardHeaderProps {
  title: string;
  userName?: string;
  onLogout: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title, userName, onLogout }) => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          <div className="flex items-center space-x-4">
            {userName && (
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700">{userName}</span>
                <button 
                  onClick={onLogout}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <LogOut className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};