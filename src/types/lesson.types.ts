
export interface Lesson {
  lesson_id:    number;
  course_id:    number;
  title:        string;
  content:      string | null;
  lesson_order: number;
  created_at:   string;
}

export interface OfflineMaterial {
  material_id:     number;
  title:           string;
  file_url:        string;
  file_type:       'pdf' | 'audio' | 'video' | 'worksheet';
  is_downloadable: boolean;
}

export interface LessonWithMaterials extends Lesson {
  materials: OfflineMaterial[];
}

export interface CreateLessonBody {
  title:        string;
  content?:     string;
  lesson_order?: number;
}

export interface UpdateLessonBody {
  title?:        string;
  content?:      string;
  lesson_order?: number;
}