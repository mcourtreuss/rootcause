'use client'

import { Snowflake, Sun, Calendar } from 'lucide-react'
import { MONTHS, WARM_SEASON_MONTHS } from '@/lib/constants'

const MONTH_CONFIGS = MONTHS.map((label, i) => {
  const monthNum = i + 1
  const isWarm = WARM_SEASON_MONTHS.includes(monthNum)
  return { label, monthNum, isWarm }
})

function getDaysInMonth(month, year) {
  return new Date(year, month, 0).getDate()
}

export default function AlmanacTimeline() {
  const today = new Date()
  const currentMonth = today.getMonth() + 1
  const currentDay = today.getDate()
  const year = today.getFullYear()

  const todayPct = (() => {
    let dayOfYear = 0
    for (let m = 1; m < currentMonth; m++) {
      dayOfYear += getDaysInMonth(m, year)
    }
    dayOfYear += currentDay
    const totalDays = getDaysInMonth(2, year) === 29 ? 366 : 365
    return (dayOfYear / totalDays) * 100
  })()

  // Last frost March 1 = day 60/365 ≈ 16.4%
  const lastFrostPct = ((31 + 28) / 365) * 100
  // First frost Nov 15 = day 319/365 ≈ 87.4%
  const firstFrostPct = ((31+28+31+30+31+30+31+31+30+31+14) / 365) * 100

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-bold text-emerald-900 text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#ADE883]" />
            The Almanac View — {year}
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">Planning timeline for Zone 9b, Sunnyvale CA</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-[#ADE883]/40 border border-[#ADE883] inline-block" />
          <span className="text-stone-500">Warm Season (Mar–Nov)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-blue-200 border border-blue-300 inline-block" />
          <span className="text-stone-500">Cool Season (Nov–Feb)</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
          <span className="text-stone-500">Today</span>
        </span>
      </div>

      {/* Month grid */}
      <div className="relative">
        <div className="grid grid-cols-12 gap-1">
          {MONTH_CONFIGS.map(({ label, monthNum, isWarm }) => {
            const isCurrent = monthNum === currentMonth
            const isLastFrostMonth = monthNum === 3
            const isFirstFrostMonth = monthNum === 11
            return (
              <div
                key={monthNum}
                className={`relative rounded-lg overflow-visible ${
                  isWarm
                    ? 'bg-[#ADE883]/20 border border-[#ADE883]/40'
                    : 'bg-blue-100 border border-blue-200'
                } ${isCurrent ? 'ring-2 ring-emerald-500 ring-offset-1' : ''}`}
              >
                <div className={`text-center py-3 px-1 ${
                  isWarm ? 'text-[#6B8E23]' : 'text-blue-800'
                }`}>
                  <div className={`text-xs font-bold ${isCurrent ? 'text-emerald-700' : ''}`}>
                    {label}
                  </div>
                  {isLastFrostMonth && (
                    <div className="mt-1" title="Last Frost: March 1">
                      <Snowflake className="w-3 h-3 text-blue-400 mx-auto" />
                    </div>
                  )}
                  {isFirstFrostMonth && (
                    <div className="mt-1" title="First Frost: November 15">
                      <Snowflake className="w-3 h-3 text-blue-400 mx-auto" />
                    </div>
                  )}
                  {!isLastFrostMonth && !isFirstFrostMonth && isWarm && (
                    <div className="mt-1">
                      <Sun className="w-3 h-3 text-[#ADE883] mx-auto" />
                    </div>
                  )}
                </div>
                {isCurrent && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                )}
              </div>
            )
          })}
        </div>

        {/* Continuous bar below */}
        <div className="mt-4 relative h-6 rounded-full overflow-hidden bg-stone-100 border border-stone-200">
          {/* Cool season Jan-Feb (0–16.4%) */}
          <div
            className="absolute top-0 left-0 h-full bg-blue-200"
            style={{ width: `${lastFrostPct}%` }}
          />
          {/* Warm season Mar 1 – Nov 15 */}
          <div
            className="absolute top-0 h-full bg-[#ADE883]/30"
            style={{ left: `${lastFrostPct}%`, width: `${firstFrostPct - lastFrostPct}%` }}
          />
          {/* Cool season Nov 15 – Dec 31 */}
          <div
            className="absolute top-0 right-0 h-full bg-blue-200"
            style={{ width: `${100 - firstFrostPct}%` }}
          />
          {/* Last frost marker */}
          <div
            className="absolute top-0 h-full w-0.5 bg-blue-500"
            style={{ left: `${lastFrostPct}%` }}
            title="Last Frost: March 1"
          />
          {/* First frost marker */}
          <div
            className="absolute top-0 h-full w-0.5 bg-blue-500"
            style={{ left: `${firstFrostPct}%` }}
            title="First Frost: November 15"
          />
          {/* Today marker */}
          <div
            className="absolute top-0 h-full w-1 bg-emerald-600 rounded-full shadow"
            style={{ left: `calc(${todayPct}% - 2px)` }}
            title={`Today: ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
          />
        </div>

        {/* Bar labels */}
        <div className="flex justify-between text-xs text-stone-400 mt-1 px-0.5">
          <span>Jan 1</span>
          <span className="text-blue-500 font-medium">❄ Mar 1</span>
          <span>Jun</span>
          <span className="text-blue-500 font-medium">❄ Nov 15</span>
          <span>Dec 31</span>
        </div>
      </div>

      {/* Season summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Sun className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-semibold text-orange-900">Warm Season</span>
          </div>
          <p className="text-xs text-orange-700">
            <span className="font-medium">March 1 – November 15</span> · 8.5 months
          </p>
          <p className="text-xs text-orange-600 mt-1">
            Best for: Tomatoes, Peppers, Zucchini, Basil, Bush Beans
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Snowflake className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-semibold text-blue-900">Cool Season</span>
          </div>
          <p className="text-xs text-blue-700">
            <span className="font-medium">Nov 15 – March 1</span> · 3.5 months
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Best for: Lettuce, Kale, Carrots, Sugar Snaps, Swiss Chard
          </p>
        </div>
      </div>
    </div>
  )
}
