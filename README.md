# RootCause 🌱

A smart beginner gardening assistant for **Zone 9b (Sunnyvale, CA)**. Combines live 5-day weather forecasts with almanac frost-date logic to tell you exactly what to plant — and when.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | TailwindCSS — earthy `stone-50` / `emerald-900` / `orange-500` theme |
| Icons | Lucide-react |
| Weather | OpenWeatherMap 5-day forecast API (proxied server-side) |
| Persistence | Browser LocalStorage (My Garden, active tab, weather cache) |

## Project Structure

```
├── app/
│   ├── layout.jsx           Root layout + metadata
│   ├── globals.css          Tailwind base + scrollbar styles
│   ├── page.jsx             Main page — tabs, LocalStorage state
│   └── api/weather/
│       └── route.js         Server-side OWM proxy (hides API key)
├── components/
│   ├── Header.jsx           Logo, zone badge, frost dates
│   ├── AlertBanner.jsx      Smart dismissible alerts
│   ├── WeatherCard.jsx      5-day forecast grid
│   ├── RightNow.jsx         Per-plant planting status vs forecast
│   ├── AlmanacTimeline.jsx  Visual warm/cool season year bar
│   ├── PlantLibrary.jsx     10-plant grid with expand/favourite
│   └── PlantCalendar.jsx    12-month planting window grid + summary table
├── hooks/
│   └── useWeather.js        Fetch + 1-hr localStorage cache
├── lib/
│   ├── constants.js         Zone config, frost dates, cache keys
│   ├── plantData.js         10 hardcoded plants with companion data
│   └── plantLogic.js        getPlantStatus() + getNotifications()
├── jsconfig.json            @/ path alias
└── .env.local.example       API key template
```

## Hardcoded Zone Config

| Setting | Value |
|---------|-------|
| Location | Sunnyvale, CA |
| Zone | 9b |
| Last Frost | **March 1** |
| First Frost | **November 15** |
| Warm Season | March 1 – November 15 |
| Cool Season | November 15 – March 1 |

## Getting Started

### 1. Clone and install

```bash
npm install
```

### 2. Add your OpenWeatherMap API key

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and paste your key:
```
OPENWEATHERMAP_API_KEY=your_key_here
```

Get a **free** key at [openweathermap.org/api](https://openweathermap.org/api) — the free tier (60 calls/min, 5-day forecast) is sufficient.

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> The weather API key is only used server-side (the Next.js API route at `/api/weather`). It is never exposed to the browser.

## Features

### Dashboard
- **5-Day Forecast** — condition icons, high/low temps, heat (>85°F) and frost (<32°F) badges
- **Right Now** — per-plant planting status (Ideal / Start Indoors / Too Cold / Too Hot / Almost Ready) based on live forecast lows vs each plant's minimum temperature
- **Almanac View** — horizontal year bar + month grid showing warm season (orange) and cool season (blue)

### Smart Alerts
- **Start Tomatoes Indoors** — fires when today falls within 6 weeks of March 1
- **Heat Alert** — fires when any forecast day exceeds 85°F
- **Frost Warning** — fires when any forecast day drops below 32°F
- All alerts are individually dismissible

### Plant Library (10 plants)
Tomato, Basil, Zucchini, Bush Beans, Bell Pepper, Lettuce, Kale, Carrots, Sugar Snaps, Swiss Chard

Each card shows:
- Current planting status with reasoning
- Vessel recommendation
- Companion plants & plants to avoid
- Indoor start schedule
- Days to harvest + ideal temp range

### Planting Calendar
- **12-month grid** per selected plant (green = plant outdoors, amber = start indoors)
- **All-plants summary table** — colour-coded planting windows for every plant at a glance
- Integrates with My Garden for filtered views

### My Garden
- Heart any plant to add it to your personal garden list
- Saved to LocalStorage — persists across sessions
- Filters the Plant Library and Calendar views
