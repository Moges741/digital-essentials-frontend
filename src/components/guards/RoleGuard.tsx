
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore }     from '../../store/auth.store';
import type { Role }             from '../../types/auth.types';
import { getDashboardByRole } from '../../utils/constants';

interface RoleGuardProps {
  allowedRoles: Role[];
}

const RoleGuard = ({ allowedRoles }: RoleGuardProps) => {
  const user = useAuthStore((state) => state.user);

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={getDashboardByRole(user?.role ?? 'learner')} replace />;
  }

  return <Outlet />;
};

export default RoleGuard;