import { useEffect, useState } from 'react';
import api from '../services/api';

const weatherDescription = (code) => {
    if (code === 0) return 'Clear sky';
    if ([1, 2, 3].includes(code)) return 'Partly cloudy';
    if ([45, 48].includes(code)) return 'Foggy';
    if ([51, 53, 55, 56, 57].includes(code)) return 'Drizzle';
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Rain';
    if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snow';
    if ([95, 96, 99].includes(code)) return 'Thunderstorms';
    return 'Current conditions';
};

const FarmInsights = ({ milk = {} }) => {
    const [weather, setWeather] = useState(null);
    const [weatherError, setWeatherError] = useState('');

    useEffect(() => {
        let active = true;

        const loadWeather = async () => {
            try {
                const response = await api.get('/weather/current');
                if (active) setWeather(response.data.data);
            } catch (error) {
                if (active) setWeatherError(error.response?.data?.message || 'Weather data is temporarily unavailable.');
            }
        };

        loadWeather();
        return () => { active = false; };
    }, []);

    const total = Number(milk.today || 0);
    const morning = Number(milk.morning || 0);
    const evening = Number(milk.evening || 0);
    const history = milk.history || [];
    const maxValue = Math.max(...history.map((item) => Number(item.total || 0)), 1);

    return (
        <aside className="farm-insights dashboard-insights">
            <div className="insights-title"><span>🌱</span><strong>Smart Farm Insights</strong><span>⋮</span></div>
            <div className="weather-card">
                <div className="weather-heading"><span>⛅ Farm Weather</span><small>{weather?.locationName || 'Farm location'}</small></div>
                <strong>{weather ? `${Math.round(weather.temperature)}°C` : '—°C'}</strong>
                <p>{weather ? weatherDescription(weather.weatherCode) : (weatherError || 'Loading current weather…')}</p>
                <div className="weather-meta"><span>💧 Humidity {weather ? `${weather.humidity}%` : '—'}</span><span>↝ Wind {weather ? `${weather.windSpeed} km/h` : '—'}</span><span>☂ Rain {weather ? `${weather.precipitation} mm` : '—'}</span></div>
            </div>
            <div className="production-card">
                <div className="section-label">🥛 Today's Milk Production <span>Live</span></div>
                <strong>{total.toFixed(1)} <small>L</small></strong>
                <p>Recorded production for today</p>
                <div className="production-split"><div><span>☀ Morning</span><b>{morning.toFixed(1)} L</b></div><div><span>☾ Evening</span><b>{evening.toFixed(1)} L</b></div></div>
                <div className="milk-chart" aria-label="Seven-day milk production chart">
                    {history.length ? history.map((item) => <div className="chart-bar" key={item.label}><i style={{ height: `${Math.max(8, (Number(item.total || 0) / maxValue) * 100)}%` }} /><small>{item.label.split(' ')[0]}</small></div>) : <p className="chart-empty">No production data for the last 7 days.</p>}
                </div>
            </div>
            <div className="farm-tip"><span>💡</span><div><strong>Smart Tip of the Day</strong><p>Keep clean water available throughout the day to support healthy milk production.</p><small>♥ Healthy cows, happy farm!</small></div></div>
        </aside>
    );
};

export default FarmInsights;
