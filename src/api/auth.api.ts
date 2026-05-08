
import apiClient from './axios';
import type {
  LoginBody,
  RegisterBody,
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

  register: async (body: RegisterBody): Promise<AuthResponse> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>(
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

};