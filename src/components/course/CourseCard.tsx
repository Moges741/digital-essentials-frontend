import { useNavigate } from 'react-router-dom';
import {
  Clock,
  BookOpen,
  User,
  ChevronRight,
  Star,
} from 'lucide-react';

import Card from '../ui/Card';
import { StatusBadge } from '../ui/Badge';

import type {
  Course,
} from '../../types/course.types';

import { useAuthStore } from '../../store/auth.store';
import { ROLES } from '../../utils/constants';

interface CourseCardProps {
  course: Course;
}

const CourseCard = ({ course }: CourseCardProps) => {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);

  const isMentorOrAdmin =
    user?.role === ROLES.MENTOR ||
    user?.role === ROLES.ADMINISTRATOR;

  // Convert minutes to readable format
  const formatDuration = (mins: number): string => {
    if (!mins) return 'Self-paced';

    if (mins < 60) {
      return `${mins} min`;
    }

    const h = Math.floor(mins / 60);
    const m = mins % 60;

    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  // Random gradient color
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
  const targetRoles = Array.isArray(course.target_roles) ? course.target_roles : [];

  return (
    <Card
      hover
      padding="none"
      onClick={() =>
        navigate(`/courses/${course.course_id}`)
      }
      className="group flex w-full min-h-[360px] cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg transition-transform duration-200 hover:scale-[1.02] hover:shadow-2xl"
    >
      {/* Header */}
      <div className={`relative flex h-32 w-full items-center justify-center bg-gradient-to-r sm:h-40 ${colorClass}`}>
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <BookOpen
            size={44}
            className="text-white/80 drop-shadow-lg"
            aria-hidden
          />
        )}

        {/* subtle overlay to ensure contrast */}
        <div className="absolute inset-0 bg-black/10" />

        {isMentorOrAdmin && (
          <div className="absolute right-3 top-3">
            <StatusBadge
              status={
                course.is_published
                  ? 'published'
                  : 'draft'
              }
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-5 p-6 sm:p-7">

        {/* Topic & Target Roles Label */}
        {(course.topic || targetRoles.length > 0) && (
          <div className="flex flex-wrap items-center gap-1.5">
            {course.topic && (
              <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-semibold text-primary-800 drop-shadow-sm">
                {course.topic}
              </span>
            )}
            
            {targetRoles.length > 0 && (
              <>
                <span className="text-xs font-medium italic text-gray-500">for</span>
                <div className="flex flex-wrap gap-1">
                  {targetRoles.map((role) => (
                    <span 
                      key={role} 
                      className="inline-flex items-center text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full capitalize"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Title */}
        <h3 className="line-clamp-2 text-xl font-bold leading-tight text-gray-900 transition-colors group-hover:text-primary-700">
          {course.title}
        </h3>

        {/* Description */}
        <p className="line-clamp-3 flex-1 text-[15px] leading-relaxed text-gray-600">
          {course.description}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-6 border-t border-gray-100 pt-2 text-sm text-gray-500">

          <span className="flex items-center gap-2">
            <User size={15} />

            <span className="font-medium">
              {course.creator_name}
            </span>
          </span>

          <span className="flex items-center gap-2">
            <Clock size={15} />

            <span>
              {formatDuration(course.duration_mins)}
            </span>
          </span>
        </div>

        {/* Footer */}
        <div className="mt-2 flex items-center justify-between">

          <span className="flex items-center gap-1 text-sm font-semibold text-primary-600 group-hover:text-primary-700">
            View course

            <ChevronRight size={16} />
          </span>

          <span className="flex items-center gap-1 text-xs font-medium text-yellow-500">
            <Star size={15} className="-ml-0.5" />
            4.8
          </span>

        </div>
      </div>
    </Card>
  );
};

export default CourseCard;