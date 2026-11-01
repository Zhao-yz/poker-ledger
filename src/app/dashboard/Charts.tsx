"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney } from "@/lib/sessions";
import type { DashboardStats } from "@/lib/stats";

// Chart colors validated for dark mode and color-vision deficiency (dataviz validator, surface #141a17):
// gains blue, losses red. Text keeps its +/− sign so polarity never relies on color alone.
const GAIN = "#3987e5";
const LOSS = "#e5534b";
const GRID = "#26302b";
const AXIS = "#8a978f";

// Always keep $0 on the axis so a losing month reads as below zero, even with one data point.
const withZero: [(min: number) => number, (max: number) => number] = [
  (min) => Math.min(0, min),
  (max) => Math.max(0, max),
];

const tooltipStyle = {
  background: "#0b0f0d",
  border: "1px solid #26302b",
  borderRadius: 8,
  color: "#e8ece9",
  fontSize: 12,
};

export function CumulativeChart({ data }: { data: DashboardStats["cumulative"] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 4 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="date" tick={{ fill: AXIS, fontSize: 11 }} tickLine={false} axisLine={{ stroke: GRID }} minTickGap={40} />
        <YAxis
          tick={{ fill: AXIS, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={64}
          domain={withZero}
          tickFormatter={(v: number) => formatMoney(v)}
        />
        <ReferenceLine y={0} stroke={AXIS} strokeDasharray="3 3" />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ stroke: AXIS, strokeWidth: 1 }}
          formatter={(value, name) => [formatMoney(Number(value)), name === "cumulative" ? "Running total" : name]}
          labelFormatter={(label, payload) => {
            const p = payload?.[0]?.payload as { net: number } | undefined;
            return p ? `${label} · session ${formatMoney(p.net)}` : String(label);
          }}
        />
        <Line type="monotone" dataKey="cumulative" stroke={GAIN} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function MonthlyChart({ data }: { data: DashboardStats["byMonth"] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 4 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="month" tick={{ fill: AXIS, fontSize: 11 }} tickLine={false} axisLine={{ stroke: GRID }} />
        <YAxis
          tick={{ fill: AXIS, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={64}
          domain={withZero}
          tickFormatter={(v: number) => formatMoney(v)}
        />
        <ReferenceLine y={0} stroke={AXIS} />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
          formatter={(value, _name, item) => {
            const hours = (item?.payload as { hours: number } | undefined)?.hours ?? 0;
            return [`${formatMoney(Number(value))} over ${hours.toFixed(1)}h`, "Net"];
          }}
        />
        <Bar dataKey="net" radius={[4, 4, 4, 4]} maxBarSize={36}>
          {data.map((m) => (
            <Cell key={m.month} fill={m.net >= 0 ? GAIN : LOSS} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
