import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/")({
  component: HomePageComponent,
});

function HomePageComponent() {
  const [count, setCount] = useState(0);
  const healthCheck = useQuery(orpc.healthCheck.queryOptions());

  return (
    <div className="flex min-h-screen w-screen flex-col items-center justify-center">
      <div className="flex flex-col gap-4">
        <h1>Vite + React + TanStack Router</h1>
        <div className="flex gap-2">
          <Button onClick={() => setCount((count) => count + 1)}>count is {count}</Button>
          <Button nativeButton={false} render={<Link to="/login">Go to Login Page</Link>} />
          {/* {session?.data && (
            <Button onClick={handleLogout} disabled={logout.isPending}>
              {logout.isPending ? "Logging out..." : "Log Out"}
            </Button>
          )} */}
        </div>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
        <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
      </div>
    </div>
  );
}
