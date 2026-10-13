import { Provider } from "react-redux"
import { QueryClientProvider } from "@tanstack/react-query"
import { store } from "@/store"
import { queryClient } from "@/lib/queryClient"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useInitializeAuth } from "@/features/auth/hooks/useInitializeAuth";

// Renders nothing; exists only to resolve the session on boot, before any
// route guard decides whether to redirect.
function AuthInitializer() {
  useInitializeAuth();
  return null;
}

export function AppProviders({ children }) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthInitializer />
        {children}
        <ReactQueryDevtools/>
      </QueryClientProvider>
    </Provider>
  );
}
