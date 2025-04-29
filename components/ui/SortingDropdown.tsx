"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Button } from "./button";
import { AdjustmentsHorizontalIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem
} from "./dropdown-menu";
import { SortField, SortOrder } from "@/hooks/useReels";

interface SortingDropdownProps {
  sortField: SortField;
  sortOrder: SortOrder;
  changeSorting: (field: SortField, order: SortOrder) => void;
}

export function SortingDropdown({ sortField, sortOrder, changeSorting }: SortingDropdownProps) {
  const t = useTranslations("dashboard.sorting");

  const options: Array<{ field: SortField; label: string }> = [
    { field: "date", label: t("date") },
    { field: "visits", label: t("visits") }
  ];

  const current = options.find(o => o.field === sortField);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="relative !z-[9999] flex items-center space-x-1">
          <AdjustmentsHorizontalIcon className="w-5 h-5" />
          <span>{current?.label || t("label")}</span>
          <ChevronDownIcon className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={4} className="!z-[9999]">
        <DropdownMenuLabel>{t("label")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt.field}
            onSelect={() => changeSorting(opt.field, sortOrder)}
            className={`cursor-pointer ${sortField === opt.field ? 'font-semibold' : ''}`}
          >
            {sortField === opt.field && (
              <Check className="mr-2 h-4 w-4" />
            )}
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 