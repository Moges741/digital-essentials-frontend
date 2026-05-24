import { useNavigate }   from 'react-router-dom';
import { useForm, Controller }       from 'react-hook-form';
import { zodResolver }   from '@hookform/resolvers/zod';
import { z }             from 'zod';
import { ArrowLeft, Clock } from 'lucide-react';
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
  'General',
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
      'General',
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
  time_limit_value: z
    .number({ error: 'Must be a number' })
    .min(1, 'Must be at least 1')
    .optional()
    .nullable(),
  time_limit_unit: z
    .enum(['minute', 'hour', 'day', 'week', 'month'])
    .optional()
    .nullable(),
});

type CreateCourseFormData = z.infer<typeof createCourseSchema>;

const CreateCoursePage = () => {
  const navigate = useNavigate();
  const { mutate: createCourse, isPending } = useCreateCourse();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<CreateCourseFormData>({
    resolver:      zodResolver(createCourseSchema),
    defaultValues: { 
      duration_mins: undefined, 
      category: 'Basics',
      topic: 'Software Development & Coding',
      target_roles: ['student'],
      time_limit_value: undefined,
      time_limit_unit: 'day',
    },
  });

  const watchedTimeLimitValue = watch('time_limit_value');

  const onSubmit = (data: CreateCourseFormData) => {
    // Build FormData to allow optional thumbnail file
    const form = new FormData();
    form.append('title', data.title);
    form.append('description', data.description);
    form.append('category', data.category);
    form.append('topic', data.topic);
    form.append('target_roles', JSON.stringify(data.target_roles));
    if (data.duration_mins !== undefined && data.duration_mins !== null) form.append('duration_mins', String(data.duration_mins));
    if (data.time_limit_value !== undefined && data.time_limit_value !== null) form.append('time_limit_value', String(data.time_limit_value));
    if (data.time_limit_unit) form.append('time_limit_unit', data.time_limit_unit as string);
    // Thumbnail file input (if present in DOM)
    const thumbInput = document.querySelector<HTMLInputElement>('#thumbnail-input');
    if (thumbInput && thumbInput.files && thumbInput.files.length > 0) {
      form.append('thumbnail', thumbInput.files[0]);
    }

    createCourse(form as unknown as CreateCourseFormData);
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

          {/* Thumbnail upload */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Course Thumbnail (optional)</label>
            <input id="thumbnail-input" type="file" accept="image/*" className="text-sm text-gray-600" />
            <p className="text-xs text-gray-500 mt-1">Recommended: 1200x400 or similar wide banner for best appearance.</p>
          </div>

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

          {/* Time Limit */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Clock size={16} className="text-amber-500" />
              Course Time Limit
              <span className="text-xs text-gray-400 font-normal">(optional)</span>
            </label>
            <p className="text-xs text-gray-500">
              Set a deadline for learners to complete this course after enrolling. Leave empty for no limit.
            </p>
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="e.g. 2"
                  error={errors.time_limit_value?.message}
                  {...register('time_limit_value', { valueAsNumber: true })}
                />
              </div>
              <div className="w-40">
                <Select
                  options={[
                    { value: 'minute', label: 'Minute(s)' },
                    { value: 'hour',   label: 'Hour(s)' },
                    { value: 'day',    label: 'Day(s)' },
                    { value: 'week',   label: 'Week(s)' },
                    { value: 'month',  label: 'Month(s)' },
                  ]}
                  {...register('time_limit_unit')}
                />
              </div>
            </div>
            {watchedTimeLimitValue && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <Clock size={12} />
                Learners will have {watchedTimeLimitValue} {watch('time_limit_unit')}(s) after enrolling to complete the course.
              </p>
            )}
          </div>

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
