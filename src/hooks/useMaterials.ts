
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast            from 'react-hot-toast';
import { materialApi }  from '../api/material.api';
import { QUERY_KEYS }   from '../utils/constants';

// ── List materials for a course ───────────────────────────────
export const useMaterials = (course_id: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.MATERIALS, course_id],
    queryFn:  () => materialApi.list(course_id),
    enabled:  !!course_id,
  });
};

// ── Upload material ───────────────────────────────────────────
export const useUploadMaterial = (course_id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) =>
      materialApi.upload(course_id, formData),

    onSuccess: (data) => {
      // Refresh material list
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.MATERIALS, course_id],
      });
      // Refresh lesson detail (shows materials at bottom)
      if (data.lesson_id) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.LESSONS, course_id, data.lesson_id],
        });
      }
      toast.success('Material uploaded successfully');
    },

    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ?? 'Upload failed'
      );
    },
  });
};

// ── Delete material ───────────────────────────────────────────
export const useDeleteMaterial = (course_id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (material_id: number) =>
      materialApi.delete(course_id, material_id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.MATERIALS, course_id],
      });
      toast.success('Material deleted');
    },

    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ?? 'Failed to delete material'
      );
    },
  });
};