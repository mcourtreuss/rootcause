'use client'

import { useState, useEffect } from 'react'
import {
  WEATHER_CACHE_KEY,
  WEATHER_CACHE_TIME_KEY,
  WEATHER_CACHE_DURATION,
} from '@/lib/constants'

function wmoToCondition(code) {
  if (code === 0) return 'Clear'
  if (code <= 3) return 'Clouds'
  if (code <= 48) return 'Fog'
  if (code <= 55) return 'Drizzle'
  if (code <= 65) return 'Rain'
  if (code <= 75) return 'Snow'
  if (code <= 82) return 'Rain'
  if (code <= 99) return 'Thunderstorm'
  return 'Clouds'
}

function parseDailyForecast(data) {
  if (!data?.daily?.time) return []
  const { time, temperature_2m_max, temperature_2m_min, weathercode } = data.daily
  return time.slice(0, 10).map((date, i) => ({
    date,
    high: Math.round(temperature_2m_max[i]),
    low: Math.round(temperature_2m_min[i]),
    condition: wmoToCondition(weathercode[i]),
  }))
}

export function useWeather() {
  const [rawData, setRawData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const cached = localStorage.getItem(WEATHER_CACHE_KEY)
        const cachedTime = localStorage.getItem(WEATHER_CACHE_TIME_KEY)

        if (cached && cachedTime) {
          const age = Date.now() - parseInt(cachedTime, 10)
          if (age < WEATHER_CACHE_DURATION) {
            setRawData(JSON.parse(cached))
            setLoading(false)
            return
          }
        }

        const res = await fetch('/api/weather')
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || `Weather API error (${res.status})`)
        }
        const json = await res.json()
        if (json.error) throw new Error(json.error)
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
  }, [])

  const dailyForecast = rawData ? parseDailyForecast(rawData) : []
  const forecastLows = dailyForecast.map((d) => d.low)
  const hasHeatAlert = dailyForecast.some((d) => d.high > 85)
  const hasFrostAlert = dailyForecast.some((d) => d.low < 32)
  const currentTemp = rawData?.current?.temperature_2m ?? null

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
