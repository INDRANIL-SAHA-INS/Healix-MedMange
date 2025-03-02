import React, { useState, useEffect } from 'react';
import { Search, User, Clock, Bot, FileText, Volume2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatDistanceToNow } from 'date-fns';

interface ChatUser {
  id: string;
  name: string;
  type: 'doctor' | 'assistant' | 'ai';
  lastMessage?: string;
  lastMessageTime?: string;
  online?: boolean;
  messageType?: string;
}

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  message_type: 'text' | 'voice' | 'pdf';
}

export const ChatList = () => {
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem('doctor') || '{}');

  useEffect(() => {
    const initializeChat = async () => {
      await fetchUsers();
      subscribeToMessages();
      subscribeToPresence();
    };

    initializeChat();
  }, []);

  const fetchUsers = async () => {
    try {
      const [{ data: doctors }, { data: assistants }] = await Promise.all([
        supabase.from('doctors').select('ref_id, username').neq('ref_id', currentUser.ref_id),
        supabase.from('assistants').select('id, username')
      ]);

      const userPromises = [
        ...(doctors || []).map(d => ({
          id: d.ref_id,
          name: d.username,
          type: 'doctor' as const,
        })),
        ...(assistants || []).map(a => ({
          id: a.id,
          name: a.username,
          type: 'assistant' as const,
        }))
      ];

      const lastMessagesPromise = supabase
        .from('messages')
        .select('*')
        .or(
          `sender_id.eq.${currentUser.ref_id},recipient_id.eq.${currentUser.ref_id}`
        )
        .order('created_at', { ascending: false });

      const [users, { data: messages }] = await Promise.all([
        Promise.all(userPromises),
        lastMessagesPromise
      ]);

      const userMap = new Map();
      messages?.forEach(msg => {
        const otherId = msg.sender_id === currentUser.ref_id ? msg.recipient_id : msg.sender_id;
        if (!userMap.has(otherId) || new Date(userMap.get(otherId).lastMessageTime) < new Date(msg.created_at)) {
          userMap.set(otherId, {
            lastMessage: msg.content,
            lastMessageTime: msg.created_at,
            messageType: msg.message_type
          });
        }
      });

      const enrichedUsers = users.map(user => ({
        ...user,
        ...userMap.get(user.id),
        online: false
      }));

      const sortedUsers = enrichedUsers.sort((a, b) => {
        if (!a.lastMessageTime) return 1;
        if (!b.lastMessageTime) return -1;
        return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
      });

      setUsers([...sortedUsers]);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    supabase
      .channel('new-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id.eq.${currentUser.ref_id}`
        },
        async (payload) => {
          await fetchUsers();
        }
      )
      .subscribe();
  };

  const subscribeToPresence = () => {
    const presenceChannel = supabase.channel('online-users');

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        updateOnlineStatus(state);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        updateOnlineStatus({ [key]: newPresences });
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        updateOnlineStatus({ [key]: leftPresences }, true);
      })
      .subscribe();

    presenceChannel.track({
      user_id: currentUser.ref_id,
      online_at: new Date().toISOString(),
    });
  };

  const updateOnlineStatus = (state: any, isLeaving = false) => {
    setUsers(prevUsers => 
      prevUsers.map(user => ({
        ...user,
        online: user.type === 'ai' ? true : isLeaving ? false : !!state[user.id]
      }))
    );
  };

  const formatMessageTime = (timestamp: string) => {
    if (!timestamp) return '';
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  const getMessagePreview = (message: string, type: string) => {
    if (!message) return '';
    switch (type) {
      case 'voice':
        return '🎤 Voice message';
      case 'pdf':
        return '📄 PDF document';
      case 'image':
        return '📷 Image';
      case 'video':
        return '🎥 Video';
      default:
        return message.length > 30 ? `${message.substring(0, 30)}...` : message;
    }
  };

  const filteredUsers = users
    .filter(user =>
      user.type === 'ai' || user.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (a.type === 'ai') return -1;
      if (b.type === 'ai') return 1;
      if (!a.lastMessageTime) return 1;
      if (!b.lastMessageTime) return -1;
      return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
    });

  return (
    <div className="h-full flex flex-col bg-white border-r">
      <div className="p-4 border-b">
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="divide-y">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors relative"
              >
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center relative">
                    {user.type === 'ai' ? (
                      <Bot className="h-5 w-5 text-blue-600" />
                    ) : (
                      <User className="h-5 w-5 text-blue-600" />
                    )}
                    {user.online && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></span>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                          {user.type}
                        </span>
                      </div>
                      {user.lastMessageTime && (
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatMessageTime(user.lastMessageTime)}
                        </span>
                      )}
                    </div>
                    {user.lastMessage && (
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-gray-500 truncate flex-1">
                          {getMessagePreview(user.lastMessage, user.messageType || '')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};