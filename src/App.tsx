import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';

interface DailyForecast {
  date: string;
  tempHigh: number;
  tempLow: number;
  description: string;
}

interface WeatherData {
  cityName: string;
  state: string | null;
  country: string | null;
  temperature: number;
  feelsLike: number;
  tempHigh: number;
  tempLow: number;
  description: string;
  humidity: number;
  windSpeed: number;
  localTime: string;
  sunrise: string;
  sunset: string;
  airQuality: number | null;
  airQualityLabel: string | null;
  forecast: DailyForecast[];
}

type WeatherTheme = 'clear' | 'cloudy' | 'overcast' | 'rain' | 'drizzle' | 'snow' | 'fog' | 'thunder' | 'default';

function getTheme(description: string): WeatherTheme {
  const d = description.toLowerCase();
  if (d.includes('thunderstorm'))  return 'thunder';
  if (d.includes('rain') || d.includes('shower')) return 'rain';
  if (d.includes('drizzle'))       return 'drizzle';
  if (d.includes('snow') || d.includes('grain')) return 'snow';
  if (d.includes('fog'))           return 'fog';
  if (d.includes('overcast'))      return 'overcast';
  if (d.includes('cloudy') || d.includes('partly')) return 'cloudy';
  if (d.includes('clear') || d.includes('sunny') || d.includes('mainly clear')) return 'clear';
  return 'default';
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatLocalTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

function getDayName(dateStr: string, index: number): string {
  if (index === 0) return 'Today';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString([], { weekday: 'short' });
}

function toF(c: number): number {
  return c * 9 / 5 + 32;
}

function WeatherEffects({ theme }: { theme: WeatherTheme }) {
  const rainDrops = useMemo(() =>
    Array.from({ length: 50 }, () => ({
      left: `${Math.random() * 100}%`,
      height: `${15 + Math.random() * 25}px`,
      duration: `${0.5 + Math.random() * 0.4}s`,
      delay: `${Math.random() * 2}s`,
      opacity: 0.3 + Math.random() * 0.5,
    })), []
  );

  const snowflakes = useMemo(() =>
    Array.from({ length: 40 }, () => ({
      left: `${Math.random() * 100}%`,
      size: `${4 + Math.random() * 6}px`,
      duration: `${3 + Math.random() * 4}s`,
      delay: `${Math.random() * 5}s`,
      opacity: 0.4 + Math.random() * 0.5,
    })), []
  );

  return (
    <div className="effects-layer">
      {(theme === 'clear' || theme === 'cloudy') && <div className="sun" />}
      {theme !== 'clear' && theme !== 'default' && (
        <>
          <div className="cloud cloud-1" />
          <div className="cloud cloud-2" />
          {(theme === 'overcast' || theme === 'rain' || theme === 'thunder') && (
            <div className="cloud cloud-3" />
          )}
        </>
      )}
      {(theme === 'rain' || theme === 'drizzle' || theme === 'thunder') &&
        rainDrops.slice(0, theme === 'drizzle' ? 20 : 50).map((drop, i) => (
          <div key={`r${i}`} className="rain-drop" style={{
            left: drop.left, height: drop.height,
            animationDuration: drop.duration, animationDelay: drop.delay, opacity: drop.opacity,
          }} />
        ))
      }
      {theme === 'snow' &&
        snowflakes.map((flake, i) => (
          <div key={`s${i}`} className="snowflake" style={{
            left: flake.left, width: flake.size, height: flake.size,
            animationDuration: flake.duration, animationDelay: flake.delay, opacity: flake.opacity,
          }} />
        ))
      }
      {theme === 'fog' && (
        <>
          <div className="fog-band fog-band-1" />
          <div className="fog-band fog-band-2" />
        </>
      )}
      {theme === 'thunder' && (
        <>
          <div className="lightning" />
          <div className="lightning lightning-2" />
        </>
      )}
    </div>
  );
}

function App() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [city, setCity] = useState('New York');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unit, setUnit] = useState<'F' | 'C'>('F');

  const API_URL = import.meta.env.VITE_API_URL || '/api';

  const temp = (celsius: number) => Math.round(unit === 'F' ? toF(celsius) : celsius);
  const theme: WeatherTheme = weather ? getTheme(weather.description) : 'default';

  const fetchWeather = async () => {
    setLoading(true);
    setError('');
    try {
      const parts = city.split(',').map(p => p.trim()).filter(Boolean);
      const cityName = encodeURIComponent(parts[0]);
      const params = new URLSearchParams();
      if (parts.length === 2) {
        params.set('state', parts[1]);
        params.set('country', parts[1]);
      } else if (parts.length >= 3) {
        params.set('state', parts[1]);
        params.set('country', parts[2]);
      }
      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await fetch(`${API_URL}/weather/${cityName}${query}`);
      if (!response.ok) throw new Error('City not found');
      const data = await response.json();
      setWeather(data);
    } catch {
      setError('Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWeather(); }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') fetchWeather();
  };

  return (
    <div className={`app-container weather-${theme}`}>
      <WeatherEffects theme={theme} />

      <motion.div
        className="app-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Top bar: search + unit toggle */}
        <div className="top-bar">
          <div className="search-bar">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter city, state, country"
            />
            <button onClick={fetchWeather} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          <div className="unit-toggle">
            <button
              className={unit === 'F' ? 'unit-active' : ''}
              onClick={() => setUnit('F')}
            >°F</button>
            <button
              className={unit === 'C' ? 'unit-active' : ''}
              onClick={() => setUnit('C')}
            >°C</button>
          </div>
        </div>

        {error && <p className="error-text">{error}</p>}

        <AnimatePresence mode="wait">
          {weather && (
            <motion.div
              key={weather.cityName + weather.description}
              className="weather-display"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* Hero */}
              <div className="weather-hero">
                <h1 className="weather-city">{weather.cityName}</h1>
                {(weather.state || weather.country) && (
                  <p className="weather-location">
                    {[weather.state, weather.country].filter(Boolean).join(', ')}
                  </p>
                )}
                <p className="weather-local-time">{formatLocalTime(weather.localTime)}</p>

                <div className="weather-temp-group">
                  <div className="weather-temp">{temp(weather.temperature)}°{unit}</div>
                  <p className="weather-feels">Feels like {temp(weather.feelsLike)}°{unit}</p>
                </div>

                <p className="weather-desc">{weather.description}</p>
                <p className="weather-hi-lo">
                  H: {temp(weather.tempHigh)}°{unit} &nbsp; L: {temp(weather.tempLow)}°{unit}
                </p>
              </div>

              {/* Stats */}
              <div className="weather-stats">
                <div className="glass-card">
                  <span className="glass-card-label">Humidity</span>
                  <span className="glass-card-value">{weather.humidity}%</span>
                </div>
                <div className="glass-card">
                  <span className="glass-card-label">Wind</span>
                  <span className="glass-card-value">{weather.windSpeed} m/s</span>
                </div>
                <div className="glass-card">
                  <span className="glass-card-label">Sunrise</span>
                  <span className="glass-card-value">{formatTime(weather.sunrise)}</span>
                </div>
                <div className="glass-card">
                  <span className="glass-card-label">Sunset</span>
                  <span className="glass-card-value">{formatTime(weather.sunset)}</span>
                </div>
                {weather.airQuality != null && (
                  <div className="glass-card">
                    <span className="glass-card-label">Air Quality</span>
                    <span className="glass-card-value">{weather.airQuality}</span>
                    <span className="glass-card-sub">{weather.airQualityLabel}</span>
                  </div>
                )}
              </div>

              {/* 5-Day Forecast */}
              {weather.forecast && weather.forecast.length > 0 && (
                <div className="forecast-section">
                  <div className="forecast-title">5-Day Forecast</div>
                  <div className="forecast-row">
                    {weather.forecast.map((day, i) => (
                      <div className="forecast-day" key={day.date}>
                        <span className="forecast-day-name">{getDayName(day.date, i)}</span>
                        <span className="forecast-day-desc">{day.description}</span>
                        <span className="forecast-day-temps">
                          {temp(day.tempHigh)}° <span className="lo">{temp(day.tempLow)}°{unit}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default App;
