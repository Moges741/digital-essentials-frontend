import { Navigate, useParams } from 'react-router-dom';

const LessonPage = () => {
  const { course_id, lesson_id } = useParams<{
    course_id: string;
    lesson_id: string;
  }>();

  if (!course_id) {
    return <Navigate to="/courses" replace />;
  }

  const target = lesson_id
    ? `/courses/${course_id}?lesson=${lesson_id}`
    : `/courses/${course_id}`;

  return <Navigate to={target} replace />;
};

export default LessonPage;
