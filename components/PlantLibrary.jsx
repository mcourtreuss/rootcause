'use client'

import { useState } from 'react'
import { Info, Leaf, Package, Users, XCircle, EyeOff, Eye, Droplets, ExternalLink } from 'lucide-react'
import { PLANTS } from '@/lib/plantData'
import { getPlantStatus, getWateringAdvice } from '@/lib/plantLogic'

const MATURITY_STAGES = ['seedling', 'juvenile', 'established']
const MATURITY_LABELS = { seedling: 'Seedling', juvenile: 'Juvenile', established: 'Established' }
const MATURITY_STYLES = {
  seedling: { active: 'bg-lime-600 text-white border-lime-600', inactive: 'bg-white text-lime-700 border-lime-300 hover:bg-lime-50' },
  juvenile: { active: 'bg-emerald-600 text-white border-emerald-600', inactive: 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50' },
  established: { active: 'bg-teal-700 text-white border-teal-700', inactive: 'bg-white text-teal-700 border-teal-300 hover:bg-teal-50' },
}

const DIFFICULTY_STYLES = {
  Easy:       'bg-green-100 text-green-700 border-green-200',
  Moderate:   'bg-amber-100 text-amber-700 border-amber-200',
  Challenging:'bg-red-100 text-red-700 border-red-200',
}

const TYPE_STYLES = {
  warm: 'bg-[#ADE883]/20 text-[#6B8E23] border-[#ADE883]/40',
  cool: 'bg-blue-100 text-blue-700 border-blue-200',
}

const STATUS_DOT = {
  Ideal:          'bg-green-500',
  'Almost Ready': 'bg-amber-400',
  'Start Indoors':'bg-amber-400',
  'Too Cold':     'bg-blue-400',
  'Too Hot':      'bg-red-500',
  Unknown:        'bg-stone-300',
}

export default function PlantLibrary({ myPlants, allSeedIds = [], ignoredPlants = [], onToggleIgnore, forecastLows = [], dailyForecast = [], plantMaturity = {}, onMaturityChange }) {
  const [expanded, setExpanded] = useState(null)
  const today = new Date()

  const filters = ['All', 'Warm Season', 'Cool Season', 'My Garden', 'Ignored']
  const [filter, setFilter] = useState('All')

  const visible = PLANTS.filter((p) => {
    if (filter === 'Ignored') return ignoredPlants.includes(p.id)
    if (ignoredPlants.includes(p.id)) return false
    if (filter === 'Warm Season') return p.type === 'warm'
    if (filter === 'Cool Season') return p.type === 'cool'
    if (filter === 'My Garden') return myPlants.includes(p.id)
    return true
  })

  return (
    <div>
      {/* Filter pills */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
              filter === f
                ? 'bg-emerald-800 text-white border-emerald-800'
                : 'bg-white text-stone-600 border-stone-200 hover:border-emerald-400'
            }`}
          >
            {f}
            {f === 'My Garden' && myPlants.length > 0 && (
              <span className="ml-1.5 bg-[#ADE883] text-[#2D5016] text-xs rounded-full w-4 h-4 inline-flex items-center justify-center font-semibold">
                {myPlants.length}
              </span>
            )}
            {f === 'Ignored' && ignoredPlants.length > 0 && (
              <span className="ml-1.5 bg-stone-400 text-white text-xs rounded-full w-4 h-4 inline-flex items-center justify-center">
                {ignoredPlants.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {visible.length === 0 && (
        <div className="text-center py-16 text-stone-400">
          <Leaf className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No plants yet</p>
          <p className="text-sm mt-1">No plants match this filter.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((plant) => {
          const isSelected = myPlants.includes(plant.id)
          const isSeed = allSeedIds.includes(plant.id)
          const isIgnored = ignoredPlants.includes(plant.id)
          const isOpen = expanded === plant.id
          const { status, detail } = getPlantStatus(plant, today, forecastLows)
          const dotColor = STATUS_DOT[status] ?? STATUS_DOT.Unknown

          return (
            <div
              key={plant.id}
              className={`bg-white rounded-2xl border transition-all shadow-sm overflow-hidden ${
                isIgnored ? 'border-stone-200 opacity-60' :
                isSelected ? 'border-[#ADE883] ring-1 ring-[#ADE883]/30' : 'border-stone-200'
              }`}
            >
              {/* Card header */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl leading-none">{plant.emoji}</span>
                    <div>
                      <h3 className="font-bold text-emerald-900 text-sm leading-tight">{plant.name}</h3>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full border ${TYPE_STYLES[plant.type]}`}>
                          {plant.type === 'warm' ? '☀️ Warm' : '❄️ Cool'}
                        </span>
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full border ${DIFFICULTY_STYLES[plant.difficulty]}`}>
                          {plant.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isSelected && (
                      <span className="flex-shrink-0 bg-[#ADE883]/20 text-[#6B8E23] text-[10px] font-semibold px-2 py-1 rounded-full border border-[#ADE883]/40">
                        My Seeds
                      </span>
                    )}
                    {isIgnored && (
                      <span className="flex-shrink-0 bg-stone-100 text-stone-500 text-[10px] font-semibold px-2 py-1 rounded-full border border-stone-200">
                        Ignored
                      </span>
                    )}
                    {onToggleIgnore && (
                      <button
                        onClick={() => onToggleIgnore(plant.id)}
                        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                          isIgnored
                            ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                            : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                        }`}
                        title={isIgnored ? 'Show this plant' : 'Hide this plant'}
                      >
                        {isIgnored ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Status indicator */}
                <div className="flex items-center gap-1.5 mt-3 bg-stone-50 rounded-lg px-2.5 py-1.5">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
                  <span className="text-xs text-stone-600 font-medium">{status}</span>
                  <span className="text-xs text-stone-400">·</span>
                  <span className="text-xs text-stone-400 truncate">{detail}</span>
                </div>

                <p className="text-xs text-stone-500 mt-2 leading-relaxed line-clamp-2">{plant.description}</p>
              </div>

              {/* Expandable details */}
              <div className="border-t border-stone-100">
                <button
                  onClick={() => setExpanded(isOpen ? null : plant.id)}
                  className="w-full flex items-center justify-between px-4 py-2 text-xs text-stone-500 hover:bg-stone-50 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    Details
                  </span>
                  <span>{isOpen ? '▲' : '▼'}</span>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 space-y-3 text-xs">
                    <div className="flex items-start gap-2">
                      <Package className="w-3.5 h-3.5 text-stone-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-stone-700">Vessel: </span>
                        <span className="text-stone-500">{plant.vessel}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Leaf className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-stone-700">Days to harvest: </span>
                        <span className="text-stone-500">{plant.daysToHarvest} days</span>
                      </div>
                    </div>

                    {plant.indoorStartWeeks && (
                      <div className="flex items-start gap-2">
                        <Info className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-semibold text-stone-700">Indoor start: </span>
                          <span className="text-stone-500">{plant.indoorStartWeeks} weeks before last frost</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-2">
                      <Users className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-stone-700">Good companions: </span>
                        <span className="text-stone-500">{plant.companions.join(', ')}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <XCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-stone-700">Avoid near: </span>
                        <span className="text-stone-500">{plant.avoid.join(', ')}</span>
                      </div>
                    </div>

                    <div className="bg-stone-50 rounded-lg p-2.5 mt-1">
                      <span className="font-semibold text-stone-600">Temp range: </span>
                      <span className="text-stone-500">
                        Min {plant.minTempF}°F · Ideal {plant.idealTempRange[0]}–{plant.idealTempRange[1]}°F
                      </span>
                    </div>

                    {/* Watering section */}
                    {plant.watering && (() => {
                      const currentMaturity = plantMaturity[plant.id] || 'established'
                      const advice = getWateringAdvice(plant, currentMaturity, dailyForecast)
                      return (
                        <div className="bg-blue-50/50 rounded-lg p-2.5 mt-2 border border-blue-100">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Droplets className="w-3.5 h-3.5 text-blue-500" />
                            <span className="font-semibold text-blue-800 text-xs">Watering Guide</span>
                          </div>

                          <div className="flex gap-1 mb-2">
                            {MATURITY_STAGES.map(stage => {
                              const isActive = currentMaturity === stage
                              const styles = MATURITY_STYLES[stage]
                              return (
                                <button
                                  key={stage}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onMaturityChange?.(plant.id, stage)
                                  }}
                                  className={`text-[10px] font-medium px-2 py-1 rounded-full border transition-colors ${
                                    isActive ? styles.active : styles.inactive
                                  }`}
                                >
                                  {MATURITY_LABELS[stage]}
                                </button>
                              )
                            })}
                          </div>

                          <div className="space-y-1.5">
                            <div className="text-xs text-blue-700">
                              <span className="font-semibold">Every {advice.frequencyDays} day{advice.frequencyDays !== 1 ? 's' : ''}</span>
                              <span className="text-blue-500 mx-1">·</span>
                              <span>{advice.depthInches}" deep</span>
                            </div>
                            <p className="text-[11px] text-stone-600 leading-relaxed">{advice.notes}</p>
                            <p className="text-[11px] text-stone-400 italic">{advice.method}</p>

                            {advice.weatherAdjustments.length > 0 && (
                              <div className="space-y-1 pt-1">
                                {advice.weatherAdjustments.map((adj, i) => (
                                  <div key={i} className={`text-[10px] px-2 py-1 rounded ${
                                    adj.type === 'heat' ? 'bg-red-50 text-red-600' :
                                    adj.type === 'rain' ? 'bg-blue-50 text-blue-600' :
                                    adj.type === 'cold' ? 'bg-indigo-50 text-indigo-600' :
                                    'bg-stone-50 text-stone-500'
                                  }`}>
                                    {adj.text}
                                  </div>
                                ))}
                              </div>
                            )}

                            {advice.sources.length > 0 && (
                              <div className="flex flex-wrap gap-2 pt-1">
                                {advice.sources.map((src, i) => (
                                  <a key={i} href={src.url} target="_blank" rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 hover:text-emerald-800 underline decoration-emerald-300">
                                    <ExternalLink className="w-2.5 h-2.5" />
                                    {src.name}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
