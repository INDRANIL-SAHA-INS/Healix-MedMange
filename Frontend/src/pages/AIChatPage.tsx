import React, { useState, useEffect } from 'react';
import { AIChatSidebar } from '../components/aiChat/AIChatSidebar';
import { AIChatWindow } from '../components/aiChat/AIChatWindow';
import { supabase } from '../lib/supabase';
import { useDoctor } from '../hooks/useDoctor';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  created_at: string;
  message_type: 'text' | 'image' | 'pdf' | 'file';
  file_url?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
}

export const AIChatPage: React.FC = () => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const { doctor } = useDoctor();

  // Use the onAuthStateChange to track the session
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        fetchChatSessions();  // Fetch chat sessions when the user is authenticated
      } else {
        setChatSessions([]);  // Clear sessions if no user
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  // Fetch chat sessions for the logged-in user
  const fetchChatSessions = async () => {
    if (!doctor) return;
    
    const { data } = await supabase
      .from('ai_chat_sessions')
      .select('*')
      .eq('doctor_id', doctor.id);

    if (data) {
      setChatSessions(data);
    }
  };

  // Handle creating a new chat session
  const handleNewChat = async () => {
    if (!doctor) {
      console.error('No authenticated doctor');
      return;
    }

    const { data, error } = await supabase
      .from('ai_chat_sessions')
      .insert([{
        title: 'New Chat',
        doctor_id: doctor.ref_id
      }])
      .select()
      .single();

    if (error) {
      console.error('Session creation error:', error);
      return;
    }

    if (data) {
      setChatSessions(prev => [data, ...prev]);
      setSelectedSession(data);
    }
  };

  const handleSelectSession = (session: ChatSession) => {
    setSelectedSession(session);
  };

  const handleDeleteSession = (sessionId: string) => {
    setChatSessions(prev => prev.filter(s => s.id !== sessionId));
    if (selectedSession && selectedSession.id === sessionId) {
      setSelectedSession(null);
    }
  };

  const updateSessionMessages = (sessionId: string, messages: ChatMessage[]) => {
    setChatSessions(prev =>
      prev.map(s => (s.id === sessionId ? { ...s, messages } : s))
    );
    if (selectedSession && selectedSession.id === sessionId) {
      setSelectedSession({ ...selectedSession, messages });
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-64 border-r">
        <AIChatSidebar
          chatSessions={chatSessions}
          onNewChat={handleNewChat}
          onSelectSession={handleSelectSession}
          onDeleteSession={handleDeleteSession}
          selectedSessionId={selectedSession ? selectedSession.id : null}
        />
      </div>
      <div className="flex-1">
        {selectedSession ? (
          <AIChatWindow
            session={selectedSession}
            updateSessionMessages={updateSessionMessages}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a chat session to start or create a new chat.
          </div>
        )}
      </div>
    </div>
  );
};
