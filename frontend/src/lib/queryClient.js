// PATH: frontend/src/lib/queryClient.js
// Central QueryClient config — import this in App.jsx

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:          5 * 60 * 1000,  // 5 min — data stays fresh, no refetch
      gcTime:             10 * 60 * 1000, // 10 min — keep in cache after unmount
      refetchOnWindowFocus: false,         // don't refetch when tab regains focus
      refetchOnMount:     false,           // use cache on re-mount if still fresh
      retry:              1,               // retry once on failure
      retryDelay:         1000,
    },
    mutations: {
      retry: 0,
    },
  },
});