
import { useNavigate }    from 'react-router-dom';
import { Clock, BookOpen, User, ChevronRight } from 'lucide-react';
import Card               from '../ui/Card';
import  { StatusBadge } from '../ui/Badge';
// import Badge from '../ui/Badge';
import type { Course }         from '../../types/course.types';
import { useAuthStore }   from '../../store/auth.store';
import { ROLES }          from '../../utils/constants';

interface CourseCardProps {
  course: Course;
}

const CourseCard = ({ course }: CourseCardProps) => {
  const navigate = useNavigate();
  const user     = useAuthStore((state) => state.user);

  const isMentorOrAdmin =
    user?.role === ROLES.MENTOR || user?.role === ROLES.ADMINISTRATOR;

  // Convert minutes to readable format
  const formatDuration = (mins: number): string => {
    if (!mins) return 'Self-paced';
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <Card
      hover
      padding="none"
      onClick={() => navigate(`/courses/${course.course_id}`)}
      className="flex flex-col overflow-hidden group"
    >
      {/* Color header bar */}
      <div className="h-2 bg-gradient-to-r from-primary-500 to-primary-700" />

      <div className="p-5 flex flex-col flex-1 gap-3">

        {/* Status badge — only visible to mentor/admin */}
        {isMentorOrAdmin && (
          <div className="flex justify-end">
            <StatusBadge status={course.is_published ? 'published' : 'draft'} />
          </div>
        )}

        {/* Title */}
        <h3 className="text-base font-semibold text-gray-900 leading-snug
                        group-hover:text-primary-700 transition-colors line-clamp-2">
          {course.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 flex-1">
          {course.description}
        </p>

        {/* Meta info */}
        <div className="flex items-center gap-4 text-xs text-gray-400 pt-1
                         border-t border-gray-100">
          <span className="flex items-center gap-1">
            <User size={12} />
            {course.creator_name}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {formatDuration(course.duration_mins)}
          </span>
        </div>

        {/* View course link */}
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs font-medium text-primary-600
                            group-hover:text-primary-700 flex items-center gap-1">
            View course
            <ChevronRight size={13} />
          </span>
          <BookOpen size={16} className="text-gray-300" />
        </div>

      </div>
    </Card>
  );
};

export default CourseCard;