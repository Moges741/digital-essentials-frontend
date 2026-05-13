export interface Feedback {
  feedback_id:   number;
  enrollment_id: number;
  rating:        number;   // 1 to 5
  comments:      string | null;
  submitted_at:  string;
}

export interface FeedbackWithDetails extends Feedback {
  user_name:    string;
  user_email:   string;
  course_title: string;
}

export interface CreateFeedbackBody {
  enrollment_id: number;
  rating:        number;
  comments?:     string;
}

export interface UpdateFeedbackBody {
  rating?:   number;
  comments?: string;
}