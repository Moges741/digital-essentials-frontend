
import { useNavigate }       from 'react-router-dom';
import {
  Plus, BookOpen,
  Eye, Globe, EyeOff,
} from 'lucide-react';
import { useCourses }        from '../../hooks/useCourses';
import { usePublishCourse }  from '../../hooks/useCourses';
import { useAuthStore }      from '../../store/auth.store';
import Card, { CardHeader, CardTitle } from '../../components/ui/Card';
import Button                from '../../components/ui/Button';
import Badge, { StatusBadge } from '../../components/ui/Badge';
import EmptyState            from '../../components/ui/EmptyState';
import { PageSpinner }       from '../../components/ui/Spinner';
import { formatDate }        from '../../utils/format';
import { ROLES }             from '../../utils/constants';

// ── Course row in the table ───────────────────────────────────
const CourseRow = ({ course }: { course: any }) => {
  const navigate = useNavigate();
  const { mutate: publish, isPending } = usePublishCourse(course.course_id);

  return (
    <div className="flex items-center gap-4 py-4
                     border-b border-gray-100 last:border-0">

      {/* Title and meta */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {course.title}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          Created {formatDate(course.created_at)}
        </p>
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

      {/* Courses table */}
      <Card padding="md">
        <CardHeader>
          <CardTitle>
            {isAdmin ? 'All Courses' : 'My Courses'}
          </CardTitle>
          <Badge variant="neutral">{courses.length}</Badge>
        </CardHeader>

        {courses.length === 0 ? (
          <EmptyState
            icon={<BookOpen size={24} />}
            title="No courses yet"
            description="Create your first course to get started."
            action={{
              label:   'Create Course',
              onClick: () => navigate('/mentor/courses/create'),
            }}
          />
        ) : (
          <div>
            {courses.map((course) => (
              <CourseRow key={course.course_id} course={course} />
            ))}
          </div>
        )}
      </Card>

    </div>
  );
};

export default MentorDashboard;