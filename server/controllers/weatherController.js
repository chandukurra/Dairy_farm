const isCoordinate = (value, min, max) => {
    const number = Number(value);
    return Number.isFinite(number) && number >= min && number <= max;
};

const CACHE_DURATION_MS = 15 * 60 * 1000;
let weatherCache = null;
let weatherRequest = null;

const fetchOpenMeteoWeather = async (latitude, longitude) => {
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
    return {
        temperature: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        windSpeed: data.current.wind_speed_10m,
        precipitation: data.current.precipitation,
        weatherCode: data.current.weather_code,
        updatedAt: data.current.time
    };
};

const fetchMetNoWeather = async (latitude, longitude) => {
    const response = await fetch(`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${latitude}&lon=${longitude}`, {
        headers: { 'User-Agent': 'KurraDairyFarm/1.0 (farm weather dashboard)' }
    });

    if (!response.ok) {
        const error = new Error(`Backup weather service responded with ${response.status}`);
        error.status = response.status;
        throw error;
    }

    const data = await response.json();
    const current = data.properties?.timeseries?.[0];
    const details = current?.data?.instant?.details;
    if (!details) throw new Error('Backup weather service did not return current conditions');

    const symbol = current.data.next_1_hours?.summary?.symbol_code || 'Current conditions';
    return {
        temperature: details.air_temperature,
        humidity: details.relative_humidity,
        windSpeed: details.wind_speed,
        precipitation: current.data.next_1_hours?.details?.precipitation_amount || 0,
        description: symbol.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()),
        updatedAt: current.time
    };
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
                weatherRequest = fetchOpenMeteoWeather(latitude, longitude)
                    .catch(() => fetchMetNoWeather(latitude, longitude))
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
                ...current
            }
        });
    } catch (error) {
        const message = error.status === 429
            ? 'Weather updates are temporarily limited. Please try again in a few minutes.'
            : 'Weather data is temporarily unavailable. Please try again shortly.';
        res.status(503).json({ success: false, message });
    }
};
