
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, BookOpen } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center
                     justify-center px-4">
      <div className="max-w-md w-full text-center">

        {/* 404 visual */}
        <div className="mb-8">
          <div className="text-8xl font-bold text-primary-100
                            select-none mb-4">
            404
          </div>
          <div className="w-20 h-20 bg-primary-50 rounded-2xl
                            flex items-center justify-center mx-auto
                            border border-primary-200">
            <BookOpen size={32} className="text-primary-400" />
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Page Not Found
        </h1>
        <p className="text-gray-500 leading-relaxed mb-8">
          The page you are looking for does not exist or has been
          moved. Let's get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center
                         justify-center gap-3">
          <Button
            onClick={() => navigate(-1)}
            variant="secondary"
            leftIcon={<ArrowLeft size={16} />}
          >
            Go Back
          </Button>
          <Button
            onClick={() => navigate('/')}
            leftIcon={<Home size={16} />}
          >
            Back to Home
          </Button>
        </div>

      </div>
    </div>
  );
};

export default NotFoundPage;