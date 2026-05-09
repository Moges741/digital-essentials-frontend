
import { useNavigate }      from 'react-router-dom';
import {
  BookOpen, Award, BarChart2,
  GraduationCap, ArrowRight,
} from 'lucide-react';
import { useMyEnrollments }  from '../../hooks/useEnrollment';
import { useCourseProgress } from '../../hooks/useProgress';
import { useAuthStore }      from '../../store/auth.store';
import Card, { CardHeader } from '../../components/ui/Card';
import Button                from '../../components/ui/Button';
import ProgressBar           from '../../components/ui/ProgressBar';
import EmptyState            from '../../components/ui/EmptyState';
import { StatusBadge }       from '../../components/ui/Badge';
import { PageSpinner }       from '../../components/ui/Spinner';
import { formatDate }        from '../../utils/format';

// ── Stat card ────────────────────────────────────────────────
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

// ── Enrollment card with progress ────────────────────────────
const EnrollmentCard = ({
  enrollment,
}: {
  enrollment: any;
}) => {
  const navigate = useNavigate();
  const { data: progress } = useCourseProgress(enrollment.course_id);

  return (
    <Card
      hover
      padding="md"
      onClick={() => navigate(`/courses/${enrollment.course_id}`)}
      className="flex flex-col gap-3"
    >
      <CardHeader className="mb-0">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {enrollment.course_title}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {enrollment.creator_name} · Enrolled {formatDate(enrollment.enrollment_date)}
          </p>
        </div>
        <StatusBadge status={enrollment.status} />
      </CardHeader>

      {/* Progress bar */}
      {progress ? (
        <ProgressBar
          value={progress.percentage}
          size="sm"
          showLabel
          label={`${progress.completed_lessons}/${progress.total_lessons} lessons`}
        />
      ) : (
        <ProgressBar value={0} size="sm" />
      )}

      {/* Continue button */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          rightIcon={<ArrowRight size={13} />}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/dashboard/progress`);
          }}
        >
          View Progress
        </Button>
      </div>
    </Card>
  );
};

// ── Main Dashboard ────────────────────────────────────────────
const LearnerDashboard = () => {
  const navigate                          = useNavigate();
  const user                              = useAuthStore((s) => s.user);
  const { data: enrollments, isLoading }  = useMyEnrollments();

  if (isLoading) return <PageSpinner />;

  const activeEnrollments    = enrollments?.filter((e) => e.status === 'active')    ?? [];
  const completedEnrollments = enrollments?.filter((e) => e.status === 'completed') ?? [];
  const totalEnrollments     = enrollments?.length ?? 0;

  return (
    <div className="flex flex-col gap-8">

      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Continue your learning journey
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<GraduationCap size={20} className="text-primary-600" />}
          label="Enrolled Courses"
          value={totalEnrollments}
          color="bg-primary-50"
        />
        <StatCard
          icon={<BarChart2 size={20} className="text-green-600" />}
          label="In Progress"
          value={activeEnrollments.length}
          color="bg-green-50"
        />
        <StatCard
          icon={<Award size={20} className="text-amber-600" />}
          label="Completed"
          value={completedEnrollments.length}
          color="bg-amber-50"
        />
      </div>

      {/* Enrolled courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">
            My Courses
          </h2>
          <Button
            variant="ghost"
            size="sm"
            rightIcon={<ArrowRight size={14} />}
            onClick={() => navigate('/courses')}
          >
            Browse More
          </Button>
        </div>

        {totalEnrollments === 0 ? (
          <EmptyState
            icon={<BookOpen size={28} />}
            title="No courses yet"
            description="Browse our course catalog and enroll in your first course."
            action={{
              label:   'Browse Courses',
              onClick: () => navigate('/courses'),
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {enrollments?.map((enrollment) => (
              <EnrollmentCard
                key={enrollment.enrollment_id}
                enrollment={enrollment}
              />
            ))}
          </div>
        )}
      </div>

      {/* Certificates shortcut */}
      {completedEnrollments.length > 0 && (
        <Card
          padding="md"
          className="flex items-center justify-between
                      bg-gradient-to-r from-amber-50 to-amber-100
                      border-amber-200"
        >
          <div className="flex items-center gap-3">
            <Award size={24} className="text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                You have {completedEnrollments.length} certificate
                {completedEnrollments.length !== 1 ? 's' : ''}!
              </p>
              <p className="text-xs text-amber-600">
                View and download your earned certificates
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/dashboard/certificates')}
          >
            View All
          </Button>
        </Card>
      )}

    </div>
  );
};

export default LearnerDashboard;