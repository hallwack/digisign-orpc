import { Link } from "@tanstack/react-router";
import { type ColumnDef } from "@tanstack/react-table";
import { EyeIcon, KeyIcon, MoreHorizontalIcon, TrashIcon } from "lucide-react";
import { useMemo } from "react";

import type { DocumentTableItemSchema } from "@digisign/types";

import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { convertToSlug, formatDate } from "@/lib/format";

interface UseDocumentColumnsProps {
  onViewDocument?: (id: string) => void;
  onResignDocument?: (id: string) => void;
  onDeleteDocument?: (id: string) => void;
}

export function useDocumentColumns({
  onViewDocument,
  onResignDocument,
  onDeleteDocument,
}: UseDocumentColumnsProps = {}) {
  const columns = useMemo<ColumnDef<DocumentTableItemSchema>[]>(
    () => [
      {
        id: "id",
        accessorKey: "id",
        header: ({ column }) => <DataTableColumnHeader column={column} title="ID Dokumen" />,
        cell: ({ row }) => <div>{(row.getValue("id") as string).slice(0, 10).padEnd(15, "*")}</div>,
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "title",
        accessorKey: "title",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
        cell: ({ row }) => <div>{row.getValue("title")}</div>,
        meta: {
          label: "Title",
          placeholder: "Cari berdasarkan title",
          variant: "text",
        },
        enableColumnFilter: true,
      },
      {
        id: "createdAt",
        accessorKey: "createdAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Dibuat Pada" />,
        cell: ({ row }) => formatDate(row.getValue<Date>("createdAt")),
        meta: {
          label: "Dibuat Pada",
          variant: "dateRange",
        },
        enableColumnFilter: true,
      },
      {
        id: "signedAt",
        accessorKey: "signedAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Ditandatangani Pada" />,
        cell: ({ row }) => formatDate(row.getValue<Date>("signedAt")),
        meta: {
          label: "Ditandatangani Pada",
          variant: "dateRange",
        },
        enableColumnFilter: true,
      },
      {
        id: "actions",
        header: "Aksi",
        cell: ({ row }) => {
          const url = convertToSlug(`${row.original.title}-${row.original.id}`);
          return (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                    <MoreHorizontalIcon className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => onViewDocument?.(row.original.id)}
                    render={
                      <Link
                        to="/dashboard/document/$docId"
                        params={{
                          docId: row.original.id,
                        }}
                      >
                        <EyeIcon className="mr-2 h-4 w-4" />
                        Lihat Dokumen
                      </Link>
                    }
                  />
                  {row.original.signedAt && (
                    <DropdownMenuItem className="cursor-pointer" onClick={() => onResignDocument?.(row.original.id)}>
                      <KeyIcon className="mr-2 h-4 w-4" />
                      Tanda Tangan Ulang Dokumen
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive cursor-pointer"
                    onClick={() => onDeleteDocument?.(url)}
                  >
                    <TrashIcon className="mr-2 h-4 w-4" />
                    Hapus Dokumen
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        size: 24,
      },
    ],
    [onViewDocument, onResignDocument, onDeleteDocument],
  );

  return columns;
}
