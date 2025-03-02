import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Paperclip, Send, Mic, MicOff, Type, Download, Image as ImageIcon } from 'lucide-react';
import { ChatMessage, ChatSession, AIResponse } from '../../types/chat';
import { aiChatService } from '../../services/aiChatService';
import { supabase } from '../../lib/supabase';

interface AIChatWindowProps {
  session: ChatSession;
  updateSessionMessages: (sessionId: string, messages: ChatMessage[]) => void;
}

const useWebSocket = (sessionId: string) => {
  const fullUrl = `${import.meta.env.VITE_WS_BASE_URL}/ws/${sessionId}`;

  // Add connection state tracking
  const [connectionState, setConnectionState] = useState<number>(WebSocket.CONNECTING);

  const connect = useCallback(() => {
    const socket = new WebSocket(fullUrl);
    
    socket.onopen = () => {
      console.log('🟢 WebSocket connected');
      setConnectionState(WebSocket.OPEN);
    };

    socket.onclose = (event) => {
      console.log(`🔴 Closed: Code ${event.code}, Reason: ${event.reason}`);
      setConnectionState(WebSocket.CLOSED);
    };

    socket.onerror = (error) => {
      console.error('⚠️ WebSocket error:', error);
      setConnectionState(WebSocket.CLOSED);
    };

    return socket;
  }, [fullUrl]);

  // Render connection state in component
  return { connectionState };
};

// Add this component before the main AIChatWindow component
const LoadingDots: React.FC = () => (
  <div className="flex space-x-2 p-3 bg-white text-gray-900 shadow rounded-lg">
    <div className="flex space-x-2">
      <div className="w-2 h-2 bg-gray-600 rounded-full animate-blink" style={{ animationDelay: '0s' }}></div>
      <div className="w-2 h-2 bg-gray-600 rounded-full animate-blink" style={{ animationDelay: '0.3s' }}></div>
      <div className="w-2 h-2 bg-gray-600 rounded-full animate-blink" style={{ animationDelay: '0.6s' }}></div>
    </div>
  </div>
);

// Update the interface for the backend payload
interface AIRequestPayload {
  question: string;
  option: string;
  imgurl: string;
  conversationsNew: Array<{
    role: string;
    content: string;
  }>;
  visit_patient_id: string | null;
  is_new_chat: boolean;
}

export const AIChatWindow: React.FC<AIChatWindowProps> = ({
  session,
  updateSessionMessages
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(session.messages || []);
  const [isRecording, setIsRecording] = useState(false);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const { connectionState } = useWebSocket(session.id);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cachedSummary, setCachedSummary] = useState<{ [key: string]: string }>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isNewChat, setIsNewChat] = useState(true);

  // Add these with other state declarations
  const [patientId, setPatientId] = useState<string>('');
  const [visits, setVisits] = useState<Array<{ visit_patient_id: string }>>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Modify the useEffect that runs when session changes
  useEffect(() => {
    // Clear messages when component mounts or session changes
    setMessages([]);
    updateSessionMessages(session.id, []);
    
    // Don't store or cache any summary
    setCachedSummary({});
    
    // Reset other states
    setNewMessage('');
    setSelectedFile(null);
    setSelectedOption(null);
    setPatientId(''); // Reset patient ID
    
    // Set isNewChat to true when a new session is opened
    setIsNewChat(true);
    
  }, [session.id]);

  useEffect(() => {
    setMessages(session.messages || []);
  }, [session]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setNewMessage(prev => prev + ' ' + transcript);
      };

      recognition.onerror = (event: any) => {
        setRecognitionError('Error occurred in recognition: ' + event.error);
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } else {
      setRecognitionError('Speech recognition not supported in this browser');
    }
  }, []);

  // Add this with your other useEffect hooks
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '40px';
    }
  }, [newMessage === '']); // Reset height when message is cleared

  const fetchPatientIds = async () => {
    try {
      const { data, error } = await supabase
        .from('patient_health_records')
        .select('visit_patient_id');
  
      if (error) throw error;
  
      // Filter out records with null visit_patient_id
      const filteredData = data.filter(record => record.visit_patient_id);
  
      // Remove duplicates using a Set
      const uniqueIds = Array.from(new Set(filteredData.map(record => record.visit_patient_id)))
        .map(id => ({ visit_patient_id: id }));
  
      setVisits(uniqueIds);
    } catch (error) {
      console.error('Error fetching patient ids:', error);
    }
  };
  
  useEffect(() => {
    fetchPatientIds();
  }, []);
  // Add this useEffect for handling clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen && !event.target?.closest('.patient-id-selector')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const toggleVoiceInput = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      setRecognitionError(null);
      recognitionRef.current?.start();
    }
    setIsRecording(!isRecording);
  };

  const handleFileSelect = (file: File) => {
    if (file) {
      setSelectedFile(file);
    }
  };

  // Modify the handleSend function's payload creation
  const handleSend = async () => {
    if (!newMessage.trim() && !selectedFile) {
      return;
    }

    setIsLoading(true);
    
    try {
      let fileUrl = '';
      
      // Handle file upload if present
      if (selectedFile) {
        try {
          setIsUploading(true);
          
          // Validate file
          if (selectedFile.size > 5 * 1024 * 1024) {
            throw new Error('File size must be less than 5MB');
          }
      
          if (!selectedFile.type.startsWith('image/')) {
            throw new Error('Only image files are allowed');
          }
      
          // Create file path
          const fileExt = selectedFile.name.split('.').pop();
          const sanitizedName = selectedFile.name.replace(/[^a-zA-Z0-9]/g, '');
          const fileName = `${Date.now()}-${sanitizedName}.${fileExt}`;
          const filePath = `${session.id}/${fileName}`;
      
          // Upload to Supabase
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('chat-attachments')
            .upload(filePath, selectedFile, {
              cacheControl: '3600',
              upsert: false,
            });
      
          if (uploadError) throw uploadError;
      
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('chat-attachments')
            .getPublicUrl(filePath);
          
          fileUrl = publicUrl;
        } catch (error) {
          console.error('Error uploading file:', error);
          throw error;
        } finally {
          setIsUploading(false);
          setUploadProgress(0);
        }
      }

      // Create message object
      const messageObj: ChatMessage = {
        id: Date.now().toString(),
        sender: 'doctor',
        content: newMessage || '',
        created_at: new Date().toISOString(),
        message_type: selectedFile ? 'image' : 'text',
        file_url: fileUrl || undefined
      };

      // Update messages array and UI
      const updatedMessages = [...messages, messageObj];
      setMessages(updatedMessages);
      updateSessionMessages(session.id, updatedMessages);

      try {
        // Format conversations for AI service
        const conversationsNew = updatedMessages.map(msg => ({
          role: msg.sender === 'doctor' ? 'user' : 'assistant',
          content: msg.content
        }));

        // Format payload for Python Flask server - send null if patientId is empty
        const aiPayload: AIRequestPayload = {
          question: messageObj.content || "Analyze this image",
          option: selectedOption || 'general',
          imgurl: fileUrl || '',
          conversationsNew: conversationsNew,
          visit_patient_id: patientId.trim() || null, // Will be null if empty string
          is_new_chat: isNewChat // Send the new chat flag
        };

        console.log('Sending to AI service:', {
          url: `${import.meta.env.VITE_API_URL}/doctor/chat-ai`,
          payload: aiPayload
        });

        const response = await aiChatService.sendMessage(
          aiPayload.question,
          aiPayload.option,
          aiPayload.imgurl,
          aiPayload.conversationsNew,
          aiPayload.visit_patient_id,
          aiPayload.is_new_chat // Send the new chat flag
        );

        // After sending the first message, set isNewChat to false
        setIsNewChat(false);

        if (!response || !response.response) {
          throw new Error('Invalid response format from server');
        }

        // Remove summary storage
        if (response && response.response) {
          const aiResponse: ChatMessage = {
            id: Date.now().toString(),
            sender: 'ai',
            content: response.response,
            created_at: new Date().toISOString(),
            message_type: 'text'
          };

          const newMessages = [...updatedMessages, aiResponse];
          setMessages(newMessages);
          updateSessionMessages(session.id, newMessages);
        }

      } catch (error) {
        console.error('Error in AI communication:', error);
        const errorMessage: ChatMessage = {
          id: Date.now().toString(),
          sender: 'system',
          content: 'Error connecting to AI service. Please try again.',
          created_at: new Date().toISOString(),
          message_type: 'text'
        };
        const newMessages = [...updatedMessages, errorMessage];
        setMessages(newMessages);
        updateSessionMessages(session.id, newMessages);
      }

      // Clear inputs
      setNewMessage('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Error in handleSend:', error);
      alert(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleOptionClick = (option: string, message: string) => {
    if (selectedOption === option) {
      setSelectedOption(null);
      setNewMessage('');
    } else {
      setSelectedOption(option);
      setNewMessage(message);
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    
    // Calculate new height (with max-height of 150px)
    const newHeight = Math.min(textarea.scrollHeight, 150);
    
    // Set the new height
    textarea.style.height = `${newHeight}px`;
    
    // Update the message state
    setNewMessage(textarea.value);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'doctor' ? 'justify-end' : 'justify-start'} mb-4`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                msg.sender === 'doctor'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-900 shadow'
              }`}
            >
              {/* Show text content if exists */}
              {msg.content && (
                <p className="whitespace-pre-wrap break-words mb-2">{msg.content}</p>
              )}
              
              {/* Show image if exists */}
              {msg.message_type === 'image' && msg.file_url && (
                <div className="relative group">
                  {/* ... your existing image display code ... */}
                </div>
              )}
              
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className={`opacity-70 ${msg.sender === 'doctor' ? 'text-white' : 'text-gray-500'}`}>
                  {new Date(msg.created_at).toLocaleTimeString()}
                </span>
                {msg.message_type === 'image' && (
                  <span className={`ml-2 ${msg.sender === 'doctor' ? 'text-white' : 'text-gray-500'} opacity-70`}>
                    📷 Image
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <LoadingDots />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t">
        <div className="flex gap-2 mb-2 flex-wrap">
          <button
            onClick={() => handleOptionClick('symptoms', 'What are the symptoms? ')}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${
              selectedOption === 'symptoms'
                ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            } ${selectedOption && selectedOption !== 'symptoms' ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={selectedOption && selectedOption !== 'symptoms'}
          >
            A) Symptoms
          </button>
          <button
            onClick={() => handleOptionClick('diagnosis', 'Please explain the diagnosis. ')}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${
              selectedOption === 'diagnosis'
                ? 'bg-green-600 text-white ring-2 ring-green-300'
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            } ${selectedOption && selectedOption !== 'diagnosis' ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={selectedOption && selectedOption !== 'diagnosis'}
          >
            B) Diagnosis
          </button>
          <button
            onClick={() => handleOptionClick('treatment', 'Suggest treatment options. ')}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${
              selectedOption === 'treatment'
                ? 'bg-purple-600 text-white ring-2 ring-purple-300'
                : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
            } ${selectedOption && selectedOption !== 'treatment' ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={selectedOption && selectedOption !== 'treatment'}
          >
            C) Treatment
          </button>
          <button
            onClick={() => handleOptionClick('precautions', 'Any precautions to take? ')}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${
              selectedOption === 'precautions'
                ? 'bg-yellow-600 text-white ring-2 ring-yellow-300'
                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
            } ${selectedOption && selectedOption !== 'precautions' ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={selectedOption && selectedOption !== 'precautions'}
          >
            D) Precautions
          </button>
          <button
            onClick={() => handleOptionClick('rare', 'What are the rare and complex aspects of this condition? ')}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${
              selectedOption === 'rare'
                ? 'bg-red-600 text-white ring-2 ring-red-300'
                : 'bg-red-100 text-red-800 hover:bg-red-200'
            } ${selectedOption && selectedOption !== 'rare' ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={selectedOption && selectedOption !== 'rare'}
          >
            E) Rare and Complex
          </button>
        </div>
        <div className="flex items-center">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleFileSelect(file);
              }
            }}
          />
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="p-2 hover:bg-gray-100 rounded-full"
            disabled={isUploading}
          >
            <Paperclip className={`h-6 w-6 ${isUploading ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
          {selectedFile && (
            <div className="ml-2 text-sm text-gray-500">
              📎 {selectedFile.name}
            </div>
          )}
          <button
            onClick={toggleVoiceInput}
            className={`p-2 ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-500'}`}
            title={isRecording ? 'Stop recording' : 'Start recording'}
          >
            {isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </button>
          <textarea
            value={newMessage}
            onChange={handleTextareaInput}
            onKeyPress={handleKeyPress}
            placeholder="Type or speak your message..."
            className="flex-1 border rounded-md p-2 mx-2 resize-none"
            rows={1}
            ref={textareaRef}
          />
          <div className="flex items-center gap-2">
            <div className="relative patient-id-selector">
              <div className="flex items-center border rounded-md">
                <input
                  type="text"
                  value={patientId}
                  onChange={(e) => {
                    setPatientId(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder="Patient ID"
                  className="w-32 px-2 py-1 text-sm"
                />
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="px-2 py-1 text-gray-500 hover:text-gray-700"
                >
                  ▼
                </button>
              </div>
              
              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {visits
                    .filter(v => v.visit_patient_id.toLowerCase().includes(patientId.toLowerCase()))
                    .map((visit) => (
                      <div
                        key={visit.visit_patient_id}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                        onClick={() => {
                          setPatientId(visit.visit_patient_id);
                          setIsDropdownOpen(false);
                        }}
                      >
                        {visit.visit_patient_id}
                      </div>
                    ))}
                </div>
              )}
            </div>
            
            <button 
              onClick={handleSend} 
              className="p-2 hover:bg-gray-100 rounded-full"
              disabled={isLoading}
            >
              <Send className={`h-6 w-6 ${isLoading ? 'text-gray-300' : 'text-blue-500'}`} />
            </button>
          </div>
        </div>
        {recognitionError && (
          <div className="text-red-500 text-sm mt-2">{recognitionError}</div>
        )}
      </div>
    </div>
  );
};

// Add these classes to your global CSS or tailwind.config.js
