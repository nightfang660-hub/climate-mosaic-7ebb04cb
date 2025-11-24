import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";
import { LayerControl, LayerType, ForecastLayer, SatelliteLayer } from "./LayerControl";

// Fix for default marker icon
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface WeatherMapWithLayersProps {
  center: LatLngExpression;
  onMapClick: (lat: number, lon: number) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

const MapClickHandler = ({ onMapClick }: { onMapClick: (lat: number, lon: number) => void }) => {
  useMapEvents({
    click: (e) => {
      let lon = e.latlng.lng;
      while (lon > 180) lon -= 360;
      while (lon < -180) lon += 360;
      onMapClick(e.latlng.lat, lon);
    },
  });
  return null;
};

// NASA GIBS date helper
const getGIBSDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1); // Use yesterday's data for reliability
  return date.toISOString().split('T')[0];
};

const getForecastLayerUrl = (layer: ForecastLayer): string => {
  // Open-Meteo weather map tiles (completely free, no API key required)
  const layerMap: Record<ForecastLayer, string> = {
    temp: 'temp',
    wind: 'wind',
    humidity: 'humidity',
    cloudcover: 'cloudcover',
    precipitation: 'precipitation',
    pressure: 'pressure'
  };
  return `https://maps.open-meteo.com/v1/map?layer=${layerMap[layer]}&z={z}&x={x}&y={y}`;
};

const getSatelliteLayerUrl = (layer: SatelliteLayer): string => {
  const date = getGIBSDate();
  const baseUrl = "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best";
  
  switch (layer) {
    case "truecolor":
      return `${baseUrl}/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/${date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`;
    case "infrared":
      return `${baseUrl}/GOES-East_ABI_Band13_Clean_Infrared/default/${date}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png`;
    case "watervapor":
      return `${baseUrl}/GOES-East_ABI_Band09_Clean_Longwave_Window/default/${date}/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png`;
  }
};

export const WeatherMapWithLayers = ({ 
  center, 
  onMapClick,
  isFullscreen = false,
  onToggleFullscreen 
}: WeatherMapWithLayersProps) => {
  const [layerType, setLayerType] = useState<LayerType>("forecast");
  const [forecastLayer, setForecastLayer] = useState<ForecastLayer>("temp");
  const [satelliteLayer, setSatelliteLayer] = useState<SatelliteLayer>("truecolor");
  const [showRadar, setShowRadar] = useState(false);
  const [opacity, setOpacity] = useState(0.7);
  const [radarFrames, setRadarFrames] = useState<any[]>([]);
  const [currentRadarFrame, setCurrentRadarFrame] = useState(0);

  // Fetch radar frames
  useEffect(() => {
    if (!showRadar) return;
    
    const fetchRadar = async () => {
      try {
        const response = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        const data = await response.json();
        const allFrames = [...data.radar.past, ...data.radar.nowcast];
        setRadarFrames(allFrames);
        setCurrentRadarFrame(allFrames.length > 0 ? allFrames.length - 1 : 0);
      } catch (error) {
        console.error('Failed to fetch radar:', error);
      }
    };

    fetchRadar();
    const interval = setInterval(fetchRadar, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [showRadar]);

  const activeLayerUrl = layerType === "forecast" 
    ? getForecastLayerUrl(forecastLayer)
    : getSatelliteLayerUrl(satelliteLayer);

  const radarUrl = showRadar && radarFrames[currentRadarFrame]
    ? `https://tilecache.rainviewer.com${radarFrames[currentRadarFrame].path}/256/{z}/{x}/{y}/2/1_1.png`
    : null;

  return (
    <div className="relative h-full w-full">
      {onToggleFullscreen && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-4 right-4 z-[1000] bg-card/95 backdrop-blur-sm border-border shadow-lg hover:bg-card"
          onClick={onToggleFullscreen}
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </Button>
      )}

      <LayerControl
        activeLayerType={layerType}
        activeForecastLayer={forecastLayer}
        activeSatelliteLayer={satelliteLayer}
        showRadar={showRadar}
        opacity={opacity}
        onLayerTypeChange={setLayerType}
        onForecastLayerChange={setForecastLayer}
        onSatelliteLayerChange={setSatelliteLayer}
        onRadarToggle={setShowRadar}
        onOpacityChange={setOpacity}
      />

      <div className="h-full w-full rounded-lg overflow-hidden">
        <MapContainer 
          center={center} 
          zoom={isFullscreen ? 7 : 10} 
          scrollWheelZoom={true} 
          className="h-full w-full"
          key={`${center[0]}-${center[1]}-${isFullscreen}`}
          maxZoom={layerType === "forecast" ? 10 : 9}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {layerType === "forecast" && (
            <TileLayer
              url={activeLayerUrl}
              opacity={opacity}
              attribution='&copy; <a href="https://open-meteo.com/">Open-Meteo</a>'
              key={`forecast-${forecastLayer}`}
              maxZoom={10}
              tileSize={256}
            />
          )}
          
          {layerType === "satellite" && (
            <TileLayer
              url={activeLayerUrl}
              opacity={opacity}
              attribution='&copy; <a href="https://earthdata.nasa.gov/">NASA GIBS</a>'
              key={`satellite-${satelliteLayer}`}
              maxZoom={satelliteLayer === "truecolor" ? 9 : 6}
              tileSize={256}
            />
          )}

          {radarUrl && (
            <TileLayer
              url={radarUrl}
              opacity={0.6}
              attribution="RainViewer"
              key={`radar-${currentRadarFrame}`}
            />
          )}

          <Marker position={center}>
            <Popup>
              Selected Location
              <br />
              {center[0].toFixed(4)}°, {center[1].toFixed(4)}°
            </Popup>
          </Marker>
          <MapClickHandler onMapClick={onMapClick} />
        </MapContainer>
      </div>
    </div>
  );
};
