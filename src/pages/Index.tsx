import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { SearchBox } from "@/components/SearchBox";
import { WeatherMap } from "@/components/WeatherMap";
import { WeatherTable } from "@/components/WeatherTable";
import { ForecastChart } from "@/components/ForecastChart";
import { HourlyForecast } from "@/components/HourlyForecast";
import { SavedLocations } from "@/components/SavedLocations";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  fetchWeatherData,
  fetchForecastData,
  fetchHourlyForecast,
  geocodeCity,
  getUserLocation,
  type WeatherData,
  type ForecastData,
  type HourlyForecastData,
} from "@/lib/weather-api";
import { Menu, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [activeView, setActiveView] = useState<"forecast" | "map" | "climate">("forecast");
  const [location, setLocation] = useState<{ lat: number; lon: number }>({
    lat: 17.385,
    lon: 78.4867,
  });
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [hourlyData, setHourlyData] = useState<HourlyForecastData[]>([]);
  const [locationName, setLocationName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();

  // Fetch weather data when location changes
  useEffect(() => {
    const loadWeatherData = async () => {
      setLoading(true);
      try {
        const [weather, forecast, hourly] = await Promise.all([
          fetchWeatherData(location.lat, location.lon),
          fetchForecastData(location.lat, location.lon),
          fetchHourlyForecast(location.lat, location.lon),
        ]);
        setWeatherData(weather);
        setForecastData(forecast);
        setHourlyData(hourly);
        
        // Reverse geocode to get location name
        const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?latitude=${location.lat}&longitude=${location.lon}&count=1`;
        const geocodeResponse = await fetch(geocodeUrl);
        if (geocodeResponse.ok) {
          const geocodeData = await geocodeResponse.json();
          if (geocodeData.results && geocodeData.results.length > 0) {
            const result = geocodeData.results[0];
            setLocationName(`${result.name}, ${result.country}`);
          }
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch weather data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadWeatherData();
  }, [location, toast]);

  // Try to get user's location on mount
  useEffect(() => {
    getUserLocation()
      .then((loc) => {
        setLocation(loc);
        toast({
          title: "Location detected",
          description: "Showing weather for your current location",
        });
      })
      .catch(() => {
        // Silently fail and use default location (Hyderabad)
      });
  }, [toast]);

  const handleSearch = async (cityName: string) => {
    try {
      const result = await geocodeCity(cityName);
      if (result) {
        setLocation({ lat: result.latitude, lon: result.longitude });
        setLocationName(`${result.name}, ${result.country}`);
        toast({
          title: "Location updated",
          description: `Showing weather for ${result.name}, ${result.country}`,
        });
      } else {
        toast({
          title: "City not found",
          description: "Please try a different city name.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Failed to search for city. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMapClick = (lat: number, lon: number) => {
    setLocation({ lat, lon });
    toast({
      title: "Location updated",
      description: `Coordinates: ${lat.toFixed(4)}, ${lon.toFixed(4)}`,
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Menu className="w-6 h-6" />
      </Button>

      {/* Sidebar */}
      <div className={`${sidebarOpen ? "block" : "hidden"} md:block fixed md:relative inset-0 z-40 md:z-0`}>
        <Sidebar activeView={activeView} onViewChange={(view) => {
          setActiveView(view);
          setSidebarOpen(false);
        }} />
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 space-y-6 overflow-auto">
        {/* Header with Location and Search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-2xl font-bold">{locationName || "Loading location..."}</h2>
              <p className="text-sm text-muted-foreground">
                {location.lat.toFixed(4)}°, {location.lon.toFixed(4)}°
              </p>
            </div>
          </div>
          <div className="max-w-md w-full md:w-auto">
            <SearchBox onSearch={handleSearch} />
          </div>
        </div>

        {/* Forecast View */}
        {activeView === "forecast" && (
          <>
            <WeatherTable data={weatherData} loading={loading} />
            <HourlyForecast data={hourlyData} loading={loading} />
            <ForecastChart data={forecastData} loading={loading} />
            <SavedLocations 
              currentLocation={location} 
              onLocationSelect={(lat, lon) => setLocation({ lat, lon })}
              currentLocationName={locationName}
            />
          </>
        )}

        {/* Map View */}
        {activeView === "map" && (
          <Card className="h-[calc(100vh-12rem)] bg-card p-4">
            <WeatherMap
              center={[location.lat, location.lon]}
              onMapClick={handleMapClick}
            />
          </Card>
        )}

        {/* Climate Info */}
        {activeView === "climate" && (
          <Card className="p-6 bg-card space-y-6">
            <h2 className="text-2xl font-bold">Climate Information</h2>
            
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Current Location
              </h3>
              <div className="space-y-2">
                <p className="text-lg font-medium">{locationName || "Unknown location"}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Latitude:</span>
                    <span className="ml-2 font-mono">{location.lat.toFixed(6)}°</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Longitude:</span>
                    <span className="ml-2 font-mono">{location.lon.toFixed(6)}°</span>
                  </div>
                </div>
              </div>
            </div>

            {weatherData && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Current Conditions Summary</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3">Metric</th>
                        <th className="text-right py-2 px-3">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 text-muted-foreground">Temperature</td>
                        <td className="py-2 px-3 text-right font-medium">{weatherData.temperature.toFixed(1)}°C</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 text-muted-foreground">Feels Like</td>
                        <td className="py-2 px-3 text-right font-medium">{weatherData.feelsLike.toFixed(1)}°C</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 text-muted-foreground">Humidity</td>
                        <td className="py-2 px-3 text-right font-medium">{weatherData.humidity}%</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 text-muted-foreground">Wind Speed</td>
                        <td className="py-2 px-3 text-right font-medium">{weatherData.windSpeed.toFixed(1)} km/h</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 text-muted-foreground">Pressure</td>
                        <td className="py-2 px-3 text-right font-medium">{weatherData.pressure.toFixed(0)} hPa</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 text-muted-foreground">UV Index</td>
                        <td className="py-2 px-3 text-right font-medium">{weatherData.uvIndex.toFixed(1)}</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 text-muted-foreground">Visibility</td>
                        <td className="py-2 px-3 text-right font-medium">{weatherData.visibility.toFixed(1)} km</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 text-muted-foreground">Cloud Cover</td>
                        <td className="py-2 px-3 text-right font-medium">{weatherData.cloudCover}%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Data Sources</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Weather Data</h4>
                  <p className="text-sm text-muted-foreground">Open-Meteo API</p>
                  <p className="text-xs text-muted-foreground mt-1">Real-time weather & forecasts</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Map Tiles</h4>
                  <p className="text-sm text-muted-foreground">OpenStreetMap</p>
                  <p className="text-xs text-muted-foreground mt-1">Interactive map display</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Geolocation</h4>
                  <p className="text-sm text-muted-foreground">Browser API</p>
                  <p className="text-xs text-muted-foreground mt-1">Auto-detect your location</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Geocoding</h4>
                  <p className="text-sm text-muted-foreground">Open-Meteo Geocoding</p>
                  <p className="text-xs text-muted-foreground mt-1">City name to coordinates</p>
                </div>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Index;
