export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  rainfall: number;
  cloudCover: number;
  feelsLike: number;
  uvIndex: number;
  visibility: number;
  sunrise: string;
  sunset: string;
  weatherCode: number;
}

export interface HourlyForecastData {
  time: string;
  temperature: number;
  precipitation: number;
  windSpeed: number;
  weatherCode: number;
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
  admin1?: string; // State/Region
}

/**
 * Fetch current weather data from Open-Meteo API
 */
export const fetchWeatherData = async (lat: number, lon: number): Promise<WeatherData> => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,pressure_msl,cloud_cover,wind_speed_10m,uv_index,visibility,weather_code&daily=sunrise,sunset&timezone=auto`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch weather data");
  }
  
  const data = await response.json();
  const current = data.current;
  const daily = data.daily;
  
  return {
    temperature: current.temperature_2m,
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m,
    pressure: current.pressure_msl,
    rainfall: current.precipitation,
    cloudCover: current.cloud_cover,
    feelsLike: current.apparent_temperature,
    uvIndex: current.uv_index,
    visibility: current.visibility / 1000, // Convert to km
    sunrise: daily.sunrise[0],
    sunset: daily.sunset[0],
    weatherCode: current.weather_code,
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
 * Search locations with autocomplete suggestions
 */
export const searchLocations = async (query: string): Promise<GeocodingResult[]> => {
  if (!query || query.length < 2) return [];
  
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json`;
  
  const response = await fetch(url);
  if (!response.ok) {
    return [];
  }
  
  const data = await response.json();
  
  if (!data.results || data.results.length === 0) {
    return [];
  }
  
  return data.results.map((result: any) => ({
    name: result.name,
    latitude: result.latitude,
    longitude: result.longitude,
    country: result.country,
    admin1: result.admin1, // State/Region
  }));
};

/**
 * Fetch 24-hour hourly forecast from Open-Meteo API
 * Returns data starting from current hour
 */
export const fetchHourlyForecast = async (lat: number, lon: number): Promise<HourlyForecastData[]> => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation,wind_speed_10m,weather_code&timezone=auto&forecast_days=2`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch hourly forecast data");
  }
  
  const data = await response.json();
  const hourly = data.hourly;
  
  // Find current hour index
  const now = new Date();
  const currentHour = now.getHours();
  
  // API returns data starting from midnight, find the index for current hour
  let startIndex = 0;
  for (let i = 0; i < hourly.time.length; i++) {
    const hourTime = new Date(hourly.time[i]);
    if (hourTime.getDate() === now.getDate() && hourTime.getHours() >= currentHour) {
      startIndex = i;
      break;
    }
    // If we passed today, use tomorrow's first hour
    if (hourTime.getDate() > now.getDate()) {
      startIndex = i;
      break;
    }
  }
  
  // Get 24 hours starting from current hour
  const result: HourlyForecastData[] = [];
  for (let i = 0; i < 24 && startIndex + i < hourly.time.length; i++) {
    const idx = startIndex + i;
    const time = new Date(hourly.time[idx]);
    const isNow = i === 0;
    
    result.push({
      time: isNow ? 'Now' : time.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
      temperature: hourly.temperature_2m[idx],
      precipitation: hourly.precipitation[idx],
      windSpeed: hourly.wind_speed_10m[idx],
      weatherCode: hourly.weather_code[idx],
    });
  }
  
  return result;
};

export interface HistoricalWeatherData {
  date: string;
  temperature: number;
  humidity: number;
  precipitation: number;
}

export interface WeatherAlert {
  id: string;
  severity: 'info' | 'warning' | 'severe';
  title: string;
  description: string;
  metric: string;
  value: number;
}

/**
 * Fetch historical weather data from Open-Meteo API
 */
export const fetchHistoricalWeather = async (
  lat: number,
  lon: number,
  startDate?: Date,
  endDate?: Date,
  metrics?: string[]
): Promise<any> => {
  const end = endDate || new Date();
  const start = startDate || new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const hourlyParams = metrics && metrics.length > 0 
    ? metrics.join(",")
    : "temperature_2m,relative_humidity_2m,precipitation";

  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${formatDate(start)}&end_date=${formatDate(end)}&hourly=${hourlyParams}&timezone=auto`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch historical weather data");
  }

  const data = await response.json();
  return data;
};

/**
 * Fetch air quality historical data from Open-Meteo API
 */
export const fetchAirQualityHistory = async (
  lat: number,
  lon: number,
  startDate: Date,
  endDate: Date,
  metrics: string[]
): Promise<any> => {
  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  
  const hourlyParams = metrics.join(",");
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&start_date=${formatDate(startDate)}&end_date=${formatDate(endDate)}&hourly=${hourlyParams}&timezone=auto`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch air quality data");
  }

  const data = await response.json();
  return data;
};

/**
 * Analyze weather data for alerts
 */
export const analyzeWeatherAlerts = (weather: WeatherData): WeatherAlert[] => {
  const alerts: WeatherAlert[] = [];

  // High temperature alert
  if (weather.temperature > 35) {
    alerts.push({
      id: 'high-temp',
      severity: weather.temperature > 40 ? 'severe' : 'warning',
      title: 'High Temperature Alert',
      description: `Extreme heat detected. Temperature is ${weather.temperature.toFixed(1)}°C`,
      metric: 'Temperature',
      value: weather.temperature,
    });
  }

  // Low temperature alert
  if (weather.temperature < 0) {
    alerts.push({
      id: 'low-temp',
      severity: weather.temperature < -10 ? 'severe' : 'warning',
      title: 'Freezing Temperature Alert',
      description: `Freezing conditions detected. Temperature is ${weather.temperature.toFixed(1)}°C`,
      metric: 'Temperature',
      value: weather.temperature,
    });
  }

  // High wind speed alert
  if (weather.windSpeed > 50) {
    alerts.push({
      id: 'high-wind',
      severity: weather.windSpeed > 80 ? 'severe' : 'warning',
      title: 'High Wind Alert',
      description: `Strong winds detected. Wind speed is ${weather.windSpeed.toFixed(1)} km/h`,
      metric: 'Wind Speed',
      value: weather.windSpeed,
    });
  }

  // Heavy rainfall alert
  if (weather.rainfall > 10) {
    alerts.push({
      id: 'heavy-rain',
      severity: weather.rainfall > 50 ? 'severe' : 'warning',
      title: 'Heavy Rainfall Alert',
      description: `Heavy precipitation detected. Rainfall is ${weather.rainfall.toFixed(1)} mm`,
      metric: 'Rainfall',
      value: weather.rainfall,
    });
  }

  // High UV index alert
  if (weather.uvIndex > 8) {
    alerts.push({
      id: 'high-uv',
      severity: weather.uvIndex > 11 ? 'severe' : 'warning',
      title: 'High UV Index Alert',
      description: `Extreme UV levels detected. UV index is ${weather.uvIndex.toFixed(1)}`,
      metric: 'UV Index',
      value: weather.uvIndex,
    });
  }

  // Low visibility alert
  if (weather.visibility < 1) {
    alerts.push({
      id: 'low-visibility',
      severity: weather.visibility < 0.5 ? 'severe' : 'warning',
      title: 'Low Visibility Alert',
      description: `Poor visibility conditions. Visibility is ${weather.visibility.toFixed(1)} km`,
      metric: 'Visibility',
      value: weather.visibility,
    });
  }

  return alerts;
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
