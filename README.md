 # Digital Essentials — Frontend

 A compact, production-ready React + Vite frontend for the Digital Essentials learning platform.

 This README explains how to run, develop, and debug the frontend app, plus important conventions and quick troubleshooting notes specific to this repository.

 ---

 ## Quick overview

 - Framework: React (TypeScript) + Vite
 - State: TanStack Query (server state), Zustand (auth)
 - Routing: React Router
 - Styling: Tailwind CSS
 - Validation: Zod
 - HTTP: Axios

 This app communicates with the backend API (see backend in the monorepo) via the environment variable `VITE_API_BASE_URL`.

 ---

 ## Prerequisites

 - Node.js 18+ (LTS recommended)
 - npm (or yarn/pnpm)
 - A running backend API (for local development) — see the backend README in the workspace root

 ---

 ## Environment

 Create a `.env` file in the `digital-essentials-frontend` folder or use your environment manager. Required variables used by the app:

 - `VITE_API_BASE_URL` — base URL for backend API (example: `http://localhost:4000`)
 - `VITE_API_URL` — used for some OAuth redirects (falls back to backend default when unset)
 - `VITE_APP_NAME` — application display name

 Add other variables as needed for deployments (CI, preview environments, etc.).

 ---

 ## Install & run

 Install dependencies and start development server:

 ```bash
 cd digital-essentials-frontend
 npm install
 npm run dev
 ```

 Build for production:

 ```bash
 npm run build
 npm run preview   # preview the production build locally
 ```

 Linting:

 ```bash
 npm run lint
 ```

 ---

 ## Important scripts

 - `dev` — starts Vite dev server
 - `build` — TypeScript build + Vite production build
 - `preview` — serve built assets locally
 - `lint` — run ESLint

 ---

 ## Project structure (high level)

 - `src/` — application source
	 - `src/pages` — route pages (courses, auth, dashboard, admin)
	 - `src/components` — shared components (CourseCard, layout, UI primitives)
	 - `src/hooks` — data hooks (e.g., `useCourses`, `useAuth`)
	 - `src/api` — API wrappers (e.g., `course.api.ts`, `certificate.api.ts`)
	 - `src/store` — global client state (auth store)
	 - `src/utils` — app constants and helpers

 See these files for implementation details:

 - Course listing: [src/pages/courses/CoursesPage.tsx](src/pages/courses/CoursesPage.tsx)
 - Admin certificates: [src/pages/dashboard/AdminCertificates.tsx](src/pages/dashboard/AdminCertificates.tsx)
 - Admin instructors (mentor directory): [src/pages/dashboard/AdminInstructors.tsx](src/pages/dashboard/AdminInstructors.tsx)
 - Shared Input component: [src/components/ui/Input.tsx](src/components/ui/Input.tsx)

 ---

 ## Conventions & important notes

 - Role mapping: the UI shows `Instructor` but the internal role value stored in the database is `mentor`. See [src/utils/constants.ts](src/utils/constants.ts).
 - Courses page default behavior: the courses listing defaults to `topic=All` when opened. The route is `/courses?topic=All` (if you open `/courses` the app normalizes the query param).
 - Certificate generation: certificates are generated only after the learner completes lessons and passes the final exam for courses that contain an exam. The backend enforces this; the frontend shows download/view actions in the admin certificates page.
 - Search input focus: a past bug where the search input lost focus on first keystroke was fixed by keeping previous query data during typing (see `useCourses` hook). If you still see focus issues, ensure you are running the latest frontend build.

 ---

 ## Developing & debugging tips

 - To work locally, start the backend then run the frontend dev server. Configure `VITE_API_BASE_URL` to point at your backend (e.g., `http://localhost:4000`).
 - To test email-related flows (verification, approval emails) use a local SMTP or an API provider; the backend contains the mailer configuration and fallback logic.
 - When adding large pages or heavy libraries, use dynamic imports to avoid oversized Vite chunks (see build warnings in production builds).

 ---

 ## Common tasks

 - Add a new page: create a new component under `src/pages` and add a route in [src/App.tsx](src/App.tsx).
 - Add an API wrapper: follow `src/api/course.api.ts` for patterns — always return typed responses.
 - Add a UI primitive: put it under `src/components/ui` and keep it headless (accept `className` and `...props`).

 ---

 ## Troubleshooting

 - Dev server not hitting backend: confirm `VITE_API_BASE_URL` and CORS on backend.
 - Emails not delivered: check backend SMTP config and the fallback provider (Resend) credentials.
 - Search field losing cursor: ensure you are on the recent `useCourses` hook with `keepPreviousData` enabled.

 ---

 If you want, I can also:

 - Add a short `CONTRIBUTING.md` with onboarding steps and branch rules.
 - Produce a single-page quick-start for non-dev admins (how to approve instructors, view certificates, manage categories).
