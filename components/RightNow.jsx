'use client'

import { CheckCircle2, XCircle, Clock, AlertTriangle, Thermometer } from 'lucide-react'
import { PLANTS } from '@/lib/plantData'
import { getPlantStatus } from '@/lib/plantLogic'

const STATUS_CONFIG = {
  Ideal: {
    Icon: CheckCircle2,
    iconClass: 'text-green-500',
    badge: 'bg-green-100 text-green-800 border-green-200',
  },
  'Start Indoors': {
    Icon: Clock,
    iconClass: 'text-amber-500',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  'Almost Ready': {
    Icon: Clock,
    iconClass: 'text-amber-500',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  'Too Cold': {
    Icon: XCircle,
    iconClass: 'text-blue-500',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  'Too Hot': {
    Icon: AlertTriangle,
    iconClass: 'text-red-500',
    badge: 'bg-red-100 text-red-800 border-red-200',
  },
  Unknown: {
    Icon: AlertTriangle,
    iconClass: 'text-stone-400',
    badge: 'bg-stone-100 text-stone-600 border-stone-200',
  },
}

function StatusRow({ plant, status, detail }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.Unknown
  const { Icon, iconClass, badge } = cfg
  return (
    <div className="flex items-start gap-2.5 py-2.5 border-b border-stone-100 last:border-0">
      <span className="text-xl leading-none mt-0.5">{plant.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-emerald-900">{plant.name}</span>
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${badge}`}>
            <Icon className={`w-3 h-3 ${iconClass}`} />
            {status}
          </span>
        </div>
        <p className="text-xs text-stone-400 mt-0.5 leading-snug">{detail}</p>
      </div>
    </div>
  )
}

export default function RightNow({ forecastLows = [], loading, lastFrost = null, firstFrost = null }) {
  const today = new Date()

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-5 animate-pulse shadow-sm">
        <div className="h-5 w-24 bg-stone-200 rounded mb-4" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 bg-stone-100 rounded-lg mb-2" />
        ))}
      </div>
    )
  }

  const statuses = PLANTS.map((plant) => ({
    plant,
    ...getPlantStatus(plant, today, forecastLows, lastFrost, firstFrost),
  }))

  const idealCount = statuses.filter((s) => s.status === 'Ideal').length
  const indoorCount = statuses.filter((s) => s.status === 'Start Indoors').length

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-bold text-emerald-900 text-base">Right Now</h2>
        <div className="flex items-center gap-1 text-xs text-stone-400">
          <Thermometer className="w-3.5 h-3.5" />
          <span>Based on 5-day forecast</span>
        </div>
      </div>

      <div className="flex gap-2 mb-3">
        {idealCount > 0 && (
          <span className="text-xs bg-green-100 text-green-700 font-medium px-2 py-1 rounded-lg border border-green-200">
            ✓ {idealCount} ready to plant
          </span>
        )}
        {indoorCount > 0 && (
          <span className="text-xs bg-amber-100 text-amber-700 font-medium px-2 py-1 rounded-lg border border-amber-200">
            🌱 {indoorCount} start indoors
          </span>
        )}
      </div>

      <div className="divide-y divide-stone-100">
        {statuses.map(({ plant, status, detail }) => (
          <StatusRow key={plant.id} plant={plant} status={status} detail={detail} />
        ))}
      </div>
    </div>
  )
}
