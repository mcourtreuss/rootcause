'use client'

import { useState, useMemo } from 'react'
import { Info, Leaf, Package, Users, XCircle, EyeOff, Eye, Sparkles, Check, Clock, Sprout, Heart, Star, Zap } from 'lucide-react'
import { PLANTS } from '@/lib/plantData'
import { getPlantStatus, getRecommendations } from '@/lib/plantLogic'

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

const REASON_ICONS = {
  check: Check,
  clock: Clock,
  sprout: Sprout,
  heart: Heart,
  star: Star,
  zap: Zap,
}

const REASON_STYLES = {
  forecast: 'bg-blue-50 text-blue-700 border-blue-200',
  companion: 'bg-pink-50 text-pink-700 border-pink-200',
  beginner: 'bg-green-50 text-green-700 border-green-200',
  harvest: 'bg-amber-50 text-amber-700 border-amber-200',
}

export default function PlantLibrary({ myPlants, allSeedIds = [], ignoredPlants = [], onToggleIgnore, forecastLows = [], lastFrost = null, firstFrost = null }) {
  const [expanded, setExpanded] = useState(null)
  const today = new Date()

  const filters = ['All', 'Warm Season', 'Cool Season', 'My Garden', 'Recommended', 'Ignored']
  const [filter, setFilter] = useState('All')

  const recommendations = useMemo(() => {
    return getRecommendations(PLANTS, myPlants, forecastLows, lastFrost, firstFrost, ignoredPlants)
  }, [myPlants, forecastLows, lastFrost, firstFrost, ignoredPlants])

  const recommendedIds = useMemo(() => {
    return new Set(recommendations.map(r => r.plant.id))
  }, [recommendations])

  const recommendationMap = useMemo(() => {
    const map = new Map()
    recommendations.forEach(r => map.set(r.plant.id, r))
    return map
  }, [recommendations])

  const visible = useMemo(() => {
    if (filter === 'Warm Season') {
      return PLANTS.filter(p => p.type === 'warm' && !ignoredPlants.includes(p.id))
    }
    if (filter === 'Cool Season') {
      return PLANTS.filter(p => p.type === 'cool' && !ignoredPlants.includes(p.id))
    }
    if (filter === 'My Garden') {
      return PLANTS.filter(p => myPlants.includes(p.id) && !ignoredPlants.includes(p.id))
    }
    if (filter === 'Ignored') {
      return PLANTS.filter(p => ignoredPlants.includes(p.id))
    }
    if (filter === 'Recommended') {
      return recommendations.map(r => r.plant)
    }
    // All - exclude ignored
    return PLANTS.filter(p => !ignoredPlants.includes(p.id))
  }, [filter, ignoredPlants, myPlants, recommendations])

  return (
    <div>
      {/* Filter pills */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {filters.map((f) => {
          const isRecommended = f === 'Recommended'
          const badgeCount = isRecommended ? recommendations.length : (f === 'My Garden' ? myPlants.length : f === 'Ignored' ? ignoredPlants.length : 0)
          const showBadge = badgeCount > 0

          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all flex items-center gap-1.5 ${
                filter === f
                  ? 'bg-emerald-800 text-white border-emerald-800'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-emerald-400'
              }`}
            >
              {isRecommended && <Sparkles className="w-3.5 h-3.5" />}
              {f}
              {showBadge && (
                <span className={`text-xs rounded-full w-4 h-4 inline-flex items-center justify-center font-semibold ${
                  filter === f
                    ? isRecommended ? 'bg-amber-400 text-amber-900' : 'bg-[#ADE883] text-[#2D5016]'
                    : f === 'Ignored' ? 'bg-stone-400 text-white' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {badgeCount > 9 ? '9+' : badgeCount}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Recommended header */}
      {filter === 'Recommended' && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 mb-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-emerald-900">Recommended for You</h3>
              <p className="text-sm text-emerald-700 mt-1">
                Based on your {myPlants.length > 0 ? `${myPlants.length} plant${myPlants.length > 1 ? 's' : ''} in the garden, ` : ''}
                current weather forecast, and what grows well in containers.
              </p>
            </div>
          </div>
        </div>
      )}

      {visible.length === 0 && (
        <div className="text-center py-16 text-stone-400">
          <Leaf className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No plants yet</p>
          <p className="text-sm mt-1">
            {filter === 'Ignored' ? 'No ignored plants.' : 'No plants match this filter.'}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((plant) => {
          const isSelected = myPlants.includes(plant.id)
          const isIgnored = ignoredPlants.includes(plant.id)
          const isOpen = expanded === plant.id
          const { status, detail } = getPlantStatus(plant, today, forecastLows, lastFrost, firstFrost)
          const dotColor = STATUS_DOT[status] ?? STATUS_DOT.Unknown
          const recData = recommendationMap.get(plant.id)
          const reasons = recData?.reasons || []

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

                {/* Recommendation badges */}
                {reasons.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {reasons.map((reason, i) => {
                      const IconComponent = REASON_ICONS[reason.icon] || Star
                      return (
                        <span
                          key={i}
                          className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${REASON_STYLES[reason.type] || REASON_STYLES.beginner}`}
                        >
                          <IconComponent className="w-3 h-3" />
                          {reason.text}
                        </span>
                      )
                    })}
                  </div>
                )}

                {/* Status indicator */}
                <div className="flex items-center gap-1.5 mt-2 bg-stone-50 rounded-lg px-2.5 py-1.5">
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
