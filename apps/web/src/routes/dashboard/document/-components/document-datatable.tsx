import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { orpc } from "@/utils/orpc";

import { useDocumentTableParams } from "../-hooks/use-document-params";
import { useDocumentColumns } from "./document-column";
import DocumentDeleteAlertDialog from "./document-delete-alert-dialog";
import DocumentResignModalForm from "./document-resign-modal-form";

export default function DocumentDataTable() {
  const { input } = useDocumentTableParams();
  const [deleteDocumentId, setDeleteDocumentId] = useState<string | null>(null);
  const [resignDocumentId, setResignDocumentId] = useState<string | null>(null);
  const [viewDocumentId, setViewDocumentId] = useState<string | null>(null);

  const documentQuery = useQuery(
    orpc.document.datalist.queryOptions({
      input,
    }),
  );

  const columns = useDocumentColumns({
    onDeleteDocument: (id) => setDeleteDocumentId(id),
    onResignDocument: (id) => setResignDocumentId(id),
  });

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
        onOpenChange={() => setDeleteDocumentId(null)}
        open={!!deleteDocumentId}
      />

      <DocumentResignModalForm
        id={resignDocumentId}
        onOpenChange={() => setResignDocumentId(null)}
        open={!!resignDocumentId}
        onSuccess={() => setResignDocumentId(null)}
      />

      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
    </>
  );
}
