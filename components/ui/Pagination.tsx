import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const page = currentPage;
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex space-x-2 justify-center mt-4 items-center">
      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="w-24 h-10 bg-indigo-700/50 hover:bg-indigo-700 text-white text-sm rounded-lg font-medium transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed border border-transparent hover:border-indigo-500/50 disabled:hover:bg-indigo-700/50 disabled:hover:border-transparent"
      >
        ← Anterior
      </button>
      {pages.map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-10 h-10 text-sm rounded-lg font-bold transition-all duration-200 border ${
            p === page 
              ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-purple-400 shadow-xl shadow-purple-500/50 ring-2 ring-purple-400/50 transform scale-110' 
              : 'bg-indigo-900/40 text-gray-300 hover:bg-indigo-700/60 hover:text-white border-transparent hover:border-indigo-500/50'
          }`}
        >
          {p}
        </button>
      ))}
      <button
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className="w-24 h-10 bg-indigo-700/50 hover:bg-indigo-700 text-white text-sm rounded-lg font-medium transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed border border-transparent hover:border-indigo-500/50 disabled:hover:bg-indigo-700/50 disabled:hover:border-transparent"
      >
        Siguiente →
      </button>
    </div>
  );
}; 