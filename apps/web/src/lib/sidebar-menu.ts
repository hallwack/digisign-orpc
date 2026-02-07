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
  User,
  Users,
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
      {
        title: "Generate Signature",
        shortName: "Generate",
        url: "/dashboard/generate-signature",
        icon: FileCheck,
      },
      {
        title: "Append Signature to File",
        shortName: "Append",
        url: "/dashboard/append-file",
        icon: FileLock2,
      },
    ],
  },
  {
    title: "Document Management",
    shortName: "Document",
    url: "#",
    items: [
      {
        title: "All Documents",
        shortName: "Documents",
        url: "/dashboard/document",
        icon: FileStack,
      },
      {
        title: "Upload Documents",
        shortName: "Upload",
        url: "/dashboard/document/upload",
        icon: FileUp,
      },
      {
        title: "Sign Documents",
        shortName: "Sign",
        url: "/dashboard/document/sign",
        icon: FileKey,
      },
      {
        title: "Verify Documents",
        shortName: "Verify",
        url: "/dashboard/document/verify",
        icon: FileCheck,
      },
    ],
  },
  {
    title: "Key Management",
    shortName: "Key",
    url: "#",
    items: [
      {
        title: "All Keys",
        shortName: "Keys",
        url: "/dashboard/key",
        icon: FolderKey,
      },
      {
        title: "Create Key",
        shortName: "Create",
        url: "/dashboard/key/create",
        icon: KeyRound,
      },
    ],
  },
  {
    title: "User and Role Management",
    shortName: "User & Role",
    url: "#",
    items: [
      {
        title: "User Management",
        shortName: "User",
        url: "/dashboard/admin/user-management",
        icon: User,
      },
      {
        title: "Role Management",
        shortName: "Role",
        url: "/dashboard/admin/role-management",
        icon: Users,
      },
    ],
  },
];

export const sidebarFooterMenu = [{ title: "Settings", url: "/settings", icon: Settings }];
