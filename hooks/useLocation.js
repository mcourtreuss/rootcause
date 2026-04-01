'use client'

import { useState, useEffect, useCallback } from 'react'
import { ZONE_CONFIG, WEATHER_CACHE_KEY, WEATHER_CACHE_TIME_KEY } from '@/lib/constants'

const LOCATION_CACHE_KEY = 'rootcause_location'
const LOCATION_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000

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
    const cached = localStorage.getItem(LOCATION_CACHE_KEY)
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        setLocation(parsed)
      } catch {}
    }
  }, [])

  const setZipCode = useCallback(async (zip) => {
    const cleanZip = zip.replace(/\D/g, '').slice(0, 5)
    if (cleanZip.length !== 5) {
      return { success: false, error: 'Please enter a 5-digit zip code.' }
    }

    setLoading(true)
    setError(null)

    try {
      const geoRes = await fetch(`/api/geocode?zip=${cleanZip}`, {
        signal: AbortSignal.timeout(10000),
      }).catch((err) => {
        if (err.name === 'AbortError') {
          throw new Error('Request timed out. Check your connection.')
        }
        throw new Error('Cannot connect to server. Is the dev server running?')
      })
      
      let geoData
      try {
        geoData = await geoRes.json()
      } catch {
        throw new Error('Server returned invalid response. Is the dev server running?')
      }
      
      if (!geoRes.ok) {
        if (geoRes.status === 404) {
          throw new Error('Zip code not found. Try a different US zip.')
        }
        throw new Error(geoData.error || `Server error (${geoRes.status})`)
      }

      const frostRes = await fetch(`/api/frost-dates?zip=${cleanZip}`, {
        signal: AbortSignal.timeout(10000),
      }).catch((err) => {
        if (err.name === 'AbortError') {
          throw new Error('Request timed out. Check your connection.')
        }
        throw new Error('Cannot connect to server.')
      })
      
      let frostData
      try {
        frostData = await frostRes.json()
      } catch {
        throw new Error('Server returned invalid response for frost dates.')
      }
      
      if (!frostRes.ok) {
        if (frostRes.status === 404) {
          throw new Error('Location found but frost data unavailable for this area.')
        }
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

      localStorage.removeItem(WEATHER_CACHE_KEY)
      localStorage.removeItem(WEATHER_CACHE_TIME_KEY)

      return { success: true }
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch location. Please try again.'
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

  return {
    location,
    loading,
    error,
    mounted,
    setZipCode,
    clearLocation,
  }
}
