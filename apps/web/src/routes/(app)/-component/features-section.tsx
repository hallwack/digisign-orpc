import { CircleCheckIcon, CodeIcon, FileIcon, KeyIcon, LockIcon, ShieldIcon } from "lucide-react";
import { type ReactNode } from "react";

type FeatureItem = {
  id: number;
  icon: ReactNode;
  title: string;
  description: string;
};

export default function FeaturesSection() {
  const features: FeatureItem[] = [
    {
      id: 1,
      icon: <ShieldIcon width={18} height={18} className="stroke-primary" />,
      title: "Dual Signature RSA + EdDSA",
      description:
        "Dua algoritma kriptografi berbeda menandatangani setiap dokumen secara bersamaan — keduanya harus valid untuk lolos verifikasi.",
    },
    {
      id: 2,
      icon: <LockIcon width={18} height={18} className="stroke-primary" />,
      title: "Private Key Tetap di Anda",
      description:
        "Server hanya menerima public key saat pendaftaran. Private key tidak pernah meninggalkan perangkat Anda.",
    },
    {
      id: 3,
      icon: <CodeIcon width={18} height={18} className="stroke-primary" />,
      title: "Integritas SHA-256",
      description:
        "Hash SHA-256 dihitung saat penandatanganan dan dibandingkan ulang saat verifikasi. Satu bit berubah — dokumen tidak valid.",
    },
    {
      id: 4,
      icon: <FileIcon width={18} height={18} className="stroke-primary" />,
      title: "Signature di Metadata Dokumen",
      description:
        "Tanda tangan disisipkan ke metadata PDF. Verifikasi dapat dilakukan kapan saja tanpa akses ke database.",
    },
    {
      id: 5,
      icon: <KeyIcon width={18} height={18} className="stroke-primary" />,
      title: "Manajemen Key Fleksibel",
      description:
        "Buat beberapa key dengan nama berbeda. Setiap key menghasilkan pasangan RSA dan EdDSA secara otomatis.",
    },
    {
      id: 6,
      icon: <CircleCheckIcon width={18} height={18} className="stroke-primary" />,
      title: "Verifikasi Terbuka",
      description:
        "Penerima dokumen bisa memverifikasi tanpa akun. Cukup upload dokumen — sistem mengecek RSA, EdDSA, dan hash.",
    },
  ];

  return (
    <section id="fitur" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-14">
        <p className="text-primary mb-3 text-xs font-semibold tracking-widest uppercase">Fitur Unggulan</p>

        <h2 className="text-foreground mb-4 text-[clamp(1.75rem,3.5vw,2.5rem)] leading-tight font-bold tracking-tighter">
          Dirancang untuk
          <br />
          Keamanan Nyata
        </h2>

        <p className="text-muted-foreground max-w-lg text-sm leading-relaxed">
          Setiap bagian sistem dibangun dengan prinsip <em>zero-trust</em> — server hanya menyimpan apa yang boleh
          publik lihat.
        </p>
      </div>

      <div className="@container/features">
        <div className="grid grid-cols-1 gap-4 @[520px]/features:grid-cols-2 @[820px]/features:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="group border-border bg-card hover:border-primary hover:shadow-primary/10 cursor-default rounded-xl border p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="bg-muted border-border mb-4 flex h-12 w-12 items-center justify-center rounded-lg border">
                {feature.icon}
              </div>
              <h3 className="tracking-snug text-card-foreground mb-2 font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
