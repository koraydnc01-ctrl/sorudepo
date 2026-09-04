"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function TopicBarChart({ data }: { data: { topic: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 42)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E1DCCE" horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#716B5E" }} />
        <YAxis
          type="category"
          dataKey="topic"
          width={150}
          tick={{ fontSize: 12, fill: "#23262B" }}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #E1DCCE",
            fontSize: 13,
          }}
        />
        <Bar dataKey="count" fill="#2F4D74" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
