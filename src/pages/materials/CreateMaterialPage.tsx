// Page for uploading course/lesson materials
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import LessonMaterialUpload from '../../components/lesson/LessonMaterialUpload';

const CreateMaterialPage = () => {
  const { course_id } = useParams<{ course_id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const courseId = parseInt(course_id ?? '0', 10);
  const lessonIdParam = searchParams.get('lesson_id');
  const lessonId = lessonIdParam ? parseInt(lessonIdParam, 10) : undefined;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Upload Material</h1>
        <p className="text-gray-600 mt-1">Upload PDFs, videos, audio, or worksheets for this course/lesson.</p>
      </div>

      <Card className="p-6">
        <LessonMaterialUpload
          course_id={courseId}
          // if lessonId is undefined the upload will be course-level
          lesson_id={lessonId ?? 0}
          onDone={() => navigate(`/courses/${courseId}`)}
        />
      </Card>
    </div>
  );
};

export default CreateMaterialPage;
