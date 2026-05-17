
import { useEffect } from 'react';
import { Link, useNavigate }   from 'react-router-dom';
import { useForm }             from 'react-hook-form';
import { zodResolver }         from '@hookform/resolvers/zod';
import { z }                   from 'zod';
import {
  User, Mail, Lock, BookOpen,
  GraduationCap, Briefcase,
} from 'lucide-react';

import { useRegister }   from '../../hooks/useAuth';
import { useAuthStore }  from '../../store/auth.store';
import Input, { Textarea, PasswordInput } from '../../components/ui/Input';
import Button              from '../../components/ui/Button';
import { getDashboardByRole } from '../../utils/constants';
import type { Role }            from '../../types/auth.types';

// ── Zod schema — mirrors backend validation ───────────────────
const registerSchema = z.object({
  name:            z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .regex(/^[a-zA-Z\s-]+$/, 'Name can only contain letters, spaces, and hyphens')
    .refine(
      (val) => !/^\d+$/.test(val),
      'Name cannot be only numbers'
    ),
  email:           z.string().min(1, 'Email is required').email('Please enter a valid email'),
  password:        z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  role:            z.enum(['learner', 'mentor', 'administrator']),
  specialization:  z.string().optional(),
  qualifications:  z.string().optional(),
}).refine(
  (data) => data.password === data.confirmPassword,
  { message: 'Passwords do not match', path: ['confirmPassword'] }
).refine(
  (data) => data.role !== 'mentor' || !!data.specialization?.trim(),
  { message: 'Specialization is required for mentors', path: ['specialization'] }
);

type RegisterFormData = z.infer<typeof registerSchema>;

// ── Role selector option ──────────────────────────────────────
interface RoleOption {
  value:       Role;
  label:       string;
  description: string;
  icon:        React.ReactNode;
  color:       string;
}

const roleOptions: RoleOption[] = [
  {
    value:       'learner',
    label:       'Learner',
    description: 'I want to learn digital skills',
    icon:        <GraduationCap size={20} />,
    color:       'primary',
  },
  {
    value:       'mentor',
    label:       'Mentor',
    description: 'I want to teach and create courses',
    icon:        <Briefcase size={20} />,
    color:       'success',
  },
];

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
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver:      zodResolver(registerSchema),
    defaultValues: { role: 'learner' },
  });

  const watchedRole = watch('role');

  const handleRoleSelect = (role: Role) => {
    setValue('role', role, { shouldValidate: true });
  };

  const onSubmit = (data: RegisterFormData) => {
    const { confirmPassword, ...body } = data;
    register(body);
  };

  return (
    <div className="mt-10 min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-gray-50">
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

            {/* Role selector */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                I am a <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {roleOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleRoleSelect(option.value)}
                    className={`
                      flex flex-col items-center gap-2 p-4 rounded-xl border-2
                      transition-all duration-150 cursor-pointer text-center
                      ${watchedRole === option.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }
                    `}
                  >
                    <span className={watchedRole === option.value ? 'text-primary-600' : 'text-gray-400'}>
                      {option.icon}
                    </span>
                    <span className="text-sm font-semibold">{option.label}</span>
                    <span className="text-xs text-gray-400 leading-tight">
                      {option.description}
                    </span>
                  </button>
                ))}
              </div>
              {errors.role && (
                <p className="text-xs text-red-600">⚠ {errors.role.message}</p>
              )}
            </div>

            {/* Basic fields */}
            <Input
              label="Full name"
              type="text"
              placeholder="Moges Sisay"
              leftIcon={<User size={16} />}
              error={errors.name?.message}
              helperText="Letters, spaces, and hyphens only (not just numbers)"
              autoComplete="name"
              required
              {...registerField('name')}
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

            <PasswordInput
              label="Password"
              placeholder="Minimum 8 characters"
              leftIcon={<Lock size={16} />}
              error={errors.password?.message}
              helperText="Must include: uppercase, lowercase, number, and special character (!@#$%^&*, etc.)"
              autoComplete="new-password"
              required
              {...registerField('password')}
            />

            <PasswordInput
              label="Confirm password"
              placeholder="Repeat your password"
              leftIcon={<Lock size={16} />}
              error={errors.confirmPassword?.message}
              autoComplete="new-password"
              required
              {...registerField('confirmPassword')}
            />

            {/* Mentor-only fields */}
            {watchedRole === 'mentor' && (
              <div className="flex flex-col gap-5 p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-xs font-semibold text-green-700 -mb-2">
                  Mentor Information
                </p>
                <Input
                  label="Specialization"
                  type="text"
                  placeholder="e.g. Digital Literacy, Smartphone Usage"
                  error={errors.specialization?.message}
                  helperText="What digital skills do you teach?"
                  required
                  {...registerField('specialization')}
                />
                <Textarea
                  label="Qualifications"
                  placeholder="e.g. BSc Computer Science, 3 years teaching experience"
                  error={errors.qualifications?.message}
                  helperText="Optional — helps learners trust your courses"
                  {...registerField('qualifications')}
                />
              </div>
            )}

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