
export type QuestionType = 'multiple_choice' | 'short_answer';

export interface FinalExam {
  exercise_id:   number;
  title:         string;
  passing_score: number;
  created_at:    string;
}

export interface ExamQuestion {
  question_id:   number;
  exercise_id:   number;
  question_text: string;
  question_type: QuestionType;
  option_a:      string | null;
  option_b:      string | null;
  option_c:      string | null;
  option_d:      string | null;
  question_order: number;
  // Only present in instructor view
  correct_answer?: string | null;
}

export interface ExamWithQuestions extends FinalExam {
  questions: ExamQuestion[];
}

export interface ExamAnswerWithQuestion {
  answer_id:      number;
  submission_id:  number;
  question_id:    number;
  answer_text:    string;
  is_correct:     boolean | null;
  graded_at:      string | null;
  question_text:  string;
  question_type:  QuestionType;
  correct_answer: string | null;
  option_a:       string | null;
  option_b:       string | null;
  option_c:       string | null;
  option_d:       string | null;
}

export interface ExamResult {
  submission_id:   number;
  score:           number | null;
  submitted_at:    string;
  is_passed:       boolean;
  is_fully_graded: boolean;
  answers:         ExamAnswerWithQuestion[];
}

export interface ExamSubmissionForInstructor {
  submission_id:   number;
  user_id:         number;
  learner_name:    string;
  learner_email:   string;
  score:           number | null;
  submitted_at:    string;
  is_passed:       boolean;
  is_fully_graded: boolean;
  pending_count:   number;
  answers?:        ExamAnswerWithQuestion[];
}

export interface CreateExamBody {
  title:          string;
  passing_score?: number;
}

export interface CreateQuestionBody {
  question_text:  string;
  question_type:  QuestionType;
  option_a?:      string;
  option_b?:      string;
  option_c?:      string;
  option_d?:      string;
  correct_answer?: string;
}

export interface SubmitExamBody {
  answers: { question_id: number; answer_text: string }[];
}