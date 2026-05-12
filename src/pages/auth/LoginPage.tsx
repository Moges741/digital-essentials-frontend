import { useEffect }       from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm }         from 'react-hook-form';
import { zodResolver }     from '@hookform/resolvers/zod';
import { z }               from 'zod';
import { Mail, Lock, BookOpen } from 'lucide-react';

import { useLogin }      from '../../hooks/useAuth';
import { useAuthStore }  from '../../store/auth.store';
import Input             from '../../components/ui/Input';
import Button            from '../../components/ui/Button';
import { getDashboardByRole } from '../../utils/constants';
import { useGoogleLogin } from '../../hooks/useGoogleAuth';  // New hook

// ── Zod validation schema ─────────────────────────────────────
const loginSchema = z.object({
  email:    z.string().min(1, 'Email is required').email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const { mutate: login, isPending } = useLogin();
  const { isAuthenticated, user }    = useAuthStore();
  const navigate                     = useNavigate();
  const { loginWithGoogle } = useGoogleLogin();

  // If already logged in → redirect to correct dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getDashboardByRole(user.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <BookOpen size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-sm text-gray-500 mt-1">
              Sign in to continue learning
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail size={16} />}
              error={errors.email?.message}
              autoComplete="email"
              required
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              leftIcon={<Lock size={16} />}
              error={errors.password?.message}
              autoComplete="current-password"
              required
              {...register('password')}
            />
<div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or</span>
        </div>
      </div>

      <Button
        type="button"
        onClick={loginWithGoogle}
        fullWidth
        size="lg"
        className="mt-1"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </Button>
            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isPending}
              className="mt-1"
            >
              {isPending ? 'Signing in...' : 'Sign in'}
            </Button>

          </form>
          {/* Footer link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-primary-600 font-semibold hover:underline"
            >
              Create one
            </Link>
          </p>

        </div>

        {/* Test credentials hint (remove in production) */}
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-xs font-semibold text-amber-700 mb-2">
            Test Accounts
          </p>
          <div className="flex flex-col gap-1 text-xs text-amber-600">
            <span>Learner: yonas123@test.com / password123</span>
            <span>Mentor:  yonas@test.com / password123</span>
            <span>Admin:   admin@test.com / password123</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;