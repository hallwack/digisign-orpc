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
  onSignDocument?: (id: string) => void;
  onDeleteDocument?: (id: string) => void;
}

export function useDocumentColumns({ onViewDocument, onSignDocument, onDeleteDocument }: UseDocumentColumnsProps = {}) {
  const columns = useMemo<ColumnDef<DocumentTableItemSchema>[]>(
    () => [
      {
        id: "id",
        accessorKey: "id",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Document ID" />,
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
          placeholder: "Search by title",
          variant: "text",
        },
        enableColumnFilter: true,
      },
      {
        id: "createdAt",
        accessorKey: "createdAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
        cell: ({ row }) => formatDate(row.getValue<Date>("createdAt")),
        meta: {
          label: "Created At",
          variant: "dateRange",
        },
        enableColumnFilter: true,
      },
      {
        id: "signedAt",
        accessorKey: "signedAt",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Signed At" />,
        cell: ({ row }) => formatDate(row.getValue<Date>("signedAt")),
        meta: {
          label: "Signed At",
          variant: "dateRange",
        },
        enableColumnFilter: true,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const url = convertToSlug(`${row.original.title}-${row.original.id}`);

          return (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontalIcon className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => onViewDocument?.(row.original.id)}>
                    <EyeIcon className="mr-2 h-4 w-4" />
                    View Document
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => onSignDocument?.(row.original.id)}>
                    <KeyIcon className="mr-2 h-4 w-4" />
                    Sign Document
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive cursor-pointer"
                    onClick={() => onDeleteDocument?.(url)}
                  >
                    <TrashIcon className="mr-2 h-4 w-4" />
                    Delete Document
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        size: 24,
      },
    ],
    [onViewDocument, onSignDocument, onDeleteDocument],
  );

  return columns;
}
