import apiClient from './axios';
import type {
  Feedback,
  FeedbackWithDetails,
  CreateFeedbackBody,
  UpdateFeedbackBody,
} from '../types/feedback.types';
import type { ApiResponse } from '../types/auth.types';

export const feedbackApi = {

  // POST /api/feedback
  // Learner submits feedback for an enrollment
  create: async (body: CreateFeedbackBody): Promise<Feedback> => {
    const res = await apiClient.post<ApiResponse<{ feedback: Feedback }>>(
      '/feedback',
      body
    );
    return res.data.data.feedback;
  },

  // GET /api/feedback/my
  // Learner views all feedback they have submitted
  getMy: async (): Promise<FeedbackWithDetails[]> => {
    const res = await apiClient.get<ApiResponse<{ feedback: FeedbackWithDetails[] }>>(
      '/feedback/my'
    );
    return res.data.data.feedback;
  },

  // GET /api/feedback/course/:course_id
  // Mentor/admin views all feedback for a course
  getByCourse: async (
    course_id: number
  ): Promise<FeedbackWithDetails[]> => {
    const res = await apiClient.get<ApiResponse<{ feedback: FeedbackWithDetails[] }>>(
      `/feedback/course/${course_id}`
    );
    return res.data.data.feedback;
  },

  // PATCH /api/feedback/:feedback_id
  // Learner updates their own feedback
  update: async (
    feedback_id: number,
    body:        UpdateFeedbackBody
  ): Promise<Feedback> => {
    const res = await apiClient.patch<ApiResponse<{ feedback: Feedback }>>(
      `/feedback/${feedback_id}`,
      body
    );
    return res.data.data.feedback;
  },
};