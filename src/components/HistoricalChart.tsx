import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { HistoricalWeatherData } from "@/lib/weather-api";
import { Skeleton } from "@/components/ui/skeleton";

interface HistoricalChartProps {
  data: HistoricalWeatherData[];
  loading?: boolean;
}

export const HistoricalChart = ({ data, loading }: HistoricalChartProps) => {
  if (loading) {
    return (
      <Card className="p-6 bg-card">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-[300px] w-full" />
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card">
      <h3 className="text-xl font-semibold mb-4">Historical Weather Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="date" 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              color: "hsl(var(--foreground))",
            }}
          />
          <Legend 
            wrapperStyle={{
              color: "hsl(var(--foreground))",
            }}
          />
          <Line
            type="monotone"
            dataKey="temperature"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            name="Temperature (°C)"
            dot={{ fill: "hsl(var(--chart-1))" }}
          />
          <Line
            type="monotone"
            dataKey="humidity"
            stroke="hsl(var(--chart-2))"
            strokeWidth={2}
            name="Humidity (%)"
            dot={{ fill: "hsl(var(--chart-2))" }}
          />
          <Line
            type="monotone"
            dataKey="precipitation"
            stroke="hsl(var(--chart-3))"
            strokeWidth={2}
            name="Precipitation (mm)"
            dot={{ fill: "hsl(var(--chart-3))" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};
