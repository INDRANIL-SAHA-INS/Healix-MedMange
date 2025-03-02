import React, { useState, useEffect } from 'react';
import { Search, User, Bot } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatDistanceToNow } from 'date-fns';

interface Contact {
  id: string;
  name: string;
  type: 'doctor' | 'assistant' | 'ai';
  lastMessage?: string;
  lastMessageTime?: string;
  online?: boolean;
  messageType?: string;
}

interface ChatSidebarProps {
  onSelectContact: (contact: Contact) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  userRole: 'doctor' | 'assistant';
  currentUserId: string;
  refreshTrigger?: number;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ 
  onSelectContact, 
  searchTerm, 
  onSearchChange,
  userRole,
  currentUserId,
  refreshTrigger
}) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
    subscribeToMessages();
  }, [refreshTrigger]);

  const fetchLastMessage = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${currentUserId},recipient_id.eq.${userId}),` +
          `and(sender_id.eq.${userId},recipient_id.eq.${currentUserId})`
        )
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Error fetching last message:', error);
      return null;
    }
  };

  const fetchContacts = async () => {
    try {
      let userContacts: Contact[] = [];

      if (userRole === 'assistant') {
        const { data: doctors } = await supabase
          .from('doctors')
          .select('ref_id, username');
        
        userContacts = await Promise.all((doctors || []).map(async d => {
          const lastMessage = await fetchLastMessage(d.ref_id);
          return {
            id: d.ref_id,
            name: d.username,
            type: 'doctor' as const,
            online: false,
            lastMessage: lastMessage?.content,
            lastMessageTime: lastMessage?.created_at,
            messageType: lastMessage?.message_type
          };
        }));
      } else {
        const { data: doctors } = await supabase
          .from('doctors')
          .select('ref_id, username')
          .neq('ref_id', currentUserId);

        const { data: assistants } = await supabase
          .from('assistants')
          .select('id, username');

        const doctorContacts = await Promise.all((doctors || []).map(async d => {
          const lastMessage = await fetchLastMessage(d.ref_id);
          return {
            id: d.ref_id,
            name: d.username,
            type: 'doctor' as const,
            online: false,
            lastMessage: lastMessage?.content,
            lastMessageTime: lastMessage?.created_at,
            messageType: lastMessage?.message_type
          };
        }));

        const assistantContacts = await Promise.all((assistants || []).map(async a => {
          const lastMessage = await fetchLastMessage(a.id);
          return {
            id: a.id,
            name: a.username,
            type: 'assistant' as const,
            online: false,
            lastMessage: lastMessage?.content,
            lastMessageTime: lastMessage?.created_at,
            messageType: lastMessage?.message_type
          };
        }));

        userContacts = [...doctorContacts, ...assistantContacts];
      }

      // Sort contacts by last message time
      userContacts.sort((a, b) => {
        if (!a.lastMessageTime) return 1;
        if (!b.lastMessageTime) return -1;
        return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
      });

      setContacts([...userContacts]);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    return supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id.eq.${currentUserId}`
        },
        async () => {
          await fetchContacts();
        }
      )
      .subscribe();
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

  const formatMessageTime = (timestamp: string) => {
    if (!timestamp) return '';
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-80 bg-white border-r h-full">
      <div className="p-4 border-b">
        <div className="relative">
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
        </div>
      </div>

      <div className="overflow-y-auto h-[calc(100%-5rem)]">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          filteredContacts.map(contact => (
            <button
              key={contact.id}
              onClick={() => onSelectContact(contact)}
              className="w-full p-4 flex items-center hover:bg-gray-50 border-b transition-colors relative"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  {contact.type === 'ai' ? (
                    <Bot className="w-6 h-6 text-blue-600" />
                  ) : (
                    <User className="w-6 h-6 text-blue-600" />
                  )}
                </div>
                {contact.online && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></span>
                )}
              </div>
              <div className="ml-3 flex-1 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{contact.name}</span>
                  {contact.lastMessageTime && (
                    <span className="text-xs text-gray-500">
                      {formatMessageTime(contact.lastMessageTime)}
                    </span>
                  )}
                </div>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                    {contact.type}
                  </span>
                  {contact.lastMessage && (
                    <span className="ml-2 text-sm text-gray-500 truncate">
                      {getMessagePreview(contact.lastMessage, contact.messageType || '')}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};