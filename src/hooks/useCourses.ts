
import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast           from 'react-hot-toast';
import { courseApi }   from '../api/course.api';
import { QUERY_KEYS }  from '../utils/constants';
import type {
  CourseFilters,
  CreateCourseBody,
  UpdateCourseBody,
} from '../types/course.types';

// ── List courses ──────────────────────────────────────────────
export const useCourses = (filters: CourseFilters = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.COURSES, filters],
    queryFn:  () => courseApi.list(filters),
    placeholderData: keepPreviousData,
  });
};

// ── Get one course ────────────────────────────────────────────
export const useCourse = (course_id: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.COURSES, course_id],
    queryFn:  () => courseApi.getOne(course_id),
    enabled:  !!course_id,  // only fetch if course_id exists
  });
};

// ── Create course ─────────────────────────────────────────────
export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  const navigate    = useNavigate();

  return useMutation({
    mutationFn: (body: CreateCourseBody) => courseApi.create(body),

    onSuccess: (data) => {
      // Invalidate course list so it shows the new course
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSES] });
      toast.success('Course created successfully');
      // Go to the new course detail page
      navigate(`/courses/${data.course_id}`);
    },

    onError: (error: any) => {
      const message = error.response?.data?.message ?? 'Failed to create course';
      toast.error(message);
    },
  });
};

// ── Update course ─────────────────────────────────────────────
export const useUpdateCourse = (course_id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateCourseBody) => courseApi.update(course_id, body),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSES, course_id] });
      toast.success('Course updated successfully');
    },

    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? 'Failed to update course');
    },
  });
};

// ── Publish / unpublish ───────────────────────────────────────
export const usePublishCourse = (course_id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (is_published: boolean) => courseApi.publish(course_id, is_published),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSES, course_id] });
      toast.success(data.is_published ? 'Course published' : 'Course unpublished');
    },

    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? 'Failed to update publish status');
    },
  });
};

// ── Delete course ─────────────────────────────────────────────
export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  const navigate    = useNavigate();

  return useMutation({
    mutationFn: (course_id: number) => courseApi.delete(course_id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COURSES] });
      toast.success('Course deleted successfully');
      navigate('/courses');
    },

    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? 'Failed to delete course');
    },
  });
};