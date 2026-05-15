import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mail } from 'lucide-react';
import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
} from 'react-icons/fa';
import Button from '../ui/Button';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder: integrate with newsletter endpoint later
    setEmail('');
  };

  return (
    <footer className="mt-auto bg-slate-900 text-slate-200">
      <div className="max-w-screen-xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-md">
                <BookOpen size={18} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-white">Digital Essentials</p>
                <p className="text-xs text-slate-300">Practical digital skills for communities — online and offline.</p>
              </div>
            </div>
            <p className="text-xs text-slate-400">Jimma Institute of Technology · CBTP · Bosa Addis Kebele</p>
            <div className="flex items-center gap-3 mt-4">
              <a aria-label="Twitter" href="#" className="text-slate-300 hover:text-white">
                <FaTwitter size={18} />
              </a>
              <a aria-label="Facebook" href="#" className="text-slate-300 hover:text-white">
                <FaFacebook size={18} />
              </a>
              <a aria-label="Instagram" href="#" className="text-slate-300 hover:text-white">
                <FaInstagram size={18} />
              </a>
              <a aria-label="Email" href="mailto:info@example.org" className="text-slate-300 hover:text-white">
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4>
            <ul className="text-sm text-slate-300 space-y-2">
              <li><Link to="/courses" className="hover:text-white">Courses</Link></li>
              <li><Link to="/register" className="hover:text-white">Get Started</Link></li>
              <li><Link to="/chat" className="hover:text-white">AI Assistant</Link></li>
              <li><Link to="/courses" className="hover:text-white">Browse Topics</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Resources</h4>
            <ul className="text-sm text-slate-300 space-y-2">
              <li><Link to="/help" className="hover:text-white">Help & FAQ</Link></li>
              <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white">Terms of Use</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Stay Updated</h4>
            <p className="text-sm text-slate-300 mb-3">Get updates about new courses, workshops, and community events.</p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Button type="submit" size="sm" className="rounded-xl">Subscribe</Button>
            </form>
            <p className="text-xs text-slate-400 mt-3">We respect your privacy. Unsubscribe anytime.</p>
          </div>

        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Digital Essentials — Built for communities. All rights reserved.
        </div>

      </div>
    </footer>
  );
};

export default Footer;