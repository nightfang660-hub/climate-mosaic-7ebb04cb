import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Thermometer, Wind, Droplets, Cloud, CloudRain, Gauge, Satellite, CloudRainWind, Layers, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export type LayerType = "forecast" | "satellite" | "radar";
export type ForecastLayer = "temp" | "wind" | "humidity" | "cloudcover" | "precipitation" | "pressure";
export type SatelliteLayer = "truecolor" | "infrared" | "watervapor";

interface LayerControlProps {
  activeLayerType: LayerType;
  activeForecastLayer: ForecastLayer;
  activeSatelliteLayer: SatelliteLayer;
  showRadar: boolean;
  opacity: number;
  onLayerTypeChange: (type: LayerType) => void;
  onForecastLayerChange: (layer: ForecastLayer) => void;
  onSatelliteLayerChange: (layer: SatelliteLayer) => void;
  onRadarToggle: (show: boolean) => void;
  onOpacityChange: (opacity: number) => void;
}

const forecastLayers = [
  { id: "temp" as const, label: "Temperature", icon: Thermometer, color: "from-red-500 to-orange-500" },
  { id: "wind" as const, label: "Wind Speed", icon: Wind, color: "from-cyan-500 to-blue-500" },
  { id: "humidity" as const, label: "Humidity", icon: Droplets, color: "from-blue-500 to-indigo-500" },
  { id: "cloudcover" as const, label: "Cloud Cover", icon: Cloud, color: "from-slate-400 to-slate-600" },
  { id: "precipitation" as const, label: "Precipitation", icon: CloudRain, color: "from-emerald-500 to-teal-500" },
  { id: "pressure" as const, label: "Pressure", icon: Gauge, color: "from-purple-500 to-violet-500" },
];

const satelliteLayers = [
  { id: "truecolor" as const, label: "True Color", description: "Natural view" },
  { id: "infrared" as const, label: "Infrared", description: "Heat signature" },
  { id: "watervapor" as const, label: "Water Vapor", description: "Moisture levels" },
];

export const LayerControl = ({
  activeLayerType,
  activeForecastLayer,
  activeSatelliteLayer,
  showRadar,
  opacity,
  onLayerTypeChange,
  onForecastLayerChange,
  onSatelliteLayerChange,
  onRadarToggle,
  onOpacityChange,
}: LayerControlProps) => {
  return (
    <div className="absolute top-4 left-4 z-[1000] animate-fade-in">
      {/* Glass morphism container */}
      <div className="bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden w-72">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/20 to-primary/5 px-4 py-3 border-b border-border/30">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/20">
              <Layers className="w-4 h-4 text-primary" />
            </div>
            <span className="font-semibold text-sm">Map Layers</span>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Layer Type Toggle - Pill style */}
          <div className="bg-muted/50 rounded-xl p-1 flex gap-1">
            <button
              onClick={() => onLayerTypeChange("forecast")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200",
                activeLayerType === "forecast" 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <CloudRain className="w-3.5 h-3.5" />
              Forecast
            </button>
            <button
              onClick={() => onLayerTypeChange("satellite")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200",
                activeLayerType === "satellite" 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Satellite className="w-3.5 h-3.5" />
              Satellite
            </button>
          </div>

          {/* Forecast Layers Grid */}
          {activeLayerType === "forecast" && (
            <div className="space-y-2">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                Weather Data
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {forecastLayers.map((layer) => {
                  const Icon = layer.icon;
                  const isActive = activeForecastLayer === layer.id;
                  return (
                    <button
                      key={layer.id}
                      onClick={() => onForecastLayerChange(layer.id)}
                      className={cn(
                        "relative flex flex-col items-start p-3 rounded-xl text-left transition-all duration-200 group overflow-hidden",
                        isActive 
                          ? "bg-primary/15 border-2 border-primary/50 shadow-lg shadow-primary/10" 
                          : "bg-muted/30 border border-transparent hover:bg-muted/50 hover:border-border/50"
                      )}
                    >
                      {/* Gradient accent for active */}
                      {isActive && (
                        <div className={cn(
                          "absolute inset-0 opacity-10 bg-gradient-to-br",
                          layer.color
                        )} />
                      )}
                      <div className={cn(
                        "p-1.5 rounded-lg mb-1.5 transition-colors",
                        isActive ? "bg-primary/20" : "bg-muted"
                      )}>
                        <Icon className={cn(
                          "w-4 h-4 transition-colors",
                          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                        )} />
                      </div>
                      <span className={cn(
                        "text-xs font-medium transition-colors relative z-10",
                        isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                      )}>
                        {layer.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Satellite Layers List */}
          {activeLayerType === "satellite" && (
            <div className="space-y-2">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                Satellite View
              </Label>
              <div className="space-y-1.5">
                {satelliteLayers.map((layer) => {
                  const isActive = activeSatelliteLayer === layer.id;
                  return (
                    <button
                      key={layer.id}
                      onClick={() => onSatelliteLayerChange(layer.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200",
                        isActive 
                          ? "bg-primary/15 border border-primary/50" 
                          : "bg-muted/30 border border-transparent hover:bg-muted/50"
                      )}
                    >
                      <div className={cn(
                        "p-1.5 rounded-lg",
                        isActive ? "bg-primary/20" : "bg-muted"
                      )}>
                        <Satellite className={cn(
                          "w-3.5 h-3.5",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )} />
                      </div>
                      <div className="text-left">
                        <div className={cn(
                          "text-xs font-medium",
                          isActive ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {layer.label}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {layer.description}
                        </div>
                      </div>
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Radar Toggle */}
          <div className="pt-2 border-t border-border/30">
            <button
              onClick={() => onRadarToggle(!showRadar)}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200",
                showRadar 
                  ? "bg-emerald-500/15 border border-emerald-500/50" 
                  : "bg-muted/30 border border-transparent hover:bg-muted/50"
              )}
            >
              <div className="flex items-center gap-2.5">
                <div className={cn(
                  "p-1.5 rounded-lg",
                  showRadar ? "bg-emerald-500/20" : "bg-muted"
                )}>
                  <CloudRainWind className={cn(
                    "w-4 h-4",
                    showRadar ? "text-emerald-500" : "text-muted-foreground"
                  )} />
                </div>
                <div className="text-left">
                  <div className={cn(
                    "text-xs font-medium",
                    showRadar ? "text-foreground" : "text-muted-foreground"
                  )}>
                    Rain Radar
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Live precipitation
                  </div>
                </div>
              </div>
              <div className={cn(
                "w-10 h-5 rounded-full transition-all duration-200 relative",
                showRadar ? "bg-emerald-500" : "bg-muted"
              )}>
                <div className={cn(
                  "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200",
                  showRadar ? "left-[22px]" : "left-0.5"
                )} />
              </div>
            </button>
          </div>

          {/* Opacity Control */}
          <div className="pt-2 border-t border-border/30 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium flex items-center gap-1.5">
                <Eye className="w-3 h-3" />
                Opacity
              </Label>
              <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                {Math.round(opacity * 100)}%
              </span>
            </div>
            <Slider
              value={[opacity * 100]}
              onValueChange={(value) => onOpacityChange(value[0] / 100)}
              max={100}
              step={5}
              className="cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
