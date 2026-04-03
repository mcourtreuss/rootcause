'use client'

import { useState, useEffect, useCallback } from 'react'
import { ZONE_CONFIG, WEATHER_CACHE_KEY, WEATHER_CACHE_TIME_KEY } from '@/lib/constants'

const LOCATION_CACHE_KEY = 'rootcause_location'

const DEFAULT_LOCATION = {
  zip: '',
  city: ZONE_CONFIG.city,
  state: '',
  lat: ZONE_CONFIG.lat,
  lon: ZONE_CONFIG.lon,
  zone: ZONE_CONFIG.zone,
  lastFrost: ZONE_CONFIG.lastFrost,
  firstFrost: ZONE_CONFIG.firstFrost,
}

export function useLocation() {
  const [location, setLocation] = useState(DEFAULT_LOCATION)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const cached = localStorage.getItem(LOCATION_CACHE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        setLocation(parsed)
      }
    } catch {}
  }, [])

  const setZipCode = useCallback(async (zip) => {
    const cleanZip = zip.replace(/\D/g, '').slice(0, 5)
    if (cleanZip.length !== 5) {
      return { success: false, error: 'Please enter a 5-digit zip code.' }
    }

    setLoading(true)
    setError(null)

    try {
      const geoRes = await fetch(`/api/geocode?zip=${cleanZip}`)
      const geoData = await geoRes.json()

      if (!geoRes.ok) {
        throw new Error(geoData.error || `Geocoding error (${geoRes.status})`)
      }

      const frostRes = await fetch(`/api/frost-dates?zip=${cleanZip}`)
      const frostData = await frostRes.json()

      if (!frostRes.ok) {
        throw new Error(frostData.error || 'Could not determine frost dates.')
      }

      const newLocation = {
        zip: cleanZip,
        city: geoData.city,
        state: geoData.state,
        lat: geoData.lat,
        lon: geoData.lon,
        zone: frostData.zone,
        lastFrost: frostData.lastFrost,
        firstFrost: frostData.firstFrost,
      }

      setLocation(newLocation)
      localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(newLocation))

      // Clear weather cache so it re-fetches for new location
      localStorage.removeItem(WEATHER_CACHE_KEY)
      localStorage.removeItem(WEATHER_CACHE_TIME_KEY)

      return { success: true }
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch location.'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  const clearLocation = useCallback(() => {
    setLocation(DEFAULT_LOCATION)
    localStorage.removeItem(LOCATION_CACHE_KEY)
    localStorage.removeItem(WEATHER_CACHE_KEY)
    localStorage.removeItem(WEATHER_CACHE_TIME_KEY)
  }, [])

  return { location, loading, error, mounted, setZipCode, clearLocation }
}
