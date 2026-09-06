"use client";
import { cn } from "@/lib/utils";

interface TabsProps {
  tabs: { value: string; label: string; count?: number }[];
  active: string;
  onChange: (value: string) => void;
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="max-w-xs">
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
  );
}
