import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { MailCheck, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';

import { authApi } from '../../api/auth.api';
import { useAuthStore } from '../../store/auth.store';
import { getDashboardByRole } from '../../utils/constants';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email address...');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Verification token is missing. Please request a new verification email.');
        return;
      }

      try {
        const data = await authApi.verifyEmail(token);
        setAuth(data.user, data.token);
        setStatus('success');
        setMessage('Email verified successfully. Redirecting you now...');

        window.setTimeout(() => {
          navigate(getDashboardByRole(data.user.role), { replace: true });
        }, 1500);
      } catch (error: any) {
        setStatus('error');
        setMessage(
          error.response?.data?.message ?? 'Verification failed. The link may be expired.'
        );
      }
    };

    void verify();
  }, [navigate, setAuth, token]);

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-14 h-14 mx-auto mb-5 rounded-2xl flex items-center justify-center bg-primary-600 text-white shadow-lg shadow-primary-600/20">
            {status === 'loading' && <Loader2 size={28} className="animate-spin" />}
            {status === 'success' && <ShieldCheck size={28} />}
            {status === 'error' && <AlertCircle size={28} />}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Email verification</h1>
          <p className="text-sm text-gray-600 mb-6">{message}</p>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <MailCheck size={16} />
            <span>Digital Essentials Platform</span>
          </div>

          {status === 'error' && (
            <div className="mt-6">
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
              >
                Back to login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;