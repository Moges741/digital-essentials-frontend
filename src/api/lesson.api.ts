
import apiClient from './axios';
import type  {
  Lesson,
  LessonWithMaterials,
  CreateLessonBody,
  UpdateLessonBody,
} from '../types/lesson.types';
import type { ApiResponse } from '../types/auth.types';

export const lessonApi = {

  // GET /api/courses/:course_id/lessons
  list: async (course_id: number): Promise<Lesson[]> => {
    const res = await apiClient.get<ApiResponse<{ lessons: Lesson[] }>>(
      `/courses/${course_id}/lessons`
    );
    return res.data.data.lessons;
  },

  // GET /api/courses/:course_id/lessons/:lesson_id
  getOne: async (
    course_id: number,
    lesson_id: number
  ): Promise<LessonWithMaterials> => {
    const res = await apiClient.get<ApiResponse<{ lesson: LessonWithMaterials }>>(
      `/courses/${course_id}/lessons/${lesson_id}`
    );
    return res.data.data.lesson;
  },

  // POST /api/courses/:course_id/lessons
  create: async (
    course_id: number,
    body: CreateLessonBody
  ): Promise<Lesson> => {
    const res = await apiClient.post<ApiResponse<{ lesson: Lesson }>>(
      `/courses/${course_id}/lessons`,
      body
    );
    return res.data.data.lesson;
  },

  // PATCH /api/courses/:course_id/lessons/:lesson_id
  update: async (
    course_id: number,
    lesson_id: number,
    body: UpdateLessonBody
  ): Promise<Lesson> => {
    const res = await apiClient.patch<ApiResponse<{ lesson: Lesson }>>(
      `/courses/${course_id}/lessons/${lesson_id}`,
      body
    );
    return res.data.data.lesson;
  },

  // DELETE /api/courses/:course_id/lessons/:lesson_id
  delete: async (
    course_id: number,
    lesson_id: number
  ): Promise<void> => {
    await apiClient.delete(
      `/courses/${course_id}/lessons/${lesson_id}`
    );
  },
};