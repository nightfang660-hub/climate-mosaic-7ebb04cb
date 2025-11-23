import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Play, Pause, SkipBack, SkipForward, Loader2 } from "lucide-react";

interface RadarControlsProps {
  frames: any[];
  currentFrameIndex: number;
  isPlaying: boolean;
  loading: boolean;
  onFrameChange: (index: number) => void;
  onPlayPause: () => void;
}

export const RadarControls = ({
  frames,
  currentFrameIndex,
  isPlaying,
  loading,
  onFrameChange,
  onPlayPause,
}: RadarControlsProps) => {
  const currentFrame = frames[currentFrameIndex];
  const frameTime = currentFrame ? new Date(currentFrame.time * 1000) : null;

  const goToPrevious = () => {
    onFrameChange(Math.max(0, currentFrameIndex - 1));
  };

  const goToNext = () => {
    onFrameChange(Math.min(frames.length - 1, currentFrameIndex + 1));
  };

  return (
    <Card className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-card/95 backdrop-blur-sm border-border shadow-lg p-4 w-[500px] animate-fade-in">
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Time Display */}
          {frameTime && (
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Radar Time</div>
              <div className="font-semibold text-sm">
                {frameTime.toLocaleDateString()} {frameTime.toLocaleTimeString()}
              </div>
            </div>
          )}

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevious}
              disabled={currentFrameIndex === 0}
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            
            <Button
              variant="default"
              size="icon"
              onClick={onPlayPause}
              disabled={frames.length === 0}
              className="w-12 h-12"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={goToNext}
              disabled={currentFrameIndex === frames.length - 1}
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          {/* Timeline Slider */}
          <div>
            <Slider
              value={[currentFrameIndex]}
              onValueChange={(value) => onFrameChange(value[0])}
              max={Math.max(0, frames.length - 1)}
              step={1}
              disabled={frames.length === 0}
            />
            <div className="text-xs text-muted-foreground mt-2 text-center">
              Frame {currentFrameIndex + 1} of {frames.length}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
