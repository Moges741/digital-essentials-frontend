// src/api/course.api.ts
// All HTTP calls for the course module
// Every function maps to exactly one backend endpoint

import apiClient from './axios';
import type {
  Course,
  CourseWithLessons,
  PaginatedCourses,
  CreateCourseBody,
  UpdateCourseBody,
  CourseFilters,
} from '../types/course.types';
import type  { ApiResponse } from '../types/auth.types';

export const courseApi = {

  // GET /api/courses
  // Public — returns published courses with pagination
  list: async (filters: CourseFilters = {}): Promise<PaginatedCourses> => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.page)   params.set('page',   String(filters.page));
    if (filters.limit)  params.set('limit',  String(filters.limit));

    const res = await apiClient.get<ApiResponse<PaginatedCourses>>(
      `/courses?${params.toString()}`
    );
    return res.data.data;
  },

  // GET /api/courses/:course_id
  // Public — returns course with lessons array
  getOne: async (course_id: number): Promise<CourseWithLessons> => {
    const res = await apiClient.get<ApiResponse<{ course: CourseWithLessons }>>(
      `/courses/${course_id}`
    );
    return res.data.data.course;
  },

  // POST /api/courses
  // mentor, admin only
  create: async (body: CreateCourseBody): Promise<Course> => {
    const res = await apiClient.post<ApiResponse<{ course: Course }>>(
      '/courses',
      body
    );
    return res.data.data.course;
  },

  // PATCH /api/courses/:course_id
  // mentor (own), admin
  update: async (course_id: number, body: UpdateCourseBody): Promise<Course> => {
    const res = await apiClient.patch<ApiResponse<{ course: Course }>>(
      `/courses/${course_id}`,
      body
    );
    return res.data.data.course;
  },

  // PATCH /api/courses/:course_id/publish
  // mentor (own), admin
  publish: async (course_id: number, is_published: boolean): Promise<Course> => {
    const res = await apiClient.patch<ApiResponse<{ course: Course }>>(
      `/courses/${course_id}/publish`,
      { is_published }
    );
    return res.data.data.course;
  },

  // DELETE /api/courses/:course_id
  // admin only
  delete: async (course_id: number): Promise<void> => {
    await apiClient.delete(`/courses/${course_id}`);
  },
};