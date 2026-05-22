import { useState } from 'react';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { feedbackApi } from '../../api/feedback.api';
import { useIsEnrolled } from '../../hooks/useEnrollment';
import Button from '../ui/Button';

interface Props {
  courseId: number;
}

const FeedbackForm = ({ courseId }: Props) => {
  const queryClient = useQueryClient();
  const { isEnrolled, enrollment } = useIsEnrolled(courseId);
  const [rating, setRating] = useState<number>(5);
  const [comments, setComments] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);

  const { data: myFeedback = [] } = useQuery({
    queryKey: ['feedback', 'my'],
    queryFn: () => feedbackApi.getMy(),
    enabled: !!isEnrolled,
  });

  const existing = myFeedback.find((f) => f.enrollment_id === enrollment?.enrollment_id);

  const mutation = useMutation({
    mutationFn: (body: { enrollment_id: number; rating: number; comments?: string }) =>
      feedbackApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries(['feedback']);
      toast.success('Thanks for your feedback!');
      setSubmitted(true);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? 'Failed to submit feedback');
    },
  });

  if (!isEnrolled || !enrollment) return null;

  if (existing || submitted) {
    return (
      <div className="mt-8 rounded-lg border border-slate-100 bg-slate-50 p-4">
        <p className="font-semibold text-slate-800">Thank you for your feedback</p>
        {existing && (
          <div className="mt-2 text-sm text-slate-700">
            <p>Rating: {existing.rating} / 5</p>
            {existing.comments && <p className="mt-1">"{existing.comments}"</p>}
          </div>
        )}
      </div>
    );
  }

  const handleSubmit = () => {
    if (!enrollment) return;
    mutation.mutate({ enrollment_id: enrollment.enrollment_id, rating, comments });
  };

  return (
    <div className="mt-8 rounded-lg border border-slate-100 bg-white p-4">
      <h3 className="mb-2 text-lg font-semibold text-slate-900">Course feedback</h3>
      <p className="mb-3 text-sm text-slate-600">Share a rating and optional comments about this course.</p>

      <div className="flex items-center gap-3">
        <label className="text-sm text-slate-700">Rating</label>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="rounded-md border px-3 py-1 text-sm"
        >
          {[5,4,3,2,1].map((r) => (
            <option key={r} value={r}>{r}★</option>
          ))}
        </select>
      </div>

      <textarea
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        placeholder="Optional comments"
        className="mt-3 w-full rounded-md border px-3 py-2 text-sm text-slate-700"
        rows={4}
      />

      <div className="mt-3 flex items-center gap-2">
        <Button variant="primary" size="sm" isLoading={mutation.isLoading} onClick={handleSubmit}>
          Submit feedback
        </Button>
        <Button variant="ghost" size="sm" onClick={() => { setComments(''); setRating(5); }}>
          Reset
        </Button>
      </div>
    </div>
  );
};

export default FeedbackForm;
