import { Link } from "@tanstack/react-router";
import {
  BadgeCheckIcon,
  ChevronRightIcon,
  CircleCheckBigIcon,
  CodeIcon,
  Maximize2Icon,
  MinusIcon,
  ShieldIcon,
  XIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="dot-grid relative flex min-h-[90vh] items-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_70%_40%,oklch(0.59_0.14_242/0.08),transparent)]"></div>
      <div className="to-background pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-b from-transparent"></div>

      <div className="relative mx-auto w-full max-w-6xl px-6 py-24">
        <div className="@container/hero">
          <div className="flex flex-col gap-12 @[900px]/hero:flex-row @[900px]/hero:items-center">
            <div className="flex max-w-2xl flex-1 flex-col gap-6">
              <Badge variant="outline" className="text-chart-5/75">
                <BadgeCheckIcon size={12} data-icon="inline-start" className="me-1" />
                Platform Verifikasi Dokumen
              </Badge>

              <h1 className="text-foreground text-[clamp(2.6rem,6vw,4.2rem)] leading-[1.1] font-bold tracking-tight">
                Tanda Tangan Dokumen
                <br />
                <span className="from-primary to-primary/60 bg-linear-to-br bg-clip-text text-transparent">
                  Secara Kriptografis.
                </span>
              </h1>

              <p className="text-foreground max-w-xl text-base leading-relaxed font-light">
                Veridoc menggunakan <span className="text-foreground font-medium">dual signature RSA + EdDSA</span> dan
                hash SHA-256 dengan metode Hybrid Signature untuk menjamin integritas dokumen. Private key hanya ada di
                tangan Anda — server tidak pernah menyimpannya.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  size="lg"
                  nativeButton={false}
                  render={
                    <Link to="/verify">
                      <CircleCheckBigIcon size={16} />
                      Mulai Verifikasi
                    </Link>
                  }
                />
                <Button
                  size="lg"
                  nativeButton={false}
                  variant="outline"
                  render={
                    <Link to="/">
                      Cara Kerja
                      <ChevronRightIcon size={16} />
                    </Link>
                  }
                />
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm font-light">
                <div className="text-accent-foreground flex items-center gap-2">
                  <div className="bg-muted border-border flex h-7 w-7 items-center justify-center rounded-md border">
                    <ShieldIcon size={16} className="text-primary" />
                  </div>
                  Private key tidak disimpan server
                </div>
                <div className="text-accent-foreground flex items-center gap-2">
                  <div className="bg-muted border-border flex h-7 w-7 items-center justify-center rounded-md border">
                    <CodeIcon size={16} className="text-primary" />
                  </div>
                  SHA-256 · RSA · EdDSA
                </div>
              </div>
            </div>

            <div className="relative w-full shrink-0 @[900px]/hero:w-90">
              <div className="border-border bg-card shadow-foreground/10 overflow-hidden rounded-xl border shadow-xl">
                <div className="border-border bg-muted/50 flex items-center gap-1.5 border-b px-4 py-3">
                  <span className="group h-3 w-3 rounded-full bg-[#ff5f56]">
                    <XIcon size={12} className="hidden group-hover:block" />
                  </span>
                  <span className="group h-3 w-3 rounded-full bg-[#ffbd2e]">
                    <MinusIcon size={12} className="hidden group-hover:block" />
                  </span>
                  <span className="group h-3 w-3 rounded-full bg-[#27c93f]">
                    <Maximize2Icon size={11} className="hidden group-hover:block" />
                  </span>
                  <span className="text-muted-foreground ml-2 font-mono text-sm">dokuverify · signing</span>
                </div>

                <div className="text-muted-foreground p-4 font-mono text-sm leading-6">
                  <div>
                    <span className="text-muted-foreground">$</span> <span className="text-primary">sign</span>{" "}
                    <span className="text-foreground">--doc contract.pdf</span>
                  </div>
                  <div className="mt-1">
                    <span>&gt;</span> Computing SHA-256...
                  </div>
                  <div>
                    <span>&gt;</span> hash: <span className="text-foreground">a3f8c2d1e5b7f9...</span>
                  </div>
                  <div className="mt-2">
                    <span>&gt;</span> RSA signing... <span className="text-[#27c93f]">✓</span>
                  </div>
                  <div>
                    <span>&gt;</span> EdDSA signing... <span className="text-[#27c93f]">✓</span>
                  </div>
                  <div className="mt-2">
                    <span>&gt;</span> Embedding metadata...
                  </div>
                  <div className="bg-primary/10 border-primary/20 mt-2 rounded-md border p-2">
                    <div className="text-[#27c93f]">✓ Dokumen berhasil ditandatangani</div>
                    <div className="text-muted-foreground">→ contract_signed.pdf</div>
                  </div>
                </div>
              </div>

              <div className="border-border bg-card shadow-foreground/10 absolute top-28 -right-20 z-10 hidden w-full overflow-hidden rounded-xl border shadow-2xl @[900px]/hero:block">
                <div className="border-border bg-muted/50 flex items-center gap-1.5 border-b px-4 py-3">
                  <span className="group h-3 w-3 rounded-full bg-[#ff5f56]">
                    <XIcon size={12} className="hidden group-hover:block" />
                  </span>
                  <span className="group h-3 w-3 rounded-full bg-[#ffbd2e]">
                    <MinusIcon size={12} className="hidden group-hover:block" />
                  </span>
                  <span className="group h-3 w-3 rounded-full bg-[#27c93f]">
                    <Maximize2Icon size={11} className="hidden group-hover:block" />
                  </span>
                  <span className="text-muted-foreground ml-2 font-mono text-sm">dokuverify · verifying</span>
                </div>

                <div className="text-muted-foreground p-4 font-mono text-sm leading-6">
                  <div>
                    <span className="text-muted-foreground">$</span> <span className="text-primary">verify</span>{" "}
                    <span className="text-foreground">--doc contract_signed.pdf</span>
                  </div>
                  <div className="mt-1">
                    <span>&gt;</span> Computing SHA-256...
                  </div>
                  <div>
                    <span>&gt;</span> hash: <span className="text-foreground">a3f8c2d1e5b7f9...</span>
                  </div>
                  <div className="mt-2">
                    <span>&gt;</span> RSA verification... <span className="text-[#27c93f]">✓</span>
                  </div>
                  <div>
                    <span>&gt;</span> EdDSA verification... <span className="text-[#27c93f]">✓</span>
                  </div>
                  <div className="bg-primary/10 border-primary/20 mt-2 rounded-md border p-2">
                    <div className="text-[#27c93f]">✓ Signature valid</div>
                    <div className="text-muted-foreground">→ integrity confirmed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
