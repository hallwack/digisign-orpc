import { Link } from "@tanstack/react-router";
import { FileIcon } from "lucide-react";

export default function FooterSection() {
  return (
    <footer className="border-border border-t">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-md p-2">
            <FileIcon size={16} />
          </div>
          <Link to="/" className="text-foreground text-lg font-bold tracking-tight">
            Veri<span className="text-primary">doc</span>
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="text-muted-foreground hover:text-foreground text-sm no-underline transition-colors">
            Panduan
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground text-sm no-underline transition-colors">
            API
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground text-sm no-underline transition-colors">
            Privasi
          </a>
        </div>
        <div className="text-muted-foreground text-sm">© 2026 Veridoc</div>
      </div>
    </footer>
  );
}
