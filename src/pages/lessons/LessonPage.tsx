
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, CheckCircle,
  Download, FileText, Volume2, Video,
  BookOpen, ArrowLeft,
} from 'lucide-react';
import { useLesson }         from '../../hooks/useLessons';
import { useLessons }        from '../../hooks/useLessons';
import { useCourseProgress } from '../../hooks/useProgress';
import { useMarkComplete }   from '../../hooks/useProgress';
import { useIsEnrolled }     from '../../hooks/useEnrollment';
import Button                from '../../components/ui/Button';
import Card                  from '../../components/ui/Card';
import ProgressBar           from '../../components/ui/ProgressBar';
import { PageSpinner }       from '../../components/ui/Spinner';
import EmptyState            from '../../components/ui/EmptyState';
import type { OfflineMaterial }   from '../../types/lesson.types';

// ── Material icon by type ─────────────────────────────────────
const MaterialIcon = ({ type }: { type: string }) => {
  const icons: Record<string, React.ReactNode> = {
    pdf:       <FileText  size={16} className="text-red-500" />,
    audio:     <Volume2   size={16} className="text-purple-500" />,
    video:     <Video     size={16} className="text-blue-500" />,
    worksheet: <BookOpen  size={16} className="text-green-500" />,
  };
  return <>{icons[type] ?? <FileText size={16} />}</>;
};

// ── Material type label ───────────────────────────────────────
const typeLabel: Record<string, string> = {
  pdf:       'PDF Document',
  audio:     'Audio Lesson',
  video:     'Video',
  worksheet: 'Worksheet',
};

const LessonPage = () => {
  const { course_id, lesson_id } = useParams<{
    course_id: string;
    lesson_id: string;
  }>();
  const navigate = useNavigate();

  const courseId = parseInt(course_id ?? '0', 10);
  const lessonId = parseInt(lesson_id ?? '0', 10);

  // Fetch data
  const { data: lesson,   isLoading: lessonLoading  } = useLesson(courseId, lessonId);
  const { data: lessons,  isLoading: lessonsLoading } = useLessons(courseId);
  const { data: progress, isLoading: progressLoading } = useCourseProgress(courseId);
  const { isEnrolled }                                 = useIsEnrolled(courseId);
  const { mutate: markComplete, isPending: marking }   = useMarkComplete(courseId);

  // Find current lesson's position in list
  const currentIndex  = lessons?.findIndex((l) => l.lesson_id === lessonId) ?? -1;
  const prevLesson    = currentIndex > 0 ? lessons?.[currentIndex - 1] : null;
  const nextLesson    = currentIndex >= 0 && lessons
    ? lessons[currentIndex + 1] ?? null
    : null;

  // Find progress for this specific lesson
  const lessonProgress = progress?.lessons.find(
    (l) => l.lesson_id === lessonId
  );
  const isCompleted = lessonProgress?.is_completed ?? false;

  const isLoading = lessonLoading || lessonsLoading || progressLoading;

  // ── Loading ───────────────────────────────────────────────
  if (isLoading) return <PageSpinner />;

  // ── Not found ─────────────────────────────────────────────
  if (!lesson) return (
    <div className="min-h-screen flex items-center justify-center">
      <EmptyState
        title="Lesson not found"
        description="This lesson may have been removed."
        action={{
          label: 'Back to Course',
          onClick: () => navigate(`/courses/${courseId}`)
        }}
      />
    </div>
  );

  // ── Not enrolled ──────────────────────────────────────────
  if (!isEnrolled) return (
    <div className="min-h-screen flex items-center justify-center">
      <EmptyState
        title="Enrollment required"
        description="You need to enroll in this course to view lessons."
        action={{
          label: 'View Course',
          onClick: () => navigate(`/courses/${courseId}`)
        }}
      />
    </div>
  );

  const materials = lesson.materials ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Back to course */}
      <button
        onClick={() => navigate(`/courses/${courseId}`)}
        className="flex items-center gap-2 text-sm text-gray-500
                    hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft size={15} />
        Back to Course
      </button>

      {/* Overall progress bar */}
      {progress && (
        <div className="mb-6">
          <ProgressBar
            value={progress.percentage}
            size="sm"
            showLabel
            label={`Course progress: ${progress.completed_lessons}/${progress.total_lessons} lessons`}
          />
        </div>
      )}

      {/* Lesson position indicator */}
      {lessons && (
        <p className="text-xs text-gray-400 mb-3">
          Lesson {currentIndex + 1} of {lessons.length}
        </p>
      )}

      {/* Lesson title */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 leading-snug">
          {lesson.title}
        </h1>
        {isCompleted && (
          <div className="flex items-center gap-1.5 text-green-600
                           bg-green-50 border border-green-200
                           rounded-full px-3 py-1 flex-shrink-0">
            <CheckCircle size={14} />
            <span className="text-xs font-medium">Completed</span>
          </div>
        )}
      </div>

      {/* Lesson content */}
      <Card padding="lg" className="mb-6">
        {lesson.content ? (
          <div className="prose prose-sm max-w-none text-gray-700
                           leading-relaxed whitespace-pre-wrap">
            {lesson.content}
          </div>
        ) : (
          <p className="text-gray-400 italic text-sm">
            No written content for this lesson.
            Check the materials below.
          </p>
        )}
      </Card>

      {/* Offline materials */}
      {materials.length > 0 && (
        <div className="mb-8">
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            Lesson Materials
          </h2>
          <div className="flex flex-col gap-3">
            {materials.map((material: OfflineMaterial) => (
              <div
                key={material.material_id}
                className="flex items-center gap-4 p-4 bg-white
                            border border-gray-200 rounded-xl
                            hover:border-primary-300 transition-colors"
              >
                {/* Icon */}
                <div className="w-10 h-10 bg-gray-50 rounded-lg
                                  flex items-center justify-center
                                  flex-shrink-0">
                  <MaterialIcon type={material.file_type} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {material.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {typeLabel[material.file_type] ?? material.file_type}
                  </p>
                </div>

                {/* Download/View button */}
                {material.is_downloadable ? (
                  <a
                    href={material.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<Download size={13} />}
                    >
                      Download
                    </Button>
                  </a>
                ) : (
                  <a
                    href={material.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mark complete + navigation */}
      <div className="flex items-center justify-between gap-4
                       border-t border-gray-200 pt-6">

        {/* Previous lesson */}
        <div>
          {prevLesson ? (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ChevronLeft size={16} />}
              onClick={() =>
                navigate(
                  `/courses/${courseId}/lessons/${prevLesson.lesson_id}`
                )
              }
            >
              <span className="hidden sm:inline">Previous</span>
            </Button>
          ) : (
            <div />
          )}
        </div>

        {/* Mark complete */}
        <Button
          variant={isCompleted ? 'success' : 'primary'}
          size="md"
          isLoading={marking}
          disabled={isCompleted}
          leftIcon={
            isCompleted
              ? <CheckCircle size={16} />
              : undefined
          }
          onClick={() => {
            if (!isCompleted) markComplete(lessonId);
          }}
        >
          {isCompleted ? 'Completed' : 'Mark as Complete'}
        </Button>

        {/* Next lesson */}
        <div>
          {nextLesson ? (
            <Button
              variant={isCompleted ? 'primary' : 'secondary'}
              size="sm"
              rightIcon={<ChevronRight size={16} />}
              onClick={() =>
                navigate(
                  `/courses/${courseId}/lessons/${nextLesson.lesson_id}`
                )
              }
            >
              <span className="hidden sm:inline">Next</span>
            </Button>
          ) : (
            isCompleted && (
              <Button
                variant="success"
                size="sm"
                onClick={() => navigate(`/courses/${courseId}`)}
              >
                Finish Course
              </Button>
            )
          )}
        </div>

      </div>

    </div>
  );
};

export default LessonPage;