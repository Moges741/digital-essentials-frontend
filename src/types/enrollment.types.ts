
export interface Enrollment {
  enrollment_id:   number;
  user_id:         number;
  course_id:       number;
  enrollment_date: string;
  status:          'active' | 'exam_pending' | 'completed' | 'dropped';
}

export interface EnrollmentWithCourse extends Enrollment {
  course_title:       string;
  course_description: string;
  creator_name:       string;
  total_lessons:      number;
  completed_lessons:  number;
}

export interface CreateEnrollmentBody {
  course_id: number;
}