import { useState, useMemo, useCallback, type ReactNode } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import { AppBadge } from "@/components/ui/app-badge";
import { Skeleton } from "@/components/ui/skeleton";

export type SortDir = "asc" | "desc" | false;
export type Column<T> = {
  key: string;
  label: string;
  sortable?: boolean;
  sortKey?: string;
  filterable?: boolean;
  hidden?: boolean;
  render: (row: T) => ReactNode;
  cellClassName?: string;
  headerClassName?: string;
};

export type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  loading?: boolean;
  error?: string | null;
  emptyTitle?: string;
  emptySub?: string;
  emptyIcon?: ReactNode;
  onRetry?: () => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  pageSize?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  totalCount?: number;
  sortKey?: string;
  sortDir?: SortDir;
  onSort?: (key: string, dir: SortDir) => void;
  filters?: ReactNode;
  toolbarActions?: ReactNode;
  rowCount?: boolean;
  className?: string;
  tableClassName?: string;
  responsive?: boolean;
  stickyHeader?: boolean;
};

function getValue<T>(row: T, key: string): string {
  const v = (row as Record<string, unknown>)[key];
  if (v == null) return "";
  return String(v);
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  loading = false,
  error = null,
  emptyTitle = "No data found",
  emptySub,
  emptyIcon,
  onRetry,
  searchable = false,
  searchPlaceholder = "Search...",
  searchQuery = "",
  onSearchChange,
  pageSize = 10,
  currentPage: externalPage,
  onPageChange,
  totalCount: externalTotal,
  sortKey: externalSortKey,
  sortDir: externalSortDir,
  onSort,
  filters,
  toolbarActions,
  rowCount = true,
  className,
  tableClassName,
  responsive = true,
  stickyHeader = false,
}: DataTableProps<T>) {
  const [internalSearch, setInternalSearch] = useState("");
  const [internalSortKey, setInternalSortKey] = useState<string | undefined>();
  const [internalSortDir, setInternalSortDir] = useState<SortDir>(false);
  const [internalPage, setInternalPage] = useState(1);

  const q = onSearchChange !== undefined ? searchQuery : internalSearch;
  const setQ = onSearchChange || setInternalSearch;
  const sortKey = externalSortKey !== undefined ? externalSortKey : internalSortKey;
  const setSortKey = onSort ? () => {} : setInternalSortKey;
  const sortDir = externalSortDir !== undefined ? externalSortDir : internalSortDir;
  const setSortDir = onSort ? () => {} : setInternalSortDir;
  const page = externalPage !== undefined ? externalPage : internalPage;
  const setPage = onPageChange || setInternalPage;
  const totalRows = externalTotal !== undefined ? externalTotal : data.length;

  const filtered = useMemo(() => {
    if (!q) return data;
    const query = q.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        if (col.hidden) return false;
        const v = getValue(row, col.key);
        return v.toLowerCase().includes(query);
      })
    );
  }, [data, q, columns]);

  const sorted = useMemo(() => {
    if (!sortDir || !sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey || c.sortKey === sortKey);
    if (!col) return filtered;
    return [...filtered].sort((a, b) => {
      const va = getValue(a, col.key);
      const vb = getValue(b, col.key);
      const cmp = va.localeCompare(vb, undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortDir, sortKey, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  const handleSort = useCallback((key: string) => {
    const dir: SortDir =
      sortKey === key ? (sortDir === "asc" ? "desc" : sortDir === "desc" ? false : "asc") : "asc";
    if (onSort) {
      onSort(key, dir);
    } else {
      setSortKey(key);
      setSortDir(dir);
    }
    setPage(1);
  }, [sortKey, sortDir, onSort, setPage]);

  const displayColumns = columns.filter((c) => !c.hidden);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-border bg-secondary/40 p-10 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-rose-100 text-rose-600">
          <X className="h-5 w-5" />
        </div>
        <p className="mt-4 font-display text-base font-semibold">Failed to load data</p>
        {error ? <p className="mt-2 max-w-sm text-sm text-muted-foreground">{error}</p> : null}
        {onRetry ? (
          <button
            onClick={onRetry}
            className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary-deep"
          >
            Try again
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {(searchable || filters || toolbarActions) && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            {searchable && (
              <div className="flex h-11 min-w-[200px] flex-1 items-center gap-2.5 rounded-2xl border border-border bg-card/88 px-3.5 shadow-soft">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  value={q}
                  onChange={(e) => { setQ(e.target.value); setPage(1); }}
                  placeholder={searchPlaceholder}
                  className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                {q && (
                  <button onClick={() => { setQ(""); setPage(1); }} className="grid h-6 w-6 place-items-center rounded-full hover:bg-secondary">
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}
            {filters}
          </div>
          {toolbarActions && (
            <div className="flex items-center gap-2">{toolbarActions}</div>
          )}
        </div>
      )}

      <div className={cn("rounded-[24px] border border-border/80 bg-card shadow-soft", tableClassName)}>
        {rowCount && !loading && (
          <div className="flex items-center justify-between px-5 pt-4">
            <p className="text-xs font-medium text-muted-foreground">
              {totalRows} {totalRows === 1 ? "row" : "rows"}
              {q && ` (${filtered.length} filtered)`}
            </p>
          </div>
        )}

        <div className={responsive ? "overflow-x-auto" : ""}>
          <Table className="w-full">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {displayColumns.map((col) => (
                  <TableHead
                    key={col.key}
                    className={cn(
                      "h-12 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                      col.sortable && "cursor-pointer select-none hover:text-foreground",
                      col.headerClassName,
                    )}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.label}</span>
                      {col.sortable && (
                        <span className="grid place-items-center">
                          {sortKey === col.key ? (
                            sortDir === "asc" ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )
                          ) : (
                            <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
                          )}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: Math.min(pageSize, 5) }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    {displayColumns.map((col) => (
                      <TableCell key={col.key} className="px-4 py-3">
                        <Skeleton className="h-4 w-full" style={{ maxWidth: `${60 + Math.random() * 40}%` }} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={displayColumns.length} className="px-4 py-10 text-center">
                    <div className="flex flex-col items-center justify-center">
                      {emptyIcon || (
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                          <Search className="h-5 w-5" />
                        </div>
                      )}
                      <p className="mt-3 font-display text-sm font-semibold">{emptyTitle}</p>
                      {emptySub ? <p className="mt-1 text-xs text-muted-foreground">{emptySub}</p> : null}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((row) => (
                  <TableRow key={keyExtractor(row)} className="transition hover:bg-secondary/40">
                    {displayColumns.map((col) => (
                      <TableCell
                        key={`${keyExtractor(row)}-${col.key}`}
                        className={cn("px-4 py-3", col.cellClassName)}
                      >
                        {col.render(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/60 px-5 py-4">
            <p className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(1)}
                disabled={page <= 1}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                aria-label="First page"
              >
                <span className="sr-only">First</span>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 5l-7 7 7 7M5 5v14" /></svg>
              </button>
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                aria-label="Previous page"
              >
                <ChevronUp className="h-4 w-4 -rotate-90" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                const p = start + i;
                if (p > totalPages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                      "inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition",
                      page === p
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                aria-label="Next page"
              >
                <ChevronDown className="h-4 w-4 -rotate-90" />
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page >= totalPages}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                aria-label="Last page"
              >
                <span className="sr-only">Last</span>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 5l7 7-7 7M19 5v14" /></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function DataTableStatusBadge({ status, tone }: { status: string; tone?: "neutral" | "success" | "warning" | "danger" | "info" | "gold" }) {
  const t = tone ?? (
    status.toLowerCase().includes("approv") || status.toLowerCase().includes("active") || status.toLowerCase().includes("going") || status.toLowerCase().includes("publish") || status.toLowerCase().includes("complete") || status.toLowerCase().includes("recognized") || status.toLowerCase().includes("ready")
      ? "success"
      : status.toLowerCase().includes("pend") || status.toLowerCase().includes("maybe")
        ? "warning"
        : status.toLowerCase().includes("reject") || status.toLowerCase().includes("cancel") || status.toLowerCase().includes("suspend") || status.toLowerCase().includes("danger") || status.toLowerCase().includes("disbanded") || status.toLowerCase().includes("revision")
          ? "danger"
          : status.toLowerCase().includes("info") || status.toLowerCase().includes("schedule") || status.toLowerCase().includes("probation") || status.toLowerCase().includes("review") || status.toLowerCase().includes("process")
            ? "info"
            : "neutral"
  );
  return <AppBadge tone={t}>{status}</AppBadge>;
}
