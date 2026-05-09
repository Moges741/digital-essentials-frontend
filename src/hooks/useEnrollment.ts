
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast                from 'react-hot-toast';
import { enrollmentApi }    from '../api/enrollment.api';
import { QUERY_KEYS }       from '../utils/constants';
import type { CreateEnrollmentBody } from '../types/enrollment.types';

// ── My enrollments ────────────────────────────────────────────
export const useMyEnrollments = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.ENROLLMENTS, 'my'],
    queryFn:  () => enrollmentApi.getMy(),
  });
};

// ── Enroll in a course ────────────────────────────────────────
export const useEnroll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateEnrollmentBody) => enrollmentApi.enroll(body),

    onSuccess: (_, variables) => {
      // Refresh enrollments and the specific course
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ENROLLMENTS] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.COURSES, variables.course_id]
      });
      toast.success('Enrolled successfully! Start learning now.');
    },

    onError: (error: any) => {
      const message = error.response?.data?.message ?? 'Enrollment failed';
      toast.error(message);
    },
  });
};

// ── Drop enrollment ───────────────────────────────────────────
export const useDropEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enrollment_id: number) => enrollmentApi.drop(enrollment_id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ENROLLMENTS] });
      toast.success('Enrollment dropped');
    },

    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? 'Failed to drop enrollment');
    },
  });
};

// ── Check if enrolled in a specific course ────────────────────
// Used on CourseDetailPage to show correct button
export const useIsEnrolled = (course_id: number) => {
  const { data: enrollments, isLoading } = useMyEnrollments();

  const enrollment = enrollments?.find(
    (e) => e.course_id === course_id && e.status !== 'dropped'
  );

  return {
    isEnrolled:   !!enrollment,
    enrollment,
    isLoading,
  };
};