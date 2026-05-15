
import { useNavigate, Link } from 'react-router-dom';
import {
  BookOpen, Wifi, WifiOff, Award,
  MessageCircle, ChevronRight, CheckCircle,
   Globe, Download, ArrowRight,
  Smartphone, Shield, BarChart2,
} from 'lucide-react';
import { useCourses }       from '../../hooks/useCourses';
import { useAuthStore }     from '../../store/auth.store';
import Button               from '../../components/ui/Button';
import CourseCard           from '../../components/course/CourseCard';
// import { PageSpinner }      from '../../components/ui/Spinner';

// ── Feature card ──────────────────────────────────────────────
const FeatureCard = ({
  icon, title, description, color,
}: {
  icon:        React.ReactNode;
  title:       string;
  description: string;
  color:       string;
}) => (
  <div className="flex flex-col gap-4 p-6 bg-white rounded-2xl
                   border border-gray-200 shadow-sm
                   hover:shadow-md hover:border-primary-200
                   transition-all duration-200">
    <div className={`w-12 h-12 rounded-xl flex items-center
                      justify-center ${color}`}>
      {icon}
    </div>
    <div>
      <h3 className="text-base font-bold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-500 leading-relaxed">
        {description}
      </p>
    </div>
  </div>
);

// ── Step card ─────────────────────────────────────────────────
const StepCard = ({
  step, title, description,
}: {
  step:        number;
  title:       string;
  description: string;
}) => (
  <div className="flex gap-4">
    <div className="flex-shrink-0 w-10 h-10 bg-primary-600
                     rounded-full flex items-center justify-center
                     text-white font-bold text-sm">
      {step}
    </div>
    <div className="pt-1">
      <h3 className="text-base font-semibold text-gray-900 mb-1">
        {title}
      </h3>
      <p className="text-sm text-gray-500 leading-relaxed">
        {description}
      </p>
    </div>
  </div>
);

// ── Stat item ─────────────────────────────────────────────────
const StatItem = ({ value, label }: { value: string; label: string }) => (
  <div className="text-center">
    <p className="text-3xl font-bold text-white">{value}</p>
    <p className="text-sm text-primary-200 mt-1">{label}</p>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────
const HomePage = () => {
  const navigate                = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  // Fetch a preview of published courses (max 3)
  const { data } = useCourses({
    limit: 3,
    page:  1,
  });

  const previewCourses = data?.courses ?? [];

  const handleGetStarted = () => {
    if (isAuthenticated && user) {
      const roleMap: Record<string, string> = {
        learner:       '/dashboard',
        mentor:        '/mentor',
        administrator: '/admin',
      };
      navigate(roleMap[user.role] ?? '/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="flex flex-col">

      {/* ══════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════ */}
      <section className="relative bg-gradient-to-br from-primary-900
                            via-primary-800 to-primary-700
                            text-white overflow-hidden">

        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80
                           bg-primary-500 rounded-full opacity-20
                           blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60
                           bg-blue-400 rounded-full opacity-10
                           blur-3xl" />
        </div>

        <div className="relative max-w-screen-xl mx-auto px-4
                          py-20 md:py-28">
          <div className="max-w-3xl">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5
                              bg-white/10 rounded-full border
                              border-white/20 mb-6">
              <Globe size={14} className="text-primary-200" />
              <span className="text-xs font-medium text-primary-100">
                Bosa Addis Kebele · Jimma, Ethiopia
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold
                             leading-tight mb-6">
              Learn Digital Skills
              <span className="block text-primary-300 mt-1">
                At Your Own Pace
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-lg md:text-xl text-primary-100
                            leading-relaxed mb-8 max-w-2xl">
              The Digital Essentials Platform helps communities build
              confidence with technology — from basic smartphone use
              to online safety and productivity tools. Learn online
              or offline, at any skill level.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="bg-white text-primary-700
                            hover:bg-primary-50
                            focus:ring-white"
                rightIcon={<ArrowRight size={18} />}
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
              </Button>

              <Link to="/courses">
                <Button
                  size="lg"
                  variant="ghost"
                  className="text-white hover:bg-white/10
                              border border-white/30"
                >
                  Browse Courses
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-5 mt-10">
              {[
                'Free to join',
                'Works offline',
                'Earn certificates',
                'AI assistant included',
              ].map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-green-400" />
                  <span className="text-sm text-primary-100">{item}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Stats bar */}
        <div className="relative bg-black/20 border-t border-white/10">
          <div className="max-w-screen-xl mx-auto px-4 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <StatItem value="100%"  label="Free Access" />
              <StatItem value="3"     label="User Roles" />
              <StatItem value="AI"    label="Chat Assistant" />
              <StatItem value="∞"     label="Offline Support" />
            </div>
          </div>
        </div>

      </section>

      {/* ══════════════════════════════════════════════════
          FEATURES SECTION
      ══════════════════════════════════════════════════ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-screen-xl mx-auto px-4">

          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Learn
            </h2>
            <p className="text-gray-500 leading-relaxed">
              Built specifically for communities with limited digital
              experience. Simple, accessible, and available even
              without a reliable internet connection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Wifi size={22} className="text-primary-600" />}
              title="Online Learning"
              description="Interactive courses with lessons, quizzes, and exercises. Track your progress and earn certificates automatically."
              color="bg-primary-50"
            />
            <FeatureCard
              icon={<WifiOff size={22} className="text-purple-600" />}
              title="Works Offline"
              description="Download materials — PDFs, audio lessons, worksheets — and learn without internet. Progress syncs automatically when you reconnect."
              color="bg-purple-50"
            />
            <FeatureCard
              icon={<MessageCircle size={22} className="text-blue-600" />}
              title="AI Assistant"
              description="Ask questions anytime using the built-in AI chat powered by Groq. Get clear answers about digital skills in plain language."
              color="bg-blue-50"
            />
            <FeatureCard
              icon={<Award size={22} className="text-amber-600" />}
              title="Earn Certificates"
              description="Complete all lessons in a course and receive a digital certificate automatically. Share your achievement with others."
              color="bg-amber-50"
            />
            <FeatureCard
              icon={<Shield size={22} className="text-green-600" />}
              title="Safe and Secure"
              description="Your data is protected with industry-standard encryption and secure login. Your privacy matters to us."
              color="bg-green-50"
            />
            <FeatureCard
              icon={<BarChart2 size={22} className="text-rose-600" />}
              title="Track Progress"
              description="See exactly how far you have come. Visual progress bars, lesson completion tracking, and enrollment history."
              color="bg-rose-50"
            />
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-screen-xl mx-auto px-4">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16
                            items-center">

            {/* Left — steps */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                How It Works
              </h2>
              <p className="text-gray-500 mb-10">
                Start learning in minutes. No experience required.
              </p>

              <div className="flex flex-col gap-8">
                <StepCard
                  step={1}
                  title="Create Your Free Account"
                  description="Register as a learner in seconds. No payment required, no technical experience needed."
                />
                <StepCard
                  step={2}
                  title="Browse and Enroll in Courses"
                  description="Choose from courses on smartphone use, internet safety, email, and more. Enroll with one click."
                />
                <StepCard
                  step={3}
                  title="Learn at Your Own Pace"
                  description="Study online or download materials for offline use. Complete lessons when and where it suits you."
                />
                <StepCard
                  step={4}
                  title="Earn Your Certificate"
                  description="Finish all lessons in a course and receive a certificate of completion automatically."
                />
              </div>
            </div>

            {/* Right — visual card */}
            <div className="bg-gradient-to-br from-primary-50 to-blue-50
                             rounded-2xl border border-primary-100 p-8">

              <div className="flex flex-col gap-4">

                {/* Mock progress card */}
                <div className="bg-white rounded-xl p-4 shadow-sm border
                                  border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 bg-primary-100 rounded-lg
                                      flex items-center justify-center">
                      <Smartphone size={18} className="text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Introduction to Smartphones
                      </p>
                      <p className="text-xs text-gray-400">2 of 4 lessons</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full w-1/2" />
                  </div>
                  <p className="text-xs text-right text-gray-400 mt-1">50%</p>
                </div>

                {/* Mock lesson items */}
                {[
                  { done: true,  label: 'What is a Smartphone?' },
                  { done: true,  label: 'Making Your First Call' },
                  { done: false, label: 'Using the Internet Safely' },
                  { done: false, label: 'Downloading Apps' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 bg-white
                                 rounded-xl px-4 py-3 shadow-sm
                                 border border-gray-100"
                  >
                    {item.done ? (
                      <CheckCircle size={16} className="text-green-500" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2
                                        border-gray-300" />
                    )}
                    <span className={`text-sm ${
                      item.done
                        ? 'text-gray-400 line-through'
                        : 'text-gray-700 font-medium'
                    }`}>
                      {item.label}
                    </span>
                  </div>
                ))}

                {/* Mock AI chat */}
                <div className="bg-white rounded-xl p-4 shadow-sm
                                  border border-gray-200">
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 bg-gray-100 rounded-full
                                      flex items-center justify-center
                                      flex-shrink-0">
                      <MessageCircle size={13} className="text-gray-500" />
                    </div>
                    <div className="bg-gray-50 rounded-xl rounded-tl-sm
                                      px-3 py-2">
                      <p className="text-xs text-gray-600">
                        What is a strong password? 🔐
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          COURSE PREVIEW
      ══════════════════════════════════════════════════ */}
      {previewCourses.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-screen-xl mx-auto px-4">

            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Start Learning Today
                </h2>
                <p className="text-gray-500 mt-2">
                  Browse our available courses
                </p>
              </div>
              <Link
                to="/courses"
                className="hidden sm:flex items-center gap-1
                             text-sm font-medium text-primary-600
                             hover:text-primary-700 transition-colors"
              >
                View all courses
                <ChevronRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2
                              lg:grid-cols-3 gap-6">
              {previewCourses.map((course) => (
                <CourseCard key={course.course_id} course={course} />
              ))}
            </div>

            <div className="text-center mt-8 sm:hidden">
              <Link to="/courses">
                <Button variant="secondary">
                  View All Courses
                </Button>
              </Link>
            </div>

          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════
          OFFLINE SECTION
      ══════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="bg-gradient-to-r from-purple-600 to-primary-700
                            rounded-2xl p-8 md:p-12 text-white
                            flex flex-col md:flex-row items-center
                            justify-between gap-8">

            <div className="max-w-lg">
              <div className="flex items-center gap-2 mb-4">
                <WifiOff size={20} className="text-purple-200" />
                <span className="text-sm font-medium text-purple-200">
                  Offline-Ready Learning
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                No Internet? No Problem.
              </h2>
              <p className="text-purple-100 leading-relaxed">
                Download PDFs, audio lessons, and worksheets before
                you go offline. Complete your lessons anywhere.
                When you reconnect, your progress syncs automatically.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                {[
                  { icon: <Download size={14} />, label: 'Download materials' },
                  { icon: <WifiOff  size={14} />, label: 'Learn offline' },
                  { icon: <Wifi     size={14} />, label: 'Auto-sync progress' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-1.5 px-3 py-1.5
                                 bg-white/15 rounded-full text-xs
                                 font-medium border border-white/20"
                  >
                    {item.icon}
                    {item.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-shrink-0">
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="bg-white text-primary-700
                            hover:bg-primary-50 focus:ring-white"
                rightIcon={<ArrowRight size={18} />}
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Join Free'}
              </Button>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════════════ */}
      <section className="py-20 bg-primary-900 text-white">
        <div className="max-w-screen-xl mx-auto px-4 text-center">

          <div className="w-16 h-16 bg-primary-700 rounded-2xl
                            flex items-center justify-center mx-auto mb-6">
            <BookOpen size={28} className="text-white" />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Build Your Digital Skills?
          </h2>
          <p className="text-primary-200 text-lg max-w-xl mx-auto mb-8">
            Join learners in Bosa Addis Kebele and beyond who are
            building confidence with technology — one lesson at a time.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="bg-white text-primary-700
                          hover:bg-primary-50 focus:ring-white"
            >
              {isAuthenticated ? 'Continue Learning' : 'Create Free Account'}
            </Button>
            <Link to="/courses">
              <Button
                size="lg"
                variant="ghost"
                className="text-white hover:bg-white/10
                            border border-white/30"
              >
                Browse Courses
              </Button>
            </Link>
          </div>

          <p className="text-primary-400 text-sm mt-8">
            Jimma University · Jimma Institute of Technology ·
            Software Engineering Program · CBTP
          </p>

        </div>
      </section>

    </div>
  );
};

export default HomePage;