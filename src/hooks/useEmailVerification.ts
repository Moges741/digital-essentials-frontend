import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth.api';

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: (token: string) => authApi.verifyEmail(token),
    onSuccess: (data) => {
      toast.success('Email verified successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Verification failed');
    },
  });
};

export const useResendVerification = () => {
  return useMutation({
    mutationFn: (email: string) => authApi.resendVerification(email),
    onSuccess: () => {
      toast.success('Verification email sent!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send email');
    },
  });
};