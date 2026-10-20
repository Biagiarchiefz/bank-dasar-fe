"use client";

// Table wrapper around TanStack Table v9 with loading skeleton, empty state,
// row click and server-side pagination (PROTOTYPE_PLAN §10.1).

import {
  type ColumnDef,
  type RowData,
  createColumnHelper as createHelper,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { EmptyState } from "./empty-state";
import { RowsSkeleton } from "./loading";

// Core-only table: sorting/filtering happen on the server.
const features = tableFeatures({});
type Features = typeof features;

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- column value types vary per column
export type Columns<T extends RowData> = ColumnDef<Features, T, any>[];

/** Typed column helper for DataTable columns. */
export function columnHelper<T extends RowData>() {
  return createHelper<Features, T>();
}

const EMPTY: never[] = [];

export type PageMeta = { page: number; page_size: number; total: number };

export function DataTable<T extends RowData>({
  columns,
  data,
  loading,
  empty,
  onRowClick,
  rowClassName,
  meta,
  onPageChange,
  getRowId,
}: {
  columns: Columns<T>;
  data: T[] | undefined;
  loading?: boolean;
  empty?: ReactNode;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string | undefined;
  meta?: PageMeta;
  onPageChange?: (page: number) => void;
  getRowId?: (row: T) => string;
}) {
  const table = useTable({
    features,
    columns,
    data: data ?? (EMPTY as T[]),
    getRowId: getRowId ? (row) => getRowId(row) : undefined,
  });
  const rows = table.getRowModel().rows;

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id} className="hover:bg-transparent">
                {group.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          {!loading && rows.length > 0 && (
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  className={cn(onRowClick && "cursor-pointer", rowClassName?.(row.original))}
                >
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id} className="align-middle">
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
      </div>
      {loading && <RowsSkeleton />}
      {!loading && rows.length === 0 && (empty ?? <EmptyState title="Belum ada data" />)}
      {meta && onPageChange && meta.total > meta.page_size && (
        <Pagination meta={meta} onPageChange={onPageChange} />
      )}
    </div>
  );
}

function Pagination({ meta, onPageChange }: { meta: PageMeta; onPageChange: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(meta.total / meta.page_size));
  const from = (meta.page - 1) * meta.page_size + 1;
  const to = Math.min(meta.total, meta.page * meta.page_size);
  return (
    <div className="flex items-center justify-between border-t px-4 py-2 text-sm text-muted-foreground">
      <span>
        {from}–{to} dari {meta.total}
      </span>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon-sm" disabled={meta.page <= 1} onClick={() => onPageChange(meta.page - 1)}>
          <ChevronLeft />
          <span className="sr-only">Sebelumnya</span>
        </Button>
        <span className="px-2 tabular-nums">
          {meta.page} / {pages}
        </span>
        <Button variant="ghost" size="icon-sm" disabled={meta.page >= pages} onClick={() => onPageChange(meta.page + 1)}>
          <ChevronRight />
          <span className="sr-only">Berikutnya</span>
        </Button>
      </div>
    </div>
  );
}
