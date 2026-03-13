'use client';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 py-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-1.5 border border-c3 text-c7 font-mono text-sm hover:border-c5 hover:text-c11 transition-colors disabled:text-c4 disabled:border-c2 disabled:cursor-not-allowed"
      >
        Prev
      </button>
      <span className="text-[10px] font-mono text-c5 uppercase tracking-[0.2em]">
        {page} / {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="px-3 py-1.5 border border-c3 text-c7 font-mono text-sm hover:border-c5 hover:text-c11 transition-colors disabled:text-c4 disabled:border-c2 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
}
