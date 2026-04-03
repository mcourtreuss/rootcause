'use client'

import { useState } from 'react'
import { Info, Leaf, Package, Users, XCircle, EyeOff, Eye, Droplets, ExternalLink, Heart, Plus, X, Sparkles } from 'lucide-react'
import { PLANTS } from '@/lib/plantData'
import { getPlantStatus, getWateringAdvice } from '@/lib/plantLogic'
import { getRecommendations } from '@/lib/plantRecommendations'

const DIFFICULTY_STYLES = {
  Easy:       'bg-mint/30 text-forest border-sage/30',
  Moderate:   'bg-sunlight-light/50 text-terracotta-dark border-sunlight/40',
  Challenging:'bg-red-50 text-red-700 border-red-200',
}

const TYPE_STYLES = {
  warm: 'bg-sunlight-light/30 text-terracotta-dark border-sunlight/40',
  cool: 'bg-blue-50 text-blue-700 border-blue-200',
}

const STATUS_DOT = {
  Ideal:          'bg-sage',
  'Almost Ready': 'bg-terracotta-light',
  'Start Indoors':'bg-terracotta-light',
  'Too Cold':     'bg-blue-400',
  'Too Hot':      'bg-red-500',
  Unknown:        'bg-clay',
}

const MATURITY_STAGES = ['seedling', 'juvenile', 'established']
const MATURITY_LABELS = { seedling: 'Seedling', juvenile: 'Juvenile', established: 'Established' }
const MATURITY_STYLES = {
  seedling: { active: 'bg-lime-600 text-white border-lime-600', inactive: 'bg-white text-lime-700 border-lime-300 hover:bg-lime-50' },
  juvenile: { active: 'bg-emerald-600 text-white border-emerald-600', inactive: 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50' },
  established: { active: 'bg-teal-700 text-white border-teal-700', inactive: 'bg-white text-teal-700 border-teal-300 hover:bg-teal-50' },
}

export default function PlantLibrary({
  myPlants,
  customPlants = [],
  ignoredPlants = [],
  onToggleIgnore,
  onToggleGarden,
  onAddCustomPlant,
  onRemoveCustomPlant,
  forecastLows = [],
  dailyForecast = [],
  plantMaturity = {},
  onMaturityChange,
}) {
  const [expanded, setExpanded] = useState(null)
  const [customInput, setCustomInput] = useState('')
  const today = new Date()

  const filters = ['All', 'Warm Season', 'Cool Season', 'My Garden', 'Recommended', 'Ignored']
  const [filter, setFilter] = useState('All')

  const recommendations = getRecommendations(myPlants, customPlants)

  const visible = PLANTS.filter((p) => {
    if (filter === 'Recommended') return false // Handled separately
    if (filter === 'Ignored') return ignoredPlants.includes(p.id)
    if (ignoredPlants.includes(p.id)) return false
    if (filter === 'Warm Season') return p.type === 'warm'
    if (filter === 'Cool Season') return p.type === 'cool'
    if (filter === 'My Garden') return myPlants.includes(p.id)
    return true
  })

  const handleAddCustom = () => {
    const name = customInput.trim()
    if (name) {
      onAddCustomPlant?.(name)
      setCustomInput('')
    }
  }

  const gardenCount = myPlants.length + customPlants.length

  return (
    <div>
      {/* Filter pills */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filter === f
                ? 'bg-forest text-white border-forest'
                : 'bg-parchment text-soil border-clay-light hover:border-sage'
            }`}
          >
            {f}
            {f === 'My Garden' && gardenCount > 0 && (
              <span className="ml-1.5 bg-mint text-forest text-xs rounded-full w-5 h-5 inline-flex items-center justify-center font-semibold">
                {gardenCount}
              </span>
            )}
            {f === 'Recommended' && recommendations.length > 0 && (
              <span className="ml-1.5 bg-terracotta-light text-white text-xs rounded-full w-5 h-5 inline-flex items-center justify-center font-semibold">
                {recommendations.length}
              </span>
            )}
            {f === 'Ignored' && ignoredPlants.length > 0 && (
              <span className="ml-1.5 bg-clay-dark text-white text-xs rounded-full w-4 h-4 inline-flex items-center justify-center">
                {ignoredPlants.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Custom plant input — shown in My Garden view */}
      {filter === 'My Garden' && (
        <div className="mb-4 bg-white rounded-xl border border-stone-200 p-3 shadow-sm">
          <p className="text-xs text-stone-500 mb-2">Add a plant not in the catalog:</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustom() } }}
              placeholder="e.g. Strawberries, Mint, Rosemary..."
              className="flex-1 border border-stone-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
            />
            <button
              onClick={handleAddCustom}
              disabled={!customInput.trim()}
              className="bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>

          {/* Custom plant tags */}
          {customPlants.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {customPlants.map(name => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full"
                >
                  🌱 {name}
                  <button
                    onClick={() => onRemoveCustomPlant?.(name)}
                    className="hover:bg-emerald-200 rounded-full p-0.5 transition-colors"
                    title="Remove from garden"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recommended section */}
      {filter === 'Recommended' && (
        <div className="space-y-4">
          {recommendations.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No recommendations yet</p>
              <p className="text-sm mt-1">Add plants to your garden to get personalized suggestions.</p>
            </div>
          ) : (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">Based on your garden</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    These plants complement what you're already growing — as companions, pest deterrents, or flavor pairings.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.map((rec) => (
                  <div
                    key={rec.name}
                    className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl leading-none">{rec.emoji}</span>
                          <div>
                            <h3 className="font-bold text-emerald-900 text-sm leading-tight">{rec.name}</h3>
                            <div className="flex items-center gap-1 mt-1 flex-wrap">
                              {rec.matchedCategories.slice(0, 2).map(cat => (
                                <span key={cat} className="text-[10px] font-medium px-1.5 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
                                  {cat}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => onAddCustomPlant?.(rec.name)}
                          className="flex-shrink-0 bg-emerald-700 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg hover:bg-emerald-800 transition-colors flex items-center gap-1"
                          title="Add to My Garden"
                        >
                          <Plus className="w-3 h-3" />
                          Add
                        </button>
                      </div>

                      <p className="text-xs text-stone-600 mt-3 leading-relaxed">{rec.reason}</p>

                      {rec.tips && (
                        <p className="text-xs text-stone-400 mt-2 italic">{rec.tips}</p>
                      )}

                      {rec.sources.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {rec.sources.map((src, i) => (
                            <a key={i} href={src.url} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 hover:text-emerald-800 underline decoration-emerald-300">
                              <ExternalLink className="w-2.5 h-2.5" />
                              {src.name}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center pt-2">
                <p className="text-[10px] text-stone-400">
                  Recommendations sourced from{' '}
                  <a href="https://www.almanac.com/companion-planting-guide-vegetables" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-700 underline">Old Farmer's Almanac</a>,{' '}
                  <a href="https://extension.umn.edu/yard-and-garden/vegetables" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-700 underline">UMN Extension</a>, and{' '}
                  <a href="https://www.gardeningknowhow.com" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-700 underline">Gardening Know How</a>.
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {filter !== 'Recommended' && visible.length === 0 && customPlants.length === 0 && (
        <div className="text-center py-16 text-stone-400">
          <Leaf className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No plants yet</p>
          <p className="text-sm mt-1">
            {filter === 'My Garden'
              ? 'Tap the heart on any plant to add it to your garden, or type a custom plant above.'
              : 'No plants match this filter.'}
          </p>
        </div>
      )}

      {filter !== 'Recommended' && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((plant) => {
          const inGarden = myPlants.includes(plant.id)
          const isIgnored = ignoredPlants.includes(plant.id)
          const isOpen = expanded === plant.id
          const { status, detail } = getPlantStatus(plant, today, forecastLows)
          const dotColor = STATUS_DOT[status] ?? STATUS_DOT.Unknown

          return (
            <div
              key={plant.id}
              className={`bg-parchment rounded-2xl border transition-all shadow-warm overflow-hidden hover:shadow-warm-md hover:scale-[1.01] ${
                isIgnored ? 'border-clay-light opacity-50' :
                inGarden ? 'border-sage ring-1 ring-sage/20' : 'border-clay-light'
              }`}
            >
              {/* Card header */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl leading-none">{plant.emoji}</span>
                    <div>
                      <h3 className="font-semibold text-bark text-sm leading-tight">{plant.name}</h3>
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
                    {/* Garden toggle (heart) */}
                    {onToggleGarden && (
                      <button
                        onClick={() => onToggleGarden(plant.id)}
                        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                          inGarden
                            ? 'bg-rose-100 text-rose-500 hover:bg-rose-200'
                            : 'bg-stone-100 text-stone-300 hover:bg-stone-200 hover:text-stone-400'
                        }`}
                        title={inGarden ? 'Remove from My Garden' : 'Add to My Garden'}
                      >
                        <Heart className={`w-3.5 h-3.5 ${inGarden ? 'fill-current' : ''}`} />
                      </button>
                    )}
                    {/* Ignore toggle */}
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
                <div className="flex items-center gap-1.5 mt-3 bg-cream rounded-lg px-2.5 py-1.5">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
                  <span className="text-xs text-bark-light font-medium">{status}</span>
                  <span className="text-xs text-clay">·</span>
                  <span className="text-xs text-soil truncate">{detail}</span>
                </div>

                <p className="text-xs text-soil mt-2 leading-relaxed line-clamp-2">{plant.description}</p>
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
      </div>}
    </div>
  )
}
