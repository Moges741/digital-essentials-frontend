// src/pages/exam/ExamReviewPage.tsx
// Mentor reviews short answer submissions and grades them

import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Users,
} from 'lucide-react';
import {
  useExamSubmissions,
  useExam,
} from '../../hooks/useExam';
import Card, { CardHeader } from '../../components/ui/Card';
import Button          from '../../components/ui/Button';
import Badge           from '../../components/ui/Badge';
import { PageSpinner } from '../../components/ui/Spinner';
import EmptyState      from '../../components/ui/EmptyState';
import { formatDateTime } from '../../utils/format';

// ── Main Page ─────────────────────────────────────────────────
const ExamReviewPage = () => {
  const { course_id } = useParams<{ course_id: string }>();
  const navigate      = useNavigate();
  const courseId      = parseInt(course_id ?? '0', 10);

  const { data: exam,        isLoading: examLoading }  = useExam(courseId);
  const { data: submissions, isLoading: subsLoading }  = useExamSubmissions(courseId);
//   const { mutate: grade, isPending: grading }          = useGradeAnswer(courseId);

  const isLoading = examLoading || subsLoading;

  if (isLoading) return <PageSpinner />;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate(`/mentor`)}
            className="flex items-center gap-2 text-sm
                         text-gray-500 hover:text-gray-700 mb-2"
          >
            <ArrowLeft size={15} /> Back to Dashboard
          </button>
          <h1 className="text-xl font-bold text-gray-900">
            Exam Submissions Review
          </h1>
          {exam && (
            <p className="text-sm text-gray-500 mt-0.5">
              {exam.title} · Passing score: {exam.passing_score}%
            </p>
          )}
        </div>
      </div>

      {/* Submissions list */}
      {!submissions?.length ? (
        <EmptyState
          icon={<Users size={28} />}
          title="No submissions yet"
          description="Learners have not submitted the exam yet."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {submissions.map((sub) => (
            <Card key={sub.submission_id} padding="md">
              <CardHeader>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {sub.learner_name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {sub.learner_email} ·
                    Submitted {formatDateTime(sub.submitted_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {sub.is_fully_graded ? (
                    <Badge variant={sub.is_passed ? 'success' : 'danger'}>
                      {sub.is_passed ? 'Passed' : 'Failed'} ·{' '}
                      {sub.score}%
                    </Badge>
                  ) : (
                    <Badge variant="warning" dot>
                      {sub.pending_count} pending
                    </Badge>
                  )}
                </div>
              </CardHeader>

              {/* Show pending short answers to grade */}
              {sub.pending_count > 0 && (
                <div className="mt-3 p-3 bg-amber-50 border
                                   border-amber-200 rounded-xl">
                  <p className="text-xs font-semibold text-amber-700 mb-2">
                    Short answers requiring your review:
                  </p>
                  <p className="text-xs text-amber-600">
                    Click "Grade Answers" to review and mark
                    this learner's short answers.
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-2"
                    onClick={() =>
                      navigate(
                        `/mentor/courses/${courseId}/exam/submission/${sub.submission_id}`
                      )
                    }
                  >
                    Grade Answers
                  </Button>
                </div>
              )}

            </Card>
          ))}
        </div>
      )}

    </div>
  );
};

export default ExamReviewPage;