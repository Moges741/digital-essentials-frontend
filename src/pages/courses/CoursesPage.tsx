import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams }    from 'react-router-dom';
import { BookOpen, Plus, Zap, Award }        from 'lucide-react';
import { useCourses }            from '../../hooks/useCourses';
import { useAuthStore }          from '../../store/auth.store';
import type { CourseCategory, CourseTopic, CourseTopicFilter }   from '../../types/course.types';
import CourseCard                from '../../components/course/CourseCard';
import Input from '../../components/ui/Input';
import Button                   from '../../components/ui/Button';
import EmptyState               from '../../components/ui/EmptyState';
import { PageSpinner }          from '../../components/ui/Spinner';
import { ROLES }                from '../../utils/constants';
import { Search, X }            from 'lucide-react';

const LIMIT = 100;
const TOPICS: CourseTopic[] = [
  'AI',
  'IoT',
  'Cloud Computing',
  'Cyber Security',
  'Safety Issue',
  'General',
  'Software Development & Coding',
  'Digital Marketing',
  'E-Commerce',
];

const FILTER_TOPICS: CourseTopicFilter[] = ['All', ...TOPICS];

interface CourseSection {
  category: CourseCategory;
  title: string;
  description: string;
  icon: React.ReactNode;
  bgGradient: string;
  coursesByTopic: Record<CourseTopic, any[]>;
}

const CoursesPage = () => {
  const navigate     = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user         = useAuthStore((state) => state.user);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedTopic, setSelectedTopic] = useState<CourseTopicFilter | ''>((searchParams.get('topic') as CourseTopicFilter) || '');
  const [page, setPage]   = useState(1);

  // Update URL when search or topic changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    if (selectedTopic) {
      params.set('topic', selectedTopic);
    } else {
      params.delete('topic');
    }
    setSearchParams(params, { replace: true });
  }, [search, selectedTopic, searchParams, setSearchParams]);

  const { data, isLoading, isError, refetch } = useCourses({
    search: search || undefined,
    page,
    limit: LIMIT,
    topic: selectedTopic === 'All' || selectedTopic === '' ? undefined : selectedTopic,
  });

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleClearSearch = () => {
    setSearch('');
  };

  // Group courses by category and topic
  const coursesByCategory = useMemo(() => {
    const allCourses = data?.courses ?? [];
    
    const grouped: Record<CourseCategory, Record<CourseTopic, any[]>> = {
      'Basics': {} as Record<CourseTopic, any[]>,
      'Intermediate': {} as Record<CourseTopic, any[]>,
      'Advanced': {} as Record<CourseTopic, any[]>,
    };

    // Initialize all topics for each category
    (['Basics', 'Intermediate', 'Advanced'] as CourseCategory[]).forEach((cat) => {
      TOPICS.forEach((topic) => {
        grouped[cat][topic] = [];
      });
    });

    // Populate courses
    allCourses.forEach((course) => {
      const category = course.category || 'Basics';
      const topic = course.topic || 'General';
      if (category in grouped && topic in grouped[category as CourseCategory]) {
        grouped[category as CourseCategory][topic as CourseTopic].push(course);
      }
    });

    return grouped;
  }, [data?.courses]);

  const canCreateCourse =
    user?.role === ROLES.INSTRUCTOR || user?.role === ROLES.ADMINISTRATOR;

  // ── Loading ───────────────────────────────────────────────
  if (isLoading) return <PageSpinner />;

  // ── Error ─────────────────────────────────────────────────
  if (isError) return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
      <EmptyState
        title="Failed to load courses"
        description="Something went wrong. Please try again."
        action={{ label: 'Retry', onClick: () => refetch() }}
      />
    </div>
  );

  const total = data?.total ?? 0;

  // Define course sections with descriptions
  const sections: CourseSection[] = [
    {
      category: 'Basics',
      title: '🌱 Beginner-Friendly Basics',
      description: 'Start your learning journey here! These courses require no prior knowledge and cover fundamental concepts. Perfect for newcomers.',
      icon: <BookOpen size={24} className="text-green-600" />,
      bgGradient: 'from-green-50 to-emerald-50',
      coursesByTopic: coursesByCategory['Basics'],
    },
    {
      category: 'Intermediate',
      title: '⚡ Intermediate Level',
      description: 'Ready to level up? These courses build on basics and introduce more complex topics. We recommend completing relevant Basics courses first.',
      icon: <Zap size={24} className="text-blue-600" />,
      bgGradient: 'from-blue-50 to-cyan-50',
      coursesByTopic: coursesByCategory['Intermediate'],
    },
    {
      category: 'Advanced',
      title: '🏆 Advanced Challenges',
      description: 'For experienced learners seeking mastery. These courses tackle advanced topics and real-world scenarios. Prerequisites and foundational knowledge recommended.',
      icon: <Award size={24} className="text-purple-600" />,
      bgGradient: 'from-purple-50 to-pink-50',
      coursesByTopic: coursesByCategory['Advanced'],
    },
  ];

  return (
    <div className="mt-12 max-w-screen-xl mx-auto px-4 py-10">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center
                       justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Explore Courses
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {total > 0
              ? `${total} course${total !== 1 ? 's' : ''} organized by level and topic`
              : 'No courses available yet'
            }
          </p>
        </div>

        {/* Create course button — instructor and admin only */}
        {canCreateCourse && (
          <Button
            onClick={() => navigate('/instructor/courses/create')}
            leftIcon={<Plus size={16} />}
          >
            Create Course
          </Button>
        )}
      </div>

      {/* Search bar */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            leftIcon={<Search size={16} />}
            rightIcon={
              search ? (
                <button
                  onClick={handleClearSearch}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              ) : undefined
            }
          />
        </div>
      </div>

      {/* Courses grouped by category and topic */}
      <div className="space-y-16">
        {sections.map((section) => (
          <div key={section.category}>
            {/* Section header */}
            <div className={`rounded-2xl bg-gradient-to-r ${section.bgGradient} border border-gray-200 p-6 mb-6`}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {section.icon}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {section.title}
                  </h2>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {section.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Topic filters as buttons */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                Filter by Topic:
              </h3>
              <div className="flex flex-wrap gap-2">
                {FILTER_TOPICS.map((topic) => {
                  const courseCount = topic === 'All'
                    ? Object.values(section.coursesByTopic).reduce((total, courses) => total + courses.length, 0)
                    : section.coursesByTopic[topic]?.length || 0;
                  const isSelected = selectedTopic === topic;
                  
                  return (
                    <button
                      key={topic}
                      onClick={() => setSelectedTopic(isSelected ? '' : topic)}
                      className={`
                        px-4 py-2 rounded-full text-sm font-medium transition-all
                        ${isSelected
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }
                        ${courseCount === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                      disabled={courseCount === 0}
                    >
                      {topic}
                      {courseCount > 0 && (
                        <span className={`ml-2 text-xs font-semibold ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                          ({courseCount})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Courses grid - filtered by selected topic if any */}
            {selectedTopic ? (
              // Show all courses in this category
              selectedTopic === 'All' ? (
                Object.values(section.coursesByTopic).every((courses) => courses.length === 0) ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
                    <BookOpen size={32} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 text-sm">
                      No courses in {section.category.toLowerCase()} yet
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {Object.values(section.coursesByTopic).flat().map((course) => (
                      <CourseCard key={course.course_id} course={course} />
                    ))}
                  </div>
                )
              ) : section.coursesByTopic[selectedTopic]?.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
                  <BookOpen size={32} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">
                    No courses in {selectedTopic} at this level yet
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
                               xl:grid-cols-4 gap-5">
                  {section.coursesByTopic[selectedTopic].map((course) => (
                    <CourseCard key={course.course_id} course={course} />
                  ))}
                </div>
              )
            ) : (
              // Show all topics in this category
              <>
                {Object.entries(section.coursesByTopic).map(([topic, courses]) => {
                  if (courses.length === 0) return null;
                  return (
                    <div key={topic} className="mb-10">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        {topic}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
                                     xl:grid-cols-4 gap-5">
                        {courses.map((course) => (
                          <CourseCard key={course.course_id} course={course} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* Empty state for entire category */}
            {Object.values(section.coursesByTopic).every((courses) => courses.length === 0) && (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
                <BookOpen size={32} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm">
                  No {section.category.toLowerCase()} courses available yet
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty state when no results */}
      {total === 0 && (
        <div className="mt-12">
          <EmptyState
            icon={<BookOpen size={40} />}
            title="No courses available yet"
            description="Check back soon or create the first course!"
            action={
              canCreateCourse
                ? { label: 'Create First Course', onClick: () => navigate('/instructor/courses/create') }
                : undefined
            }
          />
        </div>
      )}

      {/* All empty after search */}
      {search && total > 0 && sections.every((s) => 
        Object.values(s.coursesByTopic).every((courses) => courses.length === 0)
      ) && (
        <div className="mt-12">
          <EmptyState
            icon={<BookOpen size={40} />}
            title="No courses match your search"
            description={`Try different keywords or browse all courses`}
            action={
              { label: 'Clear Search', onClick: handleClearSearch }
            }
          />
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
