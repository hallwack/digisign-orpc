import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import { FileIcon, MoonIcon, SunIcon } from "lucide-react";

import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/(app)")({
  component: RouteComponent,
  staticData: {
    breadcrumb: { label: "Home" },
  },
});

function RouteComponent() {
  const { theme, setTheme } = useTheme();

  return (
    <>
      <header className="border-border bg-background/50 supports-background-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
        <div className="mx-auto flex h-20 max-w-300 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-md p-2">
              <FileIcon size={16} />
            </div>
            <span className="font-semibold tracking-tight">Veridoc</span>
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

      <footer className="border-border border-t">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8">
          <div className="flex items-center gap-2">
            <div className="bg-primary flex h-6 w-6 items-center justify-center rounded-md">
              <svg
                width="11"
                height="11"
                fill="none"
                stroke="currentColor"
                className="text-primary-foreground"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="font-display text-foreground text-sm font-bold tracking-tight">
              Doku<span className="text-primary">Verify</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-muted-foreground hover:text-foreground text-xs no-underline transition-colors">
              Panduan
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground text-xs no-underline transition-colors">
              API
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground text-xs no-underline transition-colors">
              Privasi
            </a>
          </div>
          <div className="text-muted-foreground text-xs">© 2026 DokuVerify</div>
        </div>
      </footer>
    </>
  );
}
