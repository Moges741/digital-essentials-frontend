
export interface ChatMessage {
  message_id: number;
  user_id:    number;
  role:       'user' | 'assistant';
  content:    string;
  created_at: string;
}

export interface SendMessageBody {
  message: string;
}

export interface ChatResponse {
  user_message: ChatMessage;
  ai_message: ChatMessage;
  session_id: string;
}