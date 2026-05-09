
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast           from 'react-hot-toast';
import { feedbackApi } from '../api/feedback.api';
import { QUERY_KEYS }  from '../utils/constants';
import type {
  CreateFeedbackBody,
  UpdateFeedbackBody,
} from '../types/feedback.types';

// ── My feedback ───────────────────────────────────────────────
export const useMyFeedback = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.FEEDBACK, 'my'],
    queryFn:  () => feedbackApi.getMy(),
  });
};

// ── Course feedback (mentor/admin) ────────────────────────────
export const useCourseFeedback = (course_id: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.FEEDBACK, course_id],
    queryFn:  () => feedbackApi.getByCourse(course_id),
    enabled:  !!course_id,
  });
};

// ── Submit feedback ───────────────────────────────────────────
export const useSubmitFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateFeedbackBody) => feedbackApi.create(body),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.FEEDBACK]
      });
      toast.success('Feedback submitted. Thank you!');
    },

    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ?? 'Failed to submit feedback'
      );
    },
  });
};

// ── Update feedback ───────────────────────────────────────────
export const useUpdateFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      feedback_id,
      body,
    }: {
      feedback_id: number;
      body:        UpdateFeedbackBody;
    }) => feedbackApi.update(feedback_id, body),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FEEDBACK] });
      toast.success('Feedback updated');
    },

    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ?? 'Failed to update feedback'
      );
    },
  });
};