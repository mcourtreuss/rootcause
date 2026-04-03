'use client'

import { Droplets, Thermometer, CloudRain, Snowflake, Package, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { PLANTS } from '@/lib/plantData'
import { getWateringAdvice, getWateringUrgency } from '@/lib/plantLogic'

const MATURITY_LABELS = {
  seedling: 'Seedling',
  juvenile: 'Juvenile',
  established: 'Established',
}

const URGENCY_STYLES = {
  today: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', dot: 'bg-green-500' },
  soon: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-400' },
  check: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-400' },
  later: { bg: 'bg-stone-50', border: 'border-stone-200', text: 'text-stone-500', dot: 'bg-stone-300' },
}

const ADJUSTMENT_ICONS = {
  Thermometer,
  CloudRain,
  Snowflake,
  Package,
}

function WateringRow({ plant, maturityStage, dailyForecast }) {
  const [showDetails, setShowDetails] = useState(false)
  const advice = getWateringAdvice(plant, maturityStage, dailyForecast)
  const { urgency, label, color } = getWateringUrgency(plant, maturityStage, dailyForecast)
  const styles = URGENCY_STYLES[urgency] || URGENCY_STYLES.later

  return (
    <div className="border-b border-stone-100 last:border-0">
      <div
        className="flex items-center gap-2.5 py-2.5 cursor-pointer hover:bg-stone-50/50 transition-colors px-1 -mx-1 rounded"
        onClick={() => setShowDetails(!showDetails)}
      >
        <span className="text-xl leading-none">{plant.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-emerald-900">{plant.name}</span>
            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${styles.bg} ${styles.border} ${styles.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
              {label}
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-0.5">
            Every {advice.frequencyDays} day{advice.frequencyDays !== 1 ? 's' : ''} · {advice.depthInches}" deep
            <span className="text-stone-300 mx-1">·</span>
            <span className="text-stone-500">{MATURITY_LABELS[maturityStage]}</span>
          </p>
        </div>
        <Droplets className={`w-4 h-4 flex-shrink-0 ${urgency === 'today' ? 'text-blue-500' : 'text-stone-300'}`} />
        {showDetails ? (
          <ChevronUp className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
        )}
      </div>

      {showDetails && (
        <div className="pb-3 pl-9 pr-1 space-y-2">
          <p className="text-xs text-stone-500 leading-relaxed">{advice.notes}</p>
          <p className="text-xs text-stone-400 italic">{advice.method}</p>

          {advice.weatherAdjustments.length > 0 && (
            <div className="space-y-1">
              {advice.weatherAdjustments.map((adj, i) => {
                const Icon = ADJUSTMENT_ICONS[adj.icon] || Droplets
                return (
                  <div key={i} className={`flex items-start gap-1.5 text-xs px-2 py-1.5 rounded-lg ${
                    adj.type === 'heat' ? 'bg-red-50 text-red-600' :
                    adj.type === 'rain' ? 'bg-blue-50 text-blue-600' :
                    adj.type === 'cold' ? 'bg-indigo-50 text-indigo-600' :
                    'bg-stone-50 text-stone-600'
                  }`}>
                    <Icon className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>{adj.text}</span>
                  </div>
                )
              })}
            </div>
          )}

          {advice.sources.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {advice.sources.map((src, i) => (
                <a
                  key={i}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-emerald-600 hover:text-emerald-800 underline decoration-emerald-300"
                >
                  <ExternalLink className="w-2.5 h-2.5" />
                  {src.name}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function WateringGuide({ myPlants = [], customPlants = [], plantMaturity = {}, dailyForecast = [], loading }) {
  const myGardenPlants = PLANTS.filter(p => myPlants.includes(p.id))

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-5 animate-pulse shadow-sm">
        <div className="h-5 w-32 bg-stone-200 rounded mb-4" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 bg-stone-100 rounded-lg mb-2" />
        ))}
      </div>
    )
  }

  if (myGardenPlants.length === 0 && customPlants.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Droplets className="w-4 h-4 text-blue-500" />
          <h2 className="font-bold text-emerald-900 text-base">Watering Guide</h2>
        </div>
        <div className="text-center py-6">
          <Droplets className="w-8 h-8 mx-auto mb-2 text-stone-300" />
          <p className="text-sm text-stone-400">No plants in your garden yet.</p>
          <p className="text-xs text-stone-400 mt-1">Add plants from the Plant Library to see watering recommendations.</p>
        </div>
      </div>
    )
  }

  // Group plants by urgency
  const groups = { today: [], soon: [], check: [], later: [] }
  myGardenPlants.forEach(plant => {
    const maturity = plantMaturity[plant.id] || 'established'
    const { urgency } = getWateringUrgency(plant, maturity, dailyForecast)
    groups[urgency].push(plant)
  })

  // Collect all unique weather adjustments for the summary
  const allAdjustments = []
  const seenTypes = new Set()
  myGardenPlants.forEach(plant => {
    const maturity = plantMaturity[plant.id] || 'established'
    const advice = getWateringAdvice(plant, maturity, dailyForecast)
    advice.weatherAdjustments.forEach(adj => {
      if (!seenTypes.has(adj.type)) {
        seenTypes.add(adj.type)
        allAdjustments.push(adj)
      }
    })
  })

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-blue-500" />
          <h2 className="font-bold text-emerald-900 text-base">Watering Guide</h2>
        </div>
        <span className="text-[10px] text-stone-400 bg-stone-50 px-2 py-0.5 rounded-full">
          Weather-adjusted
        </span>
      </div>

      {/* Summary badges */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {groups.today.length > 0 && (
          <span className="text-xs bg-green-100 text-green-700 font-medium px-2 py-1 rounded-lg border border-green-200">
            💧 {groups.today.length} water today
          </span>
        )}
        {groups.soon.length > 0 && (
          <span className="text-xs bg-amber-100 text-amber-700 font-medium px-2 py-1 rounded-lg border border-amber-200">
            ⏳ {groups.soon.length} water soon
          </span>
        )}
        {groups.check.length > 0 && (
          <span className="text-xs bg-blue-100 text-blue-700 font-medium px-2 py-1 rounded-lg border border-blue-200">
            🌧️ {groups.check.length} check soil
          </span>
        )}
      </div>

      {/* Weather adjustment alerts */}
      {allAdjustments.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {allAdjustments.map((adj, i) => {
            const Icon = ADJUSTMENT_ICONS[adj.icon] || Droplets
            return (
              <div key={i} className={`flex items-start gap-2 text-xs px-2.5 py-2 rounded-lg ${
                adj.type === 'heat' ? 'bg-red-50 text-red-700 border border-red-100' :
                adj.type === 'rain' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                adj.type === 'cold' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                'bg-stone-50 text-stone-600 border border-stone-100'
              }`}>
                <Icon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span className="leading-snug">{adj.text}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Plant list */}
      <div className="divide-y divide-stone-100">
        {[...groups.today, ...groups.soon, ...groups.check, ...groups.later].map(plant => (
          <WateringRow
            key={plant.id}
            plant={plant}
            maturityStage={plantMaturity[plant.id] || 'established'}
            dailyForecast={dailyForecast}
          />
        ))}
      </div>

      {/* Custom plants */}
      {customPlants.length > 0 && (
        <div className="mt-3 pt-3 border-t border-stone-100">
          <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide mb-2">Custom Plants</p>
          {customPlants.map(name => (
            <div key={name} className="flex items-center gap-2.5 py-2 border-b border-stone-100 last:border-0">
              <span className="text-xl leading-none">🌱</span>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-emerald-900">{name}</span>
                <p className="text-xs text-stone-400 mt-0.5">No watering data available — water when top inch of soil is dry.</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Source attribution footer */}
      <div className="mt-4 pt-3 border-t border-stone-100">
        <p className="text-[10px] text-stone-400 leading-relaxed">
          Watering recommendations based on guidance from{' '}
          <a href="https://www.almanac.com/gardening/growing-guides" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-700 underline">Old Farmer's Almanac</a>,{' '}
          <a href="https://extension.umn.edu/yard-and-garden/vegetables" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-700 underline">UMN Extension</a>, and{' '}
          <a href="https://www.gardeningknowhow.com" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-700 underline">Gardening Know How</a>.
          Adjusted for your local 5-day forecast.
        </p>
      </div>
    </div>
  )
}
