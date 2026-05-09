
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast            from 'react-hot-toast';
import { exerciseApi }  from '../api/exercise.api';
import { QUERY_KEYS }   from '../utils/constants';
import type { SubmitExerciseBody } from '../types/exercise.types';

export const useExercises = (course_id: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.EXERCISES, course_id],
    queryFn:  () => exerciseApi.list(course_id),
    enabled:  !!course_id,
  });
};

export const useExercise = (
  course_id:   number,
  exercise_id: number
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.EXERCISES, course_id, exercise_id],
    queryFn:  () => exerciseApi.getOne(course_id, exercise_id),
    enabled:  !!course_id && !!exercise_id,
  });
};

export const useMySubmissions = (course_id: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.EXERCISES, course_id, 'my-submissions'],
    queryFn:  () => exerciseApi.getMySubmissions(course_id),
    enabled:  !!course_id,
  });
};

export const useSubmissions = (
  course_id:   number,
  exercise_id: number
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.EXERCISES, course_id, exercise_id, 'submissions'],
    queryFn:  () => exerciseApi.getSubmissions(course_id, exercise_id),
    enabled:  !!course_id && !!exercise_id,
  });
};

export const useSubmitExercise = (
  course_id:   number,
  exercise_id: number
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: SubmitExerciseBody) =>
      exerciseApi.submit(course_id, exercise_id, body),

    onSuccess: () => {
      // Refresh my submissions list
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.EXERCISES, course_id, 'my-submissions']
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.EXERCISES, course_id, exercise_id, 'submissions']
      });
      toast.success('Exercise submitted successfully!');
    },

    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ?? 'Failed to submit exercise'
      );
    },
  });
};