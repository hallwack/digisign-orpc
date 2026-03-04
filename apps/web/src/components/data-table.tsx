import { type Table as ReactTable } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";

import { type AdvancedFilter, AdvancedFilterPanel } from "@/components/advance-filter-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface DataTableProps<TData> {
  table: ReactTable<TData>;
  columns: any[];
  showPagination?: boolean;
  showGlobalFilter?: boolean;
  showAdvancedFilters?: boolean;
  filterFields?: Array<{
    value: string;
    label: string;
  }>;
  pageSize?: number;
  onRowClick?: (row: TData) => void;
  rowClassName?: (row: TData) => string;
  emptyState?: ReactNode;
  isLoading?: boolean;
  onAdvancedFiltersChange?: (filters: AdvancedFilter[]) => void;
}

/**
 * Abstracted DataTable component using TanStack Table and BaseUI patterns
 * Supports filtering, sorting, and pagination out of the box
 * @example
 * <DataTable
 *   table={table}
 *   columns={columns}
 *   showPagination
 *   showGlobalFilter
 *   filterFields={[
 *     { value: 'title', label: 'Title' },
 *     { value: 'status', label: 'Status' },
 *   ]}
 * />
 */
export function DataTable<TData>({
  table,
  columns,
  showPagination = true,
  showGlobalFilter = true,
  showAdvancedFilters = false,
  filterFields = [],
  pageSize = 10,
  onRowClick,
  rowClassName,
  emptyState,
  isLoading = false,
  onAdvancedFiltersChange,
}: DataTableProps<TData>) {
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilter[]>([]);
  const [selectedFilterField, setSelectedFilterField] = useState<string>(filterFields[0]?.value || "");

  const rows = table.getRowModel().rows;
  const isEmpty = rows.length === 0;

  const handleAdvancedFilterAdd = (fieldValue: string) => {
    if (!fieldValue) return;

    const field = filterFields.find((f) => f.value === fieldValue);
    if (!field) return;

    const newFilter: AdvancedFilter = {
      id: Date.now().toString(),
      fieldValue,
      fieldLabel: field.label,
      operator: "contains",
      value: "",
    };

    const newFilters = [...advancedFilters, newFilter];
    setAdvancedFilters(newFilters);
    onAdvancedFiltersChange?.(newFilters);
  };

  const handleAdvancedFilterUpdate = (id: string, updates: Partial<AdvancedFilter>) => {
    const newFilters = advancedFilters.map((filter) => (filter.id === id ? { ...filter, ...updates } : filter));
    setAdvancedFilters(newFilters);
    onAdvancedFiltersChange?.(newFilters);

    // Apply filter to column
    if (updates.value !== undefined) {
      const filter = newFilters.find((f) => f.id === id);
      if (!filter) return;

      const columnFilters = table.getState().columnFilters;
      const existingFilterIndex = columnFilters.findIndex((f) => (f as any).id === filter.fieldValue);

      const filterConfig = {
        id: filter.fieldValue,
        value: {
          operator: updates.operator || filter.operator,
          value: updates.value,
        },
      };

      if (existingFilterIndex >= 0) {
        columnFilters[existingFilterIndex] = filterConfig;
      } else {
        columnFilters.push(filterConfig);
      }

      table.setColumnFilters(columnFilters);
    }
  };

  const handleAdvancedFilterRemove = (id: string) => {
    const newFilters = advancedFilters.filter((filter) => filter.id !== id);
    setAdvancedFilters(newFilters);
    onAdvancedFiltersChange?.(newFilters);
  };

  const handleAdvancedFilterReorder = (filters: AdvancedFilter[]) => {
    setAdvancedFilters(filters);
    onAdvancedFiltersChange?.(filters);
  };

  return (
    <div className="w-full space-y-4">
      {/* Global Filter */}
      {showGlobalFilter && (
        <div className="flex gap-2">
          <Input
            placeholder="Search all fields..."
            value={(table.getState().globalFilter as string) || ""}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            className="max-w-sm"
          />
        </div>
      )}

      {/* Advanced Filters */}
      {showAdvancedFilters && filterFields.length > 0 && (
        <AdvancedFilterPanel
          filters={advancedFilters}
          filterFields={filterFields}
          onAddFilter={handleAdvancedFilterAdd}
          onUpdateFilter={handleAdvancedFilterUpdate}
          onRemoveFilter={handleAdvancedFilterRemove}
          onReorderFilter={handleAdvancedFilterReorder}
          selectedField={selectedFilterField}
          onFieldChange={setSelectedFilterField}
        />
      )}

      {/* Table */}
      <div className="border-border overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/30">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(header.column.getCanSort() && "cursor-pointer select-none")}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {header.isPlaceholder ? null : (header.column.columnDef.header as ReactNode)}
                      {header.column.getCanSort() && (
                        <span className="text-muted-foreground text-xs">
                          {header.column.getIsSorted() === "asc" && "↑"}
                          {header.column.getIsSorted() === "desc" && "↓"}
                          {header.column.getIsSorted() === false && "⇅"}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-muted-foreground h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : isEmpty ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24">
                  <div className="text-muted-foreground text-center">{emptyState || "No results found"}</div>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(onRowClick && "hover:bg-muted/50 cursor-pointer", rowClassName?.(row.original))}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {(cell.column.columnDef.cell as any)?.({ getValue: () => cell.getValue() }, cell.getContext()) ||
                        cell.getValue()}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground text-sm">
            {table.getState().pagination.pageIndex * pageSize + 1} -{" "}
            {Math.min((table.getState().pagination.pageIndex + 1) * pageSize, table.getFilteredRowModel().rows.length)}{" "}
            of {table.getFilteredRowModel().rows.length} results
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1">
              <span className="text-sm">Page</span>
              <Input
                type="number"
                min="1"
                max={table.getPageCount()}
                value={table.getState().pagination.pageIndex + 1}
                onChange={(e) => {
                  const page = e.target.value ? Number(e.target.value) - 1 : 0;
                  table.setPageIndex(page);
                }}
                className="h-8 w-12 text-center"
              />
              <span className="text-sm">of {table.getPageCount()}</span>
            </div>

            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>

            <Select
              value={String(table.getState().pagination.pageSize)}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
