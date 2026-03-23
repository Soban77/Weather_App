const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) {
      return res.status(400).json({ error: 'City name required' });
    }

    // const apiKey = process.env.WEATHER_API_KEY;
    // // Example: Get weather by coordinates
    // const url = `https://api.weather.gov/points/${latitude},${longitude}`;
    // // Then get the forecast URL from the response
    // // const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;
    // const response = await axios.get(url);
    // const data = response.data;

    // const weatherData = {
    //   city: data.name,
    //   temperature: data.main.temp,
    //   condition: data.weather[0].description,
    //   icon: data.weather[0].icon,
    //   humidity: data.main.humidity,
    //   windSpeed: data.wind.speed,
    // };

    // // 1. Geocode city to lat/lon (using Open‑Meteo geocoding – free, no key)
    // const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    // const geoRes = await axios.get(geoUrl);
    // if (!geoRes.data.results || geoRes.data.results.length === 0) {
    //   return res.status(404).json({ error: 'City not found' });
    // }
    // const { latitude, longitude, name, country } = geoRes.data.results[0];

    // // 2. Get the forecast grid point from weather.gov
    // const pointsUrl = `https://api.weather.gov/points/${latitude},${longitude}`;
    // const pointsRes = await axios.get(pointsUrl, {
    //   headers: { 'User-Agent': 'YourWeatherApp/1.0 (youremail@example.com)' } // ← Required
    // });
    // const forecastUrl = pointsRes.data.properties.forecast; // URL for the 7‑day forecast

    // // 3. Fetch the forecast
    // const forecastRes = await axios.get(forecastUrl, {
    //   headers: { 'User-Agent': 'YourWeatherApp/1.0 (youremail@example.com)' }
    // });
    // const periods = forecastRes.data.properties.periods;
    // const current = periods[0]; // First period is today's forecast

    // // 4. Format the response (matching your frontend expectations)
    // const weatherData = {
    //   city: `${name}, ${country}`,
    //   temperature: current.temperature,
    //   condition: current.shortForecast,
    //   icon: current.icon,   // Already a full URL (e.g. .../icon.png)
    //   humidity: 'N/A',      // Not provided in this forecast; you could omit
    //   windSpeed: current.windSpeed
    // };
     // 1. Geocode city to coordinates (Open‑Meteo geocoding, free, no key)
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    const geoRes = await axios.get(geoUrl);
    if (!geoRes.data.results || geoRes.data.results.length === 0) {
      return res.status(404).json({ error: 'City not found' });
    }

    const { latitude, longitude, name, country } = geoRes.data.results[0];

    // 2. Get current weather (Open‑Meteo forecast API, no key)
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&temperature_unit=celsius&wind_speed_unit=ms`;
    const weatherRes = await axios.get(weatherUrl);
    const current = weatherRes.data.current;

    // 3. Map weather codes to descriptions and icons (compatible with your frontend)
    const weatherCodeMap = {
      0: { description: 'Clear sky', icon: '01d' },
      1: { description: 'Mainly clear', icon: '02d' },
      2: { description: 'Partly cloudy', icon: '03d' },
      3: { description: 'Overcast', icon: '04d' },
      45: { description: 'Fog', icon: '50d' },
      48: { description: 'Rime fog', icon: '50d' },
      51: { description: 'Light drizzle', icon: '09d' },
      53: { description: 'Moderate drizzle', icon: '09d' },
      55: { description: 'Dense drizzle', icon: '09d' },
      61: { description: 'Slight rain', icon: '10d' },
      63: { description: 'Moderate rain', icon: '10d' },
      65: { description: 'Heavy rain', icon: '10d' },
      71: { description: 'Slight snow', icon: '13d' },
      73: { description: 'Moderate snow', icon: '13d' },
      75: { description: 'Heavy snow', icon: '13d' },
      95: { description: 'Thunderstorm', icon: '11d' }
    };
    const weatherInfo = weatherCodeMap[current.weather_code] || { description: 'Unknown', icon: '01d' };

    const weatherData = {
      city: `${name}, ${country}`,
      temperature: current.temperature_2m,
      condition: weatherInfo.description,
      icon: weatherInfo.icon,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
    };
    res.json(weatherData);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: 'City not found' });
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

module.exports = router;