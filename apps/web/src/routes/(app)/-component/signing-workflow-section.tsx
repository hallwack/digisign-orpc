import { type ReactNode } from "react";

type WorkflowItem = {
  id: number;
  title: string;
  description: ReactNode;
};

export default function SigningWorkflowSection() {
  const signingWorkflow: WorkflowItem[] = [
    {
      id: 1,
      title: "Daftar & Buat Key",
      description:
        "Buat akun dan generate key. Sistem menghasilkan pasangan RSA + EdDSA. Public key disimpan di server, private key hanya untuk Anda.",
    },
    {
      id: 2,
      title: "Unggah & Tandatangani",
      description: (
        <>
          Upload dokumen, sertakan private key. Sistem hitung SHA-256, hasilkan{" "}
          <code className="bg-muted border-border text-primary rounded border px-1 py-0.5 font-mono text-xs">
            rsa_signature
          </code>{" "}
          +{" "}
          <code className="bg-muted border-border text-primary rounded border px-1 py-0.5 font-mono text-xs">
            eddsa_signature
          </code>
          , sisipkan ke metadata.
        </>
      ),
    },
    {
      id: 3,
      title: "Distribusikan",
      description: "Unduh dokumen yang sudah disisipkan tanda tangan dan bagikan ke penerima melalui media apapun.",
    },
  ];

  const verifyingWorkflow: WorkflowItem[] = [
    {
      id: 4,
      title: "Terima Dokumen",
      description: (
        <>
          Penerima mendapatkan dokumen yang memuat metadata signature dan{" "}
          <code className="bg-muted border-border text-primary rounded border px-1 py-0.5 font-mono text-xs">
            document_hash
          </code>{" "}
          asli di dalamnya.
        </>
      ),
    },
    {
      id: 5,
      title: "Unggah ke Verifikasi",
      description:
        "Upload dokumen ke halaman verifikasi. Sistem membaca metadata, hitung ulang hash, dan ambil public key pengirim dari database.",
    },
    {
      id: 6,
      title: "Hasil Verifikasi",
      description: (
        <>
          Jika{" "}
          <code className="bg-muted border-border text-primary rounded border px-1 py-0.5 font-mono text-xs">
            hash_plain == hash_current
          </code>{" "}
          dan kedua signature valid — dokumen asli dan tidak dimodifikasi.
        </>
      ),
    },
  ];

  return (
    <section id="alur" className="bg-muted border-border border-y">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-8">
          <p className="text-primary mb-3 text-xs font-semibold tracking-widest uppercase">Alur Proses</p>
          <h2 className="tracking-tightest text-foreground mb-4 text-[clamp(1.75rem,3.5vw,2.5rem)] leading-tight font-bold">
            Dari Tanda Tangan
            <br />
            hingga Verifikasi
          </h2>
        </div>

        <div className="mb-10">
          <div className="mb-6 flex items-center gap-3">
            <span className="bg-primary/10 text-primary border-primary/20 rounded-full border px-3 py-1 text-xs font-semibold tracking-wider uppercase">
              Pengirim
            </span>
            <div className="bg-primary/30 h-px flex-1"></div>
          </div>

          <div className="@container/alur-s">
            <div className="grid grid-cols-1 gap-4 @[600px]/alur-s:grid-cols-3">
              {signingWorkflow.map((item) => (
                <div key={item.id} className="border-border bg-card rounded-xl border p-5">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary text-primary-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-semibold">
                      {item.id}
                    </div>
                    <div>
                      <div className="tracking-snug text-card-foreground mb-1 font-semibold">{item.title}</div>
                      <div className="text-muted-foreground text-sm leading-relaxed">{item.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="mb-6 flex items-center gap-3">
            <span className="bg-secondary text-secondary-foreground border-border rounded-full border px-3 py-1 text-xs font-semibold tracking-wider uppercase">
              Penerima
            </span>
            <div className="bg-accent-foreground/20 h-px flex-1"></div>
          </div>

          <div className="@container/alur-r">
            <div className="grid grid-cols-1 gap-4 @[600px]/alur-r:grid-cols-3">
              {verifyingWorkflow.map((item) => (
                <div key={item.id} className="border-border bg-card rounded-xl border p-5">
                  <div className="flex items-start gap-4">
                    <div className="bg-foreground text-background flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                      {item.id}
                    </div>
                    <div>
                      <div className="font-display tracking-snug text-card-foreground mb-1 font-semibold">
                        {item.title}
                      </div>
                      <div className="text-muted-foreground text-sm leading-relaxed">{item.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
