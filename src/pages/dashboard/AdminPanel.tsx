import { useState }       from 'react';
import { useNavigate }    from 'react-router-dom';
import {
  Users, BookOpen, GraduationCap,
  Shield, Eye, EyeOff,
  MessageSquare,
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

// ── Main Admin Panel ────────────────────────────────────────────
const AdminPanel = () => {
  const navigate               = useNavigate();
  const queryClient            = useQueryClient();
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);

  const { data: users,   isLoading: usersLoading  } = useAllUsers();
  const { data: courses, isLoading: coursesLoading } = useAllCourses();
  const { data: feedback, isLoading: feedbackLoading } = useAllFeedback();

  // Mutations
  const togglePublishMutation = useMutation({
    mutationFn: (courseId: number) => adminApi.toggleCoursePublish(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });

  const isLoading = usersLoading || coursesLoading || feedbackLoading;
  if (isLoading) return <PageSpinner />;

  const allUsers   = users   ?? [];
  const allCourses = courses ?? [];
  const allFeedback = feedback ?? [];

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
