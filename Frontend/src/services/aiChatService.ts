import { AIResponse, ChatMessage } from '../types/chat';

interface ChatResponse {
  response: string;
  error?: string;
}

interface EmailRequest {
  to: string;
  subject: string;
  body: string;
}

export const aiChatService = {
  sendMessage: async (
    question: string,
    option: string,
    imgurl: string,
    conversationsNew: Array<{ role: string; content: string }>,
    visit_patient_id: string | null
  ) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/doctor/chat-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          option,
          imgurl,
          conversationsNew,
          visit_patient_id
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in aiChatService:', error);
      throw error;
    }
  }
};