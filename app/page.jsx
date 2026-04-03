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
import GardenSetup from '@/components/GardenSetup'
import Footer from '@/components/Footer'
import { useWeather } from '@/hooks/useWeather'
import { useLocation } from '@/hooks/useLocation'
import { ACTIVE_TAB_KEY, IGNORED_PLANTS_KEY, PLANT_MATURITY_KEY, GARDEN_KEY } from '@/lib/constants'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'plants',    label: 'Plant Library', Icon: Leaf },
  { id: 'calendar',  label: 'Planting Calendar', Icon: CalendarDays },
  { id: 'doctor',    label: 'Plant Doctor', Icon: ScanLine, comingSoon: true },
]

const DEFAULT_GARDEN = { catalogPlants: [], customPlants: [] }

function saveGarden(garden) {
  try { localStorage.setItem(GARDEN_KEY, JSON.stringify(garden)) } catch {}
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [ignoredPlants, setIgnoredPlants] = useState([])
  const [plantMaturity, setPlantMaturity] = useState({})
  const [garden, setGarden] = useState(DEFAULT_GARDEN)
  const [showSetup, setShowSetup] = useState(false)
  const [mounted, setMounted] = useState(false)

  const { location, loading: locationLoading, error: locationError, mounted: locationMounted, setZipCode, clearLocation } = useLocation()

  // myPlants = catalog garden plants minus ignored
  const myPlants = garden.catalogPlants.filter(id => !ignoredPlants.includes(id))

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

      const storedGarden = localStorage.getItem(GARDEN_KEY)
      if (storedGarden) {
        setGarden(JSON.parse(storedGarden))
      } else {
        // First visit — show setup overlay
        setShowSetup(true)
      }
    } catch {}
  }, [])

  // --- Garden management handlers ---
  const handleSetupComplete = useCallback((catalogIds, customNames) => {
    const newGarden = { catalogPlants: catalogIds, customPlants: customNames }
    setGarden(newGarden)
    saveGarden(newGarden)
    setShowSetup(false)
  }, [])

  const handleToggleCatalogPlant = useCallback((plantId) => {
    setGarden(prev => {
      const inGarden = prev.catalogPlants.includes(plantId)
      const updated = {
        ...prev,
        catalogPlants: inGarden
          ? prev.catalogPlants.filter(id => id !== plantId)
          : [...prev.catalogPlants, plantId],
      }
      saveGarden(updated)
      return updated
    })
  }, [])

  const handleAddCustomPlant = useCallback((name) => {
    const trimmed = name.trim()
    if (!trimmed) return
    setGarden(prev => {
      if (prev.customPlants.includes(trimmed)) return prev
      const updated = { ...prev, customPlants: [...prev.customPlants, trimmed] }
      saveGarden(updated)
      return updated
    })
  }, [])

  const handleRemoveCustomPlant = useCallback((name) => {
    setGarden(prev => {
      const updated = { ...prev, customPlants: prev.customPlants.filter(n => n !== name) }
      saveGarden(updated)
      return updated
    })
  }, [])

  // --- Other handlers ---
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
    <div className="min-h-screen bg-cream">
      {showSetup && <GardenSetup onComplete={handleSetupComplete} />}

      <Header
        location={location}
        onZipSubmit={setZipCode}
        onClearLocation={clearLocation}
        loading={locationLoading}
        error={locationError}
      />

      <AlertBanner dailyForecast={dailyForecast} />

      {/* Tab nav */}
      <div className="max-w-6xl mx-auto px-4 pt-5">
        <div className="flex gap-1 bg-parchment border border-clay-light p-1 rounded-2xl w-fit shadow-warm">
          {TABS.map(({ id, label, Icon, comingSoon }) => (
            <button
              key={id}
              onClick={() => !comingSoon && handleTabChange(id)}
              disabled={comingSoon}
              className={`relative flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                comingSoon
                  ? 'text-clay cursor-not-allowed'
                  : activeTab === id
                    ? 'bg-forest text-white shadow-warm'
                    : 'text-soil hover:text-bark hover:bg-cream'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
              {comingSoon && (
                <span className="hidden sm:inline-flex ml-1 text-[9px] font-semibold bg-clay-light text-soil px-1.5 py-0.5 rounded-full leading-none">
                  Coming Soon
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
                  customPlants={garden.customPlants}
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
            customPlants={garden.customPlants}
            ignoredPlants={ignoredPlants}
            onToggleIgnore={handleToggleIgnore}
            onToggleGarden={handleToggleCatalogPlant}
            onAddCustomPlant={handleAddCustomPlant}
            onRemoveCustomPlant={handleRemoveCustomPlant}
            forecastLows={forecastLows}
            dailyForecast={dailyForecast}
            plantMaturity={plantMaturity}
            onMaturityChange={handleMaturityChange}
          />
        )}

        {activeTab === 'calendar' && (
          <PlantCalendar
            myPlants={myPlants}
            customPlants={garden.customPlants}
            ignoredPlants={ignoredPlants}
          />
        )}

        {activeTab === 'doctor' && (
          <PlantDoctor />
        )}
      </main>

      <Footer />
    </div>
  )
}
