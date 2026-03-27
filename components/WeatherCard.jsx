'use client'

import { Sun, Cloud, CloudRain, CloudDrizzle, CloudLightning, CloudSnow, CloudFog, Wind, Thermometer, RefreshCw } from 'lucide-react'

const CONDITION_MAP = {
  Clear:        { Icon: Sun,             color: 'text-amber-500',  bg: 'bg-amber-50',   label: 'Sunny' },
  Clouds:       { Icon: Cloud,           color: 'text-stone-400',  bg: 'bg-stone-100',  label: 'Cloudy' },
  Rain:         { Icon: CloudRain,       color: 'text-blue-500',   bg: 'bg-blue-50',    label: 'Rainy' },
  Drizzle:      { Icon: CloudDrizzle,    color: 'text-sky-400',    bg: 'bg-sky-50',     label: 'Drizzle' },
  Thunderstorm: { Icon: CloudLightning,  color: 'text-violet-500', bg: 'bg-violet-50',  label: 'Storm' },
  Snow:         { Icon: CloudSnow,       color: 'text-indigo-400', bg: 'bg-indigo-50',  label: 'Snow' },
  Mist:         { Icon: CloudFog,        color: 'text-stone-400',  bg: 'bg-stone-100',  label: 'Misty' },
  Fog:          { Icon: CloudFog,        color: 'text-stone-400',  bg: 'bg-stone-100',  label: 'Foggy' },
  Haze:         { Icon: Wind,            color: 'text-stone-400',  bg: 'bg-stone-100',  label: 'Hazy' },
}

function getCondition(condition) {
  return CONDITION_MAP[condition] ?? { Icon: Cloud, color: 'text-stone-400', bg: 'bg-stone-100', label: condition }
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
    <div className="bg-white rounded-2xl border border-stone-200 p-5 animate-pulse">
      <div className="h-5 w-32 bg-stone-200 rounded mb-4" />
      <div className="flex gap-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex-1 h-24 bg-stone-100 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

export default function WeatherCard({ dailyForecast, currentTemp, loading, error }) {
  if (loading) return <SkeletonCard />

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-red-200 p-5">
        <div className="flex items-center gap-2 text-red-600 mb-2">
          <Thermometer className="w-4 h-4" />
          <span className="font-semibold text-sm">Weather unavailable</span>
        </div>
        <p className="text-xs text-red-500 leading-relaxed">{error}</p>
        <p className="text-xs text-stone-400 mt-2">
          Make sure <code className="bg-stone-100 px-1 rounded">.env.local</code> has your{' '}
          <code className="bg-stone-100 px-1 rounded">OPENWEATHERMAP_API_KEY</code>.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-bold text-emerald-900 text-base">5-Day Forecast</h2>
          <p className="text-xs text-stone-400">Sunnyvale, CA</p>
        </div>
        {currentTemp !== null && (
          <div className="flex items-center gap-1 bg-[#ADE883]/20 border border-[#ADE883]/40 rounded-xl px-3 py-1.5">
            <Thermometer className="w-4 h-4 text-[#6B8E23]" />
            <span className="text-[#6B8E23] font-bold text-sm">{Math.round(currentTemp)}°F</span>
            <span className="text-[#6B8E23]/60 text-xs ml-1">now</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-5 gap-2">
        {dailyForecast.map((day) => {
          const { Icon, color, bg, label } = getCondition(day.condition)
          const isHot = day.high > 85
          const isCold = day.low < 32
          return (
            <div
              key={day.date}
              className="flex flex-col items-center gap-1.5 bg-stone-50 rounded-xl p-2.5 border border-stone-100"
            >
              <span className="text-xs font-semibold text-stone-500">{getDayLabel(day.date)}</span>
              <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <span className="text-xs text-stone-400">{label}</span>
              <div className="text-center">
                <div className={`text-sm font-bold ${isHot ? 'text-red-500' : 'text-emerald-900'}`}>
                  {day.high}°
                </div>
                <div className={`text-xs ${isCold ? 'text-blue-500 font-semibold' : 'text-stone-400'}`}>
                  {day.low}°
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex gap-3 mt-3 text-xs text-stone-400">
        {dailyForecast.some((d) => d.high > 85) && (
          <span className="flex items-center gap-1 text-red-500">
            <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
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
