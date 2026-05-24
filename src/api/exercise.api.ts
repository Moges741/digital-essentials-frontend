
import apiClient from './axios';
import type  {
  Exercise,
  ExerciseSubmission,
  SubmissionWithLearner,
  SubmitExerciseBody,
  MySubmission,
} from '../types/exercise.types';
import type { ApiResponse } from '../types/auth.types';

export const exerciseApi = {

  // GET /api/courses/:course_id/exercises
  // Returns all exercises for a course with lesson info
  list: async (course_id: number): Promise<Exercise[]> => {
    const res = await apiClient.get<ApiResponse<{ exercises: Exercise[] }>>(
      `/courses/${course_id}/exercises`
    );
    return res.data.data.exercises;
  },

  // GET /api/courses/:course_id/exercises/:exercise_id
  getOne: async (
    course_id:   number,
    exercise_id: number
  ): Promise<Exercise> => {
    const res = await apiClient.get<ApiResponse<{ exercise: Exercise }>>(
      `/courses/${course_id}/exercises/${exercise_id}`
    );
    return res.data.data.exercise;
  },

  // GET /api/courses/:course_id/exercises/my-submissions
  // Learner's own submissions for a course
  getMySubmissions: async (
    course_id: number
  ): Promise<MySubmission[]> => {
    const res = await apiClient.get<ApiResponse<{ submissions: MySubmission[] }>>(
      `/courses/${course_id}/exercises/my-submissions`
    );
    return res.data.data.submissions;
  },

  // GET /api/courses/:course_id/exercises/:exercise_id/submissions
  // Instructor/admin view all learner submissions
  getSubmissions: async (
    course_id:   number,
    exercise_id: number
  ): Promise<SubmissionWithLearner[]> => {
    const res = await apiClient.get<ApiResponse<{ submissions: SubmissionWithLearner[] }>>(
      `/courses/${course_id}/exercises/${exercise_id}/submissions`
    );
    return res.data.data.submissions;
  },

  // POST /api/courses/:course_id/exercises/:exercise_id/submit
  // Learner submits an exercise with optional score
  submit: async (
    course_id:   number,
    exercise_id: number,
    body:        SubmitExerciseBody
  ): Promise<ExerciseSubmission> => {
    const res = await apiClient.post<ApiResponse<{ submission: ExerciseSubmission }>>(
      `/courses/${course_id}/exercises/${exercise_id}/submit`,
      body
    );
    return res.data.data.submission;
  },

  // DELETE /api/courses/:course_id/exercises/:exercise_id
  // instructor (own), admin
  delete: async (
    course_id:   number,
    exercise_id: number
  ): Promise<void> => {
    await apiClient.delete(
      `/courses/${course_id}/exercises/${exercise_id}`
    );
  },
};