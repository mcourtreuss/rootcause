'use client'

import { useState, useEffect, useCallback } from 'react'
import { LayoutDashboard, Leaf, CalendarDays, ScanLine } from 'lucide-react'
import Header from '@/components/Header'
import AlertBanner from '@/components/AlertBanner'
import WeatherCard from '@/components/WeatherCard'
import RightNow from '@/components/RightNow'
import AlmanacTimeline from '@/components/AlmanacTimeline'
import PlantLibrary from '@/components/PlantLibrary'
import PlantCalendar from '@/components/PlantCalendar'
import PlantDoctor from '@/components/PlantDoctor'
import WateringGuide from '@/components/WateringGuide'
import { useWeather } from '@/hooks/useWeather'
import { useLocation } from '@/hooks/useLocation'
import { ACTIVE_TAB_KEY, IGNORED_PLANTS_KEY, PLANT_MATURITY_KEY } from '@/lib/constants'
import { MY_SEED_IDS } from '@/lib/mySeeds'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'plants',    label: 'Plant Library', Icon: Leaf },
  { id: 'calendar',  label: 'Planting Calendar', Icon: CalendarDays },
  { id: 'doctor',    label: 'Plant Doctor', Icon: ScanLine, comingSoon: true },
]

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [ignoredPlants, setIgnoredPlants] = useState([])
  const [plantMaturity, setPlantMaturity] = useState({})
  const [mounted, setMounted] = useState(false)

  const { location, loading: locationLoading, error: locationError, mounted: locationMounted, setZipCode, clearLocation } = useLocation()

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

  useEffect(() => {
    setMounted(true)
    try {
      const storedTab = localStorage.getItem(ACTIVE_TAB_KEY)
      if (storedTab && TABS.some((t) => t.id === storedTab)) setActiveTab(storedTab)

      const storedIgnored = localStorage.getItem(IGNORED_PLANTS_KEY)
      if (storedIgnored) setIgnoredPlants(JSON.parse(storedIgnored))

      const storedMaturity = localStorage.getItem(PLANT_MATURITY_KEY)
      if (storedMaturity) setPlantMaturity(JSON.parse(storedMaturity))
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

  const handleMaturityChange = useCallback((plantId, stage) => {
    setPlantMaturity((prev) => {
      const updated = { ...prev, [plantId]: stage }
      try { localStorage.setItem(PLANT_MATURITY_KEY, JSON.stringify(updated)) } catch {}
      return updated
    })
  }, [])

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    try { localStorage.setItem(ACTIVE_TAB_KEY, tabId) } catch {}
  }

  if (!mounted || !locationMounted) return null

  const loading = locationLoading || weatherLoading

  return (
    <div className="min-h-screen bg-stone-50">
      <Header
        location={location}
        onZipSubmit={setZipCode}
        onClearLocation={clearLocation}
        loading={locationLoading}
        error={locationError}
      />

      <AlertBanner dailyForecast={dailyForecast} />

      {/* Tab nav */}
      <div className="max-w-6xl mx-auto px-4 pt-4">
        <div className="flex gap-1 bg-white border border-stone-200 p-1 rounded-xl w-fit shadow-sm">
          {TABS.map(({ id, label, Icon, comingSoon }) => (
            <button
              key={id}
              onClick={() => !comingSoon && handleTabChange(id)}
              disabled={comingSoon}
              className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                comingSoon
                  ? 'text-stone-300 cursor-not-allowed'
                  : activeTab === id
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'text-stone-500 hover:text-emerald-900 hover:bg-stone-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
              {comingSoon && (
                <span className="hidden sm:inline-flex ml-1 text-[9px] font-semibold bg-stone-200 text-stone-400 px-1.5 py-0.5 rounded-full leading-none">
                  Coming Soon
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <main className="max-w-6xl mx-auto px-4 py-5">
        {activeTab === 'dashboard' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
              <div className="xl:col-span-1 lg:col-span-1">
                <WeatherCard
                  dailyForecast={dailyForecast}
                  currentTemp={currentTemp}
                  loading={loading}
                  error={weatherError}
                  location={location}
                />
              </div>
              <div className="xl:col-span-1 lg:col-span-1">
                <WateringGuide
                  myPlants={myPlants}
                  plantMaturity={plantMaturity}
                  dailyForecast={dailyForecast}
                  loading={loading}
                />
              </div>
              <div className="xl:col-span-1 lg:col-span-2">
                <RightNow forecastLows={forecastLows} ignoredPlants={ignoredPlants} loading={loading} />
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
            dailyForecast={dailyForecast}
            plantMaturity={plantMaturity}
            onMaturityChange={handleMaturityChange}
          />
        )}

        {activeTab === 'calendar' && (
          <PlantCalendar myPlants={myPlants} ignoredPlants={ignoredPlants} />
        )}

        {activeTab === 'doctor' && (
          <PlantDoctor />
        )}
      </main>
    </div>
  )
}
