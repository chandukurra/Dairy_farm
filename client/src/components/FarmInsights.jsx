const FarmInsights = ({ milk = {} }) => {
    const total = Number(milk.today || 0);
    const morning = Number(milk.morning || 0);
    const evening = Number(milk.evening || 0);
    const history = milk.history || [];
    const maxValue = Math.max(...history.map((item) => Number(item.total || 0)), 1);

    return (
        <aside className="farm-insights dashboard-insights">
            <div className="insights-title"><span>🌱</span><strong>Smart Farm Insights</strong><span>⋮</span></div>
            <div className="weather-card">
                <div className="weather-heading"><span>⛅ Farm Weather</span><small>Connect weather API</small></div>
                <strong>—°C</strong><p>Weather data appears once a farm location is configured.</p>
                <div className="weather-meta"><span>💧 Humidity —</span><span>↝ Wind —</span><span>☂ Rain —</span></div>
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
