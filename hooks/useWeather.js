'use client'

import { useState, useEffect } from 'react'
import {
  WEATHER_CACHE_KEY,
  WEATHER_CACHE_TIME_KEY,
  WEATHER_CACHE_DURATION,
  ZONE_CONFIG,
} from '@/lib/constants'

function parseDailyForecast(list) {
  if (!list || list.length === 0) return []

  const days = {}
  list.forEach((entry) => {
    const dateKey = entry.dt_txt.split(' ')[0]
    if (!days[dateKey]) {
      days[dateKey] = { date: dateKey, temps: [], conditions: [], icons: [] }
    }
    days[dateKey].temps.push(entry.main.temp_min, entry.main.temp_max)
    days[dateKey].conditions.push(entry.weather[0].main)
    days[dateKey].icons.push(entry.weather[0].icon)
  })

  return Object.values(days)
    .slice(0, 5)
    .map((day) => {
      const sortedTemps = [...day.temps].sort((a, b) => a - b)
      const counts = day.conditions.reduce((acc, c) => {
        acc[c] = (acc[c] || 0) + 1
        return acc
      }, {})
      const condition = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
      const midIcon = day.icons[Math.floor(day.icons.length / 2)]
      return {
        date: day.date,
        low: Math.round(sortedTemps[0]),
        high: Math.round(sortedTemps[sortedTemps.length - 1]),
        condition,
        icon: midIcon,
      }
    })
}

export function useWeather(lat = null, lon = null) {
  const [rawData, setRawData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const cached = localStorage.getItem(WEATHER_CACHE_KEY)
        const cachedTime = localStorage.getItem(WEATHER_CACHE_TIME_KEY)
        const currentLat = lat ?? ZONE_CONFIG.lat
        const currentLon = lon ?? ZONE_CONFIG.lon

        if (cached && cachedTime) {
          const age = Date.now() - parseInt(cachedTime, 10)
          if (age < WEATHER_CACHE_DURATION) {
            const parsedCache = JSON.parse(cached)
            if (parsedCache.lat === currentLat && parsedCache.lon === currentLon) {
              setRawData(parsedCache)
              setLoading(false)
              return
            }
          }
        }

        const url = `/api/weather?lat=${currentLat}&lon=${currentLon}`
        const res = await fetch(url)
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || `Weather API error (${res.status})`)
        }
        const json = await res.json()
        json.lat = currentLat
        json.lon = currentLon
        setRawData(json)
        localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(json))
        localStorage.setItem(WEATHER_CACHE_TIME_KEY, Date.now().toString())
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [lat, lon])

  const dailyForecast = rawData ? parseDailyForecast(rawData.list) : []
  const forecastLows = dailyForecast.map((d) => d.low)
  const hasHeatAlert = dailyForecast.some((d) => d.high > 85)
  const hasFrostAlert = dailyForecast.some((d) => d.low < 32)
  const currentTemp = rawData?.list?.[0]?.main?.temp ?? null

  return {
    rawData,
    dailyForecast,
    forecastLows,
    currentTemp,
    hasHeatAlert,
    hasFrostAlert,
    loading,
    error,
  }
}
