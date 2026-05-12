import apiClient from './axios';
import type { ApiResponse } from '../types/auth.types';
import type { User } from '../types/auth.types';
import type { Course } from '../types/course.types';

// ─── Admin API functions ──────────────────────────────────────

export const adminApi = {
  // Get all users
  getAllUsers: async (): Promise<User[]> => {
    const res = await apiClient.get<ApiResponse<{ users: User[] }>>('/admin/users');
    return res.data.data.users;
  },

  // Update user role
  updateUserRole: async (userId: number, role: 'learner' | 'mentor' | 'administrator'): Promise<User> => {
    const res = await apiClient.patch<ApiResponse<{ user: User }>>(`/admin/users/${userId}/role`, { role });
    return res.data.data.user;
  },

  // Get all courses
  getAllCourses: async (): Promise<Course[]> => {
    const res = await apiClient.get<ApiResponse<{ courses: Course[] }>>('/admin/courses');
    return res.data.data.courses;
  },

  // Toggle course publish status
  toggleCoursePublish: async (courseId: number): Promise<Course> => {
    const res = await apiClient.patch<ApiResponse<{ course: Course }>>(`/admin/courses/${courseId}/publish`);
    return res.data.data.course;
  },
};