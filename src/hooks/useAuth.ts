
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast           from 'react-hot-toast';
import { authApi }     from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import type { LoginBody, RegisterBody, Role } from '../types/auth.types';

const getDashboardByRole = (role: Role): string => {
  if (role === 'mentor')        return '/mentor';
  if (role === 'administrator') return '/admin';
  return '/dashboard';
};

// ── Login Hook ────────────────────────────────────────────────
export const useLogin = () => {
  const setAuth  = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (body: LoginBody) => authApi.login(body),

    onSuccess: (data) => {
      // Save user and token to Zustand + localStorage
      setAuth(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
      // Redirect based on role
      navigate(getDashboardByRole(data.user.role));
    },

    onError: (error: any) => {
      const message =
        error.response?.data?.message ?? 'Login failed. Please try again.';
      toast.error(message);
    },
  });
};

// ── Register Hook ─────────────────────────────────────────────
export const useRegister = () => {
  const setAuth  = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (body: RegisterBody) => authApi.register(body),

    // onSuccess: (data) => {
    //   setAuth(data.user, data.token);
    //   toast.success(`Account created! Welcome, ${data.user.name}!`);
    //   navigate(getDashboardByRole(data.user.role));
    // },
     onSuccess: (data) => {
      // Don't auto-login, show verification message
      toast.success('Account created! Please check your email to verify your account.');
      navigate('/login');  // Or stay on register with message
    },

    onError: (error: any) => {
      // Backend may return array of validation errors
      const errors: string[] = error.response?.data?.errors;
      if (errors?.length) {
        errors.forEach((e) => toast.error(e));
      } else {
        const message =
          error.response?.data?.message ?? 'Registration failed.';
        toast.error(message);
      }
    },
  });
};