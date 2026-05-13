import { MessageCircle, Star } from 'lucide-react';
import { formatDate } from '../../utils/format';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import EmptyState from '../ui/EmptyState';
import type { FeedbackWithDetails } from '../../types/feedback.types';

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={16}
          className={
            i < rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-200'
          }
        />
      ))}
      <span className="text-sm font-medium text-gray-600 ml-2">
        {rating}/5
      </span>
    </div>
  );
};

interface FeedbackListProps {
  feedback: FeedbackWithDetails[];
  isLoading?: boolean;
}

export const FeedbackList = ({ feedback, isLoading }: FeedbackListProps) => {
  if (isLoading) {
    return (
      <Card padding="md">
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Loading feedback...</div>
        </div>
      </Card>
    );
  }

  if (feedback.length === 0) {
    return (
      <Card padding="md">
        <EmptyState
          icon={<MessageCircle size={24} />}
          title="No feedback yet"
          description="Learners will submit feedback when they complete the course."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {feedback.map((item) => (
        <Card key={item.feedback_id} padding="md" className="border border-gray-100">
          {/* Header: Learner info + rating */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-gray-900 truncate">
                  {item.user_name}
                </p>
                <Badge variant="neutral" className="text-xs">
                  {item.user_email}
                </Badge>
              </div>
              <p className="text-xs text-gray-500">
                {formatDate(item.submitted_at)}
              </p>
            </div>
            <StarRating rating={item.rating} />
          </div>

          {/* Comments */}
          {item.comments && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-sm text-gray-700 leading-relaxed">
                {item.comments}
              </p>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

export default FeedbackList;
