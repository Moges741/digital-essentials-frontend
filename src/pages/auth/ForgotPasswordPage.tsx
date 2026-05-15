import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { authApi } from '../../api/auth.api';

const ForgotPasswordPage = () => {
  const { register, handleSubmit } = useForm<{ email: string }>();
  const [status, setStatus] = useState<'idle'|'sending'|'sent'|'error'>('idle');
  const [message, setMessage] = useState('');

  const onSubmit = async (data: { email: string }) => {
    try {
      setStatus('sending');
      await authApi.forgotPassword(data.email);
      setStatus('sent');
      setMessage('If that email exists in our system, a reset link was sent.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err?.response?.data?.message ?? 'Failed to send reset email');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Mail size={20} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold">Forgot your password?</h1>
            <p className="text-sm text-gray-500 mt-1">Enter your email to receive a reset link.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-lg border px-3 py-2 text-sm"
              required
              {...register('email')}
            />

            <button type="submit" className="w-full rounded-lg bg-primary-600 text-white py-2">
              {status === 'sending' ? <Loader2 className="animate-spin mx-auto" /> : 'Send reset email'}
            </button>
          </form>

          {message && <p className="text-sm text-gray-600 mt-4">{message}</p>}

          <p className="text-center text-sm text-gray-500 mt-6">
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
