import { Link }     from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-2 text-primary-700 font-bold">
            <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
              <BookOpen size={15} className="text-white" />
            </div>
            Digital Essentials Platform
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link to="/courses" className="hover:text-primary-600 transition-colors">
              Courses
            </Link>
            <Link to="/register" className="hover:text-primary-600 transition-colors">
              Get Started
            </Link>
          </div>

          {/* Credit */}
          <p className="text-xs text-gray-400 text-center">
            Jimma Institute of Technology — CBTP Phase II
            <br />
            Bosa Addis Kebele, Jimma, Ethiopia
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;