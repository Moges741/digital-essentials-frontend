
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Clock, User, BookOpen, ChevronRight,
  CheckCircle, Lock, Play, Globe, EyeOff,
  Plus, Trash2,
} from 'lucide-react';
import { useCourse }                   from '../../hooks/useCourses';
import { usePublishCourse, useDeleteCourse } from '../../hooks/useCourses';
import { useIsEnrolled, useEnroll }    from '../../hooks/useEnrollment';
import { useAuthStore }                from '../../store/auth.store';
import Button                          from '../../components/ui/Button';
import Badge, { StatusBadge }          from '../../components/ui/Badge';
import Card                            from '../../components/ui/Card';
import { PageSpinner }                 from '../../components/ui/Spinner';
import EmptyState                      from '../../components/ui/EmptyState';
import { ConfirmModal }                from '../../components/ui/Modal';
import { ROLES }                       from '../../utils/constants';
import { formatDate }                  from '../../utils/format';
import { useState }                    from 'react';

const CourseDetailPage = () => {
  const { course_id }           = useParams<{ course_id: string }>();
  const navigate                = useNavigate();
  const user                    = useAuthStore((state) => state.user);
  const [showDelete, setShowDelete] = useState(false);

  const courseId = parseInt(course_id ?? '0', 10);

  const { data: course, isLoading, isError } = useCourse(courseId);
  const { isEnrolled, enrollment }           = useIsEnrolled(courseId);
  const { mutate: enroll, isPending: enrolling } = useEnroll();
  const { mutate: publish, isPending: publishing } = usePublishCourse(courseId);
  const { mutate: deleteCourse, isPending: deleting } = useDeleteCourse();

  const isOwner = user?.user_id === course?.created_by;
  const isAdmin = user?.role === ROLES.ADMINISTRATOR;
//   const isMentor = user?.role === ROLES.MENTOR;
  const canManage = isOwner || isAdmin;

  const formatDuration = (mins: number) => {
    if (!mins) return 'Self-paced';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
  };

  // ── Loading ─────────────────────────────────────────────
  if (isLoading) return <PageSpinner />;

  // ── Error / Not found ──────────────────────────────────
  if (isError || !course) return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
      <EmptyState
        title="Course not found"
        description="This course may have been removed or is not yet published."
        action={{ label: 'Browse Courses', onClick: () => navigate('/courses') }}
      />
    </div>
  );

  const lessons = course.lessons ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/courses" className="hover:text-primary-600 transition-colors">
          Courses
        </Link>
        <ChevronRight size={14} />
        <span className="text-gray-800 font-medium truncate">
          {course.title}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Left column — course info ──────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Course header */}
          <div>
            {/* Status badge */}
            <div className="flex items-center gap-2 mb-3">
              <StatusBadge status={course.is_published ? 'published' : 'draft'} />
              {canManage && !course.is_published && (
                <Badge variant="warning">Only visible to you</Badge>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-3">
              {course.title}
            </h1>

            <p className="text-gray-600 leading-relaxed mb-4">
              {course.description}
            </p>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <User size={15} />
                {course.creator_name}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={15} />
                {formatDuration(course.duration_mins)}
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen size={15} />
                {lessons.length} lesson{lessons.length !== 1 ? 's' : ''}
              </span>
              <span className="text-xs text-gray-400">
                Created {formatDate(course.created_at)}
              </span>
            </div>
          </div>

          {/* Mentor controls */}
          {canManage && (
            <Card padding="md" className="border-amber-200 bg-amber-50">
              <p className="text-xs font-semibold text-amber-700 mb-3">
                Course Management
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  isLoading={publishing}
                  leftIcon={course.is_published ? <EyeOff size={14} /> : <Globe size={14} />}
                  onClick={() => publish(!course.is_published)}
                >
                  {course.is_published ? 'Unpublish' : 'Publish'}
                </Button>
                <Link to={`/mentor/courses/create?edit=${course.course_id}`}>
                  <Button variant="secondary" size="sm">
                    Edit Course
                  </Button>
                </Link>
                {isAdmin && (
                  <Button
                    variant="danger"
                    size="sm"
                    leftIcon={<Trash2 size={14} />}
                    onClick={() => setShowDelete(true)}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </Card>
          )}

          {/* Lesson list */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">
                Course Content
              </h2>
              {canManage && (
                <Link to={`/mentor/courses/${courseId}/lessons/create`}>
                  <Button variant="ghost" size="sm" leftIcon={<Plus size={14} />}>
                    Add Lesson
                  </Button>
                </Link>
              )}
            </div>

            {lessons.length === 0 ? (
              <EmptyState
                title="No lessons yet"
                description={
                  canManage
                    ? 'Add lessons to this course to get started'
                    : 'Lessons will appear here soon'
                }
              />
            ) : (
              <div className="flex flex-col gap-2">
                {lessons.map((lesson, index) => {
                  const isAccessible = isEnrolled || canManage;

                  return (
                    <div
                      key={lesson.lesson_id}
                      onClick={() => {
                        if (isAccessible) {
                          if (canManage) {
                            navigate(
                              `/mentor/courses/${courseId}/lessons/${lesson.lesson_id}/edit`
                            );
                          } else {
                            navigate(
                              `/courses/${courseId}/lessons/${lesson.lesson_id}`
                            );
                          }
                        }
                      }}
                      className={`
                        flex items-center gap-3 p-4 rounded-xl border
                        transition-all duration-150
                        ${isAccessible
                          ? 'border-gray-200 hover:border-primary-300 hover:bg-primary-50 cursor-pointer'
                          : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                        }
                      `}
                    >
                      {/* Lesson number */}
                      <div className={`
                        w-7 h-7 rounded-full flex items-center justify-center
                        text-xs font-bold flex-shrink-0
                        ${isAccessible
                          ? 'bg-primary-100 text-primary-700'
                          : 'bg-gray-200 text-gray-400'
                        }
                      `}>
                        {index + 1}
                      </div>

                      {/* Title */}
                      <span className={`
                        text-sm font-medium flex-1
                        ${isAccessible ? 'text-gray-800' : 'text-gray-400'}
                      `}>
                        {lesson.title}
                      </span>

                      {/* Icon */}
                      {isAccessible
                        ? <Play size={14} className="text-primary-500" />
                        : <Lock size={14} className="text-gray-300" />
                      }
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* ── Right column — enroll card ─────────────────── */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <Card padding="md" className="flex flex-col gap-4">

              {/* Already enrolled */}
              {isEnrolled && enrollment ? (
                <>
                  <div className="flex items-center gap-2 text-green-700
                                   bg-green-50 rounded-lg px-3 py-2">
                    <CheckCircle size={16} />
                    <span className="text-sm font-medium">
                      You are enrolled
                    </span>
                  </div>
                  <Badge variant="neutral" className="self-start">
                    Status: {enrollment.status}
                  </Badge>
                  {lessons.length > 0 && (
                    <Button
                      fullWidth
                      onClick={() =>
                        navigate(
                          `/courses/${courseId}/lessons/${lessons[0].lesson_id}`
                        )
                      }
                      leftIcon={<Play size={16} />}
                    >
                      Continue Learning
                    </Button>
                  )}
                </>
              ) : user?.role === ROLES.LEARNER ? (
                <>
                  <p className="text-sm text-gray-600">
                    Enroll to access all lessons and track your progress.
                  </p>
                  <Button
                    fullWidth
                    size="lg"
                    isLoading={enrolling}
                    onClick={() => enroll({ course_id: courseId })}
                    disabled={!course.is_published}
                  >
                    {enrolling ? 'Enrolling...' : 'Enroll Now'}
                  </Button>
                  {!course.is_published && (
                    <p className="text-xs text-center text-gray-400">
                      This course is not published yet
                    </p>
                  )}
                </>
              ) : !user ? (
                <>
                  <p className="text-sm text-gray-600">
                    Create a free account to enroll in this course.
                  </p>
                  <Link to="/register">
                    <Button fullWidth size="lg">
                      Get Started Free
                    </Button>
                  </Link>
                  <Link to="/login" className="text-center">
                    <Button variant="ghost" fullWidth size="sm">
                      Already have an account?
                    </Button>
                  </Link>
                </>
              ) : (
                // Mentor or admin viewing
                <p className="text-sm text-gray-500 text-center">
                  You are the course {isOwner ? 'creator' : 'administrator'}.
                </p>
              )}

              {/* Course stats */}
              <div className="border-t border-gray-100 pt-4 flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Lessons</span>
                  <span className="font-medium">{lessons.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-medium">
                    {formatDuration(course.duration_mins)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Instructor</span>
                  <span className="font-medium">{course.creator_name}</span>
                </div>
              </div>

            </Card>
          </div>
        </div>

      </div>

      {/* Delete confirm modal */}
      <ConfirmModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => deleteCourse(courseId)}
        isLoading={deleting}
        title="Delete Course"
        message={`Are you sure you want to delete "${course.title}"? This will permanently remove all lessons, enrollments, and progress data.`}
      />

    </div>
  );
};

export default CourseDetailPage;