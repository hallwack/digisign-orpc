import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "@/utils/orpc";

export default function ReactQueryClientProvider({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
