import { Link } from "@tanstack/react-router";
import { PenIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function CTASection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="bg-foreground relative overflow-hidden rounded-2xl px-8 py-16 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_50%,oklch(0.59_0.14_242/0.15),transparent)]"></div>
        <div className="relative">
          <p className="text-primary mb-4 text-sm font-semibold tracking-widest uppercase">Mulai Sekarang</p>
          <h2 className="text-background mb-4 text-[clamp(1.75rem,3.5vw,2.5rem)] leading-tight font-bold tracking-tighter">
            Amankan Dokumen Anda
            <br />
            dengan Kriptografi
          </h2>
          <p className="text-muted-foreground mx-auto mb-8 max-w-sm text-sm leading-relaxed">
            Daftar gratis, buat key, dan mulai menandatangani dokumen dalam hitungan menit.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              nativeButton={false}
              render={
                <Link to="/register">
                  <PenIcon size={16} />
                  Daftar & Buat Key
                </Link>
              }
            />
            <Button
              size="lg"
              className="dark:text-primary dark:border-primary text-foreground border-foreground"
              nativeButton={false}
              variant="outline"
              render={<Link to="/verify">Coba Verifikasi</Link>}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
