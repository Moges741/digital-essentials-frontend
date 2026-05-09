
// import type { ApiResponse } from './auth.types';

export interface Course {
  course_id:    number;
  title:        string;
  description:  string;
  duration_mins: number;
  created_by:   number;
  is_published: boolean;
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
}

export interface UpdateCourseBody {
  title?:        string;
  description?:  string;
  duration_mins?: number;
}

export interface CourseFilters {
  search?: string;
  page?:   number;
  limit?:  number;
}