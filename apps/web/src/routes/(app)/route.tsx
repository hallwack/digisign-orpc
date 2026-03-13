import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import { FileIcon, MoonIcon, SunIcon } from "lucide-react";

import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/(app)")({
  component: RouteComponent,
  staticData: {
    breadcrumb: { label: "Home" },
  }
});

function RouteComponent() {
  const { theme, setTheme } = useTheme();

  return (
    <>
      <header className="border-border bg-background/50 supports-background-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
        <div className="mx-auto flex h-20 max-w-300 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-md">
              <FileIcon size={16} />
            </div>
            <span className="text-sm font-semibold tracking-tight">Veridoc</span>
          </div>

          <nav className="flex items-center gap-4 font-medium">
            <Link to="/">Home</Link>
            <Link to="/verify">Verify</Link>
            <p>How-to</p>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="cursor-pointer"
              onClick={() => (theme === "light" ? setTheme("dark") : setTheme("light"))}
            >
              {theme === "light" ? <MoonIcon /> : <SunIcon />}
            </Button>
          </div>
        </div>
      </header>

      <Outlet />
    </>
  );
}
