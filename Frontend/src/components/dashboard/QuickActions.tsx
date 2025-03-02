import React from 'react';
import { UserPlus, Calendar, FileText, Settings } from 'lucide-react';

interface QuickAction {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  color: string;
}

export const QuickActions: React.FC<{ actions: QuickAction[] }> = ({ actions }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow flex flex-col items-center space-y-2"
        >
          <div className={`p-2 rounded-full ${action.color} bg-opacity-10`}>
            {action.icon}
          </div>
          <span className="text-sm font-medium text-gray-700">{action.title}</span>
        </button>
      ))}
    </div>
  );
};