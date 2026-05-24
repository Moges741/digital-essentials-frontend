
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  BookOpen,
  Eye,
  Globe,
  EyeOff,
  ClipboardList,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Star,
  FilePen,
} from 'lucide-react';
import { useCourses, usePublishCourse } from '../../hooks/useCourses';
import { useCourseFeedback } from '../../hooks/useFeedback';
import { useAuthStore } from '../../store/auth.store';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge, { StatusBadge } from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { PageSpinner } from '../../components/ui/Spinner';
import FeedbackList from '../../components/course/FeedbackList';
import { formatDate } from '../../utils/format';
import { ROLES } from '../../utils/constants';

// ── Course row with feedback section ──────────────────────────
const CourseRow = ({ course }: { course: any }) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { mutate: publish, isPending } = usePublishCourse(course.course_id);
  const { data: feedback = [], isLoading: feedbackLoading } = useCourseFeedback(
    expanded ? course.course_id : -1
  );

  const isAdmin = user?.role === ROLES.ADMINISTRATOR;
  const isOwner = user?.user_id === course.created_by;

  const avgRating =
    feedback.length > 0
      ? Number((feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1))
      : 0;

  return (
    <div className="mb-4 overflow-hidden rounded-lg border border-gray-100">
      <div className="flex items-center gap-4 bg-gray-50 p-4 transition-colors hover:bg-gray-100">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-shrink-0 rounded p-1 transition-colors hover:bg-gray-200"
          title={expanded ? 'Collapse feedback' : 'Expand feedback'}
        >
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-sm font-semibold text-gray-900">
              {course.title}
            </p>
            <Badge variant="neutral" className="shrink-0">
              {isOwner ? 'Mine' : 'Other instructor'}
            </Badge>
          </div>
          <div className="mt-0.5 flex items-center gap-2">
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

        <StatusBadge status={course.is_published ? 'published' : 'draft'} />

        <div className="flex flex-shrink-0 items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Eye size={13} />}
            onClick={() => navigate(`/courses/${course.course_id}`)}
          >
            View
          </Button>

          {(isOwner || isAdmin) && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<FilePen size={13} />}
              onClick={() => navigate(`/instructor/courses/${course.course_id}/exam`)}
            >
              Create Exam
            </Button>
          )}

          {(isOwner || isAdmin) && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ClipboardList size={13} />}
              onClick={() => navigate(`/instructor/courses/${course.course_id}/exam/review`)}
            >
              Exam Review
            </Button>
          )}

          {(isOwner || isAdmin) && (
            <Button
              variant="secondary"
              size="sm"
              isLoading={isPending}
              leftIcon={course.is_published ? <EyeOff size={13} /> : <Globe size={13} />}
              onClick={() => publish(!course.is_published)}
            >
              {course.is_published ? 'Unpublish' : 'Publish'}
            </Button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 bg-white p-4">
          <div className="mb-3">
            <h3 className="mb-2 text-sm font-semibold text-gray-900">
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
const InstructorDashboard = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const { data, isLoading } = useCourses({ limit: 50 });

  if (isLoading) return <PageSpinner />;

  const courses = data?.courses ?? [];
  const published = courses.filter((c) => c.is_published).length;
  const drafts = courses.filter((c) => !c.is_published).length;

  const isAdmin = user?.role === ROLES.ADMINISTRATOR;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'Admin Panel' : 'Instructor Dashboard'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your courses and learners
          </p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={() => navigate('/instructor/courses/create')}>
          New Course
        </Button>
      </div>

      {isAdmin ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card padding="md" className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50">
              <BookOpen size={20} className="text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
              <p className="text-xs text-gray-500">Total Courses</p>
            </div>
          </Card>

          <Card padding="md" className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50">
              <Globe size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{published}</p>
              <p className="text-xs text-gray-500">Published</p>
            </div>
          </Card>

          <Card padding="md" className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
              <EyeOff size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{drafts}</p>
              <p className="text-xs text-gray-500">Drafts</p>
            </div>
          </Card>
        </div>
      ) : (
        <Card padding="md" className="flex items-center justify-between gap-4 border-primary-100 bg-primary-50/40">
          <div>
            <p className="text-sm font-semibold text-gray-900">Browsing courses</p>
            <p className="text-xs text-gray-500">
              You can see published courses from other instructors, but you can only manage your own courses.
            </p>
          </div>
          <Badge variant="neutral">{courses.length} visible</Badge>
        </Card>
      )}

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {isAdmin ? 'All Courses' : 'Visible Courses'}
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
                label: 'Create Course',
                onClick: () => navigate('/instructor/courses/create'),
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

export default InstructorDashboard;