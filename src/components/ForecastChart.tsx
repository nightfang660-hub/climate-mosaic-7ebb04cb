import { Card } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart } from "recharts";
import { TrendingUp, Droplets } from "lucide-react";

interface ForecastData {
  date: string;
  temperature: number;
  rainfall: number;
}

interface ForecastChartProps {
  data: ForecastData[];
  loading: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover/95 backdrop-blur-md border border-border rounded-xl shadow-xl p-4 min-w-[140px]">
        <p className="text-sm font-medium text-foreground mb-3">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 text-sm">
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium" style={{ color: entry.color }}>
              {entry.value.toFixed(1)}{entry.name.includes('Temp') ? '°C' : 'mm'}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const ForecastChart = ({ data, loading }: ForecastChartProps) => {
  if (loading) {
    return (
      <Card className="p-6 md:p-8 bg-card/80 backdrop-blur-xl border-border/50">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-muted rounded-xl"></div>
            <div className="h-8 w-48 bg-muted rounded-lg"></div>
          </div>
          <div className="h-72 bg-muted rounded-xl shimmer"></div>
        </div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-6 md:p-8 bg-card/80 backdrop-blur-xl border-border/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-primary/10 rounded-xl">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">7-Day Forecast</h2>
        </div>
        <p className="text-muted-foreground text-center py-12">No forecast data available</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 md:p-8 bg-card/80 backdrop-blur-xl border-border/50 animate-fade-in relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl border border-primary/20">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">7-Day Forecast</h2>
            <p className="text-sm text-muted-foreground">Temperature & precipitation trends</p>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />
            <span className="text-sm text-muted-foreground">Temperature</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500" />
            <span className="text-sm text-muted-foreground">Rainfall</span>
          </div>
        </div>
      </div>
      
      <div className="relative z-10">
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(190, 100%, 50%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(190, 100%, 50%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(250, 100%, 65%)" stopOpacity={0.8} />
                <stop offset="100%" stopColor="hsl(250, 100%, 65%)" stopOpacity={0.4} />
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))" 
              opacity={0.5}
              vertical={false}
            />
            
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            
            <YAxis 
              yAxisId="left"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}°`}
              width={40}
            />
            
            <YAxis 
              yAxisId="right" 
              orientation="right"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}mm`}
              width={50}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Bar 
              yAxisId="right" 
              dataKey="rainfall" 
              fill="url(#rainGradient)" 
              name="Rainfall"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="temperature"
              stroke="hsl(190, 100%, 50%)"
              fill="url(#tempGradient)"
              strokeWidth={0}
            />
            
            <Line 
              yAxisId="left" 
              type="monotone" 
              dataKey="temperature" 
              stroke="hsl(190, 100%, 50%)"
              strokeWidth={3}
              dot={{ fill: 'hsl(190, 100%, 50%)', strokeWidth: 0, r: 5 }}
              activeDot={{ r: 8, stroke: 'hsl(var(--background))', strokeWidth: 2 }}
              name="Temperature"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};