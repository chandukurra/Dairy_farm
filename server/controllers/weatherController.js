const isCoordinate = (value, min, max) => {
    const number = Number(value);
    return Number.isFinite(number) && number >= min && number <= max;
};

const CACHE_DURATION_MS = 15 * 60 * 1000;
let weatherCache = null;
let weatherRequest = null;

const fetchWeather = async (latitude, longitude) => {
    const query = new URLSearchParams({
        latitude,
        longitude,
        current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code',
        timezone: 'auto'
    });
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${query}`);

    if (!response.ok) {
        const error = new Error(`Weather service responded with ${response.status}`);
        error.status = response.status;
        throw error;
    }

    const data = await response.json();
    if (!data.current) throw new Error('Weather service did not return current conditions');
    return data.current;
};

// @desc    Get current weather for the configured farm location
// @route   GET /api/weather/current
// @access  Private
exports.getCurrentWeather = async (req, res) => {
    const latitude = process.env.FARM_LATITUDE;
    const longitude = process.env.FARM_LONGITUDE;

    if (!isCoordinate(latitude, -90, 90) || !isCoordinate(longitude, -180, 180)) {
        return res.status(422).json({
            success: false,
            message: 'Farm location is not configured. Add FARM_LATITUDE and FARM_LONGITUDE to the server environment.'
        });
    }

    try {
        const now = Date.now();
        if (!weatherCache || weatherCache.latitude !== latitude || weatherCache.longitude !== longitude || now - weatherCache.cachedAt >= CACHE_DURATION_MS) {
            if (!weatherRequest) {
                weatherRequest = fetchWeather(latitude, longitude)
                    .then((current) => {
                        weatherCache = { latitude, longitude, current, cachedAt: Date.now() };
                        return current;
                    })
                    .finally(() => { weatherRequest = null; });
            }
            await weatherRequest;
        }

        const { current } = weatherCache;

        res.status(200).json({
            success: true,
            data: {
                locationName: process.env.FARM_LOCATION_NAME || 'Farm location',
                temperature: current.temperature_2m,
                humidity: current.relative_humidity_2m,
                windSpeed: current.wind_speed_10m,
                precipitation: current.precipitation,
                weatherCode: current.weather_code,
                updatedAt: current.time
            }
        });
    } catch (error) {
        const message = error.status === 429
            ? 'Weather updates are temporarily limited. Please try again in a few minutes.'
            : 'Weather data is temporarily unavailable. Please try again shortly.';
        res.status(503).json({ success: false, message });
    }
};
