import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Users, 
  MessageCircle, 
  Activity, 
  ChevronRight,
  Search,
  Heart,
  Bot,
  Pill
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SidebarProps {
  expanded: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ expanded, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const currentUser = JSON.parse(localStorage.getItem('doctor') || '{}');
  const [hasNewMessages, setHasNewMessages] = useState(false);

  // Determine if we're in the assistant section
  const isAssistant = location.pathname.startsWith('/assistant');

  const checkForNewMessages = async () => {
    const user = JSON.parse(localStorage.getItem('doctor') || localStorage.getItem('assistant') || '{}');
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact' })
      .eq('recipient_id', user.ref_id || user.id)
      .is('read_at', null);

    setHasNewMessages(!!count);
  };

  useEffect(() => {
    const channel = supabase
      .channel('sidebar-messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `recipient_id.eq.${currentUser.ref_id || currentUser.id}`
      }, () => {
        if (!location.pathname.startsWith('/messages')) {
          setHasNewMessages(true);
        }
      })
      .subscribe();

    checkForNewMessages();
    return () => channel.unsubscribe();
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname.startsWith('/messages')) {
      setHasNewMessages(false);
      supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('recipient_id', currentUser.ref_id || currentUser.id)
        .is('read_at', null);
    }
  }, [location.pathname]);

  // Define menu items based on the role
  const menuItems = isAssistant ? [
    { icon: Home, label: 'Dashboard', path: '/assistant' },
    { icon: Calendar, label: 'Manage Appointments', path: '/assistant/appointments' },
    { icon: Users, label: 'Doctors', path: '/assistant/doctors' },
    { icon: MessageCircle, label: 'Messages', path: '/assistant/messages' },
  ] : [
    { icon: Home, label: 'Overview', path: '/doctor' },
    { icon: Users, label: 'All Seen Patients', path: '/doctor/patients' },
    { icon: Pill, label: 'Medicine Management', path: '/doctor/medicine-management' },
    { icon: MessageCircle, label: 'Messages', path: '/doctor/messages' },
    { icon: Activity, label: 'Community Health', path: '/doctor/community-health' },
    { icon: Bot, label: 'Chat with AI', path: '/doctor/chat-ai' }
  ];

  return (
    <div 
      className={`fixed left-0 top-0 h-full bg-white shadow-lg transition-all duration-300 ease-in-out ${
        expanded ? 'w-64' : 'w-20'
      } z-50`}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 flex items-center justify-between border-b">
          <div className={`flex items-center ${expanded ? 'justify-between w-full' : 'justify-center'}`}>
            <Heart className="h-8 w-8 text-blue-600" />
            {expanded && <span className="ml-2 font-semibold text-gray-800">MedManage</span>}
          </div>
          <button 
            onClick={onToggle}
            className={`p-2 rounded-full hover:bg-gray-100 transition-transform duration-300 ${
              expanded ? 'rotate-180' : ''
            }`}
          >
            <ChevronRight className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {expanded && (
          <div className="px-4 py-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto">
          <div className="p-2">
            {expanded && (
              <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Main Menu
              </h3>
            )}
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <button
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center p-3 rounded-lg transition-colors duration-150 ${
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="relative">
                        <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                        {item.path.includes('messages') && (
                          <div className="relative">
                            {hasNewMessages && (
                              <div className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full animate-ping" />
                            )}
                            <div className={`absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full ${
                              hasNewMessages ? 'opacity-100' : 'opacity-0'
                            } transition-opacity duration-200`} />
                          </div>
                        )}
                      </div>
                      {expanded && (
                        <span className="ml-3 relative">
                          {item.label}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </div>
    </div>
  );
};