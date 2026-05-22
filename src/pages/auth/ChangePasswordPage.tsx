import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm }     from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z }           from 'zod';
import { Lock, ShieldCheck } from 'lucide-react';

import { useChangePassword } from '../../hooks/useAuth';
import { useAuthStore }      from '../../store/auth.store';
import { PasswordInput }     from '../../components/ui/Input';
import Button                from '../../components/ui/Button';

const changePasswordSchema = z.object({
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine(
  (data) => data.newPassword === data.confirmPassword,
  { message: 'Passwords do not match', path: ['confirmPassword'] }
);

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

const ChangePasswordPage = () => {
  const { mutate: changePassword, isPending } = useChangePassword();
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  // If they somehow get here but don't need to change password, kick them out
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    } else if (user && !user.must_change_password) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = (data: ChangePasswordFormData) => {
    changePassword(data.newPassword);
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>
            <p className="text-sm text-gray-500 mt-1">
              For security reasons, please change your generated password before continuing.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <PasswordInput
              label="New Password"
              placeholder="Minimum 8 characters"
              leftIcon={<Lock size={16} />}
              error={errors.newPassword?.message}
              helperText="Must include: uppercase, lowercase, number, and special character (!@#$%^&*, etc.)"
              autoComplete="new-password"
              required
              {...register('newPassword')}
            />

            <PasswordInput
              label="Confirm New Password"
              placeholder="Repeat your new password"
              leftIcon={<Lock size={16} />}
              error={errors.confirmPassword?.message}
              autoComplete="new-password"
              required
              {...register('confirmPassword')}
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isPending}
              className="mt-4"
            >
              {isPending ? 'Updating password...' : 'Update & Continue'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
