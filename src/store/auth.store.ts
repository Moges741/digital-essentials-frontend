import { create } from 'zustand';
import type { User }   from '../types/auth.types';
import { tokenUtils } from '../utils/token';
interface AuthState {
  // State
  user:          User | null;
  token:         string | null;
  isAuthenticated: boolean;
  // Actions
  setAuth:  (user: User, token: string) => void;
  logout:   () => void;
  hydrate:  () => void;  
}

export const useAuthStore = create<AuthState>((set) => ({
  user:            null,
  token:           null,
  isAuthenticated: false,

  // Called after successful login or register
  setAuth: (user, token) => {
    tokenUtils.set(token);
    set({ user, token, isAuthenticated: true });
  },

  // Called on logout
  logout: () => {
    tokenUtils.remove();
    set({ user: null, token: null, isAuthenticated: false });
  },

  // Called on app startup to restore session from localStorage
  // This keeps user logged in after page refresh
  hydrate: () => {
    const token = tokenUtils.get();
    if (!token) return;

    // Decode JWT payload without a library
    // JWT structure: header.payload.signature
    // payload is base64 encoded JSON
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      // Check token is not expired
      const isExpired = payload.exp * 1000 < Date.now();
      if (isExpired) {
        tokenUtils.remove();
        return;
      }

      // Restore user from token payload
      set({
        token,
        isAuthenticated: true,
        user: {
          user_id:    payload.user_id,
          name:       payload.name,
          email:      payload.email,
          role:       payload.role,
          is_active:  true,
          created_at: '',
          updated_at: '',
        },
      });
    } catch {
      // Token malformed — clear it
      tokenUtils.remove();
    }
  },
}));