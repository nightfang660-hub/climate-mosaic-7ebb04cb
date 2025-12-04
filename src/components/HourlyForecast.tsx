import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { HourlyForecastData } from "@/lib/weather-api";
import { getWeatherIcon } from "@/lib/weather-icons";
import { Clock, Droplets, Wind } from "lucide-react";

interface HourlyForecastProps {
  data: HourlyForecastData[];
  loading: boolean;
}

export const HourlyForecast = ({ data, loading }: HourlyForecastProps) => {
  if (loading) {
    return (
      <Card className="p-6 md:p-8 bg-card/80 backdrop-blur-xl border-border/50">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-muted rounded-xl"></div>
            <div className="h-8 w-48 bg-muted rounded-lg"></div>
          </div>
          <div className="flex gap-4 overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-24 h-36 bg-muted rounded-2xl"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-6 md:p-8 bg-card/80 backdrop-blur-xl border-border/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-primary/10 rounded-xl">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold">24-Hour Forecast</h2>
        </div>
        <p className="text-muted-foreground text-center py-8">No hourly forecast data available</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 md:p-8 bg-card/80 backdrop-blur-xl border-border/50 animate-fade-in relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="p-2.5 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl border border-primary/20">
          <Clock className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">24-Hour Forecast</h2>
          <p className="text-sm text-muted-foreground">Hourly weather updates</p>
        </div>
      </div>
      
      <ScrollArea className="w-full relative z-10">
        <div className="flex gap-3 pb-4">
          {data.map((hour, index) => {
            const WeatherIcon = getWeatherIcon(hour.weatherCode);
            const isNow = hour.time === 'Now';
            
            return (
              <div
                key={index}
                className={`flex-shrink-0 p-4 rounded-2xl transition-all duration-300 min-w-[100px] ${
                  isNow 
                    ? 'bg-gradient-to-b from-primary/20 to-primary/5 border-2 border-primary/40 shadow-lg' 
                    : 'bg-muted/30 border border-border/30 hover:bg-muted/50 hover:border-border/50'
                }`}
              >
                {/* Time */}
                <div className="text-center mb-3">
                  {isNow ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/20 rounded-full">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                      </span>
                      <span className="text-xs font-bold text-primary">NOW</span>
                    </span>
                  ) : (
                    <span className="text-sm font-medium text-muted-foreground">{hour.time}</span>
                  )}
                </div>
                
                {/* Weather Icon */}
                <div className={`flex justify-center mb-3 ${isNow ? 'scale-110' : ''}`}>
                  <div className={`p-2 rounded-xl ${isNow ? 'bg-primary/10' : 'bg-muted/50'}`}>
                    <WeatherIcon className={`w-7 h-7 ${isNow ? 'text-primary' : 'text-foreground/80'}`} />
                  </div>
                </div>
                
                {/* Temperature */}
                <p className={`text-center text-xl font-bold mb-3 ${isNow ? 'text-primary' : 'text-foreground'}`}>
                  {Math.round(hour.temperature)}°
                </p>
                
                {/* Details */}
                <div className="space-y-2 pt-2 border-t border-border/30">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                    <Droplets className="w-3 h-3 text-blue-400" />
                    <span>{hour.precipitation.toFixed(1)}mm</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                    <Wind className="w-3 h-3 text-cyan-400" />
                    <span>{hour.windSpeed.toFixed(0)}km/h</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="mt-2" />
      </ScrollArea>
    </Card>
  );
};