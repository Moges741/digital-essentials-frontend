import { useState }       from 'react';
import { useNavigate }    from 'react-router-dom';
import {
  Users, BookOpen, GraduationCap,
  Shield, Eye, EyeOff,
  MessageSquare, AlertTriangle,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi }       from '../../api/admin.api';
import Card, { CardHeader, CardTitle } from '../../components/ui/Card';
import Badge             from '../../components/ui/Badge';
import Button            from '../../components/ui/Button';
import EmptyState        from '../../components/ui/EmptyState';
import { PageSpinner }   from '../../components/ui/Spinner';
import Modal             from '../../components/ui/Modal';
import { formatDate }    from '../../utils/format';

const seriesConfig = [
  { key: 'enrollments', label: 'Enrollments', color: '#2563eb' },
  { key: 'exam_submissions', label: 'Exam submissions', color: '#16a34a' },
  { key: 'feedback_submissions', label: 'Feedback', color: '#f59e0b' },
] as const;

// ── Fetch all courses (admin only) ────────────────────────────
const useAllCourses = () => {
  return useQuery({
    queryKey: ['admin', 'courses'],
    queryFn: adminApi.getAllCourses,
  });
};

// ── Fetch all users (for stats) ──────────────────────────────
const useAllUsers = () => {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: adminApi.getAllUsers,
  });
};

// ── Fetch all feedback ───────────────────────────────────────
const useAllFeedback = () => {
  return useQuery({
    queryKey: ['admin', 'feedback'],
    queryFn: adminApi.getAllCourseFeedback,
  });
};

// ── Fetch at-risk learners ───────────────────────────────────
const useAtRiskLearners = () => {
  return useQuery({
    queryKey: ['admin', 'at-risk-learners'],
    queryFn: adminApi.getAtRiskLearners,
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

const formatDaysLeft = (daysLeft: number, isOverdue: boolean): string => {
  if (isOverdue) {
    return `${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? '' : 's'} overdue`;
  }
  if (daysLeft === 0) return 'Due today';
  return `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`;
};

// ── Main Admin Panel ────────────────────────────────────────────
const AdminPanel = () => {
  const navigate               = useNavigate();
  const queryClient            = useQueryClient();
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);

  const { data: users,   isLoading: usersLoading  } = useAllUsers();
  const { data: courses, isLoading: coursesLoading } = useAllCourses();
  const { data: feedback, isLoading: feedbackLoading } = useAllFeedback();
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: adminApi.getDashboardAnalytics,
  });
  const { data: atRiskLearners, isLoading: atRiskLearnersLoading } = useAtRiskLearners();

  // Mutations
  const togglePublishMutation = useMutation({
    mutationFn: (courseId: number) => adminApi.toggleCoursePublish(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });

  const isLoading = usersLoading || coursesLoading || feedbackLoading || analyticsLoading || atRiskLearnersLoading;
  if (isLoading) return <PageSpinner />;

  const allUsers   = users   ?? [];
  const allCourses = courses ?? [];
  const allFeedback = feedback ?? [];
  const dashboardAnalytics = analytics;
  const riskLearners = atRiskLearners ?? [];

  // Stats
  const learners = allUsers.filter((u) => u.role === 'learner').length;
  const avgRating = allFeedback.length > 0
    ? (allFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) / allFeedback.length).toFixed(1)
    : 0;

  const handleTogglePublish = (courseId: number) => {
    togglePublishMutation.mutate(courseId);
  };

  const publishedCourses = allCourses.filter(c => c.is_published).length;

  return (
    <div className="flex flex-col gap-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield size={18} className="text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Panel
            </h1>
          </div>
          <p className="text-sm text-gray-500">
            Platform overview, courses, and feedback management
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
          label="Courses"
          value={publishedCourses}
          color="bg-green-50"
        />
        <StatCard
          icon={<MessageSquare size={20} className="text-amber-600" />}
          label="Avg Rating"
          value={avgRating}
          color="bg-amber-50"
        />
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

      {/* Management Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card padding="md" className="flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/admin/mentors')}>
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
            <Users size={20} className="text-purple-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Manage Mentors</h3>
          <p className="text-xs text-gray-500">View and edit mentor profiles</p>
        </Card>

        <Card padding="md" className="flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/admin/certificates')}>
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
            <BookOpen size={20} className="text-green-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Manage Certificates</h3>
          <p className="text-xs text-gray-500">View and edit certificates</p>
        </Card>

        <Card padding="md" className="flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/admin/users')}>
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
            <Users size={20} className="text-blue-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Manage Users</h3>
          <p className="text-xs text-gray-500">View all users and roles</p>
        </Card>
      </div>

      {/* Courses management */}
      <Card padding="md">
        <CardHeader>
          <CardTitle>Course Management</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/courses')}
          >
            View All
          </Button>

      <Card padding="md">
        <CardHeader>
          <CardTitle>At-Risk Learners</CardTitle>
          <Badge variant="warning">Needs attention</Badge>
        </CardHeader>

        {riskLearners.length === 0 ? (
          <EmptyState
            icon={<AlertTriangle size={24} />}
            title="No learners are currently at risk"
            description="Learners close to deadlines or falling behind will appear here"
          />
        ) : (
          <div className="space-y-3">
            {riskLearners.map((learner) => (
              <div
                key={learner.enrollment_id}
                className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{learner.learner_name}</p>
                    <p className="text-sm text-gray-500 truncate">{learner.learner_email}</p>
                    <p className="text-sm text-gray-700 mt-1 truncate">{learner.course_title}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={learner.is_overdue ? 'danger' : 'warning'}>
                      {formatDaysLeft(learner.days_left, learner.is_overdue)}
                    </Badge>
                    <Badge variant="neutral">Risk {learner.risk_score}%</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Progress</p>
                    <p className="font-medium text-gray-900">{learner.progress_percent}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Lessons</p>
                    <p className="font-medium text-gray-900">{learner.completed_lessons}/{learner.total_lessons}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Deadline</p>
                    <p className="font-medium text-gray-900">{formatDate(learner.deadline)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                    <p className="font-medium text-gray-900 capitalize">{learner.status.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
        </CardHeader>

        {allCourses.length === 0 ? (
          <EmptyState title="No courses yet" />
        ) : (
          <div>
            {allCourses.slice(0, 6).map((course) => (
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

      {/* Feedback Overview */}
      <Card padding="md">
        <CardHeader>
          <CardTitle>Recent Feedback</CardTitle>
          <Badge variant="neutral">{allFeedback.length}</Badge>
        </CardHeader>

        {allFeedback.length === 0 ? (
          <EmptyState
            icon={<MessageSquare size={24} />}
            title="No feedback yet"
            description="Feedback from learners will appear here"
          />
        ) : (
          <div className="space-y-3">
            {allFeedback.slice(0, 5).map((fb) => (
              <div
                key={fb.feedback_id}
                onClick={() => setSelectedFeedback(fb)}
                className="p-3 border border-gray-200 rounded-lg
                           hover:bg-gray-50 cursor-pointer
                           transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {fb.course_title}
                    </p>
                    <p className="text-xs text-gray-500">
                      from {fb.user_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${
                          i < fb.rating ? 'text-amber-400' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                {fb.comments && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {fb.comments}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  {formatDate(fb.submitted_at)}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Feedback Detail Modal */}
      <Modal
        isOpen={!!selectedFeedback}
        onClose={() => setSelectedFeedback(null)}
        title="Feedback Details"
      >
        {selectedFeedback && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-900">
                    {selectedFeedback.course_title}
                  </p>
                  <p className="text-sm text-gray-500">
                    by {selectedFeedback.creator_name}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-xl ${
                        i < selectedFeedback.rating ? 'text-amber-400' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Learner</p>
              <p className="text-sm text-gray-900">{selectedFeedback.user_name}</p>
              <p className="text-sm text-gray-500">{selectedFeedback.user_email}</p>
            </div>

            {selectedFeedback.comments && (
              <div>
                <p className="text-sm text-gray-600 font-medium mb-2">Comments</p>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {selectedFeedback.comments}
                </p>
              </div>
            )}

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500">
                Submitted {formatDate(selectedFeedback.submitted_at)}
              </p>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default AdminPanel;
