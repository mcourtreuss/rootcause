'use client'

import { useState, useEffect } from 'react'
import { LayoutDashboard, Leaf, CalendarDays, ScanLine } from 'lucide-react'
import Header from '@/components/Header'
import AlertBanner from '@/components/AlertBanner'
import WeatherCard from '@/components/WeatherCard'
import RightNow from '@/components/RightNow'
import AlmanacTimeline from '@/components/AlmanacTimeline'
import PlantLibrary from '@/components/PlantLibrary'
import PlantCalendar from '@/components/PlantCalendar'
import PlantDoctor from '@/components/PlantDoctor'
import { useWeather } from '@/hooks/useWeather'
import { useLocation } from '@/hooks/useLocation'
import { ACTIVE_TAB_KEY, IGNORED_PLANTS_KEY } from '@/lib/constants'
import { MY_SEED_IDS } from '@/lib/mySeeds'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'plants',    label: 'Plant Library', Icon: Leaf },
  { id: 'calendar',  label: 'Planting Calendar', Icon: CalendarDays },
  { id: 'doctor',    label: 'Plant Doctor', Icon: ScanLine },
]

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [ignoredPlants, setIgnoredPlants] = useState([])
  const [mounted, setMounted] = useState(false)

  const { location, loading: locationLoading, error: locationError, mounted: locationMounted, setZipCode } = useLocation()

  // Filter out ignored plants from My Seeds
  const myPlants = MY_SEED_IDS.filter(id => !ignoredPlants.includes(id))

  const {
    dailyForecast,
    forecastLows,
    currentTemp,
    hasHeatAlert,
    hasFrostAlert,
    loading: weatherLoading,
    error: weatherError,
  } = useWeather(location.lat, location.lon)

  // Hydrate tab and ignored plants from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    setMounted(true)
    try {
      const storedTab = localStorage.getItem(ACTIVE_TAB_KEY)
      if (storedTab && TABS.some((t) => t.id === storedTab)) setActiveTab(storedTab)

      const storedIgnored = localStorage.getItem(IGNORED_PLANTS_KEY)
      if (storedIgnored) setIgnoredPlants(JSON.parse(storedIgnored))
    } catch {}
  }, [])

  const handleToggleIgnore = (plantId) => {
    setIgnoredPlants((prev) => {
      const updated = prev.includes(plantId)
        ? prev.filter((id) => id !== plantId)
        : [...prev, plantId]
      try { localStorage.setItem(IGNORED_PLANTS_KEY, JSON.stringify(updated)) } catch {}
      return updated
    })
  }

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    try { localStorage.setItem(ACTIVE_TAB_KEY, tabId) } catch {}
  }

  if (!mounted || !locationMounted) return null

  const loading = locationLoading || weatherLoading
  const error = locationError || weatherError

  return (
    <div className="min-h-screen bg-stone-50">
      <Header
        location={location}
        onZipSubmit={setZipCode}
        loading={locationLoading}
        error={locationError}
      />

      <AlertBanner
        dailyForecast={dailyForecast}
        lastFrost={location.lastFrost}
        firstFrost={location.firstFrost}
      />

      {/* Tab nav */}
      <div className="max-w-6xl mx-auto px-4 pt-4">
        <div className="flex gap-1 bg-white border border-stone-200 p-1 rounded-xl w-fit shadow-sm">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === id
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-stone-500 hover:text-emerald-900 hover:bg-stone-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <main className="max-w-6xl mx-auto px-4 py-5">
        {activeTab === 'dashboard' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
              <div className="xl:col-span-3">
                <WeatherCard
                  dailyForecast={dailyForecast}
                  currentTemp={currentTemp}
                  loading={loading}
                  error={error}
                  location={location}
                />
              </div>
              <div className="xl:col-span-2">
                <RightNow
                  forecastLows={forecastLows}
                  loading={loading}
                  lastFrost={location.lastFrost}
                  firstFrost={location.firstFrost}
                />
              </div>
            </div>
            <AlmanacTimeline />
          </div>
        )}

        {activeTab === 'plants' && (
          <PlantLibrary
            myPlants={myPlants}
            allSeedIds={MY_SEED_IDS}
            ignoredPlants={ignoredPlants}
            onToggleIgnore={handleToggleIgnore}
            forecastLows={forecastLows}
            lastFrost={location.lastFrost}
            firstFrost={location.firstFrost}
          />
        )}

        {activeTab === 'calendar' && (
          <PlantCalendar myPlants={myPlants} />
        )}

        {activeTab === 'doctor' && (
          <PlantDoctor />
        )}
      </main>
    </div>
  )
}
