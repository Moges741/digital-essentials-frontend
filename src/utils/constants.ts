import type { Role } from "../types/auth.types";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;
export const APP_NAME     = import.meta.env.VITE_APP_NAME as string;

export const ROLES = {
  LEARNER:       'learner',
  INSTRUCTOR:    'mentor',
  ADMINISTRATOR: 'administrator',
} as const;

export const QUERY_KEYS = {
  COURSES:      'courses',
  LESSONS:      'lessons',
  ENROLLMENTS:  'enrollments',
  PROGRESS:     'progress',
  EXERCISES:    'exercises',
  MATERIALS:    'materials',
  CERTIFICATES: 'certificates',
  FEEDBACK:     'feedback',
  CHAT:         'chat',
} as const;

export const getDashboardByRole = (role: Role): string => {
  if (role === 'mentor')        return '/instructor';
  if (role === 'administrator') return '/admin';
  return '/dashboard';
};