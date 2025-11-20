import { Card } from "@/components/ui/card";

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  rainfall: number;
  cloudCover: number;
}

interface WeatherTableProps {
  data: WeatherData | null;
  loading: boolean;
}

export const WeatherTable = ({ data, loading }: WeatherTableProps) => {
  if (loading) {
    return (
      <Card className="p-6 bg-card">
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-muted rounded"></div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="p-6 bg-card">
        <p className="text-muted-foreground text-center">No weather data available</p>
      </Card>
    );
  }

  const weatherMetrics = [
    { label: "Humidity", value: data.humidity, unit: "%" },
    { label: "Wind Speed", value: data.windSpeed.toFixed(1), unit: "km/h" },
    { label: "Pressure", value: Math.round(data.pressure), unit: "hPa" },
    { label: "Rainfall", value: data.rainfall.toFixed(1), unit: "mm" },
    { label: "Cloud cover", value: Math.round(data.cloudCover), unit: "%" },
  ];

  return (
    <Card className="p-6 bg-card space-y-6">
      <h2 className="text-3xl font-bold">Live Weather</h2>
      
      <div className="flex items-baseline gap-2">
        <span className="text-7xl font-bold">{data.temperature.toFixed(1)}</span>
        <span className="text-4xl text-muted-foreground">°C</span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Temperature</p>
          <p className="text-2xl font-semibold">{data.temperature.toFixed(1)} <span className="text-base text-muted-foreground">°C</span></p>
        </div>
        {weatherMetrics.map((metric) => (
          <div key={metric.label} className="space-y-1">
            <p className="text-sm text-muted-foreground">{metric.label}</p>
            <p className="text-2xl font-semibold">
              {metric.value} <span className="text-base text-muted-foreground">{metric.unit}</span>
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};
