
import React    from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter }            from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools }       from '@tanstack/react-query-devtools';
import { Toaster }                  from 'react-hot-toast';

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