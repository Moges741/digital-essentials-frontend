// src/api/exam.api.ts

import apiClient from './axios';
import type {
  FinalExam,
  ExamWithQuestions,
  ExamResult,
  ExamSubmissionForInstructor,
  ExamAnswerWithQuestion,
  CreateExamBody,
  CreateQuestionBody,
  SubmitExamBody,
} from '../types/exam.types';
import type { ApiResponse } from '../types/auth.types';

export const examApi = {

  get: async (course_id: number): Promise<ExamWithQuestions> => {
    const res = await apiClient.get<ApiResponse<{ exam: ExamWithQuestions }>>(
      `/courses/${course_id}/exam`
    );
    return res.data.data.exam;
  },

  create: async (
    course_id: number,
    body: CreateExamBody
  ): Promise<FinalExam> => {
    const res = await apiClient.post<ApiResponse<{ exam: FinalExam }>>(
      `/courses/${course_id}/exam`, body
    );
    return res.data.data.exam;
  },

  update: async (
    course_id:     number,
    passing_score: number
  ): Promise<FinalExam> => {
    const res = await apiClient.put<ApiResponse<{ exam: FinalExam }>>(
      `/courses/${course_id}/exam`, { passing_score }
    );
    return res.data.data.exam;
  },

  delete: async (course_id: number): Promise<void> => {
    await apiClient.delete(`/courses/${course_id}/exam`);
  },

  addQuestion: async (
    course_id: number,
    body: CreateQuestionBody
  ): Promise<any> => {
    const res = await apiClient.post<ApiResponse<{ question: any }>>(
      `/courses/${course_id}/exam/questions`, body
    );
    return res.data.data.question;
  },

  deleteQuestion: async (
    course_id:   number,
    question_id: number
  ): Promise<void> => {
    await apiClient.delete(
      `/courses/${course_id}/exam/questions/${question_id}`
    );
  },

  submit: async (
    course_id: number,
    body: SubmitExamBody
  ): Promise<ExamResult> => {
    const res = await apiClient.post<ApiResponse<{ result: ExamResult }>>(
      `/courses/${course_id}/exam/submit`, body
    );
    return res.data.data.result;
  },

  getResult: async (course_id: number): Promise<ExamResult | null> => {
    const res = await apiClient.get<ApiResponse<{ result: ExamResult | null }>>(
      `/courses/${course_id}/exam/result`
    );
    return res.data.data.result;
  },

  getSubmissions: async (
    course_id: number
  ): Promise<ExamSubmissionForInstructor[]> => {
    const res = await apiClient.get<ApiResponse<{ submissions: ExamSubmissionForInstructor[] }>>(
      `/courses/${course_id}/exam/submissions`
    );
    return res.data.data.submissions;
  },

  getSubmission: async (
    course_id: number,
    submission_id: number
  ): Promise<ExamSubmissionForInstructor & { answers: ExamAnswerWithQuestion[] }> => {
    const res = await apiClient.get<ApiResponse<{ submission: ExamSubmissionForInstructor & { answers: ExamAnswerWithQuestion[] } }>>(
      `/courses/${course_id}/exam/submissions/${submission_id}`
    );
    return res.data.data.submission;
  },

  gradeAnswer: async (
    course_id:    number,
    submission_id: number,
    answer_id:    number,
    is_correct:   boolean
  ): Promise<void> => {
    await apiClient.post(
      `/courses/${course_id}/exam/submissions/${submission_id}/answers/${answer_id}/grade`,
      { is_correct }
    );
  },
};