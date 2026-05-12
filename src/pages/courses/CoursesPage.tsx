

import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams }    from 'react-router-dom';
import { BookOpen, Plus }        from 'lucide-react';
import { useCourses }            from '../../hooks/useCourses';
import { useAuthStore }          from '../../store/auth.store';
import CourseCard                from '../../components/course/CourseCard';
import CourseFilters             from '../../components/course/CourseFilters';
import Button                   from '../../components/ui/Button';
import EmptyState               from '../../components/ui/EmptyState';
import { PageSpinner }          from '../../components/ui/Spinner';
import { ROLES }                from '../../utils/constants';

const LIMIT = 12;  // courses per page

const CoursesPage = () => {
  const navigate     = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user         = useAuthStore((state) => state.user);

  // Get search from URL params, default to empty string
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [page,   setPage]   = useState(1);

  // Update URL when search changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    setSearchParams(params, { replace: true });
  }, [search, searchParams, setSearchParams]);

  const { data, isLoading, isError, refetch } = useCourses({
    search: search || undefined,
    page,
    limit: LIMIT,
  });

  // Reset to page 1 when search changes
  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const canCreateCourse =
    user?.role === ROLES.MENTOR || user?.role === ROLES.ADMINISTRATOR;

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

  const courses    = data?.courses    ?? [];
  const total      = data?.total      ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-10">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center
                       justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Explore Courses
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {total > 0
              ? `${total} course${total !== 1 ? 's' : ''} available`
              : 'No courses found'
            }
          </p>
        </div>

        {/* Create course button — mentor and admin only */}
        {canCreateCourse && (
          <Button
            onClick={() => navigate('/mentor/courses/create')}
            leftIcon={<Plus size={16} />}
          >
            Create Course
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <CourseFilters
          search={search}
          onSearch={handleSearch}
          isLoading={isLoading}
        />
      </div>

      {/* Course grid */}
      {courses.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={28} />}
          title={search ? 'No courses match your search' : 'No courses yet'}
          description={
            search
              ? `Try a different keyword`
              : 'Courses will appear here once published'
          }
          action={
            canCreateCourse
              ? { label: 'Create First Course', onClick: () => navigate('/mentor/courses/create') }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
                         xl:grid-cols-4 gap-5">
          {courses.map((course) => (
            <CourseCard key={course.course_id} course={course} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <Button
            variant="secondary"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`
                  w-8 h-8 rounded-lg text-sm font-medium transition-colors
                  ${p === page
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                {p}
              </button>
            ))}
          </div>

          <Button
            variant="secondary"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

    </div>
  );
};

export default CoursesPage;