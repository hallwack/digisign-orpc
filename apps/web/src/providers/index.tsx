import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

import ReactQueryClientProvider from "./query-provider";

export default function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ReactQueryClientProvider>
        <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange storageKey="vite-ui-theme">
          {children}
          <Toaster richColors />
        </ThemeProvider>
      </ReactQueryClientProvider>
      <TanStackRouterDevtools position="bottom-left" />
      <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
    </>
  );
}
