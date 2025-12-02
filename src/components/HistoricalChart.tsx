import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { HistoricalWeatherData } from "@/lib/weather-api";
import { fetchHistoricalWeather } from "@/lib/weather-api";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MetricSelector, AVAILABLE_METRICS } from "./MetricSelector";
import { DateRangePicker } from "./DateRangePicker";
import { CitySelector, type SelectedCity } from "./CitySelector";
import { useToast } from "@/hooks/use-toast";

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
];

interface HistoricalChartProps {
  initialLocation: { name: string; lat: number; lon: number };
}

export const HistoricalChart = ({ initialLocation }: HistoricalChartProps) => {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(["temp", "humidity", "precipitation"]);
  const [visibleMetrics, setVisibleMetrics] = useState<{ [key: string]: boolean }>({
    temp: true,
    humidity: true,
    precipitation: true,
  });
  const [startDate, setStartDate] = useState<Date>(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [selectedCities, setSelectedCities] = useState<SelectedCity[]>([
    { ...initialLocation, color: CHART_COLORS[0] }
  ]);
  const [cityData, setCityData] = useState<Map<string, HistoricalWeatherData[]>>(new Map());
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const newData = new Map<string, HistoricalWeatherData[]>();
      
      try {
        for (const city of selectedCities) {
          const data = await fetchHistoricalWeather(city.lat, city.lon, startDate, endDate);
          newData.set(city.name, data);
        }
        setCityData(newData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch historical weather data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCities, startDate, endDate, toast]);

  const toggleMetric = (metricId: string) => {
    setVisibleMetrics(prev => ({ ...prev, [metricId]: !prev[metricId] }));
  };

  const handleMetricsChange = (newMetrics: string[]) => {
    setSelectedMetrics(newMetrics);
    const newVisible: { [key: string]: boolean } = {};
    newMetrics.forEach(id => {
      newVisible[id] = visibleMetrics[id] !== undefined ? visibleMetrics[id] : true;
    });
    setVisibleMetrics(newVisible);
  };

  const handleDateChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  // Combine data from all cities
  const combinedData = (() => {
    if (cityData.size === 0) return [];
    
    const allDates = new Set<string>();
    cityData.forEach(data => {
      data.forEach(d => allDates.add(d.date));
    });
    
    return Array.from(allDates).sort().map(date => {
      const dataPoint: any = { date };
      selectedCities.forEach(city => {
        const cityDataPoints = cityData.get(city.name);
        const point = cityDataPoints?.find(d => d.date === date);
        if (point) {
          dataPoint[`${city.name}_temperature`] = point.temperature;
          dataPoint[`${city.name}_humidity`] = point.humidity;
          dataPoint[`${city.name}_precipitation`] = point.precipitation;
        }
      });
      return dataPoint;
    });
  })();

  if (loading) {
    return (
      <Card className="p-6 bg-card animate-fade-in">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-[400px] w-full" />
      </Card>
    );
  }

  const stats = combinedData.length > 0 && cityData.size > 0 ? (() => {
    const firstCityData = Array.from(cityData.values())[0];
    return {
      avgTemp: (firstCityData.reduce((sum, d) => sum + d.temperature, 0) / firstCityData.length).toFixed(1),
      totalPrecip: firstCityData.reduce((sum, d) => sum + d.precipitation, 0).toFixed(1),
      avgHumidity: (firstCityData.reduce((sum, d) => sum + d.humidity, 0) / firstCityData.length).toFixed(0),
    };
  })() : null;

  return (
    <div className="space-y-4">
      <MetricSelector
        selectedMetrics={selectedMetrics}
        onMetricsChange={handleMetricsChange}
      />
      
      <Card className="p-6 bg-card animate-fade-in border-2 border-border/50">
        <div className="space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Historical Weather Trends</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedCities.length} {selectedCities.length === 1 ? 'location' : 'locations'} • {combinedData.length} days
                </p>
              </div>
            </div>
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onDateChange={handleDateChange}
            />
          </div>

          <CitySelector
            selectedCities={selectedCities}
            onCitiesChange={setSelectedCities}
          />
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gradient-to-br from-muted/50 to-muted/30 p-4 rounded-lg border border-border/30">
              <div className="text-xs text-muted-foreground mb-1">Avg Temperature</div>
              <div className="text-2xl font-bold text-chart-1">{stats.avgTemp}°C</div>
            </div>
            <div className="bg-gradient-to-br from-muted/50 to-muted/30 p-4 rounded-lg border border-border/30">
              <div className="text-xs text-muted-foreground mb-1">Avg Humidity</div>
              <div className="text-2xl font-bold text-chart-2">{stats.avgHumidity}%</div>
            </div>
            <div className="bg-gradient-to-br from-muted/50 to-muted/30 p-4 rounded-lg border border-border/30">
              <div className="text-xs text-muted-foreground mb-1">Total Precipitation</div>
              <div className="text-2xl font-bold text-chart-3">{stats.totalPrecip} mm</div>
            </div>
          </div>
        )}

        {/* Metric Toggle Buttons */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {selectedMetrics.map((metricId, index) => {
            const metric = AVAILABLE_METRICS.find(m => m.id === metricId);
            if (!metric) return null;
            const color = CHART_COLORS[index % CHART_COLORS.length];
            return (
              <Button
                key={metricId}
                variant={visibleMetrics[metricId] ? "default" : "outline"}
                size="sm"
                onClick={() => toggleMetric(metricId)}
                className="text-xs"
              >
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: color }}
                />
                {metric.label}
              </Button>
            );
          })}
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={combinedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '11px' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '11px' }}
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
                fontSize: '11px',
              }}
            />
            {selectedCities.map((city) => 
              selectedMetrics.map((metricId) => {
                const metric = AVAILABLE_METRICS.find(m => m.id === metricId);
                if (!metric || !visibleMetrics[metricId]) return null;
                
                const dataKey = metricId === "temp" 
                  ? `${city.name}_temperature` 
                  : metricId === "precipitation" 
                    ? `${city.name}_precipitation` 
                    : `${city.name}_humidity`;
                
                return (
                  <Line
                    key={`${city.name}-${metricId}`}
                    type="monotone"
                    dataKey={dataKey}
                    stroke={city.color}
                    strokeWidth={2.5}
                    name={`${city.name} - ${metric.label} (${metric.unit})`}
                    dot={{ fill: city.color, r: 3 }}
                    activeDot={{ r: 5 }}
                    animationDuration={800}
                    connectNulls
                  />
                );
              })
            )}
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};
