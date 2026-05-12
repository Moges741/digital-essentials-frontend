
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast           from 'react-hot-toast';
import { examApi }     from '../api/exam.api';
import type {
  CreateExamBody,
  CreateQuestionBody,
  SubmitExamBody,
} from '../types/exam.types';

const EXAM_KEY = 'exam';

export const useExam = (course_id: number) =>
  useQuery({
    queryKey: [EXAM_KEY, course_id],
    queryFn:  () => examApi.get(course_id),
    enabled:  !!course_id,
    retry:    false,  // 404 means no exam — don't retry
  });

export const useExamResult = (course_id: number) =>
  useQuery({
    queryKey: [EXAM_KEY, course_id, 'result'],
    queryFn:  () => examApi.getResult(course_id),
    enabled:  !!course_id,
  });

export const useExamSubmissions = (course_id: number) =>
  useQuery({
    queryKey: [EXAM_KEY, course_id, 'submissions'],
    queryFn:  () => examApi.getSubmissions(course_id),
    enabled:  !!course_id,
  });

export const useCreateExam = (course_id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateExamBody) => examApi.create(course_id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EXAM_KEY, course_id] });
      toast.success('Final exam created');
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed'),
  });
};

export const useAddQuestion = (course_id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateQuestionBody) =>
      examApi.addQuestion(course_id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EXAM_KEY, course_id] });
      toast.success('Question added');
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed'),
  });
};

export const useDeleteQuestion = (course_id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (question_id: number) =>
      examApi.deleteQuestion(course_id, question_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EXAM_KEY, course_id] });
      toast.success('Question deleted');
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed'),
  });
};

export const useSubmitExam = (course_id: number) => {
  const queryClient = useQueryClient();
  const navigate    = useNavigate();
  return useMutation({
    mutationFn: (body: SubmitExamBody) => examApi.submit(course_id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EXAM_KEY, course_id] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      navigate(`/courses/${course_id}/exam/result`);
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed'),
  });
};

export const useDeleteExam = (course_id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => examApi.delete(course_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EXAM_KEY, course_id] });
      toast.success('Exam deleted');
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed'),
  });
};

export const useGradeAnswer = (course_id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      answer_id,
      is_correct,
    }: {
      answer_id:  number;
      is_correct: boolean;
    }) => examApi.gradeAnswer(course_id, answer_id, is_correct),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EXAM_KEY, course_id, 'submissions'],
      });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      toast.success('Answer graded');
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Failed'),
  });
};