'use client';

import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface SortableColumnHeaderProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  isActionColumn?: boolean;
  minWidth?: string;
  onSort?: (columnId: string) => void;
  sortBy?: string;
  sortOrder?: string;
}

export function SortableColumnHeader({ 
  id, 
  children, 
  className = '', 
  isActionColumn = false,
  minWidth = '',
  onSort,
  sortBy,
  sortOrder
}: SortableColumnHeaderProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Get sort mapping for this column
  const getSortField = (columnId: string) => {
    switch (columnId) {
      case 'url': return 'slug';
      case 'destination': return 'originalUrl';
      case 'clicks': return 'clickCount';
      case 'status': return 'isActive';
      case 'created': return 'createdAt';
      default: return null;
    }
  };

  const sortField = getSortField(id);
  const isCurrentSort = sortBy === sortField;
  const canSort = sortField && !isActionColumn && onSort;

  const handleSort = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canSort) {
      onSort(id);
    }
  };

  return (
    <th
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`
        px-6 py-4 text-left text-xs font-semibold text-gray-200 uppercase tracking-wider 
        hover:bg-[#2c1b4d]/50 transition-colors
        border-r border-gray-700/30 last:border-r-0
        select-none relative
        ${minWidth}
        ${isActionColumn ? 'text-right' : ''}
        ${isDragging ? 'opacity-50 z-50' : ''}
        ${className}
      `.trim()}
    >
      <div className="flex items-center justify-between">
        <div 
          {...listeners}
          className="cursor-grab active:cursor-grabbing flex-shrink-0"
        >
          {children}
        </div>
        
        {canSort && (
          <button
            onClick={handleSort}
            className="ml-3 p-2 hover:bg-gray-600/30 rounded transition-colors cursor-pointer flex-shrink-0"
          >
            {isCurrentSort ? (
              sortOrder === 'desc' ? (
                <ChevronDownIcon className="h-5 w-5 text-indigo-400" />
              ) : (
                <ChevronUpIcon className="h-5 w-5 text-indigo-400" />
              )
            ) : (
              <div className="h-5 w-5 flex flex-col justify-center items-center">
                <ChevronUpIcon className="h-4 w-4 text-gray-500" />
                <ChevronDownIcon className="h-4 w-4 text-gray-500 -mt-1" />
              </div>
            )}
          </button>
        )}
      </div>
    </th>
  );
}