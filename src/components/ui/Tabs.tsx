"use client";
import { cn } from "@/lib/utils";

interface TabsProps {
  tabs: { value: string; label: string; count?: number }[];
  active: string;
  onChange: (value: string) => void;
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <>
      <div className="md:hidden">
        <select
          value={active}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-lg border border-line bg-white text-sm font-medium text-ink outline-none focus:border-brand"
        >
          {tabs.map((tab) => (
            <option key={tab.value} value={tab.value}>
              {tab.label}
              {typeof tab.count === "number" ? ` (${tab.count})` : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="hidden md:flex gap-1 overflow-x-auto no-scrollbar border-b border-line">
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
    </>
  );
}
