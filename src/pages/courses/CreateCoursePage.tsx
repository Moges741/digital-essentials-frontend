
import { useNavigate }   from 'react-router-dom';
import { useForm }       from 'react-hook-form';
import { zodResolver }   from '@hookform/resolvers/zod';
import { z }             from 'zod';
import { ArrowLeft }     from 'lucide-react';
import { useCreateCourse } from '../../hooks/useCourses';
import Input, { Textarea } from '../../components/ui/Input';
import Button              from '../../components/ui/Button';
import Card                from '../../components/ui/Card';

// ── Zod schema ────────────────────────────────────────────────
const createCourseSchema = z.object({
  title: z
    .string()
    .min(3,   'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters'),
  duration_mins: z
    .number({ error: 'Duration must be a number' })
    .min(0, 'Duration cannot be negative')
    .optional(),
});

type CreateCourseFormData = z.infer<typeof createCourseSchema>;

const CreateCoursePage = () => {
  const navigate = useNavigate();
  const { mutate: createCourse, isPending } = useCreateCourse();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCourseFormData>({
    resolver:      zodResolver(createCourseSchema),
    defaultValues: { duration_mins: undefined },
  });

  const onSubmit = (data: CreateCourseFormData) => {
    createCourse({
      title:         data.title,
      description:   data.description,
      duration_mins: data.duration_mins,
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500
                    hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
        <p className="text-sm text-gray-500 mt-1">
          Your course will be saved as a draft. Publish it when ready.
        </p>
      </div>

      {/* Form card */}
      <Card padding="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

          <Input
            label="Course Title"
            placeholder="e.g. Introduction to Smartphones"
            error={errors.title?.message}
            helperText="Choose a clear, descriptive title"
            required
            {...register('title')}
          />

          <Textarea
            label="Description"
            placeholder="What will learners gain from this course? Who is it for?"
            error={errors.description?.message}
            helperText="Minimum 10 characters"
            required
            {...register('description')}
          />

          <Input
            label="Duration (minutes)"
            type="number"
            placeholder="e.g. 120"
            error={errors.duration_mins?.message}
            helperText="Optional — total estimated time to complete"
            {...register('duration_mins', { valueAsNumber: true })}
          />

          {/* Info box */}
          <div className="bg-primary-50 border border-primary-200
                           rounded-xl p-4 text-sm text-primary-700">
            <p className="font-semibold mb-1">After creating:</p>
            <ul className="list-disc list-inside flex flex-col gap-1
                            text-primary-600 text-xs">
              <li>Add lessons to your course</li>
              <li>Upload materials (PDFs, videos, audio)</li>
              <li>Create exercises and quizzes</li>
              <li>Publish when you are ready for learners</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isPending}
            >
              {isPending ? 'Creating...' : 'Create Course'}
            </Button>
          </div>

        </form>
      </Card>

    </div>
  );
};

export default CreateCoursePage;