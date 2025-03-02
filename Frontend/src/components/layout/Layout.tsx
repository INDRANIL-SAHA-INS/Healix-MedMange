import React from 'react';
import { Sidebar } from './Sidebar';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu } from '@headlessui/react';
import { User } from 'lucide-react';

interface LayoutProps {
  userType: 'assistant' | 'doctor' | 'admin';
  userName: string;
  userRegion: string;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ userType, userName, userRegion, children }) => {
  const [sidebarExpanded, setSidebarExpanded] = React.useState(true);
  const storedAssistant = JSON.parse(localStorage.getItem('assistant') || '{}');

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        expanded={sidebarExpanded} 
        onToggle={() => setSidebarExpanded(!sidebarExpanded)} 
        userType={userType}
      />
      
      <div className={`flex-1 transition-all duration-300 ${sidebarExpanded ? 'ml-64' : 'ml-20'}`}>
        <div className="sticky top-0 z-10 bg-white shadow-sm">
          <div className="flex justify-end items-center h-16 px-4">
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center space-x-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 p-2 rounded-md">
                <User className="h-8 w-8 rounded-full bg-gray-100 p-1" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">
                    {storedAssistant.username || userName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {storedAssistant.region_name || userRegion}
                  </div>
                </div>
              </Menu.Button>

              <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } block px-4 py-2 text-sm text-gray-700 w-full text-left`}
                    >
                      Profile
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => {
                        localStorage.clear();
                        window.location.href = '/role-selection';
                      }}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } block px-4 py-2 text-sm text-gray-700 w-full text-left`}
                    >
                      Sign out
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Menu>
          </div>
        </div>
        
        <main>
          {children}
        </main>
      </div>
    </div>
  );
};