import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Play, Pause, CloudRain, Loader2 } from "lucide-react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

interface RadarFrame {
  time: number;
  path: string;
}

interface RainViewerResponse {
  radar: {
    past: RadarFrame[];
    nowcast: RadarFrame[];
  };
}

const RadarLayer = ({ 
  frame, 
  opacity 
}: { 
  frame: RadarFrame | null; 
  opacity: number;
}) => {
  if (!frame) return null;

  return (
    <TileLayer
      url={`https://tilecache.rainviewer.com${frame.path}/256/{z}/{x}/{y}/2/1_1.png`}
      opacity={opacity}
      attribution="RainViewer"
    />
  );
};

interface RadarOverlayProps {
  center: LatLngExpression;
}

export const RadarOverlay = ({ center }: RadarOverlayProps) => {
  const [frames, setFrames] = useState<RadarFrame[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [opacity, setOpacity] = useState(0.6);
  const [loading, setLoading] = useState(true);

  // Fetch radar frames
  useEffect(() => {
    const fetchRadarFrames = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        const data: RainViewerResponse = await response.json();
        const allFrames = [...data.radar.past, ...data.radar.nowcast];
        setFrames(allFrames);
        setCurrentFrameIndex(allFrames.length > 0 ? allFrames.length - 1 : 0);
      } catch (error) {
        console.error('Failed to fetch radar frames:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRadarFrames();
    // Refresh every 5 minutes
    const interval = setInterval(fetchRadarFrames, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || frames.length === 0) return;

    const interval = setInterval(() => {
      setCurrentFrameIndex((prev) => (prev + 1) % frames.length);
    }, 500);

    return () => clearInterval(interval);
  }, [isPlaying, frames.length]);

  const currentFrame = frames[currentFrameIndex] || null;
  const frameTime = currentFrame ? new Date(currentFrame.time * 1000) : null;

  return (
    <div className="relative h-full w-full">
      {/* Radar Controls */}
      <Card className="absolute top-4 left-4 z-[1000] p-4 bg-card/95 backdrop-blur-sm border-border shadow-lg w-80 animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <CloudRain className="w-5 h-5 text-primary" />
          <Label className="text-sm font-semibold">Precipitation Radar</Label>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Time Display */}
            {frameTime && (
              <div className="text-sm text-center p-2 bg-muted/50 rounded">
                <div className="text-muted-foreground">Time</div>
                <div className="font-medium">{frameTime.toLocaleTimeString()}</div>
              </div>
            )}

            {/* Play/Pause */}
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={frames.length === 0}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Play
                  </>
                )}
              </Button>
            </div>

            {/* Frame Slider */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Frame Position</Label>
              <Slider
                value={[currentFrameIndex]}
                onValueChange={(value) => {
                  setCurrentFrameIndex(value[0]);
                  setIsPlaying(false);
                }}
                max={Math.max(0, frames.length - 1)}
                step={1}
                disabled={frames.length === 0}
              />
              <div className="text-xs text-muted-foreground mt-1 text-center">
                {currentFrameIndex + 1} / {frames.length}
              </div>
            </div>

            {/* Opacity Slider */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Opacity</Label>
              <Slider
                value={[opacity * 100]}
                onValueChange={(value) => setOpacity(value[0] / 100)}
                max={100}
                step={1}
              />
              <div className="text-xs text-muted-foreground mt-1 text-center">
                {Math.round(opacity * 100)}%
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Map */}
      <div className="h-full w-full rounded-lg overflow-hidden">
        <MapContainer 
          center={center} 
          zoom={8} 
          scrollWheelZoom={true} 
          className="h-full w-full"
          key={`${center[0]}-${center[1]}`}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <RadarLayer frame={currentFrame} opacity={opacity} />
        </MapContainer>
      </div>
    </div>
  );
};
