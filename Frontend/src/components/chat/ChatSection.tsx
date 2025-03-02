import React, { useState, useEffect } from 'react';
import { ChatSidebar } from './ChatSidebar';
import { ChatWindow } from './ChatWindow';
import { Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Contact {
  id: string;
  name: string;
  type: 'doctor' | 'assistant';
  online?: boolean;
}

export const ChatSection: React.FC<{ userRole: 'doctor' | 'assistant' }> = ({ userRole }) => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const currentUser = JSON.parse(localStorage.getItem(userRole) || '{}');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleMessageUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
      <ChatSidebar
        onSelectContact={setSelectedContact}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        userRole={userRole}
        currentUserId={userRole === 'assistant' ? currentUser.id : currentUser.ref_id}
        refreshTrigger={refreshTrigger}
      />
      <AnimatePresence mode="wait">
        <motion.div 
          key={selectedContact?.id || 'empty'}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="flex-1 p-4"
        >
          {selectedContact ? (
            <ChatWindow
              recipient={selectedContact}
              onClose={() => setSelectedContact(null)}
              currentUserId={userRole === 'assistant' ? currentUser.id : currentUser.ref_id}
              userRole={userRole}
              onMessageUpdate={handleMessageUpdate}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <Bot className="h-16 w-16 mb-4 text-blue-600" />
              <p className="text-lg">Select a contact to start chatting</p>
              <p className="text-sm mt-2">Or try our AI Assistant for quick help</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};