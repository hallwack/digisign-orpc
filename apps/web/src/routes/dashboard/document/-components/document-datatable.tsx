import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { CalendarIcon, Eye, Key, MoreHorizontal, Trash } from "lucide-react";
import { useMemo, useState } from "react";

import type { DocumentTableItem } from "@digisign/types";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableSortList } from "@/components/data-table/data-table-sort-list";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDataTable } from "@/hooks/use-data-table";
import { convertToSlug, formatDate } from "@/lib/format";
import { orpc } from "@/utils/orpc";

import useDocumentTableParams from "../-hooks/use-document-params";
import DocumentDeleteAlertDialog from "./document-delete-alert-dialog";

export default function DocumentDataTable() {
  const { input } = useDocumentTableParams();
  const [deleteDocumentId, setDeleteDocumentId] = useState<string | null>(null);

  const documentQuery = useQuery(
    orpc.document.datalist.queryOptions({
      input,
    }),
  );

  const columns = useMemo<ColumnDef<DocumentTableItem>[]>(
    () => [
      {
        id: "id",
        accessorKey: "id",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Document ID" />,
        cell: ({ row }) => <div>{row.getValue("id")}</div>,
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "title",
        accessorKey: "title",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Title" />,
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
        header: ({ column }) => <DataTableColumnHeader column={column} label="Created At" />,
        cell: ({ cell }) => formatDate(cell.getValue<Date>()),
        meta: {
          label: "Created At",
          variant: "dateRange",
          icon: CalendarIcon,
        },
        enableColumnFilter: true,
      },
      {
        id: "signedAt",
        accessorKey: "signedAt",
        header: ({ column }) => <DataTableColumnHeader column={column} label="Signed At" />,
        cell: ({ cell }) => formatDate(cell.getValue<Date>()),
        meta: {
          label: "Created At",
          variant: "dateRange",
          icon: CalendarIcon,
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
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="cursor-pointer">
                  <Link to={`/document/${url}`}>
                    <Eye /> View Document
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  /* onClick={() => setSignDocumentId(row.original.id)} */
                >
                  <Key /> Sign Document
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setDeleteDocumentId(url)}
                  className="cursor-pointer"
                >
                  <Trash /> Delete Document
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        size: 24,
      },
    ],
    [],
  );

  const { table } = useDataTable({
    data: documentQuery?.data?.data || [],
    columns,
    pageCount: documentQuery?.data?.pageCount ?? 0,
    initialState: {
      columnPinning: { right: ["actions"] },
    },
    getRowId: (row) => row.id,
    shallow: true,
  });

  return (
    <>
      <DocumentDeleteAlertDialog
        id={deleteDocumentId}
        onOpenChange={() => {
          setDeleteDocumentId(null);
        }}
        open={!!deleteDocumentId}
      />

      <DataTable table={table}>
        <DataTableToolbar table={table}>
          <DataTableSortList table={table} />
        </DataTableToolbar>
      </DataTable>
    </>
  );
}
