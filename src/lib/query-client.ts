import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000, // 1 second
      refetchInterval: 5000, // 5 seconds
      refetchIntervalInBackground: true,
    },
  },
});
