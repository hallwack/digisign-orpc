import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
  beforeLoad: async ({ search }) => {
    const { data: session } = await authClient.getSession();

    if (session) {
      const searchParams = search as { redirect?: string };
      throw redirect({
        to: searchParams.redirect || "/dashboard",
        replace: true,
      });
    }
  },
});

function AuthLayout() {
  const { isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center">
        <div className="max-w-full">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Outlet />
      </div>
    </div>
  );
}
