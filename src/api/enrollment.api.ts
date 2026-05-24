
import apiClient from './axios';
import type {
  Enrollment,
  EnrollmentWithCourse,
  CreateEnrollmentBody,
} from '../types/enrollment.types';
import type { ApiResponse } from '../types/auth.types';

export const enrollmentApi = {

  // POST /api/enrollments
  // learner only — enroll in a course
  enroll: async (body: CreateEnrollmentBody): Promise<Enrollment> => {
    const res = await apiClient.post<ApiResponse<{ enrollment: Enrollment }>>(
      '/enrollments',
      body
    );
    return res.data.data.enrollment;
  },

  // GET /api/enrollments/my
  // any authenticated user — own enrollments with course details
  getMy: async (): Promise<EnrollmentWithCourse[]> => {
    const res = await apiClient.get<ApiResponse<{ enrollments: EnrollmentWithCourse[] }>>(
      '/enrollments/my'
    );
    return res.data.data.enrollments;
  },

  // GET /api/enrollments/course/:course_id
  // instructor (own course), admin
  getByCourse: async (course_id: number): Promise<any[]> => {
    const res = await apiClient.get<ApiResponse<{ enrollments: any[] }>>(
      `/enrollments/course/${course_id}`
    );
    return res.data.data.enrollments;
  },

  // PATCH /api/enrollments/:enrollment_id/drop
  // learner (own), admin
  drop: async (enrollment_id: number): Promise<void> => {
    await apiClient.patch(`/enrollments/${enrollment_id}/drop`);
  },
};