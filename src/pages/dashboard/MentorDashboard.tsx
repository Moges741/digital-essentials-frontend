
import { useState }          from 'react';
import { useNavigate }       from 'react-router-dom';
import {
  Plus, BookOpen,
  Eye, Globe, EyeOff,
  ClipboardList, MessageCircle,
  ChevronDown, ChevronUp, Star,
} from 'lucide-react';
import { useCourses }        from '../../hooks/useCourses';
import { usePublishCourse }  from '../../hooks/useCourses';
import { useCourseFeedback } from '../../hooks/useFeedback';
import { useAuthStore }      from '../../store/auth.store';
import Card from '../../components/ui/Card';
import Button                from '../../components/ui/Button';
import Badge, { StatusBadge } from '../../components/ui/Badge';
import EmptyState            from '../../components/ui/EmptyState';
import { PageSpinner }       from '../../components/ui/Spinner';
import FeedbackList          from '../../components/course/FeedbackList';
import { formatDate }        from '../../utils/format';
import { ROLES }             from '../../utils/constants';

// ── Course row with feedback section ──────────────────────────
const CourseRow = ({ course }: { course: any }) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const { mutate: publish, isPending } = usePublishCourse(course.course_id);
  const { data: feedback = [], isLoading: feedbackLoading } = useCourseFeedback(
    expanded ? course.course_id : -1
  );

  const avgRating =
    feedback.length > 0
      ? Number((feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1))
      : 0;

  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden mb-4">
      {/* Main row */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 transition-colors">

        {/* Expand button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-shrink-0 p-1 rounded hover:bg-gray-200 transition-colors"
          title={expanded ? 'Collapse feedback' : 'Expand feedback'}
        >
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {/* Title and meta */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {course.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-gray-500">
              Created {formatDate(course.created_at)}
            </p>
            {feedback.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <MessageCircle size={12} />
                <span>{feedback.length} feedback</span>
                {avgRating > 0 && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-0.5">
                      <Star size={12} className="fill-yellow-400 text-yellow-400" />
                      <span>{avgRating}/5</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Status */}
        <StatusBadge status={course.is_published ? 'published' : 'draft'} />

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Eye size={13} />}
            onClick={() => navigate(`/courses/${course.course_id}`)}
          >
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ClipboardList size={13} />}
            onClick={() => navigate(`/mentor/courses/${course.course_id}/exam/review`)}
          >
            Exam Review
          </Button>
          <Button
            variant="secondary"
            size="sm"
            isLoading={isPending}
            leftIcon={
              course.is_published
                ? <EyeOff size={13} />
                : <Globe size={13} />
            }
            onClick={() => publish(!course.is_published)}
          >
            {course.is_published ? 'Unpublish' : 'Publish'}
          </Button>
        </div>
      </div>

      {/* Expandable feedback section */}
      {expanded && (
        <div className="border-t border-gray-100 p-4 bg-white">
          <div className="mb-3">
            <h3 className="font-semibold text-gray-900 text-sm mb-2">
              Course Feedback ({feedback.length})
            </h3>
          </div>
          <FeedbackList feedback={feedback} isLoading={feedbackLoading} />
        </div>
      )}
    </div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────
const MentorDashboard = () => {
  const navigate = useNavigate();
  const user     = useAuthStore((s) => s.user);

  // Fetch all courses — admin sees all, mentor sees own
  const { data, isLoading } = useCourses({ limit: 50 });

  if (isLoading) return <PageSpinner />;

  const courses   = data?.courses ?? [];
  const published = courses.filter((c) => c.is_published).length;
  const drafts    = courses.filter((c) => !c.is_published).length;

  const isAdmin = user?.role === ROLES.ADMINISTRATOR;

  return (
    <div className="flex flex-col gap-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'Admin Panel' : 'Mentor Dashboard'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your courses and learners
          </p>
        </div>
        <Button
          leftIcon={<Plus size={16} />}
          onClick={() => navigate('/mentor/courses/create')}
        >
          New Course
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card padding="md" className="flex items-center gap-4">
          <div className="w-11 h-11 bg-primary-50 rounded-xl
                            flex items-center justify-center">
            <BookOpen size={20} className="text-primary-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {courses.length}
            </p>
            <p className="text-xs text-gray-500">Total Courses</p>
          </div>
        </Card>

        <Card padding="md" className="flex items-center gap-4">
          <div className="w-11 h-11 bg-green-50 rounded-xl
                            flex items-center justify-center">
            <Globe size={20} className="text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{published}</p>
            <p className="text-xs text-gray-500">Published</p>
          </div>
        </Card>

        <Card padding="md" className="flex items-center gap-4">
          <div className="w-11 h-11 bg-amber-50 rounded-xl
                            flex items-center justify-center">
            <EyeOff size={20} className="text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{drafts}</p>
            <p className="text-xs text-gray-500">Drafts</p>
          </div>
        </Card>
      </div>

      {/* Courses section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {isAdmin ? 'All Courses' : 'My Courses'}
          </h2>
          <Badge variant="neutral">{courses.length}</Badge>
        </div>

        {courses.length === 0 ? (
          <Card padding="md">
            <EmptyState
              icon={<BookOpen size={24} />}
              title="No courses yet"
              description="Create your first course to get started."
              action={{
                label:   'Create Course',
                onClick: () => navigate('/mentor/courses/create'),
              }}
            />
          </Card>
        ) : (
          <div className="space-y-0">
            {courses.map((course) => (
              <CourseRow key={course.course_id} course={course} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default MentorDashboard;