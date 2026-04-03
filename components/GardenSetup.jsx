'use client'

import { useState } from 'react'
import { Sprout, X, Plus, Check } from 'lucide-react'
import { PLANTS } from '@/lib/plantData'

const warmPlants = PLANTS.filter(p => p.type === 'warm')
const coolPlants = PLANTS.filter(p => p.type === 'cool')

export default function GardenSetup({ onComplete }) {
  const [selected, setSelected] = useState(new Set())
  const [customPlants, setCustomPlants] = useState([])
  const [customInput, setCustomInput] = useState('')

  const togglePlant = (id) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const addCustom = () => {
    const name = customInput.trim()
    if (name && !customPlants.includes(name)) {
      setCustomPlants(prev => [...prev, name])
      setCustomInput('')
    }
  }

  const removeCustom = (name) => {
    setCustomPlants(prev => prev.filter(n => n !== name))
  }

  const handleSubmit = () => {
    onComplete([...selected], customPlants)
  }

  const handleSkip = () => {
    onComplete([], [])
  }

  const totalCount = selected.size + customPlants.length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-900 px-6 py-5 text-white flex-shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#ADE883] rounded-xl flex items-center justify-center">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Welcome to RootCause!</h2>
              <p className="text-emerald-300 text-sm">What's growing in your garden?</p>
            </div>
          </div>
          <p className="text-emerald-200 text-xs mt-1">
            Select plants you're growing or plan to grow. You can always change this later.
          </p>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* Warm season */}
          <div>
            <h3 className="text-sm font-semibold text-stone-700 mb-2 flex items-center gap-1.5">
              <span>☀️</span> Warm Season
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {warmPlants.map(plant => {
                const isOn = selected.has(plant.id)
                return (
                  <button
                    key={plant.id}
                    onClick={() => togglePlant(plant.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-all text-left ${
                      isOn
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800 ring-1 ring-emerald-300'
                        : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    <span className="text-lg leading-none">{plant.emoji}</span>
                    <span className="flex-1 truncate text-xs font-medium">{plant.name}</span>
                    {isOn && <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Cool season */}
          <div>
            <h3 className="text-sm font-semibold text-stone-700 mb-2 flex items-center gap-1.5">
              <span>❄️</span> Cool Season
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {coolPlants.map(plant => {
                const isOn = selected.has(plant.id)
                return (
                  <button
                    key={plant.id}
                    onClick={() => togglePlant(plant.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-all text-left ${
                      isOn
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800 ring-1 ring-emerald-300'
                        : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    <span className="text-lg leading-none">{plant.emoji}</span>
                    <span className="flex-1 truncate text-xs font-medium">{plant.name}</span>
                    {isOn && <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Custom plants */}
          <div>
            <h3 className="text-sm font-semibold text-stone-700 mb-2 flex items-center gap-1.5">
              <span>🌱</span> Growing something else?
            </h3>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom() } }}
                placeholder="Type a plant name..."
                className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
              />
              <button
                onClick={addCustom}
                disabled={!customInput.trim()}
                className="bg-emerald-700 text-white px-3 py-2 rounded-lg hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {customPlants.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {customPlants.map(name => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full"
                  >
                    🌱 {name}
                    <button
                      onClick={() => removeCustom(name)}
                      className="hover:bg-emerald-200 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-stone-200 px-6 py-4 flex items-center justify-between flex-shrink-0 bg-stone-50">
          <button
            onClick={handleSkip}
            className="text-sm text-stone-400 hover:text-stone-600 transition-colors"
          >
            I'll add plants later
          </button>
          <div className="flex items-center gap-3">
            {totalCount > 0 && (
              <span className="text-xs text-stone-500">
                {totalCount} plant{totalCount !== 1 ? 's' : ''} selected
              </span>
            )}
            <button
              onClick={handleSubmit}
              className="bg-emerald-700 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-800 transition-colors shadow-sm"
            >
              Start Gardening
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
