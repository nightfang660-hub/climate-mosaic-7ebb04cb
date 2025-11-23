import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Wind, Loader2, AlertTriangle, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AQIData {
  aqi: number;
  pm25: number;
  pm10: number;
  co: number;
  no2: number;
  o3: number;
  city: string;
  country: string;
}

interface AQICardProps {
  lat: number;
  lon: number;
}

const getAQILevel = (aqi: number) => {
  if (aqi <= 50) return { label: "Good", color: "bg-emerald-500", textColor: "text-emerald-500", advice: "Air quality is satisfactory, enjoy outdoor activities" };
  if (aqi <= 100) return { label: "Moderate", color: "bg-amber-500", textColor: "text-amber-500", advice: "Air quality is acceptable for most people" };
  if (aqi <= 150) return { label: "Unhealthy for Sensitive", color: "bg-orange-500", textColor: "text-orange-500", advice: "Sensitive groups should limit prolonged outdoor activities" };
  if (aqi <= 200) return { label: "Unhealthy", color: "bg-rose-500", textColor: "text-rose-500", advice: "Everyone may experience health effects, limit outdoor exertion" };
  if (aqi <= 300) return { label: "Very Unhealthy", color: "bg-purple-500", textColor: "text-purple-500", advice: "Health alert: everyone may experience serious effects, avoid outdoor activities" };
  return { label: "Hazardous", color: "bg-red-900", textColor: "text-red-900", advice: "Health warning: emergency conditions, remain indoors" };
};

export const AQICard = ({ lat, lon }: AQICardProps) => {
  const [aqiData, setAqiData] = useState<AQIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchAQI = async () => {
      try {
        setLoading(true);
        setError(false);
        
        // OpenAQ API - get nearest station
        const response = await fetch(
          `https://api.openaq.org/v2/latest?coordinates=${lat},${lon}&radius=100000&limit=1&order_by=distance`
        );
        
        if (!response.ok) throw new Error('Failed to fetch AQI data');
        
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
          const result = data.results[0];
          const measurements = result.measurements;
          
          // Calculate simple AQI from PM2.5 (simplified calculation)
          const pm25Measurement = measurements.find((m: any) => m.parameter === 'pm25');
          const pm10Measurement = measurements.find((m: any) => m.parameter === 'pm10');
          const coMeasurement = measurements.find((m: any) => m.parameter === 'co');
          const no2Measurement = measurements.find((m: any) => m.parameter === 'no2');
          const o3Measurement = measurements.find((m: any) => m.parameter === 'o3');
          
          const pm25 = pm25Measurement?.value || 0;
          // Simplified AQI calculation based on PM2.5
          const aqi = Math.round(pm25 * 4); // Rough approximation
          
          setAqiData({
            aqi,
            pm25,
            pm10: pm10Measurement?.value || 0,
            co: coMeasurement?.value || 0,
            no2: no2Measurement?.value || 0,
            o3: o3Measurement?.value || 0,
            city: result.city,
            country: result.country,
          });
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Failed to fetch AQI:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAQI();
  }, [lat, lon]);

  if (loading) {
    return (
      <Card className="p-6 bg-card animate-fade-in">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  if (error || !aqiData) {
    return (
      <Card className="p-6 bg-card animate-fade-in border-2 border-border/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Wind className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Air Quality Index</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/30 rounded-lg">
          <AlertTriangle className="w-16 h-16 mb-3 text-amber-500" />
          <p className="text-lg font-medium">No Data Available</p>
          <p className="text-sm mt-1">Air quality monitoring station not found within 100km radius</p>
        </div>
      </Card>
    );
  }

  const aqiLevel = getAQILevel(aqiData.aqi);

  return (
    <Card className="p-6 bg-card animate-fade-in border-2 border-border/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Wind className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">Air Quality Index</h3>
          <p className="text-sm text-muted-foreground">Real-time air pollution monitoring</p>
        </div>
      </div>

      {/* AQI Display */}
      <div className="text-center mb-6 p-8 bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl border border-border/50">
        <div className={`text-7xl font-bold mb-3 ${aqiLevel.textColor} drop-shadow-lg`}>
          {aqiData.aqi}
        </div>
        <Badge className={`${aqiLevel.color} text-white mb-3 text-base px-4 py-1`}>
          {aqiLevel.label}
        </Badge>
        <p className="text-sm text-foreground/80 mt-2 max-w-md mx-auto">
          {aqiLevel.advice}
        </p>
      </div>

      {/* Pollutant Details */}
      <div>
        <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Pollutant Breakdown</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-muted/50 to-muted/30 p-4 rounded-lg border border-border/30 hover:border-border/60 transition-colors">
            <div className="text-xs text-muted-foreground mb-1 font-medium">PM2.5</div>
            <div className="text-2xl font-bold">{aqiData.pm25.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">µg/m³</div>
          </div>
          <div className="bg-gradient-to-br from-muted/50 to-muted/30 p-4 rounded-lg border border-border/30 hover:border-border/60 transition-colors">
            <div className="text-xs text-muted-foreground mb-1 font-medium">PM10</div>
            <div className="text-2xl font-bold">{aqiData.pm10.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">µg/m³</div>
          </div>
          <div className="bg-gradient-to-br from-muted/50 to-muted/30 p-4 rounded-lg border border-border/30 hover:border-border/60 transition-colors">
            <div className="text-xs text-muted-foreground mb-1 font-medium">CO</div>
            <div className="text-2xl font-bold">{aqiData.co.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">ppm</div>
          </div>
          <div className="bg-gradient-to-br from-muted/50 to-muted/30 p-4 rounded-lg border border-border/30 hover:border-border/60 transition-colors">
            <div className="text-xs text-muted-foreground mb-1 font-medium">NO₂</div>
            <div className="text-2xl font-bold">{aqiData.no2.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">ppb</div>
          </div>
          <div className="bg-gradient-to-br from-muted/50 to-muted/30 p-4 rounded-lg border border-border/30 hover:border-border/60 transition-colors">
            <div className="text-xs text-muted-foreground mb-1 font-medium">O₃</div>
            <div className="text-2xl font-bold">{aqiData.o3.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">ppb</div>
          </div>
        </div>
      </div>

      {/* Station Info */}
      <div className="mt-6 pt-4 border-t border-border flex items-center justify-center gap-2">
        <MapPin className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Monitoring station: <span className="font-medium text-foreground">{aqiData.city}, {aqiData.country}</span>
        </span>
      </div>
    </Card>
  );
};
