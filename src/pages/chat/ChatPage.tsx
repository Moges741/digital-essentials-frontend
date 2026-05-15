
import { useState, useRef,  } from 'react';
import type {KeyboardEvent} from 'react';
import { Link } from 'react-router-dom';
import { Send, Trash2, MessageCircle, ChevronLeft }      from 'lucide-react';
import { useChatHistory, useSendMessage, useClearChat } from '../../hooks/useChat';
import ChatWindow          from '../../components/chat/ChatWindow';
import Button              from '../../components/ui/Button';
import { ConfirmModal }    from '../../components/ui/Modal';
import { PageSpinner }     from '../../components/ui/Spinner';

const ChatPage = () => {
  const [input,       setInput]       = useState('');
  const [showClear,   setShowClear]   = useState(false);
  const textareaRef                   = useRef<HTMLTextAreaElement>(null);

  const { data: messages, isLoading: historyLoading } = useChatHistory();
  const { mutate: send,   isPending: sending }        = useSendMessage();
  const { mutate: clear,  isPending: clearing }       = useClearChat();

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    send(
      { message: trimmed },
      {
        onSuccess: () => {
          setInput('');
          // Reset textarea height
          if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
          }
        },
      }
    );
  };

  // Enter sends, Shift+Enter adds new line
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea as user types
  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const handleClearConfirm = () => {
    clear(undefined, { onSuccess: () => setShowClear(false) });
  };

  if (historyLoading) return <PageSpinner />;

  const messageCount = messages?.length ?? 0;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">

      {/* Back to home breadcrumb */}
      <div className="px-6 pt-4">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-primary-600 hover:underline">
          <ChevronLeft size={14} />
          Home
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4
                       border-b border-gray-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-600 rounded-xl
                            flex items-center justify-center">
            <MessageCircle size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900">
              AI Assistant
            </h1>
            <p className="text-xs text-gray-500">
              {messageCount > 0
                ? `${messageCount} message${messageCount !== 1 ? 's' : ''} in history`
                : 'Ask anything about digital skills'
              }
            </p>
          </div>
        </div>

        {/* Clear button — only show if there are messages */}
        {messageCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Trash2 size={14} />}
            onClick={() => setShowClear(true)}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-hidden flex flex-col bg-gray-50">
        <ChatWindow
          messages={messages ?? []}
          isLoading={sending}
        />
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 px-4 py-4 bg-white border-t
                       border-gray-200">
        <div className="max-w-4xl mx-auto flex items-end gap-3">

          {/* Textarea — grows with content */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onInput={handleInput}
              placeholder="Ask about digital skills... (Enter to send)"
              rows={1}
              disabled={sending}
              className="
                w-full resize-none rounded-xl border border-gray-300
                px-4 py-3 pr-4 text-sm text-gray-900
                placeholder:text-gray-400
                focus:outline-none focus:ring-2 focus:ring-primary-500
                focus:border-transparent
                disabled:opacity-50 disabled:bg-gray-50
                max-h-[120px] overflow-y-auto
              "
              style={{ height: 'auto' }}
            />
          </div>

          {/* Send button */}
          <Button
            onClick={handleSend}
            isLoading={sending}
            disabled={!input.trim() || sending}
            size="md"
            className="flex-shrink-0 h-[44px] px-4"
            leftIcon={!sending ? <Send size={16} /> : undefined}
          >
            <span className="hidden sm:inline">Send</span>
          </Button>

        </div>

        {/* Hint text */}
        <p className="text-center text-xs text-gray-400 mt-2">
          Enter to send · Shift+Enter for new line
        </p>
      </div>

      {/* Confirm clear modal */}
      <ConfirmModal
        isOpen={showClear}
        onClose={() => setShowClear(false)}
        onConfirm={handleClearConfirm}
        isLoading={clearing}
        title="Clear Chat History"
        message="Are you sure you want to delete all chat messages? This cannot be undone."
      />

    </div>
  );
};

export default ChatPage;