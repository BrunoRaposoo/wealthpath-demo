"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProjectionPoint } from "@/types";

interface ProjectionChartProps {
  data: ProjectionPoint[];
  comparisonData?: ProjectionPoint[];
  isAnimating?: boolean;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ProjectionChart({
  data,
  comparisonData,
  isAnimating = true,
}: ProjectionChartProps) {
  return (
    <Card className="border-border bg-card shadow-[0_1px_3px_rgba(11,43,38,.06),0_12px_32px_-12px_rgba(11,43,38,.12)]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-bold">
          Evolução do Património Líquido
        </CardTitle>
        <div className="flex gap-4 text-[13px] font-semibold text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-[3px] bg-[#0f9d76]" />
            Atual
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-[3px] bg-[#1868e0]" />
            Base
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f1" />
              <XAxis
                dataKey="age"
                label={{
                  value: "Idade",
                  position: "insideBottom",
                  offset: -5,
                }}
                tick={{ fontSize: 12, fill: "#5b6d69" }}
              />
              <YAxis
                tickFormatter={(v) => formatCurrency(v)}
                label={{
                  value: "Património (€)",
                  angle: -90,
                  position: "insideLeft",
                }}
                tick={{ fontSize: 12, fill: "#5b6d69" }}
              />
              <Tooltip
                formatter={(value) => [
                  formatCurrency(Number(value)),
                  "Património",
                ]}
                labelFormatter={(label) => `Idade: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="netWorth"
                stroke="#0f9d76"
                strokeWidth={3}
                dot={false}
                fill="rgba(15,157,118,0.12)"
                isAnimationActive={isAnimating}
                name="Atual"
              />
              {comparisonData && (
                <Line
                  type="monotone"
                  data={comparisonData}
                  dataKey="netWorth"
                  stroke="#1868e0"
                  strokeWidth={2}
                  strokeDasharray="6 5"
                  dot={false}
                  isAnimationActive={isAnimating}
                  name="Base"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
