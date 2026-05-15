import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Loader2, Check, X } from 'lucide-react';
import { authApi } from '../../api/auth.api';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<{ password: string; confirmPassword: string }>();

  const [status, setStatus] = useState<
    'idle' | 'submitting' | 'success' | 'error'
  >('idle');

  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Reset token is missing');
    }
  }, [token]);

  const password = watch('password', '');

  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  };

  const onSubmit = async (data: {
    password: string;
    confirmPassword: string;
  }) => {
    if (data.password !== data.confirmPassword) {
      setMessage('Passwords do not match');
      setStatus('error');
      return;
    }

    if (
      !checks.length ||
      !checks.upper ||
      !checks.lower ||
      !checks.number ||
      !checks.special
    ) {
      setMessage(
        'Please choose a stronger password that meets all requirements'
      );
      setStatus('error');
      return;
    }

    try {
      setStatus('submitting');

      await authApi.resetPassword(token, data.password);

      setStatus('success');
      setMessage('Password reset. Redirecting to login...');

      setTimeout(() => navigate('/login'), 1400);
    } catch (err: any) {
      setStatus('error');
      setMessage(
        err?.response?.data?.message ?? 'Failed to reset password'
      );
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Reset password</h1>

            <p className="text-sm text-gray-500 mt-1">
              Set a new password for your account.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div>
              <input
                type="password"
                placeholder="New password"
                required
                className="w-full rounded-lg border px-3 py-2 text-sm"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'At least 8 characters',
                  },
                  validate: {
                    hasUpper: (v) =>
                      /[A-Z]/.test(v) ||
                      'Include at least one uppercase letter',

                    hasLower: (v) =>
                      /[a-z]/.test(v) ||
                      'Include at least one lowercase letter',

                    hasNumber: (v) =>
                      /\d/.test(v) ||
                      'Include at least one number',

                    hasSpecial: (v) =>
                      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(v) ||
                      'Include at least one special character',
                  },
                })}
              />

              {errors.password && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <input
                type="password"
                placeholder="Confirm password"
                required
                className="w-full rounded-lg border px-3 py-2 text-sm"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (v) =>
                    v === password || 'Passwords do not match',
                })}
              />

              {errors.confirmPassword && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="text-sm text-gray-700">
              <p className="font-semibold mb-2">
                Password must include:
              </p>

              <ul className="space-y-1">
                <li className="flex items-center gap-2">
                  {checks.length ? (
                    <Check className="text-green-600" size={14} />
                  ) : (
                    <X className="text-red-500" size={14} />
                  )}

                  <span>At least 8 characters</span>
                </li>

                <li className="flex items-center gap-2">
                  {checks.upper ? (
                    <Check className="text-green-600" size={14} />
                  ) : (
                    <X className="text-red-500" size={14} />
                  )}

                  <span>One uppercase letter</span>
                </li>

                <li className="flex items-center gap-2">
                  {checks.lower ? (
                    <Check className="text-green-600" size={14} />
                  ) : (
                    <X className="text-red-500" size={14} />
                  )}

                  <span>One lowercase letter</span>
                </li>

                <li className="flex items-center gap-2">
                  {checks.number ? (
                    <Check className="text-green-600" size={14} />
                  ) : (
                    <X className="text-red-500" size={14} />
                  )}

                  <span>One number</span>
                </li>

                <li className="flex items-center gap-2">
                  {checks.special ? (
                    <Check className="text-green-600" size={14} />
                  ) : (
                    <X className="text-red-500" size={14} />
                  )}

                  <span>One special character</span>
                </li>
              </ul>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-primary-600 text-white py-2"
            >
              {status === 'submitting' ? (
                <Loader2 className="animate-spin mx-auto" />
              ) : (
                'Set new password'
              )}
            </button>
          </form>

          {message && (
            <p
              className={`text-sm mt-4 ${
                status === 'error'
                  ? 'text-red-600'
                  : 'text-gray-600'
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;