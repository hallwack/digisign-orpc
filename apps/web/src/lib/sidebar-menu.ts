import {
  FileCheck,
  FileKey,
  FileLock2,
  FileStack,
  FileUp,
  FolderKey,
  KeyRound,
  LayoutDashboard,
  Settings,
} from "lucide-react";

export const sidebarMainMenu = [
  {
    title: "Dashboard",
    shortName: "Dashboard",
    url: "#",
    items: [
      {
        title: "Dashboard",
        shortName: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
      /* {
        title: "Buat Tanda Tangan",
        shortName: "Buat",
        url: "/dashboard/generate-signature",
        icon: FileCheck,
      },
      {
        title: "Tambahkan Tanda Tangan ke Berkas",
        shortName: "Tambahkan",
        url: "/dashboard/append-file",
        icon: FileLock2,
      }, */
    ],
  },
  {
    title: "Manajemen Dokumen",
    shortName: "Dokumen",
    url: "#",
    items: [
      {
        title: "Dokumen",
        shortName: "Dokumen",
        url: "/dashboard/document",
        icon: FileStack,
      },
      {
        title: "Unggah Dokumen",
        shortName: "Unggah",
        url: "/dashboard/document/upload",
        icon: FileUp,
      },
      {
        title: "Tanda Tangani Dokumen",
        shortName: "Tanda Tangani",
        url: "/dashboard/document/sign",
        icon: FileKey,
      },
      {
        title: "Verifikasi Dokumen",
        shortName: "Verifikasi",
        url: "/dashboard/document/verify",
        icon: FileCheck,
      },
    ],
  },
  {
    title: "Manajemen Key",
    shortName: "Key",
    url: "#",
    items: [
      {
        title: "Key",
        shortName: "Key",
        url: "/dashboard/key",
        icon: FolderKey,
      },
      {
        title: "Buat Kunci",
        shortName: "Buat",
        url: "/dashboard/key/create",
        icon: KeyRound,
      },
    ],
  },
  /* {
    title: "Manajemen Pengguna dan Peran",
    shortName: "Pengguna & Peran",
    url: "#",
    items: [
      {
        title: "Manajemen Pengguna",
        shortName: "Pengguna",
        url: "/dashboard/admin/user-management",
        icon: User,
      },
      {
        title: "Manajemen Peran",
        shortName: "Peran",
        url: "/dashboard/admin/role-management",
        icon: Users,
      },
    ],
  }, */
];

export const sidebarFooterMenu = [{ title: "Pengaturan", url: "/settings", icon: Settings }];
