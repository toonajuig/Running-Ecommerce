'use client';

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="rounded-full border border-white/10 px-4 py-2 text-sm text-ink-muted transition hover:border-white/30 hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed"
      >
        ← Prev
      </button>

      <span className="text-sm text-ink-muted">
        {page} / {totalPages}
      </span>

      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-full border border-white/10 px-4 py-2 text-sm text-ink-muted transition hover:border-white/30 hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Next →
      </button>
    </div>
  );
}
