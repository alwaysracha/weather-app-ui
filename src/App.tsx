import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface WeatherData {
  cityName: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
}

function App() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [city, setCity] = useState('New York');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || '/api';

  const fetchWeather = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/weather/${city}`);
      
      if (!response.ok) {
        throw new Error('City not found');
      }
      
      const data = await response.json();
      setWeather(data);
    } catch (err) {
      setError('Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      backgroundColor: '#1a1a2e',
      color: 'white'
    }}>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: 'center' }}
      >
        <h1 style={{ fontSize: '3rem', marginBottom: '2rem' }}>Weather App</h1>
        
        <div style={{ marginBottom: '2rem' }}>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name"
            style={{ 
              padding: '10px', 
              fontSize: '1rem',
              marginRight: '10px',
              borderRadius: '5px'
            }}
          />
          <button 
            onClick={fetchWeather}
            disabled={loading}
            style={{ 
              padding: '10px 20px', 
              fontSize: '1rem',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {loading ? 'Loading...' : 'Get Weather'}
          </button>
        </div>

        {error && <p style={{ color: '#ab2828ff' }}>{error}</p>}

        {weather && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{ 
              padding: '2rem',
              backgroundColor: '#798fccff',
              borderRadius: '15px',
              minWidth: '300px'
            }}
          >
            <h2>{weather.cityName}</h2>
            <div style={{ fontSize: '3rem', margin: '1rem 0' }}>
              {Math.round(weather.temperature)}°C
            </div>
            <p style={{ fontSize: '1.2rem', textTransform: 'capitalize' }}>
              {weather.description}
            </p>
            <div style={{ marginTop: '1rem' }}>
              <p>Humidity: {weather.humidity}%</p>
              <p>Wind Speed: {weather.windSpeed} m/s</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default App;
