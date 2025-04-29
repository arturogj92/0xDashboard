import React from 'react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex space-x-1 justify-center mt-4">
      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="px-2 py-1 bg-indigo-700/50 hover:bg-indigo-700 text-white text-sm rounded disabled:opacity-50"
      >
        &lt;
      </button>
      {pages.map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-2 py-1 text-sm rounded ${p === page ? 'bg-indigo-600 text-white' : 'bg-indigo-900/40 text-gray-300 hover:bg-indigo-700/40'}`}
        >
          {p}
        </button>
      ))}
      <button
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className="px-2 py-1 bg-indigo-700/50 hover:bg-indigo-700 text-white text-sm rounded disabled:opacity-50"
      >
        &gt;
      </button>
    </div>
  );
}; 