import React from "react";
import { Button } from "./button";
import { useTranslations } from "next-intl";
import { EyeOff, ChevronDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem
} from "./dropdown-menu";

interface ReelsFilters {
  draft: boolean;
  active: boolean;
  inactive: boolean;
}
interface StoriesFilters {
  active: boolean;
  inactive: boolean;
}

type HideFiltersDropdownProps =
  | {
      mediaType: "reel";
      filters: ReelsFilters;
      onChange: (updates: Partial<ReelsFilters>) => void;
    }
  | {
      mediaType: "story";
      filters: StoriesFilters;
      onChange: (updates: Partial<StoriesFilters>) => void;
    };

export function HideFiltersDropdown({ mediaType, filters, onChange }: HideFiltersDropdownProps) {
  const t = useTranslations("dashboard.hide");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="relative flex items-center space-x-1">
          <EyeOff className="w-5 h-5" />
          <span>{t("label")}</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={4} className="!z-[99]">
        <DropdownMenuLabel>{t("label")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {mediaType === "reel" && (
          <DropdownMenuCheckboxItem
            className="cursor-pointer hover:bg-indigo-800/50 transition-colors"
            checked={(filters as ReelsFilters).draft}
            onCheckedChange={(v) => onChange({ draft: Boolean(v) })}
          >
            {t("draft")}
          </DropdownMenuCheckboxItem>
        )}
        <DropdownMenuCheckboxItem
          className="cursor-pointer hover:bg-indigo-800/50 transition-colors"
          checked={filters.active}
          onCheckedChange={(v) => onChange({ active: Boolean(v) } as any)}
        >
          {t("active")}
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          className="cursor-pointer hover:bg-indigo-800/50 transition-colors"
          checked={filters.inactive}
          onCheckedChange={(v) => onChange({ inactive: Boolean(v) } as any)}
        >
          {t("inactive")}
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 