import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Loader2, X, Navigation, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchLocations, GeocodingResult } from "@/lib/weather-api";

interface SearchBoxProps {
  onSearch: (city: string) => void;
  onLocationSelect?: (location: GeocodingResult) => void;
}

// Parse coordinate string (supports various formats)
const parseCoordinates = (input: string): { lat: number; lon: number } | null => {
  // Remove extra spaces and normalize
  const cleaned = input.trim().replace(/\s+/g, ' ');
  
  // Format: "lat, lon" or "lat lon" (e.g., "17.385, 78.4867" or "17.385 78.4867")
  const simpleMatch = cleaned.match(/^(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)$/);
  if (simpleMatch) {
    const lat = parseFloat(simpleMatch[1]);
    const lon = parseFloat(simpleMatch[2]);
    if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      return { lat, lon };
    }
  }
  
  // Format with degree symbols: "17.385°N, 78.4867°E" or "17.385°, 78.4867°"
  const degreeMatch = cleaned.match(/(-?\d+\.?\d*)°?\s*([NSns])?\s*[,\s]+\s*(-?\d+\.?\d*)°?\s*([EWew])?/i);
  if (degreeMatch) {
    let lat = parseFloat(degreeMatch[1]);
    let lon = parseFloat(degreeMatch[3]);
    
    // Apply direction
    if (degreeMatch[2]?.toLowerCase() === 's') lat = -Math.abs(lat);
    if (degreeMatch[4]?.toLowerCase() === 'w') lon = -Math.abs(lon);
    
    if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      return { lat, lon };
    }
  }
  
  return null;
};

export const SearchBox = ({ onSearch, onLocationSelect }: SearchBoxProps) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [coordMatch, setCoordMatch] = useState<{ lat: number; lon: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounced search for suggestions
  useEffect(() => {
    // Check for coordinate input first
    const coords = parseCoordinates(query);
    setCoordMatch(coords);
    
    if (coords) {
      setSuggestions([]);
      setShowSuggestions(true);
      return;
    }
    
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await searchLocations(query);
        setSuggestions(results);
        setShowSuggestions(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error("Search error:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (location: GeocodingResult) => {
    const displayName = location.admin1 
      ? `${location.name}, ${location.admin1}`
      : location.name;
    setQuery(displayName);
    setShowSuggestions(false);
    setSuggestions([]);
    
    if (onLocationSelect) {
      onLocationSelect(location);
    } else {
      onSearch(location.name);
    }
  };

  const handleCoordinateSelect = (coords: { lat: number; lon: number }) => {
    const coordLocation: GeocodingResult = {
      name: `${coords.lat.toFixed(4)}°, ${coords.lon.toFixed(4)}°`,
      latitude: coords.lat,
      longitude: coords.lon,
      country: "Coordinates",
      admin1: ""
    };
    setQuery(`${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}`);
    setShowSuggestions(false);
    setCoordMatch(null);
    
    if (onLocationSelect) {
      onLocationSelect(coordLocation);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Handle coordinate input first
    if (coordMatch) {
      handleCoordinateSelect(coordMatch);
      return;
    }
    
    if (selectedIndex >= 0 && suggestions[selectedIndex]) {
      handleSelect(suggestions[selectedIndex]);
    } else if (query.trim()) {
      // If there are suggestions available, select the first one
      if (suggestions.length > 0) {
        handleSelect(suggestions[0]);
      } else {
        // Try to search and get suggestions first
        setIsLoading(true);
        try {
          const results = await searchLocations(query.trim());
          if (results.length > 0) {
            handleSelect(results[0]);
          } else {
            onSearch(query.trim());
          }
        } catch {
          onSearch(query.trim());
        } finally {
          setIsLoading(false);
        }
      }
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-md">
      <form onSubmit={handleSubmit} className="relative group">
        <label htmlFor="city-search" className="sr-only">
          Search for a location
        </label>
        
        {/* Glow effect on focus */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-primary/30 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm" />
        
        <div className="relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            ref={inputRef}
            id="city-search"
            name="city"
            type="text"
            placeholder="City, place or coordinates..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => (suggestions.length > 0 || coordMatch) && setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            className="pl-10 sm:pl-12 pr-10 sm:pr-12 bg-card/80 backdrop-blur-xl border-border/50 text-foreground h-10 sm:h-12 text-sm sm:text-base rounded-xl shadow-lg focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
            autoComplete="off"
          />
          {isLoading && (
            <Loader2 className="absolute right-10 sm:right-12 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
          )}
          {query && !isLoading && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
      </form>

      {/* Coordinate Match Option */}
      {showSuggestions && coordMatch && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in-0 slide-in-from-top-2 duration-200"
        >
          <div className="p-3 border-b border-border/30 bg-muted/30">
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <Globe className="w-3 h-3" />
              Coordinates detected
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleCoordinateSelect(coordMatch)}
            className="w-full flex items-start gap-3 sm:gap-4 px-3 sm:px-4 py-3 text-left hover:bg-muted/50 transition-colors"
          >
            <div className="mt-0.5 p-2 bg-primary/20 rounded-lg flex-shrink-0">
              <Globe className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-primary text-sm sm:text-base">Go to coordinates</p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {coordMatch.lat.toFixed(4)}°, {coordMatch.lon.toFixed(4)}°
              </p>
            </div>
          </button>
        </div>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && !coordMatch && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in-0 slide-in-from-top-2 duration-200"
        >
          <div className="p-2 sm:p-3 border-b border-border/30 bg-muted/30">
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <Navigation className="w-3 h-3" />
              {suggestions.length} location{suggestions.length > 1 ? 's' : ''} found
            </p>
          </div>
          <ul className="max-h-64 sm:max-h-80 overflow-y-auto py-1 sm:py-2">
            {suggestions.map((location, index) => (
              <li key={`${location.latitude}-${location.longitude}-${index}`}>
                <button
                  type="button"
                  onClick={() => handleSelect(location)}
                  className={`w-full flex items-start gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3.5 text-left transition-all duration-150 ${
                    index === selectedIndex
                      ? "bg-primary/10 border-l-2 border-primary"
                      : "hover:bg-muted/50 border-l-2 border-transparent"
                  }`}
                >
                  <div className={`mt-0.5 p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${
                    index === selectedIndex ? 'bg-primary/20' : 'bg-muted/50'
                  }`}>
                    <MapPin className={`w-3.5 sm:w-4 h-3.5 sm:h-4 ${
                      index === selectedIndex ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm sm:text-base truncate ${
                      index === selectedIndex ? 'text-primary' : 'text-foreground'
                    }`}>
                      {location.name}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      {[location.admin1, location.country]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* No results message */}
      {showSuggestions && !coordMatch && query.length >= 2 && !isLoading && suggestions.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-4 sm:p-8 text-center z-50 animate-in fade-in-0 slide-in-from-top-2 duration-200">
          <div className="p-2 sm:p-3 bg-muted/30 rounded-xl w-fit mx-auto mb-2 sm:mb-3">
            <MapPin className="w-5 sm:w-6 h-5 sm:h-6 text-muted-foreground" />
          </div>
          <p className="text-foreground font-medium text-sm sm:text-base">No locations found</p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Try a city name or coordinates (e.g. 17.38, 78.48)
          </p>
        </div>
      )}
    </div>
  );
};