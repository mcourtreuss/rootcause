'use client'

import { Sprout, MapPin, Snowflake } from 'lucide-react'
import { ZONE_CONFIG } from '@/lib/constants'

export default function Header() {
  return (
    <header className="bg-emerald-900 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight leading-none">RootCause</h1>
            <p className="text-emerald-300 text-xs mt-0.5">Beginner Gardening Assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="hidden sm:flex items-center gap-1.5 bg-emerald-800 rounded-lg px-3 py-1.5">
            <MapPin className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-emerald-100 font-medium">{ZONE_CONFIG.city}</span>
            <span className="text-emerald-400 mx-1">·</span>
            <span className="text-orange-400 font-bold">Zone {ZONE_CONFIG.zone}</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 bg-emerald-800 rounded-lg px-3 py-1.5">
            <Snowflake className="w-3.5 h-3.5 text-blue-300" />
            <span className="text-emerald-200 text-xs">
              Last frost <span className="font-semibold text-white">Mar 1</span>
              <span className="text-emerald-400 mx-1.5">—</span>
              First frost <span className="font-semibold text-white">Nov 15</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
