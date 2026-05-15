

import { useNavigate } from 'react-router-dom';
import { Clock, BookOpen, User, ChevronRight, Star } from 'lucide-react';
import Card from '../ui/Card';
import { StatusBadge } from '../ui/Badge';
import type { Course } from '../../types/course.types';
import { useAuthStore } from '../../store/auth.store';
import { ROLES } from '../../utils/constants';

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


  // Demo: random color for illustration (replace with course image/cover if available)
  const colorList = [
    'from-blue-500 to-blue-700',
    'from-green-500 to-green-700',
    'from-purple-500 to-purple-700',
    'from-pink-500 to-pink-700',
    'from-yellow-500 to-yellow-600',
    'from-indigo-500 to-indigo-700',
  ];
  const colorIdx = course.course_id % colorList.length;
  const colorClass = colorList[colorIdx];

  return (
    <Card
      hover
      padding="none"
      onClick={() => navigate(`/courses/${course.course_id}`)}
      className="flex flex-col overflow-hidden group shadow-lg rounded-2xl border border-gray-100 bg-white transition-transform duration-200 hover:scale-[1.025] hover:shadow-2xl cursor-pointer min-h-[320px]"
      style={{ minHeight: 320 }}
    >
      {/* Visual header (could be replaced with image/cover) */}
      <div className={`h-24 w-full bg-gradient-to-r ${colorClass} flex items-center justify-center relative`}> 
        <BookOpen size={38} className="text-white/80 drop-shadow-lg" />
        {isMentorOrAdmin && (
          <div className="absolute top-3 right-3">
            <StatusBadge status={course.is_published ? 'published' : 'draft'} />
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-1 gap-4">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-primary-700 transition-colors line-clamp-2">
          {course.title}
        </h3>

        {/* Description */}
        <p className="text-base text-gray-600 leading-relaxed line-clamp-3 flex-1">
          {course.description}
        </p>

        {/* Meta info */}
        <div className="flex items-center gap-6 text-sm text-gray-500 pt-2 border-t border-gray-100">
          <span className="flex items-center gap-2">
            <User size={15} />
            <span className="font-medium">{course.creator_name}</span>
          </span>
          <span className="flex items-center gap-2">
            <Clock size={15} />
            <span>{formatDuration(course.duration_mins)}</span>
          </span>
        </div>

        {/* Action row */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-semibold text-primary-600 group-hover:text-primary-700 flex items-center gap-1">
            View course
            <ChevronRight size={16} />
          </span>
          {/* Optionally, show a rating or tag */}
          <span className="flex items-center gap-1 text-yellow-500 text-xs font-medium">
            <Star size={15} className="-ml-0.5" />
            4.8
          </span>
        </div>
      </div>
    </Card>
  );
};

export default CourseCard;