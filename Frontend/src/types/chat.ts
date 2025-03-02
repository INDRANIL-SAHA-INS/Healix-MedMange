export interface AIResponse {
  response: string;
  error?: string;
}

interface ChatMessage {
  id: string;
  content: string;
  sender: 'doctor' | 'ai'; // Updated from 'user' | 'ai'
  message_type: 'text' | 'image' | 'pdf';
  file_url?: string;
  created_at: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  created_at: string;
}