
import React    from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter }            from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools }       from '@tanstack/react-query-devtools';
import { Toaster }                  from 'react-hot-toast';
import { tokenUtils } from './utils/token';
import App               from './App.tsx';
import { useAuthStore }  from './store/auth.store.ts';
import './index.css';

// React Query client configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:        1000 * 60 * 5,   // data fresh for 5 minutes
      retry:            1,               // retry failed requests once
      refetchOnWindowFocus: false,       // don't refetch when tab is focused
    },
  },
});

// Restore auth session before rendering
// This runs once on startup — keeps user logged in after refresh
useAuthStore.getState().hydrate();
// Offline progress sync
// When browser detects internet is restored,
// check localStorage for pending completions and sync them
const OFFLINE_KEY = 'dep_offline_completions';

window.addEventListener('online', async () => {
  const raw = localStorage.getItem(OFFLINE_KEY);
  if (!raw) return;

  try {
    const completions = JSON.parse(raw);
    if (!completions?.length) return;

    const token = tokenUtils.get();
    if (!token) return;

    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/progress/sync`,
      {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ completions }),
      }
    );

    if (res.ok) {
      localStorage.removeItem(OFFLINE_KEY);
      // Force page reload so React Query refetches fresh data
      window.location.reload();
    }
  } catch {
    // Sync failed silently — will retry next time online
  }
});
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1E3A8A',
              color: '#fff',
              fontSize: '14px',
              borderRadius: '8px',
            },
          }}
        />
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);