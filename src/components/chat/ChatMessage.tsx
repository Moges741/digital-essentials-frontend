
import { Bot }          from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '../../types/chat.types';
import { useAuthStore } from '../../store/auth.store';
import { formatRelative } from '../../utils/format';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const user      = useAuthStore((s) => s.user);
  const isUser    = message.role === 'user';
  const initial   = user?.name?.charAt(0).toUpperCase() ?? 'U';

  return (
    <div className={`flex items-end gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>

      {/* Avatar */}
      {isUser ? (
        <div className="w-8 h-8 rounded-full bg-primary-600
                          flex items-center justify-center
                          text-white text-xs font-bold flex-shrink-0">
          {initial}
        </div>
      ) : (
        <div className="w-8 h-8 rounded-full bg-gray-100
                          flex items-center justify-center flex-shrink-0
                          border border-gray-200">
          <Bot size={16} className="text-gray-600" />
        </div>
      )}

      {/* Bubble */}
      <div className={`
        flex flex-col gap-1 max-w-[75%]
        ${isUser ? 'items-end' : 'items-start'}
      `}>
        <div className={`
          px-4 py-3 rounded-2xl text-sm leading-relaxed
          ${isUser
            ? 'bg-primary-600 text-white rounded-br-sm'
            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
          }
        `}>
          {/* Preserve line breaks from AI responses */}
          {message.content.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              {i < message.content.split('\n').length - 1 && <br />}
            </span>
          ))}
        </div>

        {/* Timestamp */}
        <span className="text-xs text-gray-400 px-1">
          {formatRelative(message.created_at)}
        </span>
      </div>

    </div>
  );
};

export default ChatMessage;