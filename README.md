# 🌦️ Weather App

A full‑stack weather application with user authentication and the ability to save favorite weather records. It uses a modern glassmorphic UI, real‑time weather data (no API key required), and a local SQLite database.

![Screenshot](https://via.placeholder.com/800x400?text=Weather+App+Screenshot)  
*(Replace with actual screenshot)*

## ✨ Features

- 🔐 User signup / login with JWT authentication
- 🌍 Search weather for any city worldwide (Open‑Meteo API, no key needed)
- 💾 Save current weather to personal list
- 📋 View saved weather entries (city, temperature, condition, icon, save date)
- 🗑️ Delete saved entries
- 🎨 Beautiful glassmorphic UI with Tailwind CSS
- 📱 Fully responsive

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, SQLite (better‑sqlite3)
- **Auth**: JSON Web Tokens (JWT), bcrypt
- **Weather**: Open‑Meteo API (geocoding + forecast)
- **Frontend**: HTML, CSS (Tailwind + custom glassmorphic styles), vanilla JavaScript
- **Database**: SQLite (single file, zero‑config)

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

weather-app/
├── .env.example          # Example environment variables
├── .gitignore
├── package.json
├── server.js             # Main server file
├── db.js                 # Database connection & table setup
├── models/
│   ├── User.js           # User model
│   └── SavedWeather.js   # Saved weather model
├── middleware/
│   └── auth.js           # JWT verification middleware
├── routes/
│   ├── auth.js           # /api/auth endpoints
│   ├── weather.js        # /api/weather (Open‑Meteo)
│   └── saved.js          # /api/saved (CRUD)
├── public/
│   ├── index.html        # Frontend HTML
│   ├── style.css         # Custom styles
│   └── app.js            # Frontend logic
└── weather.db            # SQLite database (auto‑created)