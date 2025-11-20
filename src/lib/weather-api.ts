export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  rainfall: number;
  cloudCover: number;
}

export interface ForecastData {
  date: string;
  temperature: number;
  rainfall: number;
}

export interface GeocodingResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
}

/**
 * Fetch current weather data from Open-Meteo API
 */
export const fetchWeatherData = async (lat: number, lon: number): Promise<WeatherData> => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,pressure_msl,cloud_cover,wind_speed_10m&timezone=auto`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch weather data");
  }
  
  const data = await response.json();
  const current = data.current;
  
  return {
    temperature: current.temperature_2m,
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m,
    pressure: current.pressure_msl,
    rainfall: current.precipitation,
    cloudCover: current.cloud_cover,
  };
};

/**
 * Fetch 7-day forecast from Open-Meteo API
 */
export const fetchForecastData = async (lat: number, lon: number): Promise<ForecastData[]> => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,precipitation_sum&timezone=auto&forecast_days=7`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch forecast data");
  }
  
  const data = await response.json();
  const daily = data.daily;
  
  return daily.time.map((date: string, index: number) => {
    const dateObj = new Date(date);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    
    return {
      date: dayName,
      temperature: daily.temperature_2m_max[index],
      rainfall: daily.precipitation_sum[index],
    };
  });
};

/**
 * Geocode city name to coordinates using Open-Meteo Geocoding API
 */
export const geocodeCity = async (cityName: string): Promise<GeocodingResult | null> => {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to geocode city");
  }
  
  const data = await response.json();
  
  if (!data.results || data.results.length === 0) {
    return null;
  }
  
  const result = data.results[0];
  return {
    name: result.name,
    latitude: result.latitude,
    longitude: result.longitude,
    country: result.country,
  };
};

/**
 * Get user's current location using browser geolocation API
 */
export const getUserLocation = (): Promise<{ lat: number; lon: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
};
