import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { orpc } from "@/utils/orpc";

import { useKeyTableParams } from "../-hooks/use-key-params";
import { useKeyColumns } from "./key-column";
import KeyDeleteAlertDialog from "./key-delete-alert-dialog";
import KeyRegenerateAlertDialog from "./key-regenerate-alert-dialog";

export default function KeyDataTable() {
  const { input } = useKeyTableParams();
  const [deleteKeyId, setDeleteKeyId] = useState<string | null>(null);
  const [regenerateKeyId, setRegenerateKeyId] = useState<string | null>(null);

  const keyQuery = useQuery(
    orpc.key.datalist.queryOptions({
      input,
    }),
  );

  const columns = useKeyColumns({
    onDeleteKey: (id) => {
      setDeleteKeyId(id);
    },
    onRegenerateKey: (id) => {
      setRegenerateKeyId(id);
    },
  });

  const { table } = useDataTable({
    data: keyQuery?.data?.data || [],
    columns,
    pageCount: keyQuery?.data?.pageCount ?? 0,
    initialState: {
      columnPinning: { right: ["actions"] },
    },
    getRowId: (row) => row.id,
    shallow: true,
  });

  return (
    <>
      <KeyDeleteAlertDialog
        id={deleteKeyId}
        onOpenChange={() => {
          setDeleteKeyId(null);
        }}
        open={!!deleteKeyId}
      />

      <KeyRegenerateAlertDialog
        id={regenerateKeyId}
        onOpenChangeComplete={(open) => {
          if (!open) setRegenerateKeyId(null);
        }}
        open={!!regenerateKeyId}
      />

      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
    </>
  );
}
