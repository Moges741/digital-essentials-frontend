
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast            from 'react-hot-toast';
import { progressApi }  from '../api/progress.api';
import { QUERY_KEYS }   from '../utils/constants';
import type { SyncProgressBody } from '../types/progress.types';

// ── Get course progress summary ───────────────────────────────
export const useCourseProgress = (course_id: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.PROGRESS, course_id],
    queryFn:  () => progressApi.getCourseProgress(course_id),
    enabled:  !!course_id,
  });
};

// ── Mark lesson complete ──────────────────────────────────────
export const useMarkComplete = (course_id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lesson_id: number) =>
      progressApi.markComplete(lesson_id),

    onSuccess: () => {
      // Refresh progress — percentage and completion status change
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PROGRESS, course_id]
      });
      // Refresh enrollments — status may change to 'completed'
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ENROLLMENTS]
      });
      // Refresh certificates — may be auto-generated
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CERTIFICATES]
      });
      toast.success('Lesson marked as complete!');
    },

    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ?? 'Failed to mark lesson complete'
      );
    },
  });
};

// ── Sync offline progress ─────────────────────────────────────
// Called automatically when browser comes back online
// Reads pending completions from localStorage
export const useSyncOffline = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: SyncProgressBody) =>
      progressApi.syncOffline(body),

    onSuccess: (result) => {
      if (result.synced.length > 0) {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROGRESS] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ENROLLMENTS] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CERTIFICATES] });
        toast.success(
          `Offline progress synced — ${result.synced.length} lesson${
            result.synced.length !== 1 ? 's' : ''
          } updated`
        );
      }
      if (result.failed.length > 0) {
        toast.error(`${result.failed.length} lesson(s) failed to sync`);
      }
    },

    onError: () => {
      toast.error('Offline sync failed — will retry when connection is stable');
    },
  });
};