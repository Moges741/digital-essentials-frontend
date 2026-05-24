
import { useEffect } from 'react';
import { Link, useNavigate }   from 'react-router-dom';
import { useForm }             from 'react-hook-form';
import { zodResolver }         from '@hookform/resolvers/zod';
import { z }                   from 'zod';
import {
  User, Mail, BookOpen,
} from 'lucide-react';

import { useRegister }   from '../../hooks/useAuth';
import { useAuthStore }  from '../../store/auth.store';
import Input from '../../components/ui/Input';
import Button              from '../../components/ui/Button';
import { getDashboardByRole } from '../../utils/constants';

// ── Zod schema — mirrors backend validation ───────────────────
const registerSchema = z.object({
  first_name: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(100, 'First name must not exceed 100 characters')
    .regex(/^[a-zA-Z\s-]+$/, 'First name can only contain letters, spaces, and hyphens'),
  middle_name: z.string()
    .min(1, 'Middle name is required')
    .regex(/^[a-zA-Z\s-]*$/, 'Middle name can only contain letters, spaces, and hyphens'),
  last_name: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(100, 'Last name must not exceed 100 characters')
    .regex(/^[a-zA-Z\s-]+$/, 'Last name can only contain letters, spaces, and hyphens'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  role: z.enum(['learner', 'instructor', 'administrator']),
  specialization:  z.string().optional(),
  qualifications:  z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

// Role selector option placeholder (unused now)

const RegisterPage = () => {
  const { mutate: register, isPending } = useRegister();
  const { isAuthenticated, user }       = useAuthStore();
  const navigate                        = useNavigate();

  // If already logged in → redirect
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getDashboardByRole(user.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver:      zodResolver(registerSchema),
    defaultValues: { role: 'learner' },
  });

  const onSubmit = (data: RegisterFormData) => {
    register(data);
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center px-4 py-8 bg-gray-50">
      <div className="w-full max-w-lg">

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <BookOpen size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="text-sm text-gray-500 mt-1">
              Join the Digital Essentials Platform
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

            {/* Basic fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="First name"
                type="text"
                placeholder="First name"
                leftIcon={<User size={16} />}
                error={errors.first_name?.message}
                autoComplete="given-name"
                required
                {...registerField('first_name')}
              />

              <Input
                label="Middle name"
                type="text"
                placeholder="Middle name"
                leftIcon={<User size={16} />}
                error={errors.middle_name?.message}
                autoComplete="additional-name"
                required
                {...registerField('middle_name')}
              />
            </div>

            <Input
              label="Last name"
              type="text"
              placeholder="Last name"
              leftIcon={<User size={16} />}
              error={errors.last_name?.message}
              autoComplete="family-name"
              required
              {...registerField('last_name')}
            />

            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail size={16} />}
              error={errors.email?.message}
              autoComplete="email"
              required
              {...registerField('email')}
            />



            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isPending}
              className="mt-1"
            >
              {isPending ? 'Creating account...' : 'Create account'}
            </Button>

          </form>

          {/* Footer link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary-600 font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default RegisterPage;