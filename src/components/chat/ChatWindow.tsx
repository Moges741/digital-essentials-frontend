
import { useEffect, useRef } from 'react';
import { Bot }               from 'lucide-react';
import ChatMessage           from './ChatMessage';
import type { ChatMessage as ChatMessageType } from '../../types/chat.types';
import Spinner               from '../ui/Spinner';

interface ChatWindowProps {
  messages:  ChatMessageType[];
  isLoading: boolean;   // AI is responding (typing indicator)
}

const ChatWindow = ({ messages, isLoading }: ChatWindowProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Empty state
  if (!messages.length && !isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center
                        gap-4 text-center px-4">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl
                          flex items-center justify-center">
          <Bot size={32} className="text-gray-400" />
        </div>
        <div>
          <p className="text-base font-semibold text-gray-700">
            AI Assistant
          </p>
          <p className="text-sm text-gray-400 mt-1 max-w-xs">
            Ask me anything about digital skills — smartphones,
            internet safety, or using apps.
          </p>
        </div>

        {/* Suggestion chips */}
        <div className="flex flex-wrap gap-2 justify-center mt-2">
          {[
            'How do I stay safe online?',
            'What is a strong password?',
            'How do I use email?',
            'What is the internet?',
          ].map((suggestion) => (
            <span
              key={suggestion}
              className="px-3 py-1.5 bg-primary-50 text-primary-700
                           rounded-full text-xs font-medium border
                           border-primary-200"
            >
              {suggestion}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">

      {messages.map((message) => (
        <ChatMessage key={message.message_id} message={message} />
      ))}

      {/* Typing indicator — shown while AI is responding */}
      {isLoading && (
        <div className="flex items-end gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gray-100
                            flex items-center justify-center
                            border border-gray-200 flex-shrink-0">
            <Bot size={16} className="text-gray-600" />
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl
                            rounded-bl-sm px-4 py-3 shadow-sm">
            <div className="flex items-center gap-1.5">
              <Spinner size="sm" color="dark" />
              <span className="text-xs text-gray-400">
                AI is thinking...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Invisible div at bottom for auto-scroll */}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatWindow;