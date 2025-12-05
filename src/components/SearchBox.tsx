import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Loader2, X, Navigation } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchLocations, GeocodingResult } from "@/lib/weather-api";

interface SearchBoxProps {
  onSearch: (city: string) => void;
  onLocationSelect?: (location: GeocodingResult) => void;
}

export const SearchBox = ({ onSearch, onLocationSelect }: SearchBoxProps) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounced search for suggestions
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            ref={inputRef}
            id="city-search"
            name="city"
            type="text"
            placeholder="Search any location..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            className="pl-12 pr-12 bg-card/80 backdrop-blur-xl border-border/50 text-foreground h-12 text-base rounded-xl shadow-lg focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
            autoComplete="off"
          />
          {isLoading && (
            <Loader2 className="absolute right-12 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
          )}
          {query && !isLoading && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in-0 slide-in-from-top-2 duration-200"
        >
          <div className="p-3 border-b border-border/30 bg-muted/30">
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <Navigation className="w-3 h-3" />
              {suggestions.length} location{suggestions.length > 1 ? 's' : ''} found
            </p>
          </div>
          <ul className="max-h-80 overflow-y-auto py-2">
            {suggestions.map((location, index) => (
              <li key={`${location.latitude}-${location.longitude}-${index}`}>
                <button
                  type="button"
                  onClick={() => handleSelect(location)}
                  className={`w-full flex items-start gap-4 px-4 py-3.5 text-left transition-all duration-150 ${
                    index === selectedIndex
                      ? "bg-primary/10 border-l-2 border-primary"
                      : "hover:bg-muted/50 border-l-2 border-transparent"
                  }`}
                >
                  <div className={`mt-0.5 p-2 rounded-lg ${
                    index === selectedIndex ? 'bg-primary/20' : 'bg-muted/50'
                  }`}>
                    <MapPin className={`w-4 h-4 ${
                      index === selectedIndex ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${
                      index === selectedIndex ? 'text-primary' : 'text-foreground'
                    }`}>
                      {location.name}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
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
      {showSuggestions && query.length >= 2 && !isLoading && suggestions.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-8 text-center z-50 animate-in fade-in-0 slide-in-from-top-2 duration-200">
          <div className="p-3 bg-muted/30 rounded-xl w-fit mx-auto mb-3">
            <MapPin className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-foreground font-medium">No locations found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try a different search term
          </p>
        </div>
      )}
    </div>
  );
};