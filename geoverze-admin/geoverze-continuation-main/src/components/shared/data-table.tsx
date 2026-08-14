import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Columns3,
  Download,
  MoreHorizontal,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { Highlight } from "@/components/shared/highlight";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  id: string;
  header: string;
  accessor: (row: T) => string | number;
  cell?: ((row: T) => ReactNode) | undefined;
  sortable?: boolean | undefined;
  align?: "left" | "right" | undefined;
  className?: string | undefined;
  defaultHidden?: boolean | undefined;
}

export interface DataTableFilter<T> {
  id: string;
  label: string;
  options: string[];
  accessor: (row: T) => string;
}

export interface DataTableRowAction<T> {
  label: string;
  onSelect: (row: T) => void;
  destructive?: boolean | undefined;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  getRowId: (row: T) => string;
  searchPlaceholder?: string | undefined;
  filters?: DataTableFilter<T>[] | undefined;
  rowActions?: DataTableRowAction<T>[] | undefined;
  onRowClick?: ((row: T) => void) | undefined;
  loading?: boolean | undefined;
  emptyTitle?: string | undefined;
  emptyDescription?: string | undefined;
  emptyAction?: ReactNode | undefined;
  pageSize?: number | undefined;
  /** Hides the built-in search / filter / column / export toolbar. */
  hideToolbar?: boolean | undefined;
  /** Hides the built-in bulk-selection bar (use an external toolbar instead). */
  hideBulkBar?: boolean | undefined;
  /** Controlled selection. When provided, selection state lives in the parent. */
  selectedIds?: string[] | undefined;
  onSelectionChange?: ((ids: string[]) => void) | undefined;
  /** Substring highlighted inside default (non-custom) cells. */
  highlight?: string | undefined;
  /** Card fallback rendered instead of the table below the `md` breakpoint. */
  renderMobileCard?: ((row: T) => ReactNode) | undefined;
}

export function DataTable<T>({
  data,
  columns,
  getRowId,
  searchPlaceholder = "Search…",
  filters = [],
  rowActions = [],
  onRowClick,
  loading = false,
  emptyTitle = "No records found",
  emptyDescription = "Adjust your search or filters to see more results.",
  emptyAction,
  pageSize: initialPageSize = 10,
  hideToolbar = false,
  hideBulkBar = false,
  selectedIds,
  onSelectionChange,
  highlight,
  renderMobileCard,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<{ id: string; dir: "asc" | "desc" } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [internalSelected, setInternalSelected] = useState<Set<string>>(new Set());
  const [hidden, setHidden] = useState<Set<string>>(
    () => new Set(columns.filter((c) => c.defaultHidden).map((c) => c.id)),
  );

  const controlled = selectedIds !== undefined;
  const selected = useMemo(
    () => (controlled ? new Set(selectedIds) : internalSelected),
    [controlled, selectedIds, internalSelected],
  );
  const setSelected = (next: Set<string>) => {
    if (!controlled) setInternalSelected(next);
    onSelectionChange?.([...next]);
  };

  const visibleColumns = columns.filter((c) => !hidden.has(c.id));

  const processed = useMemo(() => {
    let rows = data;
    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter((row) =>
        columns.some((c) => String(c.accessor(row)).toLowerCase().includes(q)),
      );
    }
    for (const filter of filters) {
      const value = filterValues[filter.id];
      if (value && value !== "__all") {
        rows = rows.filter((row) => filter.accessor(row) === value);
      }
    }
    if (sort) {
      const col = columns.find((c) => c.id === sort.id);
      if (col) {
        rows = [...rows].sort((a, b) => {
          const av = col.accessor(a);
          const bv = col.accessor(b);
          const cmp =
            typeof av === "number" && typeof bv === "number"
              ? av - bv
              : String(av).localeCompare(String(bv));
          return sort.dir === "asc" ? cmp : -cmp;
        });
      }
    }
    return rows;
  }, [data, columns, filters, filterValues, query, sort]);

  const pageCount = Math.max(1, Math.ceil(processed.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = processed.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const allOnPageSelected =
    pageRows.length > 0 && pageRows.every((row) => selected.has(getRowId(row)));

  const toggleAllOnPage = () => {
    const next = new Set(selected);
    if (allOnPageSelected) pageRows.forEach((row) => next.delete(getRowId(row)));
    else pageRows.forEach((row) => next.add(getRowId(row)));
    setSelected(next);
  };

  const toggleRow = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const toggleSort = (id: string) => {
    setSort((prev) =>
      prev?.id === id ? { id, dir: prev.dir === "asc" ? "desc" : "asc" } : { id, dir: "asc" },
    );
  };

  const activeFilterCount = Object.values(filterValues).filter((v) => v && v !== "__all").length;

  return (
    <section className="rounded-lg border border-border bg-card">
      {!hideToolbar && (
        <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
          <div className="relative min-w-52 flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="h-9 pl-8"
            />
          </div>

          {filters.map((filter) => (
            <Select
              key={filter.id}
              value={filterValues[filter.id] ?? "__all"}
              onValueChange={(value) => {
                setFilterValues((prev) => ({ ...prev, [filter.id]: value }));
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-40" aria-label={filter.label}>
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">All {filter.label.toLowerCase()}</SelectItem>
                {filter.options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}

          {(activeFilterCount > 0 || query) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9"
              onClick={() => {
                setFilterValues({});
                setQuery("");
                setPage(1);
              }}
            >
              <X className="size-4" aria-hidden="true" />
              Reset
            </Button>
          )}

          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Columns3 className="size-4" aria-hidden="true" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {columns.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={!hidden.has(column.id)}
                    onCheckedChange={(checked) => {
                      const next = new Set(hidden);
                      if (checked) next.delete(column.id);
                      else next.add(column.id);
                      setHidden(next);
                    }}
                  >
                    {column.header}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => toast.info("Export will be available once the backend is connected.")}
            >
              <Download className="size-4" aria-hidden="true" />
              Export
            </Button>
          </div>
        </div>
      )}

      {!hideBulkBar && selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-accent/40 px-3 py-2 text-sm">
          <span className="font-medium">{selected.size} selected</span>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={() => toast.info("Bulk action queued.")}>
              Bulk edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info("Bulk export placeholder.")}
            >
              Export selection
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
              Clear
            </Button>
          </div>
        </div>
      )}

      <div className={cn("overflow-x-auto", renderMobileCard && "max-md:hidden")}>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10">
                <Checkbox
                  checked={allOnPageSelected}
                  onCheckedChange={toggleAllOnPage}
                  aria-label="Select all rows on this page"
                />
              </TableHead>
              {visibleColumns.map((column) => (
                <TableHead
                  key={column.id}
                  className={cn(
                    "text-xs font-medium tracking-wide whitespace-nowrap text-muted-foreground uppercase",
                    column.align === "right" && "text-right",
                    column.className,
                  )}
                  aria-sort={
                    sort?.id === column.id
                      ? sort.dir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  {column.sortable === false ? (
                    column.header
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleSort(column.id)}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-sm transition-colors hover:text-foreground",
                        column.align === "right" && "flex-row-reverse",
                      )}
                    >
                      {column.header}
                      {sort?.id === column.id ? (
                        sort.dir === "asc" ? (
                          <ArrowUp className="size-3" aria-hidden="true" />
                        ) : (
                          <ArrowDown className="size-3" aria-hidden="true" />
                        )
                      ) : (
                        <ChevronsUpDown className="size-3 opacity-40" aria-hidden="true" />
                      )}
                    </button>
                  )}
                </TableHead>
              ))}
              {rowActions.length > 0 && <TableHead className="w-10" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading &&
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  <TableCell colSpan={visibleColumns.length + (rowActions.length ? 2 : 1)}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {!loading &&
              pageRows.map((row) => {
                const id = getRowId(row);
                return (
                  <TableRow
                    key={id}
                    data-state={selected.has(id) ? "selected" : undefined}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    tabIndex={onRowClick ? 0 : undefined}
                    onKeyDown={
                      onRowClick
                        ? (event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              onRowClick(row);
                            }
                          }
                        : undefined
                    }
                    className={cn(
                      onRowClick &&
                        "focus-visible:ring-ring/50 cursor-pointer focus-visible:ring-2 focus-visible:outline-none",
                    )}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selected.has(id)}
                        onCheckedChange={() => toggleRow(id)}
                        aria-label={`Select row ${id}`}
                      />
                    </TableCell>
                    {visibleColumns.map((column) => (
                      <TableCell
                        key={column.id}
                        className={cn(
                          "py-2 whitespace-nowrap",
                          column.align === "right" && "text-right tabular",
                          column.className,
                        )}
                      >
                        {column.cell ? (
                          column.cell(row)
                        ) : (
                          <Highlight text={String(column.accessor(row))} query={highlight} />
                        )}
                      </TableCell>
                    ))}
                    {rowActions.length > 0 && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              aria-label="Row actions"
                            >
                              <MoreHorizontal className="size-4" aria-hidden="true" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {rowActions.map((action) => (
                              <DropdownMenuItem
                                key={action.label}
                                onSelect={() => action.onSelect(row)}
                                className={cn(
                                  action.destructive && "text-destructive focus:text-destructive",
                                )}
                              >
                                {action.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}

            {!loading && pageRows.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={visibleColumns.length + (rowActions.length ? 2 : 1)}>
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    action={emptyAction}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {renderMobileCard && (
        <div className="md:hidden">
          {loading && (
            <div className="space-y-2 p-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={`m-skeleton-${i}`} className="h-20 w-full" />
              ))}
            </div>
          )}
          {!loading && pageRows.length === 0 && (
            <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
          )}
          {!loading && (
            <ul className="divide-y divide-border">
              {pageRows.map((row) => {
                const id = getRowId(row);
                return (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      className="focus-visible:ring-ring/50 w-full px-3 py-3 text-left transition-colors hover:bg-accent/40 focus-visible:ring-2 focus-visible:outline-none"
                    >
                      {renderMobileCard(row)}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-border px-3 py-2 text-sm text-muted-foreground">
        <span className="tabular">
          {processed.length === 0
            ? "0 results"
            : `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, processed.length)} of ${processed.length}`}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              setPageSize(Number(value));
              setPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-28" aria-label="Rows per page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size} rows
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            disabled={currentPage <= 1}
            onClick={() => setPage(currentPage - 1)}
          >
            Previous
          </Button>
          <span className="tabular">
            Page {currentPage} / {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            disabled={currentPage >= pageCount}
            onClick={() => setPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </section>
  );
}
