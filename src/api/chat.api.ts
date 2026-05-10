
import apiClient from './axios';
import type {
  ChatMessage,
  ChatResponse,
  SendMessageBody,
} from '../types/chat.types';
import type { ApiResponse } from '../types/auth.types';

export const chatApi = {

  // POST /api/chat/send
  // Send message to Groq AI, get response
  // Returns both the user message and AI response
  send: async (body: SendMessageBody): Promise<ChatResponse> => {
    const res = await apiClient.post<ApiResponse<ChatResponse>>(
      '/chat/send',
      body
    );
    return res.data.data;
  },

  // GET /api/chat/history
  // Returns full chat history for the logged-in user
  getHistory: async (): Promise<ChatMessage[]> => {
    const res = await apiClient.get<ApiResponse<{ messages: ChatMessage[] }>>(
      '/chat/history'
    );
    return res.data.data.messages;
  },

  // DELETE /api/chat/history
  // Clears all chat messages for the logged-in user
  clearHistory: async (): Promise<void> => {
    await apiClient.delete('/chat/history');
  },
};