import { useState }       from 'react';
import { useNavigate }    from 'react-router-dom';
import {
  Users, BookOpen, GraduationCap,
  Award, Shield, Search,
} from 'lucide-react';
import { useQuery }       from '@tanstack/react-query';
import apiClient          from '../../api/axios';
import { useCourses }     from '../../hooks/useCourses';
import { useAuthStore }   from '../../store/auth.store';
import Card, { CardHeader, CardTitle } from '../../components/ui/Card';
import Badge, { RoleBadge } from '../../components/ui/Badge';
import Input              from '../../components/ui/Input';
import Button             from '../../components/ui/Button';
import EmptyState         from '../../components/ui/EmptyState';
import { PageSpinner }    from '../../components/ui/Spinner';
import { formatDate }     from '../../utils/format';
import type { ApiResponse }    from '../../types/auth.types';
import type { User }           from '../../types/auth.types';

// ── Fetch all users (admin only) ──────────────────────────────
const useAllUsers = () => {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn:  async () => {
      const res = await apiClient.get<ApiResponse<{ users: User[] }>>(
        '/admin/users'
      );
      return res.data.data.users;
    },
    // Gracefully handle if endpoint doesn't exist yet
    retry: false,
  });
};

// ── Stat card ─────────────────────────────────────────────────
const StatCard = ({
  icon, label, value, color,
}: {
  icon:  React.ReactNode;
  label: string;
  value: number | string;
  color: string;
}) => (
  <Card padding="md" className="flex items-center gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center
                      justify-center flex-shrink-0 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  </Card>
);

// ── Main Dashboard ────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate               = useNavigate();
  const user                   = useAuthStore((s) => s.user);
  const [search, setSearch]    = useState('');

  const { data: users,   isLoading: usersLoading  } = useAllUsers();
  const { data: courses, isLoading: coursesLoading } = useCourses({ limit: 100 });

  const isLoading = usersLoading || coursesLoading;
  if (isLoading) return <PageSpinner />;

  const allUsers   = users   ?? [];
  const allCourses = courses?.courses ?? [];

  // Role counts
  const learners = allUsers.filter((u) => u.role === 'learner').length;
  const mentors  = allUsers.filter((u) => u.role === 'mentor').length;
  // const admins   = allUsers.filter((u) => u.role === 'administrator').length;

  // Filter users by search
  const filteredUsers = allUsers.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield size={18} className="text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-sm text-gray-500">
            Platform overview and user management
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users size={20} className="text-primary-600" />}
          label="Total Users"
          value={allUsers.length}
          color="bg-primary-50"
        />
        <StatCard
          icon={<GraduationCap size={20} className="text-blue-600" />}
          label="Learners"
          value={learners}
          color="bg-blue-50"
        />
        <StatCard
          icon={<BookOpen size={20} className="text-green-600" />}
          label="Total Courses"
          value={allCourses.length}
          color="bg-green-50"
        />
        <StatCard
          icon={<Award size={20} className="text-amber-600" />}
          label="Mentors"
          value={mentors}
          color="bg-amber-50"
        />
      </div>

      {/* Users table */}
      <Card padding="md">
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <Badge variant="neutral">{allUsers.length}</Badge>
        </CardHeader>

        {/* Search */}
        <div className="mb-4">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search size={15} />}
          />
        </div>

        {filteredUsers.length === 0 ? (
          <EmptyState
            icon={<Users size={24} />}
            title={search ? 'No users match your search' : 'No users yet'}
          />
        ) : (
          <div className="overflow-x-auto">

            {/* Header row */}
            <div className="grid grid-cols-4 gap-4 px-3 py-2
                             bg-gray-50 rounded-lg mb-2 text-xs
                             font-semibold text-gray-500 uppercase
                             tracking-wide min-w-[500px]">
              <span>Name</span>
              <span>Email</span>
              <span>Role</span>
              <span>Joined</span>
            </div>

            {/* Data rows */}
            {filteredUsers.map((u) => (
              <div
                key={u.user_id}
                className="grid grid-cols-4 gap-4 px-3 py-3
                             border-b border-gray-100 last:border-0
                             items-center min-w-[500px]
                             hover:bg-gray-50 rounded-lg
                             transition-colors"
              >
                <div className="flex items-center gap-2">
                  {/* Avatar initial */}
                  <div className="w-8 h-8 rounded-full bg-primary-100
                                    flex items-center justify-center
                                    flex-shrink-0">
                    <span className="text-xs font-bold text-primary-700">
                      {u.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900
                                    truncate">
                    {u.name}
                    {u.user_id === user?.user_id && (
                      <span className="text-xs text-gray-400 ml-1">
                        (you)
                      </span>
                    )}
                  </span>
                </div>

                <span className="text-sm text-gray-500 truncate">
                  {u.email}
                </span>

                <RoleBadge role={u.role} />

                <span className="text-xs text-gray-400">
                  {formatDate(u.created_at)}
                </span>
              </div>
            ))}

          </div>
        )}
      </Card>

      {/* Courses overview */}
      <Card padding="md">
        <CardHeader>
          <CardTitle>All Courses</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/courses')}
          >
            View All
          </Button>
        </CardHeader>

        {allCourses.length === 0 ? (
          <EmptyState title="No courses yet" />
        ) : (
          <div>
            {allCourses.slice(0, 8).map((course) => (
              <div
                key={course.course_id}
                className="flex items-center justify-between py-3
                             border-b border-gray-100 last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {course.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    by {course.creator_name}
                  </p>
                </div>
                <Badge
                  variant={course.is_published ? 'success' : 'warning'}
                  dot
                >
                  {course.is_published ? 'Published' : 'Draft'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

    </div>
  );
};

export default AdminDashboard;