import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGoogleLogin } from '../../hooks/useGoogleAuth';

const GoogleCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const { handleGoogleCallback } = useGoogleLogin();

  useEffect(() => {
    const token = searchParams.get('token');
    const isNewUser = searchParams.get('new') === 'true';
    const error = searchParams.get('error');

    if (error) {
      // Handle error (redirect to login with error message)
      window.location.href = '/login?error=google_auth_failed';
    } else if (token) {
      handleGoogleCallback(token, isNewUser);
    }
  }, [searchParams, handleGoogleCallback]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
};

export default GoogleCallbackPage;