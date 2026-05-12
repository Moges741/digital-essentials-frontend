import { useMutation } from '@tanstack/react-query';
import toast           from 'react-hot-toast';
import { authApi }     from '../api/auth.api';

// ── Email Verification Hook ────────────────────────────────────
export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: (token: string) => authApi.verifyEmail(token),

    onSuccess: () => {
      toast.success('Email verified successfully!');
    },

    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to verify email');
    },
  });
};