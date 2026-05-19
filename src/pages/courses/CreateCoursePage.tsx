import { useNavigate }   from 'react-router-dom';
import { useForm, Controller }       from 'react-hook-form';
import { zodResolver }   from '@hookform/resolvers/zod';
import { z }             from 'zod';
import { ArrowLeft }     from 'lucide-react';
import { useCreateCourse } from '../../hooks/useCourses';
import type { CourseTopic, TargetRole } from '../../types/course.types';
import Input, { Textarea } from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button              from '../../components/ui/Button';
import Card                from '../../components/ui/Card';

const TOPICS: CourseTopic[] = [
  'AI',
  'IoT',
  'Cloud Computing',
  'Cyber Security',
  'Safety Issue',
  'Software Development & Coding',
  'Digital Marketing',
  'E-Commerce',
];

const TARGET_ROLES: TargetRole[] = [
  'teacher',
  'doctor',
  'student',
  'farmer',
  'merchant',
  'professional',
  'general',
];

// ── Zod schema ────────────────────────────────────────────────
const createCourseSchema = z.object({
  title: z
    .string()
    .min(3,   'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters'),
  category: z
    .enum(['Basics', 'Intermediate', 'Advanced'])
    ,
  topic: z
    .enum([
      'AI',
      'IoT',
      'Cloud Computing',
      'Cyber Security',
      'Safety Issue',
      'Software Development & Coding',
      'Digital Marketing',
      'E-Commerce',
    ])
    ,
  target_roles: z
    .array(z.enum([
      'teacher',
      'doctor',
      'student',
      'farmer',
      'merchant',
      'professional',
      'general',
    ]))
    .min(1, 'Select at least one target role'),
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
    control,
    formState: { errors },
  } = useForm<CreateCourseFormData>({
    resolver:      zodResolver(createCourseSchema),
    defaultValues: { 
      duration_mins: undefined, 
      category: 'Basics',
      topic: 'Software Development & Coding',
      target_roles: ['student'],
    },
  });

  const onSubmit = (data: CreateCourseFormData) => {
    createCourse({
      title:         data.title,
      description:   data.description,
      category:      data.category,
      topic:         data.topic,
      target_roles:  data.target_roles,
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

          <Select
            label="Course Category"
            error={errors.category?.message}
            helperText="Select the difficulty level for this course"
            required
            options={[
              { value: 'Basics', label: 'Basics — Beginner level' },
              { value: 'Intermediate', label: 'Intermediate — Intermediate level' },
              { value: 'Advanced', label: 'Advanced — Advanced level' },
            ]}
            {...register('category')}
          />

          <Select
            label="Course Topic"
            error={errors.topic?.message}
            helperText="Select the subject area or domain for this course"
            required
            options={TOPICS.map((topic) => ({ value: topic, label: topic }))}
            {...register('topic')}
          />

          {/* Target Roles */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-3">
              Target Audience
              <span className="text-red-500 ml-1">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Who is this course designed for? Select all that apply.
            </p>
            <Controller
              control={control}
              name="target_roles"
              render={({ field }) => (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {TARGET_ROLES.map((role) => (
                    <label
                      key={role}
                      className="flex items-center gap-2 p-3 rounded-lg border border-gray-300 
                                 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={field.value?.includes(role) || false}
                        onChange={(e) => {
                          const current = field.value || [];
                          const updated = e.target.checked
                            ? [...current, role]
                            : current.filter((r) => r !== role);
                          field.onChange(updated);
                        }}
                        className="rounded border-gray-300 w-4 h-4 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {role}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            />
            {errors.target_roles?.message && (
              <p className="text-sm text-red-500 mt-2">
                {errors.target_roles.message}
              </p>
            )}
          </div>

          <Input
            label="Estimated Duration (minutes)"
            type="number"
            placeholder="e.g. 120"
            error={errors.duration_mins?.message}
            {...register('duration_mins', { valueAsNumber: true })}
          />

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isPending}>
              Create Course
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateCoursePage;
