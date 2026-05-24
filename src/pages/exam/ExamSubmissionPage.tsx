// src/pages/exam/ExamSubmissionPage.tsx
// Individual submission grading page for instructors

import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle, XCircle, Clock,
  User,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { examApi } from '../../api/exam.api';
import { useGradeAnswer } from '../../hooks/useExam';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { formatDateTime } from '../../utils/format';

const ExamSubmissionPage = () => {
  const { course_id, submission_id } = useParams<{
    course_id: string;
    submission_id: string;
  }>();
  const navigate = useNavigate();
  const courseId = parseInt(course_id ?? '0', 10);
  const submissionId = parseInt(submission_id ?? '0', 10);

  const queryClient = useQueryClient();
  const { mutate: gradeAnswer, isPending: grading } = useGradeAnswer(courseId);

  // Fetch the specific submission with answers
  const { data: submission } = useQuery({
    queryKey: ['exam-submission', courseId, submissionId],
    queryFn: () => examApi.getSubmission(courseId, submissionId),
  });

  if (!submission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EmptyState
          title="Submission not found"
          description="The requested exam submission could not be found."
          action={{
            label: 'Back to Submissions',
            onClick: () => navigate(`/instructor/courses/${courseId}/exam/review`),
          }}
        />
      </div>
    );
  }

  const handleGrade = (answerId: number, isCorrect: boolean) => {
    gradeAnswer(
      { submission_id: submissionId, answer_id: answerId, is_correct: isCorrect },
      {
        onSuccess: () => {
          // Refresh the submissions data
          queryClient.invalidateQueries({
            queryKey: ['exam-submissions', courseId],
          });
        },
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/instructor/courses/${courseId}/exam/review`)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={15} /> Back to Submissions
        </button>
      </div>

      {/* Submission Info */}
      <Card padding="md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <User size={20} className="text-primary-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  {submission.learner_name}'s Exam Submission
                </h1>
                <p className="text-sm text-gray-500">
                  {submission.learner_email} • Submitted {formatDateTime(submission.submitted_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {submission.is_fully_graded ? (
                <Badge variant={submission.is_passed ? 'success' : 'danger'}>
                  {submission.is_passed ? 'Passed' : 'Failed'} • {submission.score}%
                </Badge>
              ) : (
                <Badge variant="warning" dot>
                  {submission.pending_count} pending
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Answers to Grade */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Review Answers
        </h2>

        {submission.answers.map((answer, index) => (
          <Card key={answer.answer_id} padding="md">
            <div className="flex items-start gap-4">
              {/* Question Number */}
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-semibold text-gray-700">
                  {index + 1}
                </span>
              </div>

              {/* Question and Answer */}
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  {answer.question_text}
                </h3>

                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Learner's Answer:</p>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">
                      {answer.answer_text}
                    </p>
                  </div>
                </div>

                {/* Grading Status */}
                {answer.is_correct === null ? (
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-amber-500" />
                    <span className="text-sm text-amber-700">Pending Review</span>
                  </div>
                ) : answer.is_correct ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-500" />
                    <span className="text-sm text-green-700">Marked Correct</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <XCircle size={16} className="text-red-500" />
                    <span className="text-sm text-red-700">Marked Incorrect</span>
                  </div>
                )}

                {/* Grading Buttons - Only show for short answers that aren't graded */}
                {answer.question_type === 'short_answer' && answer.is_correct === null && (
                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      variant="success"
                      size="sm"
                      leftIcon={<CheckCircle size={14} />}
                      onClick={() => handleGrade(answer.answer_id, true)}
                      isLoading={grading}
                    >
                      Mark Correct
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      leftIcon={<XCircle size={14} />}
                      onClick={() => handleGrade(answer.answer_id, false)}
                      isLoading={grading}
                    >
                      Mark Incorrect
                    </Button>
                  </div>
                )}

                {/* Show correct answer for MC questions */}
                {answer.question_type === 'multiple_choice' && answer.correct_answer && (
                  <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                    <p className="text-xs text-blue-700">
                      Correct Answer: {answer.correct_answer}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

    </div>
  );
};

export default ExamSubmissionPage;