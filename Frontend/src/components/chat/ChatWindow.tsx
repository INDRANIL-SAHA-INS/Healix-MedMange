import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Paperclip, X, Image, Video, User, Bot, Download, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: string;
  sender_id: string;
  sender_type: 'doctor' | 'assistant';
  recipient_id: string;
  recipient_type: 'doctor' | 'assistant';
  content: string;
  message_type: 'text' | 'image' | 'video' | 'pdf';
  file_url?: string;
  created_at: string;
}

interface ChatWindowProps {
  recipient: {
    id: string;
    name: string;
    type: 'doctor' | 'assistant' | 'ai';
    online?: boolean;
  };
  onClose: () => void;
  currentUserId: string;
  userRole: 'doctor' | 'assistant';
  onMessageUpdate?: () => void;
}

interface MessageProps {
  message: Message;
  isCurrentUser: boolean;
}

const STORAGE_BUCKET = 'chat-files';

const MessageItem: React.FC<MessageProps> = ({ message, isCurrentUser }) => {
  const [isImageLoading, setIsImageLoading] = useState(true);

  const renderFileContent = () => {
    switch (message.message_type) {
      case 'image':
        return (
          <div className="relative max-w-sm">
            {isImageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
            <img
              src={message.file_url}
              alt={message.content}
              className={`rounded-lg max-w-full h-auto cursor-pointer transition-opacity duration-200 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
              onLoad={() => setIsImageLoading(false)}
              onClick={() => window.open(message.file_url, '_blank')}
            />
          </div>
        );

      case 'pdf':
        return (
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <FileText className="h-8 w-8 text-red-500" />
            <div className="flex-1">
              <p className="text-sm font-medium">{message.content}</p>
              <p className="text-xs text-gray-500">PDF Document</p>
            </div>
          </div>
        );

      default:
        return <p className="text-sm">{message.content}</p>;
    }
  };

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] rounded-lg p-3 ${
        isCurrentUser ? 'bg-blue-600 text-white' : 'bg-white border shadow-sm'
      }`}>
        {renderFileContent()}
        <div className="mt-1 flex items-center justify-between text-xs opacity-70">
          <span>{new Date(message.created_at).toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

export const ChatWindow: React.FC<ChatWindowProps> = ({ 
  recipient, 
  onClose, 
  currentUserId,
  userRole,
  onMessageUpdate 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<'image' | 'video' | 'pdf' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUserId},recipient_id.eq.${recipient.id}),and(sender_id.eq.${recipient.id},recipient_id.eq.${currentUserId})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, recipient.id]);

  const subscribeToMessages = useCallback(() => {
    return supabase
      .channel(`messages:${currentUserId}-${recipient.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id.eq.${currentUserId},recipient_id.eq.${recipient.id}),and(sender_id.eq.${recipient.id},recipient_id.eq.${currentUserId}))`
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages(prev => {
              // Check if message already exists using a more robust check
              const exists = prev.some(msg => 
                msg.id === payload.new.id || 
                (msg.content === payload.new.content && 
                 msg.created_at === payload.new.created_at &&
                 msg.sender_id === payload.new.sender_id)
              );
              return exists ? prev : [...prev, payload.new as Message];
            });
          } else if (payload.eventType === 'DELETE') {
            setMessages(prev => prev.filter(msg => 
              msg.id !== payload.old.id && 
              !msg.id.startsWith(`deletion-${payload.old.id}`)
            ));
          }
        }
      )
      .subscribe();
  }, [currentUserId, recipient.id]);

  useEffect(() => {
    const fetchAndSubscribe = async () => {
      await fetchMessages();
      const subscription = subscribeToMessages();
      return () => subscription.unsubscribe();
    };

    fetchAndSubscribe();
  }, [fetchMessages, subscribeToMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!newMessage.trim() && !selectedFile) return;

    try {
      const tempId = `temp-${uuidv4()}`; // Generate unique temporary ID
      
      // Create optimistic message with unique ID
      const optimisticMessage = {
        id: tempId,
        sender_id: currentUserId,
        sender_type: userRole,
        recipient_id: recipient.id,
        recipient_type: recipient.type === 'ai' ? 'assistant' : recipient.type,
        content: newMessage.trim(),
        message_type: 'text',
        created_at: new Date().toISOString()
      } as Message;

      // Update UI immediately
      setMessages(prev => [...prev, optimisticMessage]);
      setNewMessage('');

      // Insert into database
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          sender_id: currentUserId,
          sender_type: userRole,
          recipient_id: recipient.id,
          recipient_type: recipient.type === 'ai' ? 'assistant' : recipient.type,
          content: newMessage.trim(),
          message_type: 'text',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error inserting message:', error);
        // Remove the optimistic message on error
        setMessages(prev => prev.filter(msg => msg.id !== tempId));
        throw error;
      }

      if (!data) {
        console.warn('No message data returned');
        return;
      }

      // Replace optimistic message with real one
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? data : msg
      ));

      if (onMessageUpdate) onMessageUpdate();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'pdf') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = {
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      video: ['video/mp4', 'video/webm'],
      pdf: ['application/pdf']
    };

    if (!validTypes[type].includes(file.type)) {
      alert(`Please select a valid ${type} file`);
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setUploadType(type);
    setShowAttachMenu(false);
  };

  const handleSendFile = async () => {
    if (!selectedFile || !uploadType || isUploading) return;

    // Validate file size
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > MAX_FILE_SIZE) {
      alert("File size must be less than 10MB");
      return;
    }

    // Validate file type
    const allowedTypes = {
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      pdf: ['application/pdf'],
      video: ['video/mp4', 'video/webm'],
    };

    if (!allowedTypes[uploadType]?.includes(selectedFile.type)) {
      alert(`Invalid file type for ${uploadType}`);
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = selectedFile.name.split(".").pop()?.toLowerCase();
      const uniqueFileName = `${currentUserId}/${Date.now()}-${uuidv4()}.${fileExt}`;

      // Upload file with retry logic
      let uploadAttempts = 0;
      const maxAttempts = 3;
      let uploadData;
      let uploadError;

      while (uploadAttempts < maxAttempts) {
        const result = await supabase.storage
          .from("chat-files")
          .upload(uniqueFileName, selectedFile, {
            cacheControl: "3600",
            contentType: selectedFile.type,
            upsert: false
          });

        if (!result.error) {
          uploadData = result.data;
          break;
        }

        uploadError = result.error;
        uploadAttempts++;
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
      }

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("chat-files")
        .getPublicUrl(uniqueFileName);

      if (!urlData?.publicUrl) throw new Error("Failed to get public URL");

      // Create optimistic message
      const optimisticMessage = {
        id: `temp-${uuidv4()}`,
        sender_id: currentUserId,
        sender_type: userRole,
        recipient_id: recipient.id,
        recipient_type: recipient.type === 'ai' ? 'assistant' : recipient.type,
        content: selectedFile.name,
        message_type: uploadType,
        file_url: urlData.publicUrl,
        created_at: new Date().toISOString(),
      };

      // Update UI immediately
      setMessages(prev => [...prev, optimisticMessage]);
      setSelectedFile(null);
      setUploadType(null);

      // Insert message into database
      const { data: newMessage, error: messageError } = await supabase
        .from("messages")
        .insert([{
          ...optimisticMessage,
          id: undefined // Let the database generate the ID
        }])
        .select()
        .single();

      if (messageError) throw messageError;

      // Replace optimistic message with real one
      setMessages(prev => 
        prev.map(msg => msg.id === optimisticMessage.id ? newMessage : msg)
      );

      if (onMessageUpdate) onMessageUpdate();
    } catch (error) {
      console.error("Upload error:", error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => !msg.id.toString().startsWith('temp-')));
      alert("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center relative">
            {recipient.type === 'ai' ? (
              <Bot className="h-5 w-5 text-blue-600" />
            ) : (
              <User className="h-5 w-5 text-blue-600" />
            )}
            {recipient.online && (
              <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></span>
            )}
          </div>
          <div className="ml-3">
            <h3 className="font-medium text-gray-900">{recipient.name}</h3>
            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              {recipient.type}
            </span>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {messages
              .filter((msg, index, self) => 
                // Remove duplicates based on ID and content
                index === self.findIndex(m => 
                  m.id === msg.id || 
                  (m.content === msg.content && 
                   m.created_at === msg.created_at &&
                   m.sender_id === msg.sender_id)
                )
              )
              .map((msg) => (
                <MessageItem
                  key={msg.id}
                  message={msg}
                  isCurrentUser={msg.sender_id === currentUserId}
                />
              ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="p-4 border-t">
        {selectedFile && (
          <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg mb-4">
            <div className="flex items-center">
              <span className="text-blue-600">{selectedFile.name}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSendFile}
                disabled={isUploading}
                className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  'Send File'
                )}
              </button>
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setUploadType(null);
                }}
                disabled={isUploading}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="flex space-x-2 p-4 border-t">
          <div className="relative">
            <button
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            
            {showAttachMenu && (
              <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden">
                <label className="block cursor-pointer p-3 hover:bg-gray-50">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'image')}
                  />
                  <div className="flex items-center">
                    <Image className="h-5 w-5 mr-2 text-blue-500" />
                    <span>Image</span>
                  </div>
                </label>
                
                <label className="block cursor-pointer p-3 hover:bg-gray-50">
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'pdf')}
                  />
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-red-500" />
                    <span>PDF</span>
                  </div>
                </label>
              </div>
            )}
          </div>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-full focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};