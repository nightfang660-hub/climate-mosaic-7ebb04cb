import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, LayersControl } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
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

interface WeatherMapAdvancedProps {
  center: LatLngExpression;
  onMapClick: (lat: number, lon: number) => void;
}

const MapClickHandler = ({ onMapClick }: { onMapClick: (lat: number, lon: number) => void }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export const WeatherMapAdvanced = ({ center, onMapClick }: WeatherMapAdvancedProps) => {
  const [opacity, setOpacity] = useState(0.6);
  const [showLayerControl, setShowLayerControl] = useState(true);

  return (
    <div className="relative h-full w-full">
      {/* Layer Controls */}
      {showLayerControl && (
        <Card className="absolute top-4 right-4 z-[1000] p-4 bg-card/95 backdrop-blur-sm border-border shadow-lg w-64 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-primary" />
            <Label className="text-sm font-semibold">Weather Layers</Label>
          </div>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Layer Opacity</Label>
              <Slider
                value={[opacity * 100]}
                onValueChange={(value) => setOpacity(value[0] / 100)}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground mt-1 text-center">{Math.round(opacity * 100)}%</div>
            </div>
          </div>
        </Card>
      )}

      <div className="h-full w-full rounded-lg overflow-hidden">
        <MapContainer 
          center={center} 
          zoom={13} 
          scrollWheelZoom={true} 
          className="h-full w-full"
          key={`${center[0]}-${center[1]}`}
        >
          <LayersControl position="topleft">
            <LayersControl.BaseLayer checked name="Base Map">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>

            {/* Open-Meteo Weather Layers */}
            <LayersControl.Overlay name="Temperature">
              <TileLayer
                url={`https://tile.open-meteo.com/v1/temp/{z}/{x}/{y}.png`}
                opacity={opacity}
                attribution="Open-Meteo"
              />
            </LayersControl.Overlay>

            <LayersControl.Overlay name="Precipitation">
              <TileLayer
                url={`https://tile.open-meteo.com/v1/precipitation/{z}/{x}/{y}.png`}
                opacity={opacity}
                attribution="Open-Meteo"
              />
            </LayersControl.Overlay>

            <LayersControl.Overlay name="Wind Speed">
              <TileLayer
                url={`https://tile.open-meteo.com/v1/wind/{z}/{x}/{y}.png`}
                opacity={opacity}
                attribution="Open-Meteo"
              />
            </LayersControl.Overlay>

            <LayersControl.Overlay name="Clouds">
              <TileLayer
                url={`https://tile.open-meteo.com/v1/cloudcover/{z}/{x}/{y}.png`}
                opacity={opacity}
                attribution="Open-Meteo"
              />
            </LayersControl.Overlay>

            <LayersControl.Overlay name="Humidity">
              <TileLayer
                url={`https://tile.open-meteo.com/v1/humidity/{z}/{x}/{y}.png`}
                opacity={opacity}
                attribution="Open-Meteo"
              />
            </LayersControl.Overlay>

            <LayersControl.Overlay name="Pressure">
              <TileLayer
                url={`https://tile.open-meteo.com/v1/pressure/{z}/{x}/{y}.png`}
                opacity={opacity}
                attribution="Open-Meteo"
              />
            </LayersControl.Overlay>
          </LayersControl>

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
