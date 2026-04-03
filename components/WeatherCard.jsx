'use client'

import { Sun, Cloud, CloudRain, CloudDrizzle, CloudLightning, CloudSnow, CloudFog, Wind, Thermometer, RefreshCw } from 'lucide-react'

const CONDITION_MAP = {
  Clear:        { Icon: Sun,             color: 'text-amber-500',  bg: 'bg-sunlight-light', label: 'Sunny' },
  Clouds:       { Icon: Cloud,           color: 'text-soil',       bg: 'bg-parchment',      label: 'Cloudy' },
  Rain:         { Icon: CloudRain,       color: 'text-blue-500',   bg: 'bg-blue-50',        label: 'Rainy' },
  Drizzle:      { Icon: CloudDrizzle,    color: 'text-sky-400',    bg: 'bg-sky-50',         label: 'Drizzle' },
  Thunderstorm: { Icon: CloudLightning,  color: 'text-violet-500', bg: 'bg-violet-50',      label: 'Storm' },
  Snow:         { Icon: CloudSnow,       color: 'text-indigo-400', bg: 'bg-indigo-50',      label: 'Snow' },
  Mist:         { Icon: CloudFog,        color: 'text-soil',       bg: 'bg-parchment',      label: 'Misty' },
  Fog:          { Icon: CloudFog,        color: 'text-soil',       bg: 'bg-parchment',      label: 'Foggy' },
  Haze:         { Icon: Wind,            color: 'text-soil',       bg: 'bg-parchment',      label: 'Hazy' },
}

function getCondition(condition) {
  return CONDITION_MAP[condition] ?? { Icon: Cloud, color: 'text-soil', bg: 'bg-parchment', label: condition }
}

function getDayLabel(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const same = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  if (same(date, today)) return 'Today'
  if (same(date, tomorrow)) return 'Tomorrow'
  return date.toLocaleDateString('en-US', { weekday: 'short' })
}

function SkeletonCard() {
  return (
    <div className="bg-parchment rounded-2xl border border-clay-light p-6 animate-pulse">
      <div className="h-5 w-32 bg-clay-light rounded mb-4" />
      <div className="grid grid-cols-5 gap-2">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-24 bg-cream rounded-xl" />
        ))}
      </div>
    </div>
  )
}

export default function WeatherCard({ dailyForecast, currentTemp, loading, error, location }) {
  if (loading) return <SkeletonCard />

  if (error) {
    return (
      <div className="bg-parchment rounded-2xl border border-red-200 p-6">
        <div className="flex items-center gap-2 text-red-600 mb-2">
          <Thermometer className="w-4 h-4" />
          <span className="font-semibold text-sm">Weather unavailable</span>
        </div>
        <p className="text-xs text-red-500 leading-relaxed">{error}</p>
        <p className="text-xs text-soil mt-2">
          Weather data is provided by Open-Meteo. Try refreshing the page.
        </p>
      </div>
    )
  }

  if (!dailyForecast || dailyForecast.length === 0) {
    return (
      <div className="bg-parchment rounded-2xl border border-clay p-6">
        <h2 className="font-serif text-lg text-bark mb-2">10-Day Forecast</h2>
        <p className="text-xs text-soil">No forecast data available. Check back shortly.</p>
      </div>
    )
  }

  return (
    <div className="bg-parchment rounded-2xl border border-clay-light p-6 shadow-warm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-serif text-lg text-bark">10-Day Forecast</h2>
          <p className="text-xs text-soil mt-0.5">
            {location?.city || 'Sunnyvale'}{location?.state ? `, ${location.state}` : ', CA'}
          </p>
        </div>
        {currentTemp !== null && (
          <div className="flex items-center gap-1.5 bg-mint/30 border border-mint rounded-xl px-3 py-1.5">
            <Thermometer className="w-4 h-4 text-sage-dark" />
            <span className="text-sage-dark font-bold text-sm">{Math.round(currentTemp)}°F</span>
            <span className="text-sage/60 text-xs ml-0.5">now</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-5 gap-2 gap-y-2">
        {dailyForecast.map((day) => {
          const { Icon, color, bg, label } = getCondition(day.condition)
          const isHot = day.high > 85
          const isCold = day.low < 32
          return (
            <div
              key={day.date}
              className="flex flex-col items-center gap-1.5 bg-cream rounded-xl p-2.5 border border-clay-light/60"
            >
              <span className="text-xs font-semibold text-soil">{getDayLabel(day.date)}</span>
              <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <span className="text-xs text-clay-dark">{label}</span>
              <div className="text-center">
                <div className={`text-sm font-bold ${isHot ? 'text-terracotta' : 'text-bark'}`}>
                  {day.high}°
                </div>
                <div className={`text-xs ${isCold ? 'text-blue-500 font-semibold' : 'text-soil'}`}>
                  {day.low}°
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex gap-3 mt-3 text-xs text-soil">
        {dailyForecast.some((d) => d.high > 85) && (
          <span className="flex items-center gap-1 text-terracotta">
            <span className="w-2 h-2 rounded-full bg-terracotta inline-block" />
            High temp — water more
          </span>
        )}
        {dailyForecast.some((d) => d.low < 32) && (
          <span className="flex items-center gap-1 text-blue-500">
            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
            Frost risk
          </span>
        )}
      </div>
    </div>
  )
}
