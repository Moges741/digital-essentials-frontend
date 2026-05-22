
// import type { ApiResponse } from './auth.types';

export type CourseCategory = 'Basics' | 'Intermediate' | 'Advanced';
export type TimeLimitUnit = 'minute' | 'hour' | 'day' | 'week' | 'month';

export type CourseTopic = 
  | 'AI'
  | 'IoT'
  | 'Cloud Computing'
  | 'Cyber Security'
  | 'Safety Issue'
  | 'Software Development & Coding'
  | 'Digital Marketing'
  | 'E-Commerce';

export type TargetRole = 'teacher' | 'doctor' | 'student' | 'farmer' | 'merchant' | 'professional' | 'general';

export interface Course {
  course_id:    number;
  title:        string;
  description:  string;
  /** Optional thumbnail URL for course cards and previews */
  thumbnail_url?: string | null;
  duration_mins: number;
  category:     CourseCategory;
  topic:        CourseTopic;
  target_roles: TargetRole[];
  created_by:   number;
  is_published: boolean;
  time_limit_value?: number | null;
  time_limit_unit?: TimeLimitUnit | null;
  created_at:   string;
  updated_at:   string;
  creator_name: string;
  creator_role: string;
}

export interface CourseWithLessons extends Course {
  lessons: CoursLesson[];
}

export interface CoursLesson {
  lesson_id:    number;
  title:        string;
  lesson_order: number;
}

export interface PaginatedCourses {
  courses:     Course[];
  total:       number;
  page:        number;
  limit:       number;
  totalPages:  number;
}

export interface CreateCourseBody {
  title:         string;
  description:   string;
  duration_mins?: number;
  category?:     CourseCategory;
  topic?:        CourseTopic;
  target_roles?: TargetRole[];
  time_limit_value?: number | null;
  time_limit_unit?:  TimeLimitUnit | null;
}

export interface UpdateCourseBody {
  title?:        string;
  description?:  string;
  duration_mins?: number;
  category?:     CourseCategory;
  topic?:        CourseTopic;
  target_roles?: TargetRole[];
  time_limit_value?: number | null;
  time_limit_unit?:  TimeLimitUnit | null;
}

export interface CourseFilters {
  search?: string;
  page?:   number;
  limit?:  number;
}