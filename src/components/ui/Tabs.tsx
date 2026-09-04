"use client";

import { cn } from "@/lib/utils";

interface TabsProps {
  tabs: { value: string; label: string; count?: number }[];
  active: string;
  onChange: (value: string) => void;
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 overflow-x-auto no-scrollbar border-b border-line">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            "shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
            active === tab.value
              ? "border-brand text-brand"
              : "border-transparent text-muted hover:text-ink"
          )}
        >
          {tab.label}
          {typeof tab.count === "number" && (
            <span className="ml-1.5 text-xs text-muted">{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}
