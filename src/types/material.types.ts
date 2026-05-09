
export type FileType = 'pdf' | 'audio' | 'video' | 'worksheet';

export interface Material {
  material_id:          number;
  course_id:            number;
  lesson_id:            number | null;
  title:                string;
  file_url:             string;
  cloudinary_public_id: string;
  file_type:            FileType;
  is_downloadable:      boolean;
  created_at:           string;
}

// File type to display label mapping
export const fileTypeLabels: Record<FileType, string> = {
  pdf:       'PDF Document',
  audio:     'Audio Lesson',
  video:     'Video',
  worksheet: 'Worksheet',
};

// File type to accepted MIME types
export const fileTypeAccept: Record<FileType, string> = {
  pdf:       'application/pdf',
  audio:     'audio/mpeg,audio/mp4,audio/wav',
  video:     'video/mp4,video/quicktime',
  worksheet: 'application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};