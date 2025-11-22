import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Wind, Loader2, AlertTriangle } from "lucide-react";
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
  if (aqi <= 50) return { label: "Good", color: "bg-green-500", textColor: "text-green-500", advice: "Air quality is satisfactory" };
  if (aqi <= 100) return { label: "Moderate", color: "bg-yellow-500", textColor: "text-yellow-500", advice: "Acceptable for most people" };
  if (aqi <= 150) return { label: "Unhealthy for Sensitive Groups", color: "bg-orange-500", textColor: "text-orange-500", advice: "Sensitive groups should limit outdoor activities" };
  if (aqi <= 200) return { label: "Unhealthy", color: "bg-red-500", textColor: "text-red-500", advice: "Everyone may experience health effects" };
  if (aqi <= 300) return { label: "Very Unhealthy", color: "bg-purple-500", textColor: "text-purple-500", advice: "Health alert: everyone may experience serious effects" };
  return { label: "Hazardous", color: "bg-red-900", textColor: "text-red-900", advice: "Health warning: emergency conditions" };
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
      <Card className="p-6 bg-card animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <Wind className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-semibold">Air Quality Index</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <AlertTriangle className="w-12 h-12 mb-2 text-orange-500" />
          <p>No air quality data available for this location</p>
        </div>
      </Card>
    );
  }

  const aqiLevel = getAQILevel(aqiData.aqi);

  return (
    <Card className="p-6 bg-card animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <Wind className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-semibold">Air Quality Index</h3>
      </div>

      {/* AQI Display */}
      <div className="text-center mb-6 p-6 bg-muted/50 rounded-lg">
        <div className={`text-6xl font-bold mb-2 ${aqiLevel.textColor}`}>
          {aqiData.aqi}
        </div>
        <Badge className={`${aqiLevel.color} text-white mb-2`}>
          {aqiLevel.label}
        </Badge>
        <p className="text-sm text-muted-foreground mt-2">
          {aqiLevel.advice}
        </p>
      </div>

      {/* Pollutant Details */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-muted/30 p-3 rounded-lg">
          <div className="text-xs text-muted-foreground mb-1">PM2.5</div>
          <div className="text-lg font-semibold">{aqiData.pm25.toFixed(1)} µg/m³</div>
        </div>
        <div className="bg-muted/30 p-3 rounded-lg">
          <div className="text-xs text-muted-foreground mb-1">PM10</div>
          <div className="text-lg font-semibold">{aqiData.pm10.toFixed(1)} µg/m³</div>
        </div>
        <div className="bg-muted/30 p-3 rounded-lg">
          <div className="text-xs text-muted-foreground mb-1">CO</div>
          <div className="text-lg font-semibold">{aqiData.co.toFixed(1)} ppm</div>
        </div>
        <div className="bg-muted/30 p-3 rounded-lg">
          <div className="text-xs text-muted-foreground mb-1">NO₂</div>
          <div className="text-lg font-semibold">{aqiData.no2.toFixed(1)} ppb</div>
        </div>
        <div className="bg-muted/30 p-3 rounded-lg">
          <div className="text-xs text-muted-foreground mb-1">O₃</div>
          <div className="text-lg font-semibold">{aqiData.o3.toFixed(1)} ppb</div>
        </div>
      </div>

      {/* Station Info */}
      <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground text-center">
        Data from {aqiData.city}, {aqiData.country}
      </div>
    </Card>
  );
};
