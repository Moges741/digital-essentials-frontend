import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/auth.store';
import { getDashboardByRole } from '../utils/constants';

export const useGoogleLogin = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const loginWithGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/auth/google`;
  };

  const handleGoogleCallback = (token: string, isNewUser: boolean) => {
    // Decode token to get user (similar to hydrate)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const user = {
        user_id: payload.user_id,
        name: payload.name,
        email: payload.email,
        role: payload.role,
        is_active: true,
        created_at: '',
        updated_at: '',
      };
      setAuth(user, token);
      toast.success(isNewUser ? 'Account created with Google!' : 'Signed in with Google!');
      navigate(getDashboardByRole(user.role));
    } catch (error) {
      toast.error('Google authentication failed');
    }
  };

  return { loginWithGoogle, handleGoogleCallback };
};