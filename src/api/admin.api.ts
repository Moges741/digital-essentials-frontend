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

export interface AdminInstructor {
  user_id: number;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  specialization: string;
  qualifications: string | null;
}

export interface UpdateAdminCertificateBody {
  user_id?: number;
  course_id?: number;
  issued_at?: string;
  certificate_url?: string | null;
}

export interface UpdateInstructorProfileBody {
  specialization: string;
  qualifications?: string;
}

export interface AdminDashboardAnalytics {
  total_users: number;
  total_courses: number;
  total_enrollments: number;
  completed_enrollments: number;
  active_learners: number;
  certificates_issued: number;
  average_feedback_rating: number;
  average_exam_score: number;
  completion_rate: number;
  exam_pass_rate: number;
  trends: {
    labels: string[];
    enrollments: number[];
    exam_submissions: number[];
    feedback_submissions: number[];
  };
}

export interface AtRiskLearner {
  enrollment_id: number;
  user_id: number;
  learner_name: string;
  learner_email: string;
  course_id: number;
  course_title: string;
  enrollment_date: string;
  deadline: string;
  total_lessons: number;
  completed_lessons: number;
  progress_percent: number;
  remaining_ratio: number;
  days_left: number;
  risk_score: number;
  is_overdue: boolean;
  status: 'active' | 'exam_pending' | 'completed' | 'dropped';
  is_at_risk: boolean;
}

// ─── Admin API functions ──────────────────────────────────────

export const adminApi = {
  // Get all users
  getAllUsers: async (): Promise<User[]> => {
    const res = await apiClient.get<ApiResponse<{ users: User[] }>>('/admin/users');
    return res.data.data.users;
  },

  // Get dashboard analytics
  getDashboardAnalytics: async (): Promise<AdminDashboardAnalytics> => {
    const res = await apiClient.get<ApiResponse<{ analytics: AdminDashboardAnalytics }>>('/admin/analytics');
    return res.data.data.analytics;
  },

  // Get at-risk learners
  getAtRiskLearners: async (): Promise<AtRiskLearner[]> => {
    const res = await apiClient.get<ApiResponse<{ learners: AtRiskLearner[] }>>('/admin/at-risk-learners');
    return res.data.data.learners;
  },

  // Update user role
  updateUserRole: async (userId: number, role: 'learner' | 'instructor' | 'administrator'): Promise<User> => {
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

  // Get all instructors
  getAllInstructors: async (): Promise<AdminInstructor[]> => {
    const res = await apiClient.get<ApiResponse<{ instructors: AdminInstructor[] }>>('/admin/instructors');
    return res.data.data.instructors;
  },

  // Update instructor profile
  updateInstructorProfile: async (
    userId: number,
    payload: UpdateInstructorProfileBody
  ): Promise<AdminInstructor> => {
    const res = await apiClient.patch<ApiResponse<{ instructor: AdminInstructor }>>(
      `/admin/instructors/${userId}`,
      payload
    );
    return res.data.data.instructor;
  },
};