import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { HourlyForecastData } from "@/lib/weather-api";
import { getWeatherIcon } from "@/lib/weather-icons";
import { Droplets, Wind } from "lucide-react";

interface HourlyForecastProps {
  data: HourlyForecastData[];
  loading: boolean;
}

export const HourlyForecast = ({ data, loading }: HourlyForecastProps) => {
  if (loading) {
    return (
      <Card className="p-6 bg-card">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 bg-muted rounded"></div>
          <div className="flex gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 w-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-6 bg-card">
        <p className="text-muted-foreground text-center">No hourly forecast data available</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">24-Hour Forecast</h2>
        <span className="text-sm text-muted-foreground">Starting from now</span>
      </div>
      
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-3 pb-4">
          {data.map((hour, index) => {
            const WeatherIcon = getWeatherIcon(hour.weatherCode);
            const isNow = hour.time === 'Now';
            
            return (
              <div
                key={index}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl min-w-[100px] transition-all ${
                  isNow 
                    ? 'bg-primary/20 border-2 border-primary ring-2 ring-primary/20' 
                    : 'bg-muted/50 hover:bg-muted/70'
                }`}
              >
                <span className={`text-sm font-semibold ${isNow ? 'text-primary' : ''}`}>
                  {hour.time}
                </span>
                <WeatherIcon className={`w-8 h-8 ${isNow ? 'text-primary' : 'text-primary/70'}`} />
                <span className={`text-2xl font-bold ${isNow ? 'text-primary' : ''}`}>
                  {hour.temperature.toFixed(0)}°
                </span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Droplets className="w-3 h-3" />
                  <span>{hour.precipitation.toFixed(1)}mm</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Wind className="w-3 h-3" />
                  <span>{hour.windSpeed.toFixed(0)}km/h</span>
                </div>
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </Card>
  );
};
