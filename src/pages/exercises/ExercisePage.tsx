import { useParams, useNavigate }  from 'react-router-dom';
import { useForm }                       from 'react-hook-form';
import { zodResolver }                   from '@hookform/resolvers/zod';
import { z }                             from 'zod';
import {
  ArrowLeft, CheckCircle, FileText,
  Download, Users, Star,
} from 'lucide-react';
import { useExercise }       from '../../hooks/useExercises';
import { useMySubmissions }  from '../../hooks/useExercises';
import { useSubmissions }    from '../../hooks/useExercises';
import { useSubmitExercise } from '../../hooks/useExercises';
import { useAuthStore }      from '../../store/auth.store';
import Input                 from '../../components/ui/Input';
import Button                from '../../components/ui/Button';
import Card, { CardHeader, CardTitle } from '../../components/ui/Card';
import Badge                 from '../../components/ui/Badge';
import { PageSpinner }       from '../../components/ui/Spinner';
import EmptyState            from '../../components/ui/EmptyState';
import { ROLES }             from '../../utils/constants';
import { formatDateTime }    from '../../utils/format';

const submitSchema = z.object({
  score: z
    .number({ invalid_type_error: 'Score must be a number' })
    .min(0,   'Score cannot be less than 0')
    .max(100, 'Score cannot exceed 100')
    .optional(),
});

type SubmitFormData = z.infer<typeof submitSchema>;

// ── Score display ─────────────────────────────────────────────
const ScoreDisplay = ({ score }: { score: number | null }) => {
  if (score === null) return (
    <Badge variant="neutral">No score recorded</Badge>
  );

  const variant =
    score >= 80 ? 'success' :
    score >= 50 ? 'warning' : 'danger';

  return (
    <Badge variant={variant} className="text-base px-3 py-1">
      {score}/100
    </Badge>
  );
};

// ── Content type label ────────────────────────────────────────
const contentTypeLabel: Record<string, string> = {
  quiz:       'Quiz',
  worksheet:  'Worksheet',
  simulation: 'Simulation',
};

const ExercisePage = () => {
  const { course_id, exercise_id } = useParams<{
    course_id:   string;
    exercise_id: string;
  }>();
  const navigate = useNavigate();
  const user     = useAuthStore((s) => s.user);

  const courseId   = parseInt(course_id   ?? '0', 10);
  const exerciseId = parseInt(exercise_id ?? '0', 10);

  const isLearner = user?.role === ROLES.LEARNER;
  const isMentor  =
    user?.role === ROLES.MENTOR ||
    user?.role === ROLES.ADMINISTRATOR;

  // Fetch exercise
  const {
    data: exercise,
    isLoading: exerciseLoading,
  } = useExercise(courseId, exerciseId);

  // Fetch learner's own submissions for this course
  const {
    data: mySubmissions,
    isLoading: submissionsLoading,
  } = useMySubmissions(courseId);

  // Fetch all submissions (mentor/admin)
  const {
    data: allSubmissions,
  } = useSubmissions(courseId, exerciseId);

  // Submit mutation
  const {
    mutate: submitExercise,
    isPending: submitting,
  } = useSubmitExercise(courseId, exerciseId);

  // Find if learner already submitted this exercise
  const mySubmission = mySubmissions?.find(
    (s) => s.exercise_id === exerciseId
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SubmitFormData>({
    resolver: zodResolver(submitSchema),
  });

  const onSubmit = (data: SubmitFormData) => {
    submitExercise({ score: data.score });
  };

  const isLoading = exerciseLoading || submissionsLoading;

  // ── Loading ────────────────────────────────────────────────
  if (isLoading) return <PageSpinner />;

  // ── Not found ──────────────────────────────────────────────
  if (!exercise) return (
    <div className="min-h-screen flex items-center justify-center">
      <EmptyState
        title="Exercise not found"
        action={{
          label:   'Back to Course',
          onClick: () => navigate(`/courses/${courseId}`),
        }}
      />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">

      {/* Back */}
      <button
        onClick={() => navigate(`/courses/${courseId}`)}
        className="flex items-center gap-2 text-sm text-gray-500
                    hover:text-gray-700 transition-colors self-start"
      >
        <ArrowLeft size={15} />
        Back to Course
      </button>

      {/* Exercise header */}
      <div className="flex flex-col gap-2">
        <Badge variant="info" className="self-start">
          {contentTypeLabel[exercise.content_type] ?? exercise.content_type}
        </Badge>
        <h1 className="text-2xl font-bold text-gray-900">
          {exercise.title}
        </h1>
        <p className="text-sm text-gray-500">
          From lesson: {exercise.lesson_title}
        </p>
      </div>

      {/* Worksheet download */}
      {exercise.file_url && exercise.is_downloadable && (
        <Card padding="md" className="flex items-center gap-4">
          <div className="w-10 h-10 bg-red-50 rounded-lg
                            flex items-center justify-center">
            <FileText size={18} className="text-red-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">
              Exercise File
            </p>
            <p className="text-xs text-gray-400">
              Download and complete this worksheet
            </p>
          </div>
          
            href={exercise.file_url}
            target="_blank"
            rel="noopener noreferrer"
            download
          >
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Download size={13} />}
            >
              Download
            </Button>
          </a>
        </Card>
      )}

      {/* ── LEARNER VIEW ──────────────────────────────────── */}
      {isLearner && (
        <>
          {mySubmission ? (
            // Already submitted
            <Card padding="md" className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className="text-green-500" />
                <h2 className="text-base font-semibold text-gray-900">
                  Already Submitted
                </h2>
              </div>

              <div className="flex items-center justify-between
                               py-3 border-y border-gray-100">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Your Score</p>
                  <ScoreDisplay score={mySubmission.score} />
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 mb-1">Submitted</p>
                  <p className="text-sm text-gray-600">
                    {formatDateTime(mySubmission.submitted_at)}
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-500">
                You have already submitted this exercise.
                Only one submission is allowed per exercise.
              </p>
            </Card>
          ) : (
            // Submit form
            <Card padding="md">
              <CardHeader>
                <CardTitle>Submit Your Answer</CardTitle>
              </CardHeader>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-5"
              >
                <Input
                  label="Your Score (optional)"
                  type="number"
                  placeholder="Enter your score (0 - 100)"
                  error={errors.score?.message}
                  helperText="Leave empty if no score applies to this exercise"
                  leftIcon={<Star size={15} />}
                  {...register('score', { valueAsNumber: true })}
                />

                <div className="bg-blue-50 border border-blue-200
                                  rounded-xl p-4 text-sm text-blue-700">
                  <p className="font-semibold mb-1">Before submitting:</p>
                  <ul className="list-disc list-inside text-xs
                                   text-blue-600 flex flex-col gap-1">
                    <li>Complete all tasks in this exercise</li>
                    <li>Double-check your work</li>
                    <li>You can only submit once</li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  isLoading={submitting}
                  fullWidth
                  size="lg"
                >
                  {submitting ? 'Submitting...' : 'Submit Exercise'}
                </Button>
              </form>
            </Card>
          )}
        </>
      )}

      {/* ── MENTOR / ADMIN VIEW ───────────────────────────── */}
      {isMentor && (
        <Card padding="md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={16} />
              Learner Submissions
            </CardTitle>
            <Badge variant="neutral">
              {allSubmissions?.length ?? 0}
            </Badge>
          </CardHeader>

          {!allSubmissions?.length ? (
            <EmptyState
              title="No submissions yet"
              description="Learners have not submitted this exercise yet."
            />
          ) : (
            <div className="flex flex-col gap-0">
              {/* Table header */}
              <div className="grid grid-cols-3 gap-4 px-3 py-2
                               bg-gray-50 rounded-lg mb-2 text-xs
                               font-semibold text-gray-500 uppercase
                               tracking-wide">
                <span>Learner</span>
                <span className="text-center">Score</span>
                <span className="text-right">Submitted</span>
              </div>

              {/* Table rows */}
              {allSubmissions.map((sub) => (
                <div
                  key={sub.submission_id}
                  className="grid grid-cols-3 gap-4 px-3 py-3
                               border-b border-gray-100 last:border-0
                               items-center"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {sub.learner_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {sub.learner_email}
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <ScoreDisplay score={sub.score} />
                  </div>
                  <p className="text-xs text-gray-500 text-right">
                    {formatDateTime(sub.submitted_at)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

    </div>
  );
};

export default ExercisePage;