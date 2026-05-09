
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast        from 'react-hot-toast';
import { chatApi }  from '../api/chat.api';
import { QUERY_KEYS } from '../utils/constants';
import type { SendMessageBody } from '../types/chat.types';

// ── Chat history ──────────────────────────────────────────────
export const useChatHistory = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.CHAT, 'history'],
    queryFn:  () => chatApi.getHistory(),
    // Don't refetch on window focus — avoids interrupting conversation
    refetchOnWindowFocus: false,
  });
};

// ── Send message ──────────────────────────────────────────────
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: SendMessageBody) => chatApi.send(body),

    onSuccess: () => {
      // Refresh history to show both user and AI messages
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CHAT, 'history']
      });
    },

    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ?? 'Failed to send message'
      );
    },
  });
};

// ── Clear history ─────────────────────────────────────────────
export const useClearChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => chatApi.clearHistory(),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CHAT, 'history']
      });
      toast.success('Chat history cleared');
    },

    onError: () => {
      toast.error('Failed to clear chat history');
    },
  });
};