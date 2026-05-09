import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast          from 'react-hot-toast';
import { lessonApi }  from '../api/lesson.api';
import { QUERY_KEYS } from '../utils/constants';
import type {
  CreateLessonBody,
  UpdateLessonBody,
} from '../types/lesson.types';

// ── List lessons for a course ─────────────────────────────────
export const useLessons = (course_id: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.LESSONS, course_id],
    queryFn:  () => lessonApi.list(course_id),
    enabled:  !!course_id,
  });
};

// ── Get one lesson with materials ─────────────────────────────
export const useLesson = (course_id: number, lesson_id: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.LESSONS, course_id, lesson_id],
    queryFn:  () => lessonApi.getOne(course_id, lesson_id),
    enabled:  !!course_id && !!lesson_id,
  });
};

// ── Create lesson ─────────────────────────────────────────────
export const useCreateLesson = (course_id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateLessonBody) =>
      lessonApi.create(course_id, body),

    onSuccess: () => {
      // Refresh lesson list and course detail (lesson count changes)
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.LESSONS, course_id]
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.COURSES, course_id]
      });
      toast.success('Lesson created successfully');
    },

    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ?? 'Failed to create lesson'
      );
    },
  });
};

// ── Update lesson ─────────────────────────────────────────────
export const useUpdateLesson = (
  course_id: number,
  lesson_id: number
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateLessonBody) =>
      lessonApi.update(course_id, lesson_id, body),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.LESSONS, course_id]
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.LESSONS, course_id, lesson_id]
      });
      toast.success('Lesson updated');
    },

    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ?? 'Failed to update lesson'
      );
    },
  });
};

// ── Delete lesson ─────────────────────────────────────────────
export const useDeleteLesson = (course_id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lesson_id: number) =>
      lessonApi.delete(course_id, lesson_id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.LESSONS, course_id]
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.COURSES, course_id]
      });
      toast.success('Lesson deleted');
    },

    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ?? 'Failed to delete lesson'
      );
    },
  });
};