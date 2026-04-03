'use client'

import { CheckCircle2, XCircle, Clock, AlertTriangle, Thermometer } from 'lucide-react'
import { PLANTS } from '@/lib/plantData'
import { getPlantStatus } from '@/lib/plantLogic'

const STATUS_CONFIG = {
  Ideal: {
    Icon: CheckCircle2,
    iconClass: 'text-sage-dark',
    badge: 'bg-mint/40 text-forest border-sage/30',
  },
  'Start Indoors': {
    Icon: Clock,
    iconClass: 'text-terracotta',
    badge: 'bg-sunlight-light/50 text-terracotta-dark border-sunlight/40',
  },
  'Almost Ready': {
    Icon: Clock,
    iconClass: 'text-terracotta',
    badge: 'bg-sunlight-light/50 text-terracotta-dark border-sunlight/40',
  },
  'Too Cold': {
    Icon: XCircle,
    iconClass: 'text-blue-500',
    badge: 'bg-blue-50 text-blue-800 border-blue-200',
  },
  'Too Hot': {
    Icon: AlertTriangle,
    iconClass: 'text-red-500',
    badge: 'bg-red-50 text-red-800 border-red-200',
  },
  Unknown: {
    Icon: AlertTriangle,
    iconClass: 'text-soil',
    badge: 'bg-parchment text-soil border-clay',
  },
}

function StatusRow({ plant, status, detail }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.Unknown
  const { Icon, iconClass, badge } = cfg
  return (
    <div className="flex items-start gap-2.5 py-2.5 border-b border-clay-light/60 last:border-0">
      <span className="text-xl leading-none mt-0.5">{plant.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-bark">{plant.name}</span>
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${badge}`}>
            <Icon className={`w-3 h-3 ${iconClass}`} />
            {status}
          </span>
        </div>
        <p className="text-xs text-soil mt-0.5 leading-snug">{detail}</p>
      </div>
    </div>
  )
}

export default function RightNow({ forecastLows = [], ignoredPlants = [], loading }) {
  const today = new Date()

  if (loading) {
    return (
      <div className="bg-parchment rounded-2xl border border-clay-light p-6 animate-pulse shadow-warm h-full flex flex-col">
        <div className="h-5 w-24 bg-clay-light rounded mb-4" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 bg-cream rounded-lg mb-2" />
        ))}
      </div>
    )
  }

  const STATUS_ORDER = { Ideal: 0, 'Almost Ready': 1, 'Start Indoors': 2, 'Too Cold': 3, 'Too Hot': 4, Unknown: 5 }

  const statuses = PLANTS
    .filter((plant) => !ignoredPlants.includes(plant.id))
    .map((plant) => ({
      plant,
      ...getPlantStatus(plant, today, forecastLows),
    }))
    .sort((a, b) => (STATUS_ORDER[a.status] ?? 5) - (STATUS_ORDER[b.status] ?? 5))

  const idealCount = statuses.filter((s) => s.status === 'Ideal').length
  const indoorCount = statuses.filter((s) => s.status === 'Start Indoors').length

  return (
    <div className="bg-parchment rounded-2xl border border-clay-light p-6 shadow-warm h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-serif text-lg text-bark">Right Now</h2>
        <div className="flex items-center gap-1 text-xs text-soil">
          <Thermometer className="w-3.5 h-3.5" />
          <span>Based on 10-day forecast</span>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {idealCount > 0 && (
          <span className="text-xs bg-mint/40 text-forest font-medium px-2.5 py-1 rounded-xl border border-sage/30">
            ✓ {idealCount} ready to plant
          </span>
        )}
        {indoorCount > 0 && (
          <span className="text-xs bg-sunlight-light/50 text-terracotta-dark font-medium px-2.5 py-1 rounded-xl border border-sunlight/40">
            🌱 {indoorCount} start indoors
          </span>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        {statuses.map(({ plant, status, detail }) => (
          <StatusRow key={plant.id} plant={plant} status={status} detail={detail} />
        ))}
      </div>
    </div>
  )
}
