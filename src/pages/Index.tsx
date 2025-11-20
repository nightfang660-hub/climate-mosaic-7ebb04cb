import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { SearchBox } from "@/components/SearchBox";
import { WeatherMap } from "@/components/WeatherMap";
import { WeatherTable } from "@/components/WeatherTable";
import { ForecastChart } from "@/components/ForecastChart";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  fetchWeatherData,
  fetchForecastData,
  geocodeCity,
  getUserLocation,
  type WeatherData,
  type ForecastData,
} from "@/lib/weather-api";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [activeView, setActiveView] = useState<"forecast" | "map" | "climate">("forecast");
  const [location, setLocation] = useState<{ lat: number; lon: number }>({
    lat: 17.385,
    lon: 78.4867,
  });
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();

  // Fetch weather data when location changes
  useEffect(() => {
    const loadWeatherData = async () => {
      setLoading(true);
      try {
        const [weather, forecast] = await Promise.all([
          fetchWeatherData(location.lat, location.lon),
          fetchForecastData(location.lat, location.lon),
        ]);
        setWeatherData(weather);
        setForecastData(forecast);
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
        {/* Search Bar */}
        <div className="max-w-md">
          <SearchBox onSearch={handleSearch} />
        </div>

        {/* Forecast View */}
        {activeView === "forecast" && (
          <>
            <WeatherTable data={weatherData} loading={loading} />
            <ForecastChart data={forecastData} loading={loading} />
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
          <Card className="p-6 bg-card space-y-4">
            <h2 className="text-2xl font-bold">Climate Information</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                This dashboard uses free weather APIs including Open-Meteo to provide
                real-time weather data and forecasts.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">Current Location</h3>
                  <p>Latitude: {location.lat.toFixed(4)}°</p>
                  <p>Longitude: {location.lon.toFixed(4)}°</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">Data Sources</h3>
                  <p>• Open-Meteo API (Weather & Forecast)</p>
                  <p>• OpenStreetMap (Map Tiles)</p>
                  <p>• Browser Geolocation API</p>
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
