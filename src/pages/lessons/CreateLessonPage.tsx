import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { useCreateLesson } from '../../hooks/useLessons';
import Input, { Textarea } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

// ── Zod schema ────────────────────────────────────────────────
const createLessonSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters'),
  content: z
    .string()
    .optional(),
  lesson_order: z
    .number({ error: 'Lesson order must be a number' })
    .min(1, 'Lesson order must be at least 1')
    .optional(),
});

type CreateLessonFormData = z.infer<typeof createLessonSchema>;

const CreateLessonPage = () => {
  const { course_id } = useParams<{ course_id: string }>();
  const navigate = useNavigate();
  const courseId = parseInt(course_id ?? '0', 10);

  const { mutate: createLesson, isPending } = useCreateLesson(courseId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateLessonFormData>({
    resolver: zodResolver(createLessonSchema),
    defaultValues: { lesson_order: undefined },
  });

  const onSubmit = (data: CreateLessonFormData) => {
    createLesson({
      title: data.title,
      content: data.content,
      lesson_order: data.lesson_order,
    }, {
      onSuccess: () => {
        navigate(`/courses/${courseId}`);
      },
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          Create New Lesson
        </h1>
        <p className="text-gray-600 mt-1">
          Add a new lesson to your course
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lesson Title *
            </label>
            <Input
              {...register('title')}
              placeholder="Enter lesson title"
              error={errors.title?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <Textarea
              {...register('content')}
              placeholder="Enter lesson content (optional)"
              rows={6}
              error={errors.content?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lesson Order
            </label>
            <Input
              {...register('lesson_order', { valueAsNumber: true })}
              type="number"
              placeholder="Enter lesson order (optional)"
              error={errors.lesson_order?.message}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
            >
              {isPending ? 'Creating...' : 'Create Lesson'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateLessonPage;