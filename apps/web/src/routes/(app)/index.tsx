import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheckIcon, CheckIcon, ChevronRightIcon, CircleCheckBigIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/(app)/")({
  component: HomePageComponent,
});

function HomePageComponent() {
  return (
    <main className="mx-auto min-h-screen max-w-300 px-4 pt-16 pb-20 sm:px-6">
      <section className="flex max-w-160 flex-col gap-6">
        <Badge variant="secondary">
          <BadgeCheckIcon size={12} data-icon="inline-start" className="me-1" />
          Platform Verifikasi Dokumen
        </Badge>

        <h1 className="text-foreground text-4xl leading-[1.1] font-semibold tracking-tight sm:text-5xl lg:text-6xl">
          Verifikasi Dokumen
          <br />
          <span className="text-muted-foreground">Lebih Cepat.</span>
        </h1>

        <p className="text-muted-foreground max-w-120 text-base leading-relaxed">
          Veridoc membantu Anda memverifikasi keaslian dokumen secara otomatis — KTP, ijazah, sertifikat, dan lainnya —
          dalam hitungan detik, tanpa antrian panjang.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="verify-shadcn.html"
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center gap-2 rounded-md px-5 text-sm font-medium shadow-sm transition-colors"
          >
            <CircleCheckBigIcon size={16} />
            Mulai Verifikasi
          </a>
          <a
            href="#cara-kerja"
            className="border-border bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-10 items-center gap-2 rounded-md border px-5 text-sm font-medium transition-colors"
          >
            Cara Kerja
            <ChevronRightIcon size={16} />
          </a>
        </div>
      </section>
    </main>
  );
}
