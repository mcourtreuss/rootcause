'use client'

import { useState } from 'react'
import { Calendar, Leaf } from 'lucide-react'
import { PLANTS } from '@/lib/plantData'
import { MONTHS } from '@/lib/constants'

const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

function getIndoorMonths(plant) {
  if (!plant.indoorStartWeeks) return []
  const indoorMonths = new Set()
  plant.plantMonths.forEach((m) => {
    const indoorMonth = m - Math.ceil(plant.indoorStartWeeks / 4)
    if (indoorMonth >= 1) indoorMonths.add(indoorMonth)
    else indoorMonths.add(12 + indoorMonth)
  })
  return [...indoorMonths]
}

function MonthCell({ monthNum, plantMonths, indoorMonths, isCurrentMonth }) {
  const isPlant = plantMonths.includes(monthNum)
  const isIndoor = !isPlant && indoorMonths.includes(monthNum)

  let cellClass = 'bg-stone-50 border-stone-200 text-stone-400'
  if (isPlant) cellClass = 'bg-green-100 border-green-300 text-green-800 font-semibold'
  else if (isIndoor) cellClass = 'bg-amber-50 border-amber-200 text-amber-700'

  return (
    <div
      className={`relative rounded-lg border text-center py-2.5 text-xs transition-all ${cellClass} ${
        isCurrentMonth ? 'ring-2 ring-emerald-500 ring-offset-1' : ''
      }`}
    >
      <div className="font-medium">{MONTHS[monthNum - 1]}</div>
      {isPlant && <div className="text-green-600 text-[10px] mt-0.5">Plant</div>}
      {isIndoor && <div className="text-amber-600 text-[10px] mt-0.5">Indoors</div>}
      {isCurrentMonth && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full" />
      )}
    </div>
  )
}

export default function PlantCalendar({ myPlants }) {
  const today = new Date()
  const currentMonth = today.getMonth() + 1

  const displayPlants = myPlants.length > 0
    ? PLANTS.filter((p) => myPlants.includes(p.id))
    : PLANTS

  const [selectedPlantId, setSelectedPlantId] = useState(
    displayPlants.length > 0 ? displayPlants[0].id : PLANTS[0].id
  )

  const selectedPlant = PLANTS.find((p) => p.id === selectedPlantId) ?? PLANTS[0]
  const indoorMonths = getIndoorMonths(selectedPlant)

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-emerald-900 text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#ADE883]" />
              Planting Calendar
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              12-month outdoor planting windows for Zone 9b
            </p>
          </div>
        </div>

        {/* Plant selector */}
        <div className="flex flex-wrap gap-2 mb-5">
          {displayPlants.map((plant) => (
            <button
              key={plant.id}
              onClick={() => setSelectedPlantId(plant.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all ${
                selectedPlantId === plant.id
                  ? 'bg-emerald-800 text-white border-emerald-800'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-emerald-400'
              }`}
            >
              <span>{plant.emoji}</span>
              <span>{plant.name}</span>
            </button>
          ))}
          {myPlants.length === 0 && (
            <span className="text-xs text-stone-400 self-center">
              Add plants to My Garden in the Plant Library tab to filter this view.
            </span>
          )}
        </div>

        {/* Selected plant info bar */}
        <div className="bg-stone-50 rounded-xl border border-stone-200 px-4 py-3 mb-4 flex flex-wrap items-center gap-4 text-sm">
          <span className="text-xl">{selectedPlant.emoji}</span>
          <div>
            <span className="font-semibold text-emerald-900">{selectedPlant.name}</span>
            <span className="text-stone-400 mx-2">·</span>
            <span className={`text-xs font-medium ${selectedPlant.type === 'warm' ? 'text-[#6B8E23]' : 'text-blue-600'}`}>
              {selectedPlant.type === 'warm' ? '☀️ Warm season' : '❄️ Cool season'}
            </span>
          </div>
          <div className="text-xs text-stone-500">
            <span className="font-medium">{selectedPlant.daysToHarvest} days</span> to harvest
          </div>
          {selectedPlant.indoorStartWeeks && (
            <div className="text-xs text-amber-600">
              🌱 Start indoors <span className="font-medium">{selectedPlant.indoorStartWeeks} weeks</span> before last frost
            </div>
          )}
          {!selectedPlant.indoorStartWeeks && (
            <div className="text-xs text-stone-500">Direct sow outdoors</div>
          )}
        </div>

        {/* 12-month grid */}
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((monthNum) => (
            <MonthCell
              key={monthNum}
              monthNum={monthNum}
              plantMonths={selectedPlant.plantMonths}
              indoorMonths={indoorMonths}
              isCurrentMonth={monthNum === currentMonth}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 text-xs text-stone-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-green-100 border border-green-300 inline-block" />
            Outdoor planting window
          </span>
          {selectedPlant.indoorStartWeeks && (
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-50 border border-amber-200 inline-block" />
              Start indoors
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-stone-50 border border-stone-200 inline-block" />
            Not recommended
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            Current month
          </span>
        </div>
      </div>

      {/* All-plants summary table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100">
          <h3 className="font-bold text-emerald-900 text-sm flex items-center gap-2">
            <Leaf className="w-4 h-4 text-green-500" />
            All Plants — Planting Windows at a Glance
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-stone-50">
                <th className="text-left px-4 py-2 text-stone-500 font-semibold w-32">Plant</th>
                {MONTHS.map((m, i) => (
                  <th
                    key={m}
                    className={`text-center py-2 px-1 text-stone-500 font-semibold w-10 ${
                      i + 1 === currentMonth ? 'bg-emerald-50 text-emerald-700' : ''
                    }`}
                  >
                    {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PLANTS.map((plant) => {
                const pIndoorMonths = getIndoorMonths(plant)
                return (
                  <tr
                    key={plant.id}
                    className={`border-t border-stone-100 hover:bg-stone-50 transition-colors ${
                      myPlants.includes(plant.id) ? 'bg-[#ADE883]/10' : ''
                    }`}
                  >
                    <td className="px-4 py-2 font-medium text-emerald-900 whitespace-nowrap">
                      {plant.emoji} {plant.name}
                    </td>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                      const isPlant = plant.plantMonths.includes(m)
                      const isIndoor = !isPlant && pIndoorMonths.includes(m)
                      const isCurr = m === currentMonth
                      return (
                        <td
                          key={m}
                          className={`text-center py-2 px-0.5 ${isCurr ? 'bg-emerald-50' : ''}`}
                        >
                          {isPlant && (
                            <span className="block w-6 h-4 bg-green-400 rounded mx-auto" title="Plant outdoors" />
                          )}
                          {isIndoor && (
                            <span className="block w-6 h-4 bg-amber-300 rounded mx-auto" title="Start indoors" />
                          )}
                          {!isPlant && !isIndoor && (
                            <span className="block w-6 h-4 bg-stone-100 rounded mx-auto" />
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 bg-stone-50 border-t border-stone-100 flex flex-wrap gap-4 text-xs text-stone-500">
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-3 rounded bg-green-400 inline-block" />
            Plant outdoors
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-3 rounded bg-amber-300 inline-block" />
            Start indoors
          </span>
          <span className="flex items-center gap-1.5 text-[#ADE883] font-semibold">
            ★ = in My Garden
          </span>
        </div>
      </div>
    </div>
  )
}
