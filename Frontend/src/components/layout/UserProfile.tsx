import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { useDoctor } from '../../hooks/useDoctor';
import { supabase } from '../../lib/supabase';

interface UserProfileProps {
  userName: string;
  userType?: 'doctor' | 'assistant';
}

export const UserProfile: React.FC<UserProfileProps> = ({ userName, userType = 'doctor' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { doctor } = useDoctor();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      // Clear all user-related storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      // Use auth listener for reliable navigation
      supabase.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_OUT') {
          navigate('/choose-role');
          window.location.reload(); // Force clear any residual state
        }
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Logout error:', error);
      navigate('/choose-role'); // Fallback navigation
    }
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
          <User className="h-5 w-5 text-blue-600" />
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-2 z-50">
          <div className="px-4 py-2 border-b">
            <p className="text-sm font-medium text-gray-900">{doctor?.username}</p>
            <p className="text-xs text-gray-500">{userType.charAt(0).toUpperCase() + userType.slice(1)}</p>
            <p className="text-xs text-gray-500 mt-1">{today}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};