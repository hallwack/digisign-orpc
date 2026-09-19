import { type ColumnDef } from "@tanstack/react-table";
import { KeyIcon, MoreHorizontalIcon, TrashIcon } from "lucide-react";
import { useMemo } from "react";

import type { KeyTableItemSchema } from "@digisign/types";

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

interface UseKeyColumnsProps {
  onDeleteKey?: (id: string) => void;
  onRegenerateKey?: (id: string) => void;
}

export function useKeyColumns({ onDeleteKey, onRegenerateKey }: UseKeyColumnsProps = {}) {
  const columns = useMemo<ColumnDef<KeyTableItemSchema>[]>(
    () => [
      {
        id: "id",
        accessorKey: "id",
        header: ({ column }) => <DataTableColumnHeader column={column} title="ID Key" />,
        cell: ({ row }) => <div>{(row.getValue("id") as string).slice(0, 10).padEnd(15, "*")}</div>,
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "keyName",
        accessorKey: "keyName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nama Key" />,
        cell: ({ row }) => <div>{row.getValue("keyName")}</div>,
        meta: {
          label: "Nama Key",
          placeholder: "Cari berdasarkan nama key",
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
        id: "actions",
        header: "Aksi",
        cell: ({ row }) => {
          const url = convertToSlug(`${row.original.keyName}-${row.original.id}`);

          return (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                    <MoreHorizontalIcon className="h-4 w-4" />
                    <span className="sr-only">Buka menu</span>
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => onRegenerateKey?.(row.original.id)}>
                    <KeyIcon className="mr-2 h-4 w-4" />
                    Generate Ulang Key
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive cursor-pointer"
                    onClick={() => onDeleteKey?.(url)}
                  >
                    <TrashIcon className="mr-2 h-4 w-4" />
                    Hapus Key
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        size: 24,
      },
    ],
    [onDeleteKey, onRegenerateKey],
  );

  return columns;
}
