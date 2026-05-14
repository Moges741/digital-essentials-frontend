import apiClient from './axios';
import type { ApiResponse } from '../types/auth.types';
import type { User } from '../types/auth.types';
import type { Course } from '../types/course.types';

// ─── Types ───────────────────────────────────────────────────
interface Feedback {
  feedback_id: number;
  enrollment_id: number;
  rating: number;
  comments: string | null;
  submitted_at: string;
  course_id: number;
  course_title: string;
  user_name: string;
  user_email: string;
  creator_name: string;
}

export interface AdminCertificate {
  certificate_id: number;
  user_id: number;
  course_id: number;
  issued_at: string;
  certificate_url: string | null;
  learner_name: string;
  learner_email: string;
  course_title: string;
}

export interface UpdateAdminCertificateBody {
  user_id?: number;
  course_id?: number;
  issued_at?: string;
  certificate_url?: string | null;
}

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

  // Get all feedback
  getAllCourseFeedback: async (): Promise<Feedback[]> => {
    const res = await apiClient.get<ApiResponse<{ feedback: Feedback[] }>>('/admin/feedback');
    return res.data.data.feedback;
  },

  // Get all certificates
  getAllCertificates: async (): Promise<AdminCertificate[]> => {
    const res = await apiClient.get<ApiResponse<{ certificates: AdminCertificate[] }>>('/admin/certificates');
    return res.data.data.certificates;
  },

  // Update certificate
  updateCertificate: async (
    certificateId: number,
    payload: UpdateAdminCertificateBody
  ): Promise<AdminCertificate> => {
    const res = await apiClient.patch<ApiResponse<{ certificate: AdminCertificate }>>(
      `/admin/certificates/${certificateId}`,
      payload
    );
    return res.data.data.certificate;
  },

  // Delete certificate
  deleteCertificate: async (certificateId: number): Promise<void> => {
    await apiClient.delete(`/admin/certificates/${certificateId}`);
  },
};