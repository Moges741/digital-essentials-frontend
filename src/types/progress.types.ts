
export interface Progress {
  progress_id:   number;
  user_id:       number;
  lesson_id:     number;
  enrollment_id: number;
  is_completed:  boolean;
  last_accessed: string;
  synced_at:     string | null;
}

export interface ProgressWithLesson extends Progress {
  lesson_title: string;
  lesson_order: number;
}

export interface CourseProgressSummary {
  enrollment_id:     number;
  course_id:         number;
  course_title:      string;
  status:            'active' | 'completed' | 'dropped';
  total_lessons:     number;
  completed_lessons: number;
  percentage:        number;
  lessons:           ProgressWithLesson[];
}

// Used for offline sync
export interface OfflineSyncItem {
  lesson_id:    number;
  completed_at: string;  // ISO date string
}

export interface SyncProgressBody {
  completions: OfflineSyncItem[];
}

export interface SyncResult {
  synced: number[];
  failed: { lesson_id: number; reason: string }[];
}