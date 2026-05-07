
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;
export const APP_NAME     = import.meta.env.VITE_APP_NAME as string;

export const ROLES = {
  LEARNER:       'learner',
  MENTOR:        'mentor',
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


export const getDashboardByRole = (role: string): string => {
  if (role === ROLES.MENTOR)        return '/mentor';
  if (role === ROLES.ADMINISTRATOR) return '/admin';
  return '/dashboard';
}