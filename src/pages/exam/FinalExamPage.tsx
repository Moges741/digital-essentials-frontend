
import { useState }     from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ClipboardList, Lock, AlertCircle } from 'lucide-react';
import { useExam, useSubmitExam, useExamResult } from '../../hooks/useExam';
import { useMyEnrollments } from '../../hooks/useEnrollment';
import Button           from '../../components/ui/Button';
import Card             from '../../components/ui/Card';
import { PageSpinner }  from '../../components/ui/Spinner';
import EmptyState       from '../../components/ui/EmptyState';
import type { ExamQuestion } from '../../types/exam.types';

// ── Multiple choice question ──────────────────────────────────
const MCQuestion = ({
  question,
  index,
  value,
  onChange,
}: {
  question: ExamQuestion;
  index:    number;
  value:    string;
  onChange: (v: string) => void;
}) => {
  const options = [
    { key: 'A', val: question.option_a },
    { key: 'B', val: question.option_b },
    { key: 'C', val: question.option_c },
    { key: 'D', val: question.option_d },
  ].filter((o) => o.val);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold text-gray-900">
        <span className="text-primary-600 mr-2">{index + 1}.</span>
        {question.question_text}
      </p>
      <div className="flex flex-col gap-2">
        {options.map((opt) => (
          <label
            key={opt.key}
            className={`
              flex items-center gap-3 p-3 rounded-xl border-2
              cursor-pointer transition-all
              ${value === opt.key
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            <input
              type="radio"
              name={`q_${question.question_id}`}
              value={opt.key}
              checked={value === opt.key}
              onChange={() => onChange(opt.key)}
              className="accent-primary-600 flex-shrink-0"
            />
            <span className={`text-sm ${
              value === opt.key
                ? 'text-primary-700 font-medium'
                : 'text-gray-700'
            }`}>
              <strong>{opt.key}.</strong> {opt.val}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

// ── Short answer question ─────────────────────────────────────
const SAQuestion = ({
  question,
  index,
  value,
  onChange,
}: {
  question: ExamQuestion;
  index:    number;
  value:    string;
  onChange: (v: string) => void;
}) => (
  <div className="flex flex-col gap-3">
    <p className="text-sm font-semibold text-gray-900">
      <span className="text-primary-600 mr-2">{index + 1}.</span>
      {question.question_text}
    </p>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Write your answer here..."
      rows={4}
      className="w-full rounded-xl border border-gray-300 px-4 py-3
                   text-sm text-gray-900 placeholder:text-gray-400
                   focus:outline-none focus:ring-2
                   focus:ring-primary-500 resize-none"
    />
  </div>
);

// ── Main Page ─────────────────────────────────────────────────
const FinalExamPage = () => {
  const { course_id }  = useParams<{ course_id: string }>();
  const navigate       = useNavigate();
  const courseId       = parseInt(course_id ?? '0', 10);

  const { data: exam,        isLoading: examLoading }   = useExam(courseId);
  const { data: result,      isLoading: resultLoading } = useExamResult(courseId);
  const { data: enrollments, isLoading: enrollLoading } = useMyEnrollments();
  const { mutate: submit,    isPending: submitting }    = useSubmitExam(courseId);

  // Track answers: { [question_id]: answer_text }
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const isLoading = examLoading || resultLoading || enrollLoading;

  const enrollment = enrollments?.find(
    (e) => e.course_id === courseId && e.status !== 'dropped'
  );

  if (isLoading) return <PageSpinner />;

  // Already submitted → redirect to result
  if (result) {
    navigate(`/courses/${courseId}/exam/result`, { replace: true });
    return null;
  }

  // Not enrolled
  if (!enrollment) return (
    <div className="min-h-screen flex items-center justify-center">
      <EmptyState
        title="Enrollment required"
        description="You must be enrolled in this course to take the exam."
        action={{
          label: 'Back to Course',
          onClick: () => navigate(`/courses/${courseId}`),
        }}
      />
    </div>
  );

  // Lessons not done yet
  const lessonsNotDone =
    enrollment.status === 'active';

  if (lessonsNotDone) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card padding="lg" className="max-w-md text-center">
        <div className="w-16 h-16 bg-amber-50 rounded-2xl
                          flex items-center justify-center mx-auto mb-4">
          <Lock size={28} className="text-amber-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">
          Complete All Lessons First
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          You must complete all lessons in this course before
          you can take the final exam.
        </p>
        <Button
          onClick={() => navigate(`/courses/${courseId}`)}
          fullWidth
        >
          Back to Course
        </Button>
      </Card>
    </div>
  );

  // No exam
  if (!exam) return (
    <div className="min-h-screen flex items-center justify-center">
      <EmptyState
        title="No final exam"
        description="This course does not have a final exam yet."
        action={{
          label:   'Back to Course',
          onClick: () => navigate(`/courses/${courseId}`),
        }}
      />
    </div>
  );

  const questions    = exam.questions ?? [];
  const answeredCount = Object.keys(answers).filter(
    (id) => answers[parseInt(id)].trim() !== ''
  ).length;
  const allAnswered = answeredCount === questions.length;

  const handleSubmit = () => {
    if (!allAnswered) return;
    submit({
      answers: questions.map((q) => ({
        question_id:  q.question_id,
        answer_text:  answers[q.question_id] ?? '',
      })),
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-primary-50 rounded-xl
                          flex items-center justify-center">
          <ClipboardList size={24} className="text-primary-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {exam.title}
          </h1>
          <p className="text-sm text-gray-500">
            {questions.length} question(s) ·
            Passing score: {exam.passing_score}%
          </p>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-blue-50
                       border border-blue-200 rounded-xl p-4">
        <AlertCircle size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <p className="font-semibold mb-1">Before you start:</p>
          <ul className="list-disc list-inside flex flex-col gap-1
                           text-xs text-blue-600">
            <li>Answer all questions before submitting</li>
            <li>Multiple choice answers are graded automatically</li>
            <li>Short answers will be reviewed by your instructor</li>
            <li>
              You need {exam.passing_score}% or higher to pass
              and receive your certificate
            </li>
            <li>You can retake the exam if you don't pass</li>
          </ul>
        </div>
      </div>

      {/* Questions */}
      <div className="flex flex-col gap-5">
        {questions.map((question, index) => (
          <Card key={question.question_id} padding="md">
            {question.question_type === 'multiple_choice' ? (
              <MCQuestion
                question={question}
                index={index}
                value={answers[question.question_id] ?? ''}
                onChange={(v) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [question.question_id]: v,
                  }))
                }
              />
            ) : (
              <SAQuestion
                question={question}
                index={index}
                value={answers[question.question_id] ?? ''}
                onChange={(v) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [question.question_id]: v,
                  }))
                }
              />
            )}
          </Card>
        ))}
      </div>

      {/* Progress and submit */}
      <Card padding="md" className="sticky bottom-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700">
              {answeredCount} of {questions.length} answered
            </p>
            <div className="w-48 h-1.5 bg-gray-100 rounded-full mt-1">
              <div
                className="h-full bg-primary-600 rounded-full
                              transition-all duration-300"
                style={{
                  width: `${(answeredCount / questions.length) * 100}%`
                }}
              />
            </div>
          </div>
          <Button
            onClick={handleSubmit}
            isLoading={submitting}
            disabled={!allAnswered}
            size="lg"
          >
            Submit Exam
          </Button>
        </div>
        {!allAnswered && (
          <p className="text-xs text-amber-600 mt-2">
            Please answer all questions before submitting.
          </p>
        )}
      </Card>

    </div>
  );
};

export default FinalExamPage;