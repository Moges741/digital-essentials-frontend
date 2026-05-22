import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';
import {
	BookOpen,
	CheckCircle,
	ChevronLeft,
	ChevronRight,
	Clock3,
	ClipboardList,
	Copy,
	PlayCircle,
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import Button from '../ui/Button';
import LessonMaterials from './LessonMaterials';
import type { LessonWithMaterials } from '../../types/lesson.types';

type LessonNavItem = {
	lesson_id: number;
	title: string;
};

interface LessonContentProps {
	courseId: number;
	lesson: LessonWithMaterials;
	lessonIndex: number;
	totalLessons: number;
	isCompleted: boolean;
	isMarkingComplete: boolean;
	onMarkComplete: () => void;
	prevLesson: LessonNavItem | null;
	nextLesson: LessonNavItem | null;
	onGoToLesson: (lessonId: number) => void;
}

type HeadingItem = {
	id: string;
	text: string;
	level: number;
};

const slugify = (value: string) =>
	value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-');

const extractHeadings = (content: string): HeadingItem[] => {
	const lines = content.split('\n');
	const seen = new Map<string, number>();

	return lines
		.map((line) => {
			const match = line.match(/^(#{1,3})\s+(.+)/);
			if (!match) return null;

			const [, hashes, rawText] = match;
			const baseId = slugify(rawText);
			const count = seen.get(baseId) ?? 0;
			seen.set(baseId, count + 1);

			return {
				id: count > 0 ? `${baseId}-${count}` : baseId,
				text: rawText.trim(),
				level: hashes.length,
			};
		})
		.filter((item): item is HeadingItem => item !== null);
};

const estimateReadingTime = (content: string) => {
	const words = content.trim().split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.ceil(words / 220));
};

const inferDifficulty = (content: string) => {
	const words = content.trim().split(/\s+/).filter(Boolean).length;
	if (words < 350) return 'Beginner';
	if (words < 900) return 'Intermediate';
	return 'Advanced';
};

const CodeBlock = ({
	className,
	children,
}: {
	className?: string;
	children?: React.ReactNode;
}) => {
	const [copied, setCopied] = useState(false);
	const rawCode = String(children ?? '').replace(/\n$/, '');

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(rawCode);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 1200);
		} catch {
			setCopied(false);
		}
	};

	return (
		<div className="group relative my-6 overflow-hidden rounded-xl border border-slate-200 bg-slate-950 shadow-sm">
			<button
				type="button"
				onClick={handleCopy}
				className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-medium text-slate-200 transition hover:bg-slate-800"
			>
				<Copy size={12} />
				{copied ? 'Copied' : 'Copy code'}
			</button>
			<pre className="overflow-x-auto p-4 text-sm leading-relaxed text-slate-100">
				<code className={className}>{rawCode}</code>
			</pre>
		</div>
	);
};

const MarkdownCallout = ({ children }: { children: React.ReactNode }) => {
	const text = String(children ?? '');
	const noteMatch = text.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING)\]\s*/i);

	if (!noteMatch) {
		return (
			<blockquote className="my-4 rounded-r-lg border-l-4 border-slate-300 bg-slate-50 px-4 py-3 text-slate-700">
				{children}
			</blockquote>
		);
	}

	const label = noteMatch[1].toUpperCase();
	const cleaned = text.replace(/^\[!(NOTE|TIP|IMPORTANT|WARNING)\]\s*/i, '');

	const palette: Record<string, string> = {
		NOTE: 'border-blue-300 bg-blue-50 text-blue-900',
		TIP: 'border-emerald-300 bg-emerald-50 text-emerald-900',
		IMPORTANT: 'border-indigo-300 bg-indigo-50 text-indigo-900',
		WARNING: 'border-amber-300 bg-amber-50 text-amber-900',
	};

	return (
		<div className={`my-5 rounded-xl border px-4 py-3 ${palette[label]}`}>
			<p className="mb-1 text-xs font-semibold tracking-wide">{label}</p>
			<p className="text-sm leading-relaxed">{cleaned}</p>
		</div>
	);
};

const LessonContent = ({
	courseId,
	lesson,
	lessonIndex,
	totalLessons,
	isCompleted,
	isMarkingComplete,
	onMarkComplete,
	prevLesson,
	nextLesson,
	onGoToLesson,
}: LessonContentProps) => {
	const navigate = useNavigate();
	const user = useAuthStore((s) => s.user);
	const isLearner = user?.role === 'learner';
	const isFinalLesson = lessonIndex === totalLessons - 1;
	const articleRef = useRef<HTMLElement | null>(null);
	const [readingProgress, setReadingProgress] = useState(0);
	const [activeHeadingId, setActiveHeadingId] = useState<string>('');

	const markdownContent = lesson.content ?? '';
	const headings = useMemo(() => extractHeadings(markdownContent), [markdownContent]);
	const readingTime = useMemo(
		() => estimateReadingTime(markdownContent),
		[markdownContent]
	);
	const difficulty = useMemo(
		() => inferDifficulty(markdownContent),
		[markdownContent]
	);

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}, [lesson.lesson_id]);

	useEffect(() => {
		const handleScroll = () => {
			const articleEl = articleRef.current;
			if (!articleEl) return;

			const rect = articleEl.getBoundingClientRect();
			const articleStart = window.scrollY + rect.top;
			const articleHeight = articleEl.offsetHeight;
			const viewportOffset = window.innerHeight * 0.25;
			const readAmount = window.scrollY + viewportOffset - articleStart;
			const progress = Math.min(100, Math.max(0, (readAmount / articleHeight) * 100));
			setReadingProgress(progress);

			const headingElements = articleEl.querySelectorAll('h1, h2, h3');
			let currentId = '';
			headingElements.forEach((element) => {
				const headingTop = (element as HTMLElement).getBoundingClientRect().top;
				if (headingTop <= 140) {
					currentId = element.id;
				}
			});
			setActiveHeadingId(currentId);
		};

		handleScroll();
		window.addEventListener('scroll', handleScroll, { passive: true });

		return () => window.removeEventListener('scroll', handleScroll);
	}, [lesson.lesson_id]);

	const primaryVideo = lesson.materials.find((m) => m.file_type === 'video');

	return (
		<div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_220px]">
			<div>
				<div className="sticky top-16 z-20 mb-4 rounded-xl border border-slate-200 bg-white/85 px-4 py-3 shadow-sm backdrop-blur">
					<div className="mb-2 flex items-center justify-between gap-3 text-xs text-slate-600">
						<div className="flex flex-wrap items-center gap-3">
						<span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
							<BookOpen size={12} />
							Lesson {lessonIndex + 1} of {totalLessons}
						</span>
						<span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-700">
							<Clock3 size={12} />
							{readingTime} min read
						</span>
						<span className="rounded-full bg-indigo-50 px-2.5 py-1 font-medium text-indigo-700">
							{difficulty}
						</span>
						{isCompleted && (
							<span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">
								<CheckCircle size={12} />
								Completed
							</span>
						)}
						</div>
						{/* Creator/Admin quick actions */}
						{(user?.role === 'mentor' || user?.role === 'administrator') && (
							<div className="flex items-center gap-2">
								<Button
									variant="ghost"
									size="sm"
									onClick={() => navigate(`/mentor/courses/${courseId}/lessons/create`)}
								>
									Add lesson
								</Button>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => navigate(`/mentor/courses/${courseId}/materials/create?lesson_id=${lesson.lesson_id}`)}
								>
									Add material
								</Button>
							</div>
						)}
					</div>
					<div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
						<div
							className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
							style={{ width: `${readingProgress}%` }}
						/>
					</div>
				</div>

				<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
					<h1 className="mb-6 text-3xl font-extrabold tracking-tight text-slate-900">
						{lesson.title}
					</h1>

					{primaryVideo && (
						<div className="mb-7 overflow-hidden rounded-xl border border-slate-200 bg-slate-950">
							<video controls src={primaryVideo.file_url} className="h-full max-h-[420px] w-full" />
						</div>
					)}

					{markdownContent ? (
						<article ref={articleRef} className="lesson-markdown text-slate-800">
							<ReactMarkdown
								remarkPlugins={[remarkGfm]}
								rehypePlugins={[rehypeHighlight]}
								components={{
									h1: ({ children }) => {
										const id = slugify(String(children));
										return (
											<h1 id={id} className="mt-8 scroll-mt-28 text-3xl font-bold text-slate-900">
												{children}
											</h1>
										);
									},
									h2: ({ children }) => {
										const id = slugify(String(children));
										return (
											<h2
												id={id}
												className="mt-8 scroll-mt-28 border-t border-slate-100 pt-6 text-2xl font-semibold text-slate-900"
											>
												{children}
											</h2>
										);
									},
									h3: ({ children }) => {
										const id = slugify(String(children));
										return (
											<h3 id={id} className="mt-6 scroll-mt-28 text-xl font-semibold text-slate-900">
												{children}
											</h3>
										);
									},
									p: ({ children }) => (
										<p className="mt-4 text-[15px] leading-7 text-slate-700">{children}</p>
									),
									blockquote: ({ children }) => <MarkdownCallout>{children}</MarkdownCallout>,
									ul: ({ children }) => <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">{children}</ul>,
									ol: ({ children }) => (
										<ol className="mt-4 list-decimal space-y-2 pl-5 text-slate-700">{children}</ol>
									),
									table: ({ children }) => (
										<div className="my-6 overflow-x-auto rounded-xl border border-slate-200">
											<table className="min-w-full border-collapse text-left text-sm">{children}</table>
										</div>
									),
									thead: ({ children }) => <thead className="bg-slate-50">{children}</thead>,
									th: ({ children }) => (
										<th className="border-b border-slate-200 px-4 py-3 font-semibold text-slate-700">{children}</th>
									),
									td: ({ children }) => <td className="border-b border-slate-100 px-4 py-3">{children}</td>,
									code: ({ className, children }) => {
										const isInline = !(className || '').includes('language-');
										if (isInline) {
											return (
												<code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[13px] text-slate-800">
													{children}
												</code>
											);
										}
										return <CodeBlock className={className}>{children}</CodeBlock>;
									},
								}}
							>
								{markdownContent}
							</ReactMarkdown>
						</article>
					) : (
						<p className="text-slate-500">No written content for this lesson yet.</p>
					)}

					{/* Materials Section */}
					{lesson.materials.length > 0 && (
						<div className="mt-8 border-t border-slate-100 pt-6">
							<h2 className="mb-4 text-lg font-semibold text-slate-900">Materials</h2>
							<LessonMaterials materials={lesson.materials as any} course_id={courseId} />
						</div>
					)}

					{isLearner && (
							<div className="mt-10 border-t border-slate-100 pt-6">
								<div className="flex flex-wrap items-center justify-between gap-3">
									<Button
										variant="secondary"
										size="sm"
										disabled={!prevLesson}
										leftIcon={<ChevronLeft size={15} />}
										onClick={() => prevLesson && onGoToLesson(prevLesson.lesson_id)}
									>
										Previous
									</Button>

									{isCompleted && isFinalLesson ? (
										<Button
											variant="success"
											size="md"
											leftIcon={<ClipboardList size={16} />}
											onClick={() => navigate(`/courses/${courseId}/exam`)}
										>
											Take exam
										</Button>
									) : isCompleted ? (
										<Button
											variant="secondary"
											size="md"
											disabled
										>
											Mark as complete
										</Button>
									) : (
										<Button
											variant="primary"
											size="md"
											isLoading={isMarkingComplete}
											onClick={onMarkComplete}
										>
											Mark as complete
										</Button>
									)}

									<Button
										variant="secondary"
										size="sm"
										disabled={!nextLesson}
										rightIcon={<ChevronRight size={15} />}
										onClick={() => nextLesson && onGoToLesson(nextLesson.lesson_id)}
									>
										Next
									</Button>
								</div>
							</div>
						)}
				</div>
			</div>

			<aside className="hidden xl:block">
				<div className="sticky top-28 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
					<p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
						On this page
					</p>
					{headings.length === 0 ? (
						<p className="text-sm text-slate-400">No headings found</p>
					) : (
					<nav className="flex max-h-[50vh] flex-col gap-1 overflow-y-auto pr-1">
							{headings.map((heading) => (
								<a
									key={heading.id}
									href={`#${heading.id}`}
									className={`rounded-md px-2 py-1.5 text-sm transition ${
										activeHeadingId === heading.id
											? 'bg-blue-50 font-medium text-blue-700'
											: 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
									} ${heading.level === 3 ? 'ml-4' : heading.level === 2 ? 'ml-2' : ''}`}
								>
									{heading.text}
								</a>
							))}
						</nav>
					)}
					{isLearner && (
						<>
								{isCompleted && isFinalLesson && (
								<div className="mt-4 space-y-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
									<p className="text-sm font-semibold text-emerald-900">Lesson complete!</p>
									<Button
										variant="primary"
										size="sm"
										fullWidth
										leftIcon={<ClipboardList size={14} />}
										onClick={() => navigate(`/courses/${courseId}/exam`)}
									>
										Take exam
									</Button>
								</div>
							)}
								{!isCompleted && (
								<div className="mt-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-3 text-sm text-slate-700">
									<p className="mb-1 font-semibold">Continue learning</p>
									<p className="mb-3 text-xs text-slate-600">
										Keep your streak alive by finishing this lesson.
									</p>
									<Button
										variant="primary"
										size="sm"
										fullWidth
										leftIcon={<PlayCircle size={14} />}
										onClick={onMarkComplete}
										disabled={isMarkingComplete}
									>
										Complete now
									</Button>
								</div>
							)}
								{isCompleted && !isFinalLesson && (
									<div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
										<p className="mb-1 font-semibold text-slate-700">Lesson completed</p>
										<p className="text-xs text-slate-500">
											Finish the remaining lessons to unlock the exam.
										</p>
									</div>
								)}
						</>
					)}
				</div>
			</aside>
		</div>
	);
};

export default LessonContent;
