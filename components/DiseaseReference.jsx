'use client'

import { useState } from 'react'
import {
  Search,
  ChevronDown,
  ChevronUp,
  Bug,
  Droplets,
  Wind,
  Skull,
  Sun,
  FlaskConical,
  Shield,
  Pill,
  AlertTriangle,
  BookOpen,
} from 'lucide-react'
import { PLANTS } from '@/lib/plantData'
import { DISEASE_LIBRARY, DISEASE_CATEGORIES } from '@/lib/diseaseData'

const CATEGORY_ICONS = {
  Fungal: Droplets,
  Bacterial: FlaskConical,
  Viral: Skull,
  Pest: Bug,
  Nutrient: Sun,
  Environmental: Wind,
}

const CATEGORY_COLORS = {
  Fungal: 'bg-purple-100 text-purple-700 border-purple-200',
  Bacterial: 'bg-amber-100 text-amber-700 border-amber-200',
  Viral: 'bg-red-100 text-red-700 border-red-200',
  Pest: 'bg-orange-100 text-orange-700 border-orange-200',
  Nutrient: 'bg-blue-100 text-blue-700 border-blue-200',
  Environmental: 'bg-cyan-100 text-cyan-700 border-cyan-200',
}

const SEVERITY_DOTS = {
  Low: 'bg-yellow-400',
  Medium: 'bg-orange-400',
  High: 'bg-red-500',
}

function DiseaseCard({ disease, plantEmoji }) {
  const [expanded, setExpanded] = useState(false)
  const CatIcon = CATEGORY_ICONS[disease.category] || Bug

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 flex items-start gap-3"
      >
        <span className="text-2xl mt-0.5 flex-shrink-0">{plantEmoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-semibold text-stone-800">{disease.name}</h4>
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[disease.category] || 'bg-stone-100 text-stone-600 border-stone-200'}`}
            >
              <CatIcon className="w-3 h-3" />
              {disease.category}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-stone-500">
              <span className={`w-2 h-2 rounded-full ${SEVERITY_DOTS[disease.severity] || 'bg-stone-300'}`} />
              {disease.severity}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1 line-clamp-2">{disease.symptoms}</p>
        </div>
        <div className="flex-shrink-0 mt-1 text-stone-400">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-0 space-y-3 border-t border-stone-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <div className="bg-stone-50 rounded-lg p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-stone-400 mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Symptoms
              </p>
              <p className="text-xs text-stone-700 leading-relaxed">{disease.symptoms}</p>
            </div>
            <div className="bg-stone-50 rounded-lg p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-stone-400 mb-1 flex items-center gap-1">
                <FlaskConical className="w-3 h-3" /> Cause
              </p>
              <p className="text-xs text-stone-700 leading-relaxed">{disease.cause}</p>
            </div>
          </div>
          <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
            <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600 mb-1 flex items-center gap-1">
              <Pill className="w-3 h-3" /> Treatment
            </p>
            <p className="text-xs text-emerald-800 leading-relaxed">{disease.treatment}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <p className="text-[10px] font-bold uppercase tracking-wide text-blue-600 mb-1 flex items-center gap-1">
              <Shield className="w-3 h-3" /> Prevention
            </p>
            <p className="text-xs text-blue-800 leading-relaxed">{disease.prevention}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DiseaseReference() {
  const [selectedPlant, setSelectedPlant] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Build filterable list
  const allDiseases = []
  for (const plant of PLANTS) {
    const diseases = DISEASE_LIBRARY[plant.id] || []
    for (const disease of diseases) {
      allDiseases.push({ ...disease, plantId: plant.id, plantName: plant.name, plantEmoji: plant.emoji })
    }
  }

  const filtered = allDiseases.filter((d) => {
    if (selectedPlant !== 'all' && d.plantId !== selectedPlant) return false
    if (selectedCategory !== 'all' && d.category !== selectedCategory) return false
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      return (
        d.name.toLowerCase().includes(q) ||
        d.symptoms.toLowerCase().includes(q) ||
        d.cause.toLowerCase().includes(q) ||
        d.plantName.toLowerCase().includes(q)
      )
    }
    return true
  })

  // Count by category for the active filter
  const categoryCounts = {}
  for (const cat of DISEASE_CATEGORIES) {
    categoryCounts[cat] = allDiseases.filter(
      (d) =>
        d.category === cat &&
        (selectedPlant === 'all' || d.plantId === selectedPlant)
    ).length
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <BookOpen className="w-5 h-5 text-emerald-700" />
        <h3 className="text-base font-semibold text-stone-800">Disease Reference Library</h3>
        <span className="text-xs text-stone-400 ml-1">PlantVillage</span>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search diseases, symptoms, causes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all"
          />
        </div>

        {/* Plant filter */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedPlant('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedPlant === 'all'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Plants
          </button>
          {PLANTS.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPlant(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedPlant === p.id
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {p.emoji} {p.name}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-stone-800 text-white shadow-sm'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Types
          </button>
          {DISEASE_CATEGORIES.map((cat) => {
            const CatIcon = CATEGORY_ICONS[cat]
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-stone-800 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <CatIcon className="w-3 h-3" />
                {cat}
                <span className="opacity-60">({categoryCounts[cat]})</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-stone-400">
        {filtered.length} disease{filtered.length !== 1 ? 's' : ''} found
      </p>

      {/* Disease cards */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filtered.map((d, i) => (
            <DiseaseCard key={`${d.plantId}-${d.name}-${i}`} disease={d} plantEmoji={d.plantEmoji} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 p-8 text-center">
          <Search className="w-8 h-8 text-stone-300 mx-auto" />
          <p className="text-sm text-stone-500 mt-3">No diseases match your filters</p>
          <button
            onClick={() => {
              setSearchTerm('')
              setSelectedPlant('all')
              setSelectedCategory('all')
            }}
            className="text-xs text-emerald-600 underline mt-2 hover:text-emerald-700"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  )
}
