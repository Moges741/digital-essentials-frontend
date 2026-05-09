
import { useNavigate }      from 'react-router-dom';
import { BarChart2, BookOpen } from 'lucide-react';
import { useMyEnrollments } from '../../hooks/useEnrollment';
import { useCourseProgress } from '../../hooks/useProgress';
import ProgressTracker      from '../../components/progress/ProgressTracker';
import EmptyState           from '../../components/ui/EmptyState';
import { PageSpinner }      from '../../components/ui/Spinner';

// ── Progress card per course ──────────────────────────────────
const CourseProgressCard = ({ courseId }: { courseId: number }) => {
  const { data: progress, isLoading } = useCourseProgress(courseId);

  if (isLoading) return (
    <div className="h-40 bg-gray-50 rounded-xl animate-pulse" />
  );

  if (!progress) return null;

  return (
    <ProgressTracker
      summary={progress}
      showLessons
    />
  );
};

// ── Main Page ─────────────────────────────────────────────────
const ProgressPage = () => {
  const navigate = useNavigate();
  const { data: enrollments, isLoading } = useMyEnrollments();

  if (isLoading) return <PageSpinner />;

  // Only show active and completed enrollments
  const activeEnrollments = enrollments?.filter(
    (e) => e.status !== 'dropped'
  ) ?? [];

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-50 rounded-xl
                          flex items-center justify-center">
          <BarChart2 size={20} className="text-primary-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Progress</h1>
          <p className="text-sm text-gray-500">
            {activeEnrollments.length} course
            {activeEnrollments.length !== 1 ? 's' : ''} tracked
          </p>
        </div>
      </div>

      {/* Progress cards */}
      {activeEnrollments.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={28} />}
          title="No progress to show"
          description="Enroll in a course to start tracking your progress."
          action={{
            label:   'Browse Courses',
            onClick: () => navigate('/courses'),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {activeEnrollments.map((enrollment) => (
            <CourseProgressCard
              key={enrollment.enrollment_id}
              courseId={enrollment.course_id}
            />
          ))}
        </div>
      )}

    </div>
  );
};

export default ProgressPage;