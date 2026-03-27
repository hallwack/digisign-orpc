import { createORPCClient } from "@orpc/client";
import type { QueryClient } from "@tanstack/react-query";
import { HeadContent, Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { useState } from "react";

import type { AppRouterClient } from "@digisign/api/routers/index";

import RootProvider from "@/providers";
import { link, orpc } from "@/utils/orpc";

import "../index.css";

export interface RouterAppContext {
  orpc: typeof orpc;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  head: () => ({
    meta: [
      {
        title: "veridoc",
      },
      {
        name: "description",
        content: "veridoc is a web application",
      },
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.ico",
      },
    ],
  }),
});

function RootComponent() {
  const [client] = useState<AppRouterClient>(() => createORPCClient(link));

  return (
    <RootProvider>
      <HeadContent />
      <Outlet />
    </RootProvider>
  );
}
