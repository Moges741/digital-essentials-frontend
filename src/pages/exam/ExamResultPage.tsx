
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Trophy, XCircle, CheckCircle,
  Clock, RefreshCw, Award,
} from 'lucide-react';
import { useExamResult } from '../../hooks/useExam';
import Card              from '../../components/ui/Card';
import Button            from '../../components/ui/Button';
// import Badge             from '../../components/ui/Badge';
import { PageSpinner }   from '../../components/ui/Spinner';
import EmptyState        from '../../components/ui/EmptyState';
import { formatDateTime } from '../../utils/format';

const ExamResultPage = () => {
  const { course_id } = useParams<{ course_id: string }>();
  const navigate      = useNavigate();
  const courseId      = parseInt(course_id ?? '0', 10);

  const { data: result, isLoading } = useExamResult(courseId);

  if (isLoading) return <PageSpinner />;

  if (!result) return (
    <div className="min-h-screen flex items-center justify-center">
      <EmptyState
        title="No submission found"
        description="You have not taken the exam yet."
        action={{
          label:   'Take Exam',
          onClick: () => navigate(`/courses/${courseId}/exam`),
        }}
      />
    </div>
  );

  const isPassed    = result.is_passed;
  const isFullyGraded = result.is_fully_graded;
  const score       = result.score;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 flex flex-col gap-6">

      {/* Result header */}
      <Card padding="lg" className={`text-center ${
        !isFullyGraded
          ? 'border-amber-200 bg-amber-50'
          : isPassed
            ? 'border-green-200 bg-green-50'
            : 'border-red-200 bg-red-50'
      }`}>
        <div className="flex justify-center mb-4">
          {!isFullyGraded ? (
            <div className="w-20 h-20 bg-amber-100 rounded-full
                              flex items-center justify-center">
              <Clock size={36} className="text-amber-600" />
            </div>
          ) : isPassed ? (
            <div className="w-20 h-20 bg-green-100 rounded-full
                              flex items-center justify-center">
              <Trophy size={36} className="text-green-600" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-red-100 rounded-full
                              flex items-center justify-center">
              <XCircle size={36} className="text-red-500" />
            </div>
          )}
        </div>

        {!isFullyGraded ? (
          <>
            <h1 className="text-xl font-bold text-amber-800 mb-2">
              Pending Review
            </h1>
            <p className="text-sm text-amber-700">
              Your short answer questions are being reviewed by
              your instructor. You will be notified when grading
              is complete.
            </p>
          </>
        ) : isPassed ? (
          <>
            <h1 className="text-xl font-bold text-green-800 mb-2">
              Congratulations! You Passed! 🎉
            </h1>
            <p className="text-sm text-green-700">
              Your certificate has been generated and is ready
              for download.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-red-700 mb-2">
              Not Passed Yet
            </h1>
            <p className="text-sm text-red-600">
              You can retake the exam to improve your score.
              Review your answers below to understand what to
              study.
            </p>
          </>
        )}

        {/* Score */}
        {isFullyGraded && score !== null && (
          <div className="mt-4 flex justify-center">
            <div className="px-6 py-3 bg-white rounded-xl
                              border border-current inline-block">
              <p className="text-3xl font-bold" style={{
                color: isPassed ? '#16a34a' : '#dc2626'
              }}>
                {score}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Submitted {formatDateTime(result.submitted_at)}
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {isPassed && isFullyGraded ? (
          <Link to="/dashboard/certificates" className="flex-1">
            <Button fullWidth leftIcon={<Award size={16} />}>
              View My Certificate
            </Button>
          </Link>
        ) : !isFullyGraded ? (
          <Button
            variant="secondary"
            fullWidth
            onClick={() => navigate(`/courses/${courseId}`)}
          >
            Back to Course
          </Button>
        ) : (
          <Button
            fullWidth
            leftIcon={<RefreshCw size={16} />}
            onClick={() => navigate(`/courses/${courseId}/exam`)}
          >
            Retake Exam
          </Button>
        )}
        <Button
          variant="secondary"
          onClick={() => navigate(`/courses/${courseId}`)}
          className="flex-1"
        >
          Back to Course
        </Button>
      </div>

      {/* Answer review — only when fully graded */}
      {isFullyGraded && result.answers.length > 0 && (
        <Card padding="md">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Your Answers
          </h2>
          <div className="flex flex-col gap-4">
            {result.answers.map((answer, i) => (
              <div
                key={answer.answer_id}
                className={`p-4 rounded-xl border ${
                  answer.is_correct
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start gap-2 mb-2">
                  {answer.is_correct ? (
                    <CheckCircle size={16}
                      className="text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle size={16}
                      className="text-red-500 flex-shrink-0 mt-0.5" />
                  )}
                  <p className="text-sm font-medium text-gray-900">
                    {i + 1}. {answer.question_text}
                  </p>
                </div>

                <div className="ml-6">
                  <p className="text-xs text-gray-500 mb-1">
                    Your answer:
                  </p>
                  <p className="text-sm text-gray-800 font-medium">
                    {answer.answer_text}
                  </p>

                  {/* Show correct answer for MC if wrong */}
                  {!answer.is_correct &&
                    answer.question_type === 'multiple_choice' &&
                    answer.correct_answer && (
                    <p className="text-xs text-green-600 mt-1">
                      Correct answer: {answer.correct_answer}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

    </div>
  );
};

export default ExamResultPage;