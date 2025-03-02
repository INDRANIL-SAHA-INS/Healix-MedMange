import React from 'react';
import { Trash2, PlusCircle } from 'lucide-react';
import { ChatSession } from '../../pages/AIChatPage';

interface AIChatSidebarProps {
  chatSessions: ChatSession[];
  onNewChat: () => void;
  onSelectSession: (session: ChatSession) => void;
  onDeleteSession: (sessionId: string) => void;
  selectedSessionId: string | null;
}

export const AIChatSidebar: React.FC<AIChatSidebarProps> = ({
  chatSessions,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  selectedSessionId
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="font-bold">Chat with AI</h2>
        <button onClick={onNewChat} title="New Chat">
          <PlusCircle className="h-6 w-6 text-blue-500" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {chatSessions.map(session => (
          <div
            key={session.id}
            className={`flex justify-between items-center p-2 cursor-pointer hover:bg-gray-100 ${
              selectedSessionId === session.id ? 'bg-gray-200' : ''
            }`}
            onClick={() => onSelectSession(session)}
          >
            <span className="truncate">{session.title}</span>
            <button
              onClick={e => {
                e.stopPropagation();
                onDeleteSession(session.id);
              }}
              title="Delete Chat"
            >
              <Trash2 className="h-5 w-5 text-red-500" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}; 