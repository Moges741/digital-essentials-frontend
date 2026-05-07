
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