import { useNavigate }        from 'react-router-dom';
import { CheckCircle, Circle, Trophy } from 'lucide-react';
import Card, { CardHeader } from '../ui/Card';
import ProgressBar            from '../ui/ProgressBar';
import  { StatusBadge } from '../ui/Badge';
// import Badge from '../ui/Badge';
import Button                 from '../ui/Button';
import type { CourseProgressSummary } from '../../types/progress.types';

interface ProgressTrackerProps {
  summary:   CourseProgressSummary;
  showLessons?: boolean;   // show lesson-level list (used on ProgressPage)
  compact?:     boolean;   // compact mode (used on Dashboard cards)
}

const ProgressTracker = ({
  summary,
  showLessons = false,
  compact     = false,
}: ProgressTrackerProps) => {
  const navigate = useNavigate();

  return (
    <Card padding={compact ? 'sm' : 'md'} className="flex flex-col gap-3">

      {/* Header */}
      <CardHeader className="mb-0">
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-gray-900 truncate
                         ${compact ? 'text-sm' : 'text-base'}`}>
            {summary.course_title}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={summary.status} />
            {summary.status === 'completed' && (
              <Trophy size={14} className="text-amber-500" />
            )}
          </div>
        </div>
        {!compact && (
          <span className="text-2xl font-bold text-primary-600">
            {summary.percentage}%
          </span>
        )}
      </CardHeader>

      {/* Progress bar */}
      <ProgressBar
        value={summary.percentage}
        size={compact ? 'sm' : 'md'}
        showLabel={!compact}
        label={`${summary.completed_lessons} of ${summary.total_lessons} lessons`}
      />

      {/* Lesson list (only on ProgressPage) */}
      {showLessons && summary.lessons.length > 0 && (
        <div className="flex flex-col gap-2 mt-2">
          {summary.lessons.map((lesson) => (
            <div
              key={lesson.lesson_id}
              className="flex items-center gap-3 py-2 border-b
                          border-gray-50 last:border-0"
            >
              {lesson.is_completed ? (
                <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
              ) : (
                <Circle size={16} className="text-gray-300 flex-shrink-0" />
              )}
              <span className={`text-sm flex-1 ${
                lesson.is_completed
                  ? 'text-gray-500 line-through'
                  : 'text-gray-800'
              }`}>
                {lesson.lesson_title}
              </span>
              <span className="text-xs text-gray-400">
                #{lesson.lesson_order}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Continue button (compact mode) */}
      {compact && summary.status !== 'completed' && (
        <Button
          variant="ghost"
          size="sm"
          fullWidth
          onClick={() =>
            navigate(`/progress/course/${summary.course_id}`)
          }
        >
          View Progress
        </Button>
      )}

    </Card>
  );
};

export default ProgressTracker;