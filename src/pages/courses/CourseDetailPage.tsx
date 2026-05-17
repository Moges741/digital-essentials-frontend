import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  BookCheck,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Globe,
  Menu,
  Search,
  X,
} from 'lucide-react';
import { useCourse, useDeleteCourse, usePublishCourse } from '../../hooks/useCourses';
import { useEnroll, useIsEnrolled } from '../../hooks/useEnrollment';
import { useLesson, useLessons } from '../../hooks/useLessons';
import { useCourseProgress, useMarkComplete } from '../../hooks/useProgress';
import { useAuthStore } from '../../store/auth.store';
import { ROLES } from '../../utils/constants';
import { formatDate } from '../../utils/format';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge, { StatusBadge } from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { ConfirmModal } from '../../components/ui/Modal';
import { PageSpinner } from '../../components/ui/Spinner';
import LessonContent from '../../components/lesson/LessonContent';

interface ModuleGroup {
  id: string;
  title: string;
  lessons: Array<{
    lesson_id: number;
    title: string;
    lesson_order: number;
  }>;
}

const buildLessonModules = (
  lessons: Array<{ lesson_id: number; title: string; lesson_order: number }>
): ModuleGroup[] => {
  const sorted = [...lessons].sort((a, b) => a.lesson_order - b.lesson_order);
  const byNamedPrefix = new Map<string, ModuleGroup>();
  const unnamed: typeof sorted = [];

  sorted.forEach((lesson) => {
    const match = lesson.title.match(/^([^:|-]{3,40})\s*[:|-]\s*(.+)$/);
    if (!match) {
      unnamed.push(lesson);
      return;
    }

    const groupTitle = match[1].trim();
    if (!byNamedPrefix.has(groupTitle)) {
      byNamedPrefix.set(groupTitle, {
        id: `module-${groupTitle.toLowerCase().replace(/\s+/g, '-')}`,
        title: groupTitle,
        lessons: [],
      });
    }

    byNamedPrefix.get(groupTitle)?.lessons.push(lesson);
  });

  const unnamedModules: ModuleGroup[] = [];
  for (let i = 0; i < unnamed.length; i += 4) {
    const slice = unnamed.slice(i, i + 4);
    unnamedModules.push({
      id: `module-${i / 4 + 1}`,
      title: `Module ${i / 4 + 1}`,
      lessons: slice,
    });
  }

  return [...byNamedPrefix.values(), ...unnamedModules].filter(
    (module) => module.lessons.length > 0
  );
};

const formatDuration = (mins: number) => {
  if (!mins) return 'Self-paced';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
};

const CourseDetailPage = () => {
  const { course_id } = useParams<{ course_id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useAuthStore((state) => state.user);

  const [lessonSearch, setLessonSearch] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({});
  const [lessonLoaded, setLessonLoaded] = useState(false);

  const courseId = Number.parseInt(course_id ?? '0', 10);

  const { data: course, isLoading: courseLoading, isError } = useCourse(courseId);
  const { data: lessons = [], isLoading: lessonsLoading } = useLessons(courseId);
  const { isEnrolled } = useIsEnrolled(courseId);
  const { data: progress } = useCourseProgress(courseId);

  const { mutate: enroll, isPending: enrolling } = useEnroll();
  const { mutate: publish, isPending: publishing } = usePublishCourse(courseId);
  const { mutate: deleteCourse, isPending: deleting } = useDeleteCourse();
  const { mutate: markComplete, isPending: markingComplete } = useMarkComplete(courseId);

  const isOwner = user?.user_id === course?.created_by;
  const isAdmin = user?.role === ROLES.ADMINISTRATOR;
  const canManage = isOwner || isAdmin;

  const selectedLessonQueryId = Number.parseInt(searchParams.get('lesson') ?? '0', 10);

  useEffect(() => {
    if (lessons.length === 0) return;

    const validLessonIds = new Set(lessons.map((lesson) => lesson.lesson_id));
    const preferredId = validLessonIds.has(selectedLessonQueryId)
      ? selectedLessonQueryId
      : lessons[0].lesson_id;

    setSelectedLessonId(preferredId);

    if (!validLessonIds.has(selectedLessonQueryId)) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('lesson', String(preferredId));
      setSearchParams(nextParams, { replace: true });
    }
  }, [lessons, selectedLessonQueryId, searchParams, setSearchParams]);

  const { data: activeLesson, isLoading: activeLessonLoading } = useLesson(
    courseId,
    selectedLessonId ?? 0
  );

  const completedLessonIds = useMemo(() => {
    return new Set(
      (progress?.lessons ?? [])
        .filter((lessonProgress) => lessonProgress.is_completed)
        .map((lessonProgress) => lessonProgress.lesson_id)
    );
  }, [progress]);

  const modules = useMemo(() => buildLessonModules(lessons), [lessons]);

  const filteredModules = useMemo(() => {
    const query = lessonSearch.toLowerCase().trim();
    if (!query) return modules;

    return modules
      .map((module) => ({
        ...module,
        lessons: module.lessons.filter((lesson) =>
          lesson.title.toLowerCase().includes(query)
        ),
      }))
      .filter((module) => module.lessons.length > 0);
  }, [lessonSearch, modules]);

  const selectedIndex = lessons.findIndex((lesson) => lesson.lesson_id === selectedLessonId);
  const prevLesson = selectedIndex > 0 ? lessons[selectedIndex - 1] : null;
  const nextLesson = selectedIndex >= 0 ? lessons[selectedIndex + 1] ?? null : null;

  const handleSelectLesson = (lessonId: number) => {
    setSelectedLessonId(lessonId);
    setMobileSidebarOpen(false);
    if (!lessonLoaded) setLessonLoaded(true);

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('lesson', String(lessonId));
    setSearchParams(nextParams, { replace: true });
  };

  const handleMarkComplete = () => {
    if (!selectedLessonId) return;
    markComplete(selectedLessonId);
  };

  const toggleModule = (moduleId: string) => {
    setCollapsedModules((current) => ({
      ...current,
      [moduleId]: !current[moduleId],
    }));
  };

  if (courseLoading || lessonsLoading) return <PageSpinner />;

  if (isError || !course) {
    return (
      <div className="mt-20 flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
        <EmptyState
          title="Course not found"
          description="This course may have been removed or is not yet published."
          action={{ label: 'Browse Courses', onClick: () => navigate('/courses') }}
        />
      </div>
    );
  }

  return (
    <>
      <div className="mt-16 bg-gradient-to-br from-slate-50 via-white to-blue-50/50">
        <div className="mx-auto max-w-[1440px] px-4 py-4 sm:px-6 lg:px-8">
          {!lessonLoaded && (
          <header className="mb-4 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <nav className="flex items-center gap-2 text-sm text-slate-500">
                <Link to="/courses" className="transition hover:text-blue-700">
                  Courses
                </Link>
                <ChevronRight size={14} />
                <span className="max-w-[260px] truncate font-medium text-slate-900">
                  {course.title}
                </span>
              </nav>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="lg:hidden"
                  leftIcon={<Menu size={14} />}
                  onClick={() => setMobileSidebarOpen(true)}
                >
                  Lessons
                </Button>
                {isEnrolled && lessons.length > 0 && selectedLessonId && (
                  <Button
                    size="sm"
                    leftIcon={<BookCheck size={14} />}
                    onClick={() => handleSelectLesson(selectedLessonId)}
                  >
                    Continue learning
                  </Button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <StatusBadge status={course.is_published ? 'published' : 'draft'} />
                  {canManage && !course.is_published && (
                    <Badge variant="warning">Only visible to you</Badge>
                  )}
                </div>
                <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                  {course.title}
                </h1>
                <p className="max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-[15px]">
                  {course.description}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 sm:text-sm">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 size={14} />
                    {formatDuration(course.duration_mins)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpen size={14} />
                    {lessons.length} lesson{lessons.length !== 1 ? 's' : ''}
                  </span>
                  <span>Created {formatDate(course.created_at)}</span>
                </div>
              </div>

              {canManage && (
                <Card padding="sm" className="min-w-[220px] border-amber-200 bg-amber-50">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-700">
                    Mentor tools
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      isLoading={publishing}
                      leftIcon={<Globe size={13} />}
                      onClick={() => publish(!course.is_published)}
                    >
                      {course.is_published ? 'Unpublish' : 'Publish'}
                    </Button>
                    <Link to={`/mentor/courses/create?edit=${course.course_id}`}>
                      <Button variant="secondary" size="sm">
                        Edit
                      </Button>
                    </Link>
                    {isAdmin && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </Card>
              )}
            </div>

            {isEnrolled && progress && (
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <div className="h-2 w-full bg-slate-100">
                  <div
                    className="h-full rounded-r-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
                <div className="flex items-center justify-between px-3 py-2 text-xs text-slate-600 sm:text-sm">
                  <span>
                    Progress: {progress.completed_lessons}/{progress.total_lessons} lessons
                  </span>
                  <span className="font-semibold text-slate-800">{Math.round(progress.percentage)}%</span>
                </div>
              </div>
            )}
          </header>
          )}

          <div className="relative flex gap-6">
            <aside
              className={`fixed inset-y-0 left-0 z-50 w-[86%] max-w-[360px] transform border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 lg:sticky lg:top-24 lg:z-10 lg:h-[calc(100vh-7rem)] lg:w-[320px] lg:max-w-none lg:translate-x-0 lg:rounded-2xl lg:border lg:shadow-sm ${
                mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              <div className="flex h-full flex-col">
                <div className="border-b border-slate-200 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Learning workspace
                      </p>
                      <h2 className="line-clamp-2 text-base font-semibold text-slate-900">
                        {course.title}
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMobileSidebarOpen(false)}
                      className="rounded-md p-1 text-slate-500 transition hover:bg-slate-100 lg:hidden"
                      aria-label="Close lessons panel"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      value={lessonSearch}
                      onChange={(event) => setLessonSearch(event.target.value)}
                      placeholder="Search lessons"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-blue-300 focus:bg-white"
                    />
                  </div>

                  {isEnrolled && progress && (
                    <p className="mt-3 text-xs text-slate-500">
                      {Math.round(progress.percentage)}% complete
                    </p>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-3">
                  {filteredModules.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-slate-300 px-3 py-6 text-center text-sm text-slate-500">
                      No lessons match your search.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {filteredModules.map((module) => {
                        const collapsed = collapsedModules[module.id] ?? false;

                        return (
                          <div key={module.id} className="rounded-xl border border-slate-200 bg-slate-50/60">
                            <button
                              type="button"
                              onClick={() => toggleModule(module.id)}
                              className="flex w-full items-center justify-between px-3 py-2.5 text-left transition hover:bg-slate-100"
                            >
                              <span className="text-sm font-semibold text-slate-700">{module.title}</span>
                              <ChevronDown
                                size={14}
                                className={`text-slate-500 transition-transform ${
                                  collapsed ? '-rotate-90' : ''
                                }`}
                              />
                            </button>

                            {!collapsed && (
                              <div className="space-y-1 px-2 pb-2">
                                {module.lessons.map((lesson, index) => {
                                  const completed = completedLessonIds.has(lesson.lesson_id);
                                  const active = selectedLessonId === lesson.lesson_id;

                                  return (
                                    <button
                                      key={lesson.lesson_id}
                                      type="button"
                                      onClick={() => handleSelectLesson(lesson.lesson_id)}
                                      className={`group flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-all ${
                                        active
                                          ? 'bg-blue-600 text-white shadow-sm'
                                          : 'text-slate-700 hover:bg-white hover:shadow-sm'
                                      }`}
                                    >
                                      <span
                                        className={`inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                                          active
                                            ? 'bg-white/20 text-white'
                                            : 'bg-slate-200 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-700'
                                        }`}
                                      >
                                        {index + 1}
                                      </span>
                                      <span className="flex-1 truncate">{lesson.title}</span>
                                      {completed ? (
                                        <CheckCircle2
                                          size={14}
                                          className={active ? 'text-white' : 'text-emerald-500'}
                                        />
                                      ) : (
                                        <BookOpen
                                          size={14}
                                          className={active ? 'text-white/90' : 'text-slate-400'}
                                        />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </aside>

            {mobileSidebarOpen && (
              <button
                type="button"
                className="fixed inset-0 z-40 bg-slate-900/35 lg:hidden"
                aria-label="Close sidebar backdrop"
                onClick={() => setMobileSidebarOpen(false)}
              />
            )}

            <main className="min-w-0 flex-1 pb-10">
              {!isEnrolled && user?.role === ROLES.LEARNER ? (
                <Card padding="lg" className="rounded-2xl border-slate-200 bg-white shadow-sm">
                  <h2 className="mb-2 text-xl font-bold text-slate-900">Unlock full course lessons</h2>
                  <p className="mb-4 text-slate-600">
                    Enroll to access the complete learning sidebar, track your progress, and save lesson completion automatically.
                  </p>
                  <Button
                    size="lg"
                    isLoading={enrolling}
                    disabled={!course.is_published}
                    onClick={() => enroll({ course_id: courseId })}
                  >
                    {enrolling ? 'Enrolling...' : 'Enroll now'}
                  </Button>
                </Card>
              ) : lessons.length === 0 ? (
                <EmptyState
                  title="No lessons yet"
                  description={canManage ? 'Add lessons to start building your course.' : 'Lessons will appear here soon.'}
                  action={
                    canManage
                      ? {
                          label: 'Create lesson',
                          onClick: () => navigate(`/mentor/courses/${courseId}/lessons/create`),
                        }
                      : undefined
                  }
                />
              ) : activeLessonLoading || !activeLesson ? (
                <PageSpinner />
              ) : (
                <div key={activeLesson.lesson_id} className="animate-fade-in">
                  <LessonContent
                    courseId={courseId}
                    lesson={activeLesson}
                    lessonIndex={selectedIndex}
                    totalLessons={lessons.length}
                    isCompleted={completedLessonIds.has(activeLesson.lesson_id)}
                    isMarkingComplete={markingComplete}
                    onMarkComplete={handleMarkComplete}
                    prevLesson={prevLesson}
                    nextLesson={nextLesson}
                    onGoToLesson={handleSelectLesson}
                  />
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => deleteCourse(courseId)}
        isLoading={deleting}
        title="Delete Course"
        message={`Are you sure you want to delete "${course.title}"? This action cannot be undone.`}
      />
    </>
  );
};

export default CourseDetailPage;
