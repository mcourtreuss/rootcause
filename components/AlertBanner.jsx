'use client'

import { Sprout, Thermometer, Snowflake, X } from 'lucide-react'
import { useState } from 'react'
import { getNotifications } from '@/lib/plantLogic'

const ICON_MAP = {
  Sprout: Sprout,
  Thermometer: Thermometer,
  Snowflake: Snowflake,
}

const TYPE_STYLES = {
  info: {
    wrapper: 'bg-mint-light border-sage/30',
    icon: 'bg-sage/20 text-sage-dark',
    title: 'text-forest',
    text: 'text-sage-dark',
    dismiss: 'text-sage/50 hover:text-sage-dark',
  },
  warning: {
    wrapper: 'bg-gradient-to-r from-sunlight-light/60 to-sunlight-light/30 border-terracotta-light/40',
    icon: 'bg-terracotta/15 text-terracotta',
    title: 'text-terracotta-dark',
    text: 'text-bark-light',
    dismiss: 'text-terracotta/40 hover:text-terracotta',
  },
  danger: {
    wrapper: 'bg-red-50 border-red-200',
    icon: 'bg-red-100 text-red-600',
    title: 'text-red-900',
    text: 'text-red-700',
    dismiss: 'text-red-300 hover:text-red-500',
  },
}

export default function AlertBanner({ dailyForecast = [] }) {
  const [dismissed, setDismissed] = useState([])

  const today = new Date()
  const notifications = getNotifications(today, dailyForecast).filter(
    (n) => !dismissed.includes(n.id)
  )

  if (notifications.length === 0) return null

  return (
    <div className="max-w-6xl mx-auto px-4 pt-4 space-y-2">
      {notifications.map((n) => {
        const styles = TYPE_STYLES[n.type] || TYPE_STYLES.info
        const Icon = ICON_MAP[n.icon] || Sprout
        return (
          <div
            key={n.id}
            className={`flex items-start gap-3 border rounded-2xl px-4 py-3 ${styles.wrapper}`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${styles.icon}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${styles.title}`}>{n.title}</p>
              <p className={`text-xs mt-0.5 leading-relaxed ${styles.text}`}>{n.message}</p>
            </div>
            <button
              onClick={() => setDismissed((prev) => [...prev, n.id])}
              className={`flex-shrink-0 mt-0.5 ${styles.dismiss} transition-colors`}
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
