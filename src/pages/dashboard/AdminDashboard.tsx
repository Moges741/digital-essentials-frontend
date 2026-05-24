import { useState }       from 'react';
import { useNavigate }    from 'react-router-dom';
import {
  Users, BookOpen, GraduationCap,
  Award, Shield, Search,
  Edit, Eye, EyeOff,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi }       from '../../api/admin.api';
import { useAuthStore }   from '../../store/auth.store';
import Card, { CardHeader, CardTitle } from '../../components/ui/Card';
import Badge, { RoleBadge } from '../../components/ui/Badge';
import Input              from '../../components/ui/Input';
import Button             from '../../components/ui/Button';
import EmptyState         from '../../components/ui/EmptyState';
import { PageSpinner }    from '../../components/ui/Spinner';
import Modal              from '../../components/ui/Modal';
import { formatDate }     from '../../utils/format';
import type { User }           from '../../types/auth.types';
// import { adminApi }      from '../../api/admin.api';

const seriesConfig = [
  { key: 'enrollments', label: 'Enrollments', color: '#2563eb' },
  { key: 'exam_submissions', label: 'Exam submissions', color: '#16a34a' },
  { key: 'feedback_submissions', label: 'Feedback', color: '#f59e0b' },
] as const;

// ── Fetch all users (admin only) ──────────────────────────────
const useAllUsers = () => {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: adminApi.getAllUsers,
  });
};

// ── Fetch all courses (admin only) ────────────────────────────
const useAllCourses = () => {
  return useQuery({
    queryKey: ['admin', 'courses'],
    queryFn: adminApi.getAllCourses,
  });
};

// ── Fetch dashboard analytics (admin only) ────────────────────
const useDashboardAnalytics = () => {
  return useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: adminApi.getDashboardAnalytics,
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

const formatTrendLabel = (value: string): string => {
  const date = new Date(`${value}-01T00:00:00Z`);
  return new Intl.DateTimeFormat('en', { month: 'short', year: '2-digit' }).format(date);
};

const TrendChart = ({
  labels,
  series,
}: {
  labels: string[];
  series: Array<{ label: string; color: string; values: number[] }>;
}) => {
  const width = 860;
  const height = 260;
  const padding = { top: 20, right: 20, bottom: 36, left: 44 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const allValues = series.flatMap((item) => item.values);
  const maxValue = Math.max(...allValues, 1);

  const pointsFor = (values: number[]) => values
    .map((value, index) => {
      const x = padding.left + (labels.length <= 1 ? innerWidth / 2 : (index / (labels.length - 1)) * innerWidth);
      const y = padding.top + innerHeight - (value / maxValue) * innerHeight;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[720px] h-[260px]">
        {[0.25, 0.5, 0.75, 1].map((tick) => {
          const y = padding.top + innerHeight - innerHeight * tick;
          return (
            <g key={tick}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#e5e7eb" strokeDasharray="4 4" />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" className="fill-gray-400 text-[10px]">
                {Math.round(maxValue * tick)}
              </text>
            </g>
          );
        })}

        {series.map((item) => (
          <g key={item.label}>
            <polyline
              fill="none"
              stroke={item.color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={pointsFor(item.values)}
            />
            {item.values.map((value, index) => {
              const x = padding.left + (labels.length <= 1 ? innerWidth / 2 : (index / (labels.length - 1)) * innerWidth);
              const y = padding.top + innerHeight - (value / maxValue) * innerHeight;
              return <circle key={`${item.label}-${index}`} cx={x} cy={y} r="4" fill={item.color} />;
            })}
          </g>
        ))}

        {labels.map((label, index) => {
          const x = padding.left + (labels.length <= 1 ? innerWidth / 2 : (index / (labels.length - 1)) * innerWidth);
          return (
            <text
              key={label}
              x={x}
              y={height - 12}
              textAnchor="middle"
              className="fill-gray-500 text-[11px]"
            >
              {formatTrendLabel(label)}
            </text>
          );
        })}
      </svg>

      <div className="mt-4 flex flex-wrap gap-4">
        {series.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-sm text-gray-600">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate               = useNavigate();
  const queryClient            = useQueryClient();
  const user                   = useAuthStore((s) => s.user);
  const [search, setSearch]    = useState('');
  const [roleModal, setRoleModal] = useState<{
    isOpen: boolean;
    user?: User;
  }>({ isOpen: false });

  const { data: users,   isLoading: usersLoading  } = useAllUsers();
  const { data: courses, isLoading: coursesLoading } = useAllCourses();
  const { data: analytics, isLoading: analyticsLoading } = useDashboardAnalytics();

  // Mutations
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: 'learner' | 'mentor' | 'administrator' }) =>
      adminApi.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setRoleModal({ isOpen: false });
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: (courseId: number) => adminApi.toggleCoursePublish(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });

  const isLoading = usersLoading || coursesLoading || analyticsLoading;
  if (isLoading) return <PageSpinner />;

  const allUsers   = users   ?? [];
  const allCourses = courses ?? [];
  const dashboardAnalytics = analytics;

  // Role counts
  const learners = allUsers.filter((u) => u.role === 'learner').length;
  const instructors  = allUsers.filter((u) => u.role === 'mentor').length;
  // const admins   = allUsers.filter((u) => u.role === 'administrator').length;

  const handleRoleChange = (user: User, newRole: 'learner' | 'mentor' | 'administrator') => {
    updateRoleMutation.mutate({ userId: user.user_id, role: newRole });
  };

  const handleTogglePublish = (courseId: number) => {
    togglePublishMutation.mutate(courseId);
  };

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

      <Card padding="md">
        <CardHeader>
          <CardTitle>Trends Over Time</CardTitle>
          <Badge variant="neutral">Last 6 months</Badge>
        </CardHeader>

        <TrendChart
          labels={dashboardAnalytics?.trends.labels ?? []}
          series={seriesConfig.map((item) => ({
            label: item.label,
            color: item.color,
            values: dashboardAnalytics?.trends?.[item.key] ?? [],
          }))}
        />
      </Card>

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
            <div className="grid grid-cols-5 gap-4 px-3 py-2
                             bg-gray-50 rounded-lg mb-2 text-xs
                             font-semibold text-gray-500 uppercase
                             tracking-wide min-w-[600px]">
              <span>Name</span>
              <span>Email</span>
              <span>Role</span>
              <span>Joined</span>
              <span>Actions</span>
            </div>

            {/* Data rows */}
            {filteredUsers.map((u) => (
              <div
                key={u.user_id}
                className="grid grid-cols-5 gap-4 px-3 py-3
                             border-b border-gray-100 last:border-0
                             items-center min-w-[600px]
                             hover:bg-gray-50 rounded-lg
                             transition-colors"
              >
                <div className="flex items-center gap-2">
                  {/* Avatar initial */}

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
              label="Instructors"
              value={instructors}
              color="bg-amber-50"
            />
          </div>

          {/* Learning analytics */}
          <Card padding="md">
            <CardHeader>
              <CardTitle>Learning Analytics</CardTitle>
              <Badge variant="neutral">Live overview</Badge>
            </CardHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              <StatCard
                icon={<GraduationCap size={20} className="text-blue-600" />}
                label="Completion Rate"
                value={`${dashboardAnalytics?.completion_rate ?? 0}%`}
                color="bg-blue-50"
              />
              <StatCard
                icon={<Award size={20} className="text-green-600" />}
                label="Average Exam Score"
                value={`${dashboardAnalytics?.average_exam_score ?? 0}%`}
                color="bg-green-50"
              />
              <StatCard
                icon={<Shield size={20} className="text-amber-600" />}
                label="Exam Pass Rate"
                value={`${dashboardAnalytics?.exam_pass_rate ?? 0}%`}
                color="bg-amber-50"
              />
              <StatCard
                icon={<BookOpen size={20} className="text-primary-600" />}
                label="Average Feedback"
                value={(dashboardAnalytics?.average_feedback_rating ?? 0).toFixed(1)}
                color="bg-primary-50"
              />
              <StatCard
                icon={<Users size={20} className="text-slate-600" />}
                label="Active Learners"
                value={dashboardAnalytics?.active_learners ?? 0}
                color="bg-slate-50"
              />
              <StatCard
                icon={<Award size={20} className="text-emerald-600" />}
                label="Certificates Issued"
                value={dashboardAnalytics?.certificates_issued ?? 0}
                color="bg-emerald-50"
              />
            </div>
          </Card>
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

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRoleModal({ isOpen: true, user: u })}
                  disabled={u.user_id === user?.user_id}
                >
                  <Edit size={14} />
                </Button>
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
                <div className="flex items-center gap-2">
                  <Badge
                    variant={course.is_published ? 'success' : 'warning'}
                    dot
                  >
                    {course.is_published ? 'Published' : 'Draft'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTogglePublish(course.course_id)}
                    isLoading={togglePublishMutation.isPending}
                  >
                    {course.is_published ? (
                      <EyeOff size={14} />
                    ) : (
                      <Eye size={14} />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Role Change Modal */}
      <Modal
        isOpen={roleModal.isOpen}
        onClose={() => setRoleModal({ isOpen: false })}
        title="Change User Role"
        footer={
          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              onClick={() => setRoleModal({ isOpen: false })}
            >
              Cancel
            </Button>
          </div>
        }
      >
        {roleModal.user && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-sm font-bold text-primary-700">
                  {roleModal.user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{roleModal.user.name}</p>
                <p className="text-sm text-gray-500">{roleModal.user.email}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-3">Select new role:</p>
              <div className="space-y-2">
                {[
                  { value: 'learner', label: 'Learner', description: 'Can enroll in courses and complete lessons' },
                  { value: 'mentor', label: 'Instructor', description: 'Can create and manage courses' },
                  { value: 'administrator', label: 'Administrator', description: 'Full system access and user management' },
                ].map((role) => (
                  <button
                    key={role.value}
                    onClick={() => handleRoleChange(roleModal.user!, role.value as any)}
                    disabled={updateRoleMutation.isPending}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      roleModal.user?.role === role.value
                        ? 'border-primary-200 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{role.label}</p>
                        <p className="text-sm text-gray-500">{role.description}</p>
                      </div>
                      {roleModal.user?.role === role.value && (
                        <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default AdminDashboard;