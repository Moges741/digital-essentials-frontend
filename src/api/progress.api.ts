// src/api/progress.api.ts


import apiClient from './axios';
import type {
  CourseProgressSummary,
  SyncProgressBody,
  SyncResult,
} from '../types/progress.types';
import type { ApiResponse } from '../types/auth.types';

export const progressApi = {

  // PATCH /api/progress/:lesson_id/complete

  markComplete: async (lesson_id: number): Promise<void> => {
    await apiClient.patch(`/progress/${lesson_id}/complete`);
  },

  // POST /api/progress/sync

  syncOffline: async (body: SyncProgressBody): Promise<SyncResult> => {
    const res = await apiClient.post<ApiResponse<SyncResult>>(
      '/progress/sync',
      body
    );
    return res.data.data;
  },

  // GET /api/progress/course/:course_id
  getCourseProgress: async (
    course_id: number
  ): Promise<CourseProgressSummary> => {
    const res = await apiClient.get<ApiResponse<{ summary: CourseProgressSummary }>>(
      `/progress/course/${course_id}`
    );
    return res.data.data.summary;
  },

  // GET /api/progress/course/:course_id/user/:user_id
  getLearnerProgress: async (
    course_id: number,
    user_id: number
  ): Promise<CourseProgressSummary> => {
    const res = await apiClient.get<ApiResponse<{ summary: CourseProgressSummary }>>(
      `/progress/course/${course_id}/user/${user_id}`
    );
    return res.data.data.summary;
  },
};