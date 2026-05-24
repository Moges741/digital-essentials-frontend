// src/pages/home/HomePage.tsx
// Modern landing page with Embla carousel hero
// Full-screen images with text overlay, auto-plays every 4s
// Font: Plus Jakarta Sans

import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, Link }  from 'react-router-dom';
import useEmblaCarousel       from 'embla-carousel-react';
import Autoplay               from 'embla-carousel-autoplay';
import {
  BookOpen, Wifi, WifiOff, Award,
  MessageCircle, ChevronRight, CheckCircle,
  Globe, Download, ArrowRight,
  Smartphone, Shield, BarChart2,
  GraduationCap, Users, Star,
  ClipboardList,
} from 'lucide-react';
import { useCourses }     from '../../hooks/useCourses';
import { useAuthStore }   from '../../store/auth.store';
import Button             from '../../components/ui/Button';
import CourseCard         from '../../components/course/CourseCard';

// ── Hero slides ────────────────────────────────────────────────
// Replace filenames with your actual images in /public folder
const heroSlides = [
  {
    image:    '/hero1.png',
    tag:      'Welcome to Digital Essentials',
    headline: 'Learn Digital Skills',
    sub:      'At Your Own Pace',
    body:     'Empowering communities in Jimma with the digital knowledge they need to thrive in a connected world.',
  },
  {
    image:    '/hero2.png',
    tag:      'Bosa Addis Kebele · Jimma, Ethiopia',
    headline: 'Learn Anywhere',
    sub:      'Online or Offline',
    body:     'Download lessons, complete exercises, and sync your progress when you reconnect — no internet required.',
  },
  {
    image:    '/hero3.png',
    tag:      'AI-Powered Learning',
    headline: 'Ask Anything',
    sub:      'Get Instant Answers',
    body:     'Our built-in AI assistant powered by Groq answers your questions in plain language, any time you need help.',
  },
  {
    image:    '/hero4.png',
    tag:      'Earn Your Certificate',
    headline: 'Complete Courses',
    sub:      'Prove Your Skills',
    body:     'Finish lessons, pass the final exam, and receive a verified digital certificate you can share with the world.',
  },
];

// ── Stats ─────────────────────────────────────────────────────
const stats = [
  { value: '100%', label: 'Free Access',     icon: <Star      size={18} /> },
  { value: '3',    label: 'User Roles',      icon: <Users     size={18} /> },
  { value: 'AI',   label: 'Chat Assistant',  icon: <MessageCircle size={18} /> },
  { value: '∞',    label: 'Offline Support', icon: <WifiOff   size={18} /> },
];

// ── Features ──────────────────────────────────────────────────
const features = [
  {
    icon:  <Wifi size={22} />,
    title: 'Online Learning',
    body:  'Interactive courses with lessons, exercises, and quizzes. Track your progress and earn certificates automatically.',
    color: 'text-primary-600',
    bg:    'bg-primary-50',
  },
  {
    icon:  <WifiOff size={22} />,
    title: 'Works Offline',
    body:  'Download PDFs, audio lessons, and worksheets. Learn without internet and sync automatically when you reconnect.',
    color: 'text-purple-600',
    bg:    'bg-purple-50',
  },
  {
    icon:  <MessageCircle size={22} />,
    title: 'AI Assistant',
    body:  'Ask questions anytime using the built-in AI chat powered by Groq — answers in plain language.',
    color: 'text-blue-600',
    bg:    'bg-blue-50',
  },
  {
    icon:  <Award size={22} />,
    title: 'Earn Certificates',
    body:  'Complete all lessons and pass the final exam to receive a verified digital certificate automatically.',
    color: 'text-amber-600',
    bg:    'bg-amber-50',
  },
  {
    icon:  <Shield size={22} />,
    title: 'Safe and Secure',
    body:  'Your data is protected with industry-standard encryption and secure login systems.',
    color: 'text-green-600',
    bg:    'bg-green-50',
  },
  {
    icon:  <BarChart2 size={22} />,
    title: 'Track Progress',
    body:  'Visual progress bars, lesson completion tracking, and detailed enrollment history in one place.',
    color: 'text-rose-600',
    bg:    'bg-rose-50',
  },
];

// ── How it works steps ────────────────────────────────────────
const steps = [
  {
    n:     '01',
    title: 'Create Your Free Account',
    body:  'Register as a learner in seconds. No payment required, no technical experience needed.',
    icon:  <GraduationCap size={22} className="text-primary-600" />,
  },
  {
    n:     '02',
    title: 'Browse and Enroll in Courses',
    body:  'Choose from courses on smartphone use, internet safety, email, and more. Enroll with one click.',
    icon:  <BookOpen size={22} className="text-primary-600" />,
  },
  {
    n:     '03',
    title: 'Learn at Your Own Pace',
    body:  'Study online or download materials for offline use. Complete lessons when and where it suits you.',
    icon:  <Smartphone size={22} className="text-primary-600" />,
  },
  {
    n:     '04',
    title: 'Pass Exam and Get Certificate',
    body:  'Complete all lessons, pass the final exam, and receive your verified certificate automatically.',
    icon:  <ClipboardList size={22} className="text-primary-600" />,
  },
];

// ══════════════════════════════════════════════════════════════
// HERO CAROUSEL
// ══════════════════════════════════════════════════════════════
const HeroCarousel = ({
  onGetStarted,
  isAuthenticated,
}: {
  onGetStarted:    () => void;
  isAuthenticated: boolean;
}) => {
  const autoplay = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true },
    [autoplay.current]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  const scrollTo = (index: number) => {
    emblaApi?.scrollTo(index);
  };

  return (
    <section className="relative w-full overflow-hidden"
             style={{ height: '100vh', minHeight: '600px', maxHeight: '900px' }}>

      {/* Embla viewport */}
      <div ref={emblaRef} className="h-full overflow-hidden">
        <div className="flex h-full">
          {heroSlides.map((slide, i) => (
            <div
              key={i}
              className="relative flex-none w-full h-full"
            >
              {/* Background image */}
              <img
                src={slide.image}
                alt={slide.headline}
                className="absolute inset-0 w-full h-full object-cover"
                loading={i === 0 ? 'eager' : 'lazy'}
              />

              {/* Dark gradient overlay — ensures text is always readable */}
              <div className="absolute inset-0 bg-gradient-to-r
                               from-black/70 via-black/50 to-black/20" />

              {/* Text content */}
              <div className="relative h-full flex items-center">
                <div className="max-w-screen-xl mx-auto px-6 md:px-12 w-full">
                  <div className="max-w-2xl">

                    {/* Tag pill */}
                    <div className="inline-flex items-center gap-2
                                     px-3 py-1.5 rounded-full
                                     bg-white/15 backdrop-blur-sm
                                     border border-white/25 mb-5">
                      <Globe size={13} className="text-blue-300" />
                      <span className="text-xs font-semibold
                                        text-white/90 tracking-wide">
                        {slide.tag}
                      </span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl
                                    font-extrabold text-white leading-tight
                                    mb-2 drop-shadow-lg">
                      {slide.headline}
                    </h1>

                    {/* Sub-headline */}
                    <h2 className="text-3xl md:text-4xl lg:text-5xl
                                    font-extrabold leading-tight mb-5
                                    text-transparent bg-clip-text
                                    bg-gradient-to-r from-blue-300
                                    to-primary-300 drop-shadow">
                      {slide.sub}
                    </h2>

                    {/* Body */}
                    <p className="text-base md:text-lg text-white/80
                                   leading-relaxed mb-8 max-w-xl">
                      {slide.body}
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        size="lg"
                        onClick={onGetStarted}
                        className="bg-white text-blue-300
                                    hover:bg-blue-100
                                    font-bold shadow-lg
                                    shadow-black/20"
                        rightIcon={<ArrowRight size={18} />}
                      >
                        {isAuthenticated
                          ? 'Go to Dashboard'
                          : 'Get Started Free'
                        }
                      </Button>
                      <Link to="/courses">
                        <Button
                          size="lg"
                          variant="ghost"
                          className="text-blue-300 border border-white/40
                                      hover:bg-white/10 font-semibold
                                      backdrop-blur-sm"
                        >
                          Browse Courses
                        </Button>
                      </Link>
                    </div>

                    {/* Trust chips */}
                    <div className="flex flex-wrap gap-3 mt-8">
                      {[
                        'Free to join',
                        'Works offline',
                        'Earn certificates',
                        'AI assistant',
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-1.5
                                       text-white/80 text-sm"
                        >
                          <CheckCircle size={14}
                            className="text-green-400 flex-shrink-0" />
                          {item}
                        </div>
                      ))}
                    </div>

                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2
                       flex items-center gap-2 z-20">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            className={`
              transition-all duration-300 rounded-full
              ${i === selectedIndex
                ? 'w-8 h-2.5 bg-white'
                : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/60'
              }
            `}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className="absolute bottom-8 right-6 text-white/50
                       text-xs font-medium tabular-nums">
        {String(selectedIndex + 1).padStart(2, '0')} /
        {String(heroSlides.length).padStart(2, '0')}
      </div>

    </section>
  );
};

// ══════════════════════════════════════════════════════════════
// STATS BAR
// ══════════════════════════════════════════════════════════════
const StatsBar = () => (
  <section className="bg-primary-900 py-8">
    <div className="max-w-screen-xl mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.label}
               className="flex flex-col items-center gap-2 text-center">
            <div className="w-10 h-10 bg-white/10 rounded-xl
                              flex items-center justify-center
                              text-white/70">
              {s.icon}
            </div>
            <p className="text-2xl font-extrabold text-white">
              {s.value}
            </p>
            <p className="text-xs text-primary-300 font-medium">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ══════════════════════════════════════════════════════════════
// FEATURES SECTION
// ══════════════════════════════════════════════════════════════
const FeaturesSection = () => (
  <section className="py-24 bg-white">
    <div className="max-w-screen-xl mx-auto px-4">

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="inline-block px-3 py-1 bg-primary-50
                          text-primary-700 text-xs font-bold
                          rounded-full mb-4 uppercase tracking-widest">
          Platform Features
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold
                        text-gray-900 mb-4 leading-tight">
          Everything You Need to Learn
        </h2>
        <p className="text-gray-500 leading-relaxed">
          Built for communities with limited digital experience.
          Simple, accessible, and available even without a reliable
          internet connection.
        </p>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f) => (
          <div
            key={f.title}
            className="group flex flex-col gap-4 p-6 bg-white
                         rounded-2xl border border-gray-100
                         hover:border-primary-200 hover:shadow-md
                         shadow-sm transition-all duration-200"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center
                              justify-center ${f.bg} ${f.color}
                              group-hover:scale-110 transition-transform
                              duration-200`}>
              {f.icon}
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {f.body}
              </p>
            </div>
          </div>
        ))}
      </div>

    </div>
  </section>
);

// ══════════════════════════════════════════════════════════════
// HOW IT WORKS
// ══════════════════════════════════════════════════════════════
const HowItWorksSection = () => (
  <section className="py-24 bg-gray-50">
    <div className="max-w-screen-xl mx-auto px-4">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* Left */}
        <div>
          <span className="inline-block px-3 py-1 bg-primary-50
                            text-primary-700 text-xs font-bold
                            rounded-full mb-4 uppercase tracking-widest">
            Get Started in Minutes
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold
                          text-gray-900 mb-4 leading-tight">
            How It Works
          </h2>
          <p className="text-gray-500 mb-10 leading-relaxed">
            From registration to certificate in four simple steps.
            No experience required.
          </p>

          <div className="flex flex-col gap-0">
            {steps.map((step, i) => (
              <div key={step.n} className="flex gap-4">
                {/* Step line */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-primary-600 rounded-xl
                                    flex items-center justify-center
                                    flex-shrink-0 shadow-sm">
                    {step.icon}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-0.5 h-10 bg-primary-100 my-1" />
                  )}
                </div>
                {/* Text */}
                <div className="pb-8 pt-1">
                  <span className="text-xs font-bold text-primary-400
                                    tracking-widest uppercase">
                    Step {step.n}
                  </span>
                  <h3 className="text-base font-bold text-gray-900
                                   mt-0.5 mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — mock UI card */}
        <div className="relative">

          {/* Background blob */}
          <div className="absolute -inset-4 bg-gradient-to-br
                            from-primary-50 to-blue-50 rounded-3xl
                            -z-10" />

          <div className="flex flex-col gap-3 p-6">

            {/* Mock course card */}
            <div className="bg-white rounded-2xl p-4 shadow-sm
                              border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary-100 rounded-xl
                                  flex items-center justify-center">
                  <Smartphone size={18} className="text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">
                    Introduction to Smartphones
                  </p>
                  <p className="text-xs text-gray-400">2 of 4 lessons</p>
                </div>
                <span className="text-xs font-bold text-primary-600
                                   bg-primary-50 px-2 py-1 rounded-lg">
                  50%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-primary-600 h-1.5 rounded-full w-1/2" />
              </div>
            </div>

            {/* Mock lessons */}
            {[
              { done: true,  label: 'What is a Smartphone?' },
              { done: true,  label: 'Making Your First Call' },
              { done: false, label: 'Using the Internet Safely',
                active: true },
              { done: false, label: 'Downloading Apps' },
            ].map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-3 px-4 py-3
                              rounded-xl border transition-all
                              ${item.active
                                ? 'bg-primary-50 border-primary-200'
                                : 'bg-white border-gray-100'
                              }`}
              >
                {item.done ? (
                  <CheckCircle size={16}
                    className="text-green-500 flex-shrink-0" />
                ) : item.active ? (
                  <div className="w-4 h-4 rounded-full border-2
                                    border-primary-500 flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2
                                    border-gray-300 flex-shrink-0" />
                )}
                <span className={`text-sm flex-1 ${
                  item.done
                    ? 'text-gray-400 line-through'
                    : item.active
                      ? 'text-primary-700 font-semibold'
                      : 'text-gray-600'
                }`}>
                  {item.label}
                </span>
                {item.active && (
                  <span className="text-xs bg-primary-600 text-white
                                     px-2 py-0.5 rounded-md font-medium">
                    Current
                  </span>
                )}
              </div>
            ))}

            {/* Mock AI chat bubble */}
            <div className="bg-white rounded-2xl p-4 border
                              border-gray-100 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary-600 rounded-full
                                  flex items-center justify-center
                                  flex-shrink-0">
                  <MessageCircle size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">
                    AI Assistant
                  </p>
                  <div className="bg-gray-50 rounded-xl rounded-tl-sm
                                    px-3 py-2 border border-gray-100">
                    <p className="text-xs text-gray-700">
                      A strong password uses 8+ characters with
                      letters, numbers, and symbols. 🔐
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </section>
);

// ══════════════════════════════════════════════════════════════
// COURSE PREVIEW
// ══════════════════════════════════════════════════════════════
const CoursePreviewSection = ({
  courses,
}: {
  courses: any[];
}) => {
  if (!courses.length) return null;

  return (
    <section className="py-24 bg-white">
      <div className="max-w-screen-xl mx-auto px-4">

        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="inline-block px-3 py-1 bg-primary-50
                              text-primary-700 text-xs font-bold
                              rounded-full mb-4 uppercase tracking-widest">
              Available Now
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold
                            text-gray-900 leading-tight">
              Start Learning Today
            </h2>
            <p className="text-gray-500 mt-2">
              Browse our published courses
            </p>
          </div>
          <Link
            to="/courses"
            className="hidden sm:flex items-center gap-1.5
                         text-sm font-semibold text-primary-600
                         hover:text-primary-700 transition-colors"
          >
            View all
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2
                          lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.course_id} course={course} />
          ))}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Link to="/courses">
            <Button variant="secondary">View All Courses</Button>
          </Link>
        </div>

      </div>
    </section>
  );
};

// ══════════════════════════════════════════════════════════════
// OFFLINE SECTION
// ══════════════════════════════════════════════════════════════
const OfflineSection = ({
  onGetStarted,
  isAuthenticated,
}: {
  onGetStarted:    () => void;
  isAuthenticated: boolean;
}) => (
  <section className="py-24 bg-gray-50">
    <div className="max-w-screen-xl mx-auto px-4">
      <div className="relative overflow-hidden bg-gradient-to-r
                        from-primary-800 to-primary-600
                        rounded-3xl p-8 md:p-14">

        {/* Decorative circle */}
        <div className="absolute -right-16 -top-16 w-64 h-64
                          bg-white/5 rounded-full" />
        <div className="absolute -right-4 -bottom-12 w-40 h-40
                          bg-white/5 rounded-full" />

        <div className="relative flex flex-col md:flex-row
                          items-center justify-between gap-10">

          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-4">
              <WifiOff size={18} className="text-blue-300" />
              <span className="text-sm font-semibold text-blue-200">
                Offline-Ready Learning
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold
                            text-white mb-4 leading-tight">
              No Internet?
              <br />No Problem.
            </h2>
            <p className="text-primary-100 leading-relaxed mb-6">
              Download PDFs, audio lessons, and worksheets before you
              go offline. Complete your lessons anywhere, anytime.
              When you reconnect, your progress syncs automatically.
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                { icon: <Download size={13} />, label: 'Download materials' },
                { icon: <WifiOff  size={13} />, label: 'Learn offline' },
                { icon: <Wifi     size={13} />, label: 'Auto-sync progress' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-1.5 px-3 py-1.5
                               bg-white/15 rounded-full text-xs
                               font-semibold text-white border
                               border-white/20"
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
              onClick={onGetStarted}
              className="bg-white text-primary-800 hover:bg-blue-50
                          font-bold shadow-xl shadow-black/20"
              rightIcon={<ArrowRight size={18} />}
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Join Free Now'}
            </Button>
          </div>

        </div>
      </div>
    </div>
  </section>
);

// ══════════════════════════════════════════════════════════════
// FINAL CTA
// ══════════════════════════════════════════════════════════════
const FinalCTA = ({
  onGetStarted,
  isAuthenticated,
}: {
  onGetStarted:    () => void;
  isAuthenticated: boolean;
}) => (
  <section className="py-24 bg-primary-900 relative overflow-hidden">

    {/* Subtle background circles */}
    <div className="absolute top-0 left-1/4 w-96 h-96
                     bg-primary-700/30 rounded-full blur-3xl" />
    <div className="absolute bottom-0 right-1/4 w-72 h-72
                     bg-blue-700/20 rounded-full blur-3xl" />

    <div className="relative max-w-screen-xl mx-auto px-4 text-center">

      <div className="w-16 h-16 bg-primary-700 rounded-2xl
                        flex items-center justify-center mx-auto mb-6
                        ring-4 ring-primary-800">
        <BookOpen size={28} className="text-white" />
      </div>

      <h2 className="text-3xl md:text-5xl font-extrabold text-white
                      mb-5 leading-tight">
        Ready to Build Your
        <span className="block text-transparent bg-clip-text
                          bg-gradient-to-r from-blue-300 to-primary-300">
          Digital Skills?
        </span>
      </h2>

      <p className="text-primary-200 text-lg max-w-xl mx-auto mb-10
                     leading-relaxed">
        Join learners in Bosa Addis Kebele and beyond who are building
        confidence with technology — one lesson at a time.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Button
          size="lg"
          onClick={onGetStarted}
          className="bg-white text-primary-900 hover:bg-blue-50
                      font-bold shadow-xl shadow-black/30"
          rightIcon={<ArrowRight size={18} />}
        >
          {isAuthenticated ? 'Continue Learning' : 'Create Free Account'}
        </Button>
        <Link to="/courses">
          <Button
            size="lg"
            variant="ghost"
            className="text-white border border-white/30
                        hover:bg-white/10 font-semibold"
          >
            Browse Courses
          </Button>
        </Link>
      </div>

      <p className="text-primary-500 text-sm mt-10">
        Jimma University · Jimma Institute of Technology ·
        Software Engineering Program · CBTP Phase III
      </p>

    </div>
  </section>
);

// ══════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════
const HomePage = () => {
  const navigate                  = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const { data } = useCourses({ limit: 3, page: 1 });
  const previewCourses = data?.courses ?? [];

  const handleGetStarted = () => {
    if (isAuthenticated && user) {
      const map: Record<string, string> = {
        learner:       '/dashboard',
        mentor:        '/instructor',
        administrator: '/admin',
      };
      navigate(map[user.role] ?? '/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="flex flex-col">

      <HeroCarousel
        onGetStarted={handleGetStarted}
        isAuthenticated={isAuthenticated}
      />

      <StatsBar />

      <FeaturesSection />

      <HowItWorksSection />

      <CoursePreviewSection courses={previewCourses} />

      <OfflineSection
        onGetStarted={handleGetStarted}
        isAuthenticated={isAuthenticated}
      />

      <FinalCTA
        onGetStarted={handleGetStarted}
        isAuthenticated={isAuthenticated}
      />

    </div>
  );
};

export default HomePage;