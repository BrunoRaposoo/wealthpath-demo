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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <Card>
      <CardHeader>
        <CardTitle>Evolução do Património Líquido</CardTitle>
        <CardDescription>
          Projeção desde a idade atual até aos 95 anos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="age"
                label={{ value: "Idade", position: "insideBottom", offset: -5 }}
              />
              <YAxis
                tickFormatter={(v) => formatCurrency(v)}
                label={{
                  value: "Património (€)",
                  angle: -90,
                  position: "insideLeft",
                }}
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
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                isAnimationActive={isAnimating}
                name="Cenário Atual"
              />
              {comparisonData && (
                <Line
                  type="monotone"
                  data={comparisonData}
                  dataKey="netWorth"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  isAnimationActive={isAnimating}
                  name="Cenário Base"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
