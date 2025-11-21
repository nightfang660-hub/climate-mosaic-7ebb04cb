import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { Layers } from "lucide-react";

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

interface WeatherMapProps {
  center: LatLngExpression;
  onMapClick: (lat: number, lon: number) => void;
}

type RadarLayer = 'none' | 'precipitation' | 'clouds' | 'temperature';

const MapClickHandler = ({ onMapClick }: { onMapClick: (lat: number, lon: number) => void }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export const WeatherMap = ({ center, onMapClick }: WeatherMapProps) => {
  const [radarLayer, setRadarLayer] = useState<RadarLayer>('none');

  const radarLayers = {
    precipitation: 'https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=',
    clouds: 'https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=',
    temperature: 'https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=',
  };

  return (
    <div className="h-full w-full rounded-lg overflow-hidden relative">
      <div className="absolute top-4 right-4 z-[1000] bg-card/95 backdrop-blur-sm p-2 rounded-lg shadow-lg border border-border">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Radar Layers</span>
        </div>
        <div className="flex flex-col gap-1">
          <Button
            variant={radarLayer === 'none' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setRadarLayer('none')}
            className="justify-start text-xs"
          >
            None
          </Button>
          <Button
            variant={radarLayer === 'precipitation' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setRadarLayer('precipitation')}
            className="justify-start text-xs"
          >
            Precipitation
          </Button>
          <Button
            variant={radarLayer === 'clouds' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setRadarLayer('clouds')}
            className="justify-start text-xs"
          >
            Clouds
          </Button>
          <Button
            variant={radarLayer === 'temperature' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setRadarLayer('temperature')}
            className="justify-start text-xs"
          >
            Temperature
          </Button>
        </div>
      </div>
      <MapContainer center={center} zoom={10} scrollWheelZoom={true} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {radarLayer !== 'none' && (
          <TileLayer
            url={radarLayers[radarLayer]}
            opacity={0.6}
            attribution='&copy; <a href="https://openweathermap.org">OpenWeatherMap</a>'
          />
        )}
        <Marker position={center}>
          <Popup>Selected Location</Popup>
        </Marker>
        <MapClickHandler onMapClick={onMapClick} />
      </MapContainer>
    </div>
  );
};
