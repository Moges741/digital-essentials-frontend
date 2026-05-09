import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { useLesson, useUpdateLesson } from '../../hooks/useLessons';
import Input, { Textarea } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { PageSpinner } from '../../components/ui/Spinner';

// ── Zod schema ────────────────────────────────────────────────
const updateLessonSchema = z.object({
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

type UpdateLessonFormData = z.infer<typeof updateLessonSchema>;

const EditLessonPage = () => {
  const { course_id, lesson_id } = useParams<{
    course_id: string;
    lesson_id: string;
  }>();
  const navigate = useNavigate();
  const courseId = parseInt(course_id ?? '0', 10);
  const lessonId = parseInt(lesson_id ?? '0', 10);

  const { data: lesson, isLoading: lessonLoading } = useLesson(courseId, lessonId);
  const { mutate: updateLesson, isPending } = useUpdateLesson(courseId, lessonId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateLessonFormData>({
    resolver: zodResolver(updateLessonSchema),
    defaultValues: {
      title: lesson?.title || '',
      content: lesson?.content || '',
      lesson_order: lesson?.lesson_order,
    },
  });

  // Reset form when lesson data loads
  React.useEffect(() => {
    if (lesson) {
      reset({
        title: lesson.title,
        content: lesson.content || '',
        lesson_order: lesson.lesson_order,
      });
    }
  }, [lesson, reset]);

  const onSubmit = (data: UpdateLessonFormData) => {
    updateLesson({
      title: data.title,
      content: data.content,
      lesson_order: data.lesson_order,
    }, {
      onSuccess: () => {
        navigate(`/courses/${courseId}`);
      },
    });
  };

  if (lessonLoading) return <PageSpinner />;

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
          Edit Lesson
        </h1>
        <p className="text-gray-600 mt-1">
          Update the lesson details
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
              {isPending ? 'Updating...' : 'Update Lesson'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditLessonPage;