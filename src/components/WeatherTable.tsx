import { Card } from "@/components/ui/card";
import { getWeatherIcon, getWeatherDescription, getUVLevel } from "@/lib/weather-icons";
import { Sunrise, Sunset, Eye, Thermometer, Droplets, Wind, Gauge, CloudRain, Cloud } from "lucide-react";

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  rainfall: number;
  cloudCover: number;
  feelsLike: number;
  uvIndex: number;
  visibility: number;
  sunrise: string;
  sunset: string;
  weatherCode: number;
}

interface WeatherTableProps {
  data: WeatherData | null;
  loading: boolean;
}

export const WeatherTable = ({ data, loading }: WeatherTableProps) => {
  if (loading) {
    return (
      <Card className="p-8 bg-card/80 backdrop-blur-xl border-border/50">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-6">
            <div className="h-28 w-28 bg-muted rounded-2xl"></div>
            <div className="space-y-3">
              <div className="h-16 w-48 bg-muted rounded-xl"></div>
              <div className="h-5 w-32 bg-muted rounded-lg"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="p-8 bg-card/80 backdrop-blur-xl border-border/50">
        <p className="text-muted-foreground text-center">No weather data available</p>
      </Card>
    );
  }

  const WeatherIcon = getWeatherIcon(data.weatherCode);
  const weatherDesc = getWeatherDescription(data.weatherCode);
  const uvLevel = getUVLevel(data.uvIndex);
  
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const metrics = [
    { 
      icon: Droplets, 
      label: 'Humidity', 
      value: data.humidity, 
      unit: '%',
      color: 'text-blue-400'
    },
    { 
      icon: Wind, 
      label: 'Wind', 
      value: data.windSpeed.toFixed(1), 
      unit: 'km/h',
      color: 'text-cyan-400'
    },
    { 
      icon: Gauge, 
      label: 'Pressure', 
      value: Math.round(data.pressure), 
      unit: 'hPa',
      color: 'text-purple-400'
    },
    { 
      icon: CloudRain, 
      label: 'Rainfall', 
      value: data.rainfall.toFixed(1), 
      unit: 'mm',
      color: 'text-indigo-400'
    },
    { 
      icon: Cloud, 
      label: 'Cloud Cover', 
      value: Math.round(data.cloudCover), 
      unit: '%',
      color: 'text-slate-400'
    },
    { 
      icon: Eye, 
      label: 'Visibility', 
      value: data.visibility.toFixed(1), 
      unit: 'km',
      color: 'text-emerald-400'
    },
  ];

  return (
    <Card className="p-6 md:p-8 bg-card/80 backdrop-blur-xl border-border/50 space-y-8 animate-fade-in overflow-hidden relative">
      {/* Subtle glow effect */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl" />
            <div className="relative p-4 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl border border-primary/20">
              <WeatherIcon className="w-12 h-12 text-primary" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-muted-foreground mb-1">Live Weather</h2>
            <p className="text-lg text-foreground/80 capitalize">{weatherDesc}</p>
          </div>
        </div>
        
        <div className="flex items-end gap-1">
          <span className="text-7xl md:text-8xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent leading-none">
            {Math.round(data.temperature)}
          </span>
          <span className="text-3xl md:text-4xl font-light text-muted-foreground mb-2">°C</span>
        </div>
      </div>

      {/* Feels Like */}
      <div className="flex items-center gap-3 px-4 py-3 bg-muted/30 rounded-xl w-fit">
        <Thermometer className="w-5 h-5 text-orange-400" />
        <span className="text-muted-foreground">Feels like</span>
        <span className="font-semibold text-foreground">{data.feelsLike.toFixed(1)}°C</span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 stagger-children">
        {metrics.map((metric, index) => (
          <div 
            key={metric.label}
            className="metric-card group"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-center gap-2 mb-3">
              <metric.icon className={`w-4 h-4 ${metric.color} transition-transform group-hover:scale-110`} />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">{metric.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {metric.value}
              <span className="text-sm font-normal text-muted-foreground ml-1">{metric.unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* UV Index & Sun Times */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="metric-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">UV Index</span>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              uvLevel.level === 'Low' ? 'bg-green-500/20 text-green-400' :
              uvLevel.level === 'Moderate' ? 'bg-yellow-500/20 text-yellow-400' :
              uvLevel.level === 'High' ? 'bg-orange-500/20 text-orange-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {uvLevel.level}
            </span>
          </div>
          <p className="text-3xl font-bold text-foreground">{data.uvIndex.toFixed(1)}</p>
        </div>

        <div className="metric-card">
          <div className="flex items-center gap-2 mb-2">
            <Sunrise className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Sunrise</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatTime(data.sunrise)}</p>
        </div>

        <div className="metric-card">
          <div className="flex items-center gap-2 mb-2">
            <Sunset className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Sunset</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatTime(data.sunset)}</p>
        </div>
      </div>
    </Card>
  );
};