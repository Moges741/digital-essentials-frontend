
import apiClient from './axios';
import type {
  LoginBody,
  RegisterBody,
  RegisterResponse,
  AuthResponse,
  ApiResponse,
} from '../types/auth.types';

export const authApi = {

  login: async (body: LoginBody): Promise<AuthResponse> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      body
    );
    return res.data.data;
  },

  register: async (body: RegisterBody): Promise<RegisterResponse> => {
    const res = await apiClient.post<ApiResponse<RegisterResponse>>(
      '/auth/register',
      body
    );
    return res.data.data;
  },
  verifyEmail: async (token: string): Promise<AuthResponse> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/verify-email',
      { token }
    );
    return res.data.data;
  },
  resendVerification: async (email: string): Promise<void> => {
    await apiClient.post('/auth/resend-verification', { email });
  },
  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post('/auth/forgot-password', { email });
  },
  resetPassword: async (token: string, password: string): Promise<void> => {
    await apiClient.post('/auth/reset-password', { token, password });
  },

};