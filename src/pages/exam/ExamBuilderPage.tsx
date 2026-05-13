
import { useState }       from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm }        from 'react-hook-form';
import { zodResolver }    from '@hookform/resolvers/zod';
import { z }              from 'zod';
import {
  Plus, Trash2, ArrowLeft,
} from 'lucide-react';
import {
  useExam, useCreateExam, useAddQuestion,
  useDeleteQuestion, useDeleteExam,
} from '../../hooks/useExam';
import Input, { Textarea } from '../../components/ui/Input';
import Button              from '../../components/ui/Button';
import Card, { CardHeader, CardTitle } from '../../components/ui/Card';
import Badge               from '../../components/ui/Badge';
import { ConfirmModal }    from '../../components/ui/Modal';
import { PageSpinner }     from '../../components/ui/Spinner';
import type { QuestionType }    from '../../types/exam.types';

// ── Schemas ───────────────────────────────────────────────────
const examSchema = z.object({
  title:         z.string().min(3, 'Title required'),
  passing_score: z.number().min(1).max(100).optional(),
});

const mcSchema = z.object({
  question_text:  z.string().min(5, 'Question required'),
  option_a:       z.string().min(1, 'Option A required'),
  option_b:       z.string().min(1, 'Option B required'),
  option_c:       z.string().min(1, 'Option C required'),
  option_d:       z.string().min(1, 'Option D required'),
  correct_answer: z.enum(['A', 'B', 'C', 'D'], {
    message: 'Select correct answer',
  }),
});

const saSchema = z.object({
  question_text: z.string().min(5, 'Question required'),
});

type ExamForm = z.infer<typeof examSchema>;
type MCForm   = z.infer<typeof mcSchema>;
type SAForm   = z.infer<typeof saSchema>;

// ── Question type tab ─────────────────────────────────────────
const TypeTab = ({
  active, label, onClick,
}: {
  active: boolean; label: string; onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      px-4 py-2 text-sm font-medium rounded-lg transition-colors
      ${active
        ? 'bg-primary-600 text-white'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }
    `}
  >
    {label}
  </button>
);

// ── Main Page ─────────────────────────────────────────────────
const ExamBuilderPage = () => {
  const { course_id }             = useParams<{ course_id: string }>();
  const navigate                  = useNavigate();
  const courseId                  = parseInt(course_id ?? '0', 10);

  const [questionType, setQuestionType] = useState<QuestionType>('multiple_choice');
  const [showDeleteExam, setShowDeleteExam] = useState(false);

  const { data: exam, isLoading }   = useExam(courseId);
  const { mutate: createExam, isPending: creating } = useCreateExam(courseId);
  const { mutate: addQuestion, isPending: adding }  = useAddQuestion(courseId);
  const { mutate: deleteQ }   = useDeleteQuestion(courseId);
  const { mutate: deleteExam, isPending: deletingExam } = useDeleteExam(courseId);

  // Exam creation form
  const examForm = useForm<ExamForm>({
    resolver:      zodResolver(examSchema),
    defaultValues: { passing_score: 70 },
  });

  // Multiple choice form
  const mcForm = useForm<MCForm>({ resolver: zodResolver(mcSchema) });

  // Short answer form
  const saForm = useForm<SAForm>({ resolver: zodResolver(saSchema) });

  const onCreateExam = (data: ExamForm) => {
    createExam({
      title:         data.title,
      passing_score: data.passing_score,
    });
  };

  const onAddMC = (data: MCForm) => {
    addQuestion({
      question_type:  'multiple_choice',
      question_text:  data.question_text,
      option_a:       data.option_a,
      option_b:       data.option_b,
      option_c:       data.option_c,
      option_d:       data.option_d,
      correct_answer: data.correct_answer,
    }, {
      onSuccess: () => mcForm.reset(),
    });
  };

  const onAddSA = (data: SAForm) => {
    addQuestion({
      question_type: 'short_answer',
      question_text: data.question_text,
    }, {
      onSuccess: () => saForm.reset(),
    });
  };

  if (isLoading) return <PageSpinner />;

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">

      {/* Back */}
      <button
        onClick={() => navigate(`/courses/${courseId}`)}
        className="flex items-center gap-2 text-sm text-gray-500
                    hover:text-gray-700 self-start"
      >
        <ArrowLeft size={15} /> Back to Course
      </button>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Final Exam Builder
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Create a final exam that learners must pass before
          receiving their certificate.
        </p>
      </div>

      {/* ── No exam yet ─────────────────────────────── */}
      {!exam ? (
        <Card padding="lg">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Create Final Exam
          </h2>
          <form
            onSubmit={examForm.handleSubmit(onCreateExam)}
            className="flex flex-col gap-4"
          >
            <Input
              label="Exam Title"
              placeholder="e.g. Final Assessment — Smartphone Basics"
              error={examForm.formState.errors.title?.message}
              required
              {...examForm.register('title')}
            />
            <Input
              label="Passing Score (%)"
              type="number"
              placeholder="70"
              helperText="Learners must score this % or higher to pass"
              error={examForm.formState.errors.passing_score?.message}
              {...examForm.register('passing_score', { valueAsNumber: true })}
            />
            <Button type="submit" isLoading={creating}>
              Create Exam
            </Button>
          </form>
        </Card>
      ) : (
        <>
          {/* ── Exam settings ──────────────────────── */}
          <Card padding="md">
            <CardHeader>
              <div>
                <CardTitle>{exam.title}</CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">
                  Passing score: {exam.passing_score}% ·{' '}
                  {exam.questions?.length ?? 0} question(s)
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  leftIcon={<Trash2 size={13} />}
                  onClick={() => setShowDeleteExam(true)}
                >
                  Delete Exam
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* ── Existing questions ─────────────────── */}
          {(exam.questions?.length ?? 0) > 0 && (
            <Card padding="md">
              <CardHeader>
                <CardTitle>Questions</CardTitle>
                <Badge variant="neutral">
                  {exam.questions.length}
                </Badge>
              </CardHeader>
              <div className="flex flex-col gap-3">
                {exam.questions.map((q, i) => (
                  <div
                    key={q.question_id}
                    className="flex items-start gap-3 p-3
                                bg-gray-50 rounded-xl"
                  >
                    <span className="w-6 h-6 bg-primary-100
                                      text-primary-700 rounded-full
                                      flex items-center justify-center
                                      text-xs font-bold flex-shrink-0
                                      mt-0.5">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">
                        {q.question_text}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={
                            q.question_type === 'multiple_choice'
                              ? 'primary' : 'info'
                          }
                          size="sm"
                        >
                          {q.question_type === 'multiple_choice'
                            ? 'Multiple Choice'
                            : 'Short Answer'
                          }
                        </Badge>
                        {q.question_type === 'multiple_choice' &&
                          q.correct_answer && (
                          <span className="text-xs text-green-600">
                            Answer: {q.correct_answer}
                          </span>
                        )}
                      </div>
                      {/* Show options for MC */}
                      {q.question_type === 'multiple_choice' && (
                        <div className="grid grid-cols-2 gap-1 mt-2">
                          {(['a','b','c','d'] as const).map((opt) => {
                            const val = q[`option_${opt}` as keyof typeof q];
                            const isCorrect =
                              q.correct_answer?.toUpperCase() === opt.toUpperCase();
                            return val ? (
                              <span
                                key={opt}
                                className={`text-xs px-2 py-1 rounded-md
                                  ${isCorrect
                                    ? 'bg-green-100 text-green-700 font-medium'
                                    : 'bg-white text-gray-600 border border-gray-200'
                                  }`}
                              >
                                {opt.toUpperCase()}. {val as string}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => deleteQ(q.question_id)}
                      className="text-gray-400 hover:text-red-500
                                   transition-colors p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* ── Add question ───────────────────────── */}
          <Card padding="md">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Add Question
            </h2>

            {/* Type selector */}
            <div className="flex gap-2 mb-5">
              <TypeTab
                active={questionType === 'multiple_choice'}
                label="Multiple Choice"
                onClick={() => setQuestionType('multiple_choice')}
              />
              <TypeTab
                active={questionType === 'short_answer'}
                label="Short Answer"
                onClick={() => setQuestionType('short_answer')}
              />
            </div>

            {/* Multiple choice form */}
            {questionType === 'multiple_choice' && (
              <form
                onSubmit={mcForm.handleSubmit(onAddMC)}
                className="flex flex-col gap-4"
              >
                <Textarea
                  label="Question"
                  placeholder="What is a web browser?"
                  error={mcForm.formState.errors.question_text?.message}
                  required
                  {...mcForm.register('question_text')}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(['a','b','c','d'] as const).map((opt) => (
                    <Input
                      key={opt}
                      label={`Option ${opt.toUpperCase()}`}
                      placeholder={`Option ${opt.toUpperCase()}`}
                      error={
                        mcForm.formState.errors[
                          `option_${opt}` as keyof MCForm
                        ]?.message
                      }
                      required
                      {...mcForm.register(
                        `option_${opt}` as keyof MCForm
                      )}
                    />
                  ))}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Correct Answer <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    {['A','B','C','D'].map((opt) => (
                      <label
                        key={opt}
                        className="flex items-center gap-1.5 cursor-pointer"
                      >
                        <input
                          type="radio"
                          value={opt}
                          {...mcForm.register('correct_answer')}
                          className="accent-primary-600"
                        />
                        <span className="text-sm font-medium">{opt}</span>
                      </label>
                    ))}
                  </div>
                  {mcForm.formState.errors.correct_answer && (
                    <p className="text-xs text-red-600">
                      ⚠ {mcForm.formState.errors.correct_answer.message}
                    </p>
                  )}
                </div>
                <Button type="submit" isLoading={adding}
                        leftIcon={<Plus size={15} />}>
                  Add Question
                </Button>
              </form>
            )}

            {/* Short answer form */}
            {questionType === 'short_answer' && (
              <form
                onSubmit={saForm.handleSubmit(onAddSA)}
                className="flex flex-col gap-4"
              >
                <Textarea
                  label="Question"
                  placeholder="Explain in your own words what the internet is."
                  error={saForm.formState.errors.question_text?.message}
                  required
                  {...saForm.register('question_text')}
                />
                <div className="bg-amber-50 border border-amber-200
                                  rounded-xl p-3 text-xs text-amber-700">
                  Short answer questions require manual grading.
                  You will review and mark each learner's answer
                  as correct or incorrect.
                </div>
                <Button type="submit" isLoading={adding}
                        leftIcon={<Plus size={15} />}>
                  Add Question
                </Button>
              </form>
            )}
          </Card>
        </>
      )}

      {/* Delete exam confirm */}
      <ConfirmModal
        isOpen={showDeleteExam}
        onClose={() => setShowDeleteExam(false)}
        onConfirm={() =>
          deleteExam(undefined, {
            onSuccess: () => {
              setShowDeleteExam(false);
              navigate(`/courses/${courseId}`);
            },
          })
        }
        isLoading={deletingExam}
        title="Delete Final Exam"
        message="This will delete the exam and all its questions. Learners who already submitted will lose their results."
      />
    </div>
  );
};

export default ExamBuilderPage;