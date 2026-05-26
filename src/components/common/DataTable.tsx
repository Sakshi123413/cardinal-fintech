import { useMemo, useState, type ReactNode } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "./Spinner";
import { EmptyState } from "./EmptyState";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface Props<T> {
  title: string;
  description?: string;
  data: T[] | undefined;
  columns: Column<T>[];
  loading?: boolean;
  searchKeys?: (keyof T)[];
  onCreate?: () => void;
  createLabel?: string;
  rowKey: (row: T) => string | number;
  pageSize?: number;
}

export function DataTable<T extends Record<string, any>>({
  title, description, data, columns, loading,
  searchKeys, onCreate, createLabel = "Add new", rowKey, pageSize = 10,
}: Props<T>) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (!search.trim() || !searchKeys?.length) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      searchKeys.some((k) => String(row[k] ?? "").toLowerCase().includes(q)),
    );
  }, [data, search, searchKeys]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {onCreate && (
          <Button onClick={onCreate} className="sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            {createLabel}
          </Button>
        )}
      </div>

      <div className="rounded-xl border bg-card shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-3 border-b p-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>
          <span className="ml-auto text-xs text-muted-foreground">
            {filtered.length} record{filtered.length === 1 ? "" : "s"}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><Spinner size={28} /></div>
        ) : filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title={search ? "No results match your search" : "No records yet"}
              description={search ? "Try a different keyword." : "Add your first record to get started."}
              action={onCreate && !search ? (
                <Button onClick={onCreate}><Plus className="mr-2 h-4 w-4" />{createLabel}</Button>
              ) : null}
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    {columns.map((c) => (
                      <TableHead key={c.key} className={c.className}>{c.header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.map((row) => (
                    <TableRow key={rowKey(row)}>
                      {columns.map((c) => (
                        <TableCell key={c.key} className={c.className}>
                          {c.render ? c.render(row) : String(row[c.key] ?? "—")}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t p-4">
                <p className="text-xs text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</Button>
                  <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>Next</Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
