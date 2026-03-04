import {
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnPinningState,
  type FilterFn,
  type PaginationState,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";

interface DataTableOptions<TData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  pageCount?: number;
  initialState?: {
    sorting?: SortingState;
    columnFilters?: ColumnFiltersState;
    columnVisibility?: VisibilityState;
    columnPinning?: ColumnPinningState;
    pagination?: PaginationState;
  };
  getRowId?: (row: TData, index: number) => string;
  globalFilterFn?: FilterFn<TData>;
  enableRowSelection?: boolean;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enablePagination?: boolean;
  manualPagination?: boolean;
  manualFiltering?: boolean;
  manualSorting?: boolean;
  onPaginationChange?: (state: PaginationState) => void;
  onSortingChange?: (state: SortingState) => void;
  onColumnFiltersChange?: (state: ColumnFiltersState) => void;
}

interface UseDataTableReturn<TData> {
  table: ReturnType<typeof useReactTable<TData>>;
  columnFilters: ColumnFiltersState;
  setColumnFilters: (state: ColumnFiltersState) => void;
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  sorting: SortingState;
  setSorting: (state: SortingState) => void;
}

/**
 * Custom hook for creating a managed TanStack Table instance with filtering, sorting, and pagination
 * @example
 * const { table } = useDataTable({
 *   data: documents,
 *   columns,
 *   pageCount: 10,
 *   initialState: {
 *     columnPinning: { right: ["actions"] },
 *   },
 *   getRowId: (row) => row.id,
 * });
 */
export function useDataTable<TData>({
  data,
  columns,
  pageCount,
  initialState,
  getRowId,
  globalFilterFn,
  enableRowSelection = false,
  enableSorting = true,
  enableFiltering = true,
  enablePagination = !!pageCount,
  manualPagination = false,
  manualFiltering = false,
  manualSorting = false,
  onPaginationChange,
  onSortingChange,
  onColumnFiltersChange,
}: DataTableOptions<TData>): UseDataTableReturn<TData> {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(initialState?.columnFilters || []);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>(initialState?.sorting || []);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(initialState?.columnVisibility || {});
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>(
    initialState?.columnPinning || {
      left: [],
      right: [],
    },
  );
  const [pagination, setPagination] = useState<PaginationState>(
    initialState?.pagination || {
      pageIndex: 0,
      pageSize: 10,
    },
  );
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable<TData>({
    data,
    columns,
    state: {
      sorting: manualSorting ? undefined : sorting,
      columnFilters: manualFiltering ? undefined : columnFilters,
      columnVisibility,
      columnPinning,
      pagination: manualPagination ? undefined : pagination,
      globalFilter,
      rowSelection,
    },
    onSortingChange: (updater) => {
      const newState = typeof updater === "function" ? updater(sorting) : updater;
      setSorting(newState);
      onSortingChange?.(newState);
    },
    onColumnFiltersChange: (updater) => {
      const newState = typeof updater === "function" ? updater(columnFilters) : updater;
      setColumnFilters(newState);
      onColumnFiltersChange?.(newState);
    },
    onColumnVisibilityChange: (updater) => {
      setColumnVisibility(typeof updater === "function" ? updater(columnVisibility) : updater);
    },
    onColumnPinningChange: (updater) => {
      setColumnPinning(typeof updater === "function" ? updater(columnPinning) : updater);
    },
    onPaginationChange: (updater) => {
      const newState = typeof updater === "function" ? updater(pagination) : updater;
      setPagination(newState);
      onPaginationChange?.(newState);
    },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    globalFilterFn: globalFilterFn,
    getRowId: getRowId as any,
    pageCount,
    manualPagination,
    manualFiltering,
    manualSorting,
  });

  return {
    table,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    sorting,
    setSorting,
  };
}
