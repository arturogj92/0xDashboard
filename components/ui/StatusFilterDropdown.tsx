import React from "react";
import { Button } from "./button";
import { EyeIcon, ChevronDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem
} from "./dropdown-menu";

interface StatusOption {
  value: boolean | null;
  label: string;
}

interface StatusFilterDropdownProps {
  options: StatusOption[];
  currentFilter: boolean | null;
  onFilterChange: (value: boolean | null) => void;
  label: string;
}

export function StatusFilterDropdown({ 
  options, 
  currentFilter, 
  onFilterChange, 
  label 
}: StatusFilterDropdownProps) {
  const currentOption = options.find(option => option.value === currentFilter);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="relative flex items-center space-x-1">
          <EyeIcon className="w-5 h-5" />
          <span className="hidden sm:inline-block">{label}</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={4} className="!z-[99]">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value === null ? 'all' : option.value.toString()}
            onSelect={() => onFilterChange(option.value)}
            className="cursor-pointer hover:bg-indigo-800/50 transition-colors"
          >
            {currentFilter === option.value && (
              <Check className="mr-2 h-4 w-4" />
            )}
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}