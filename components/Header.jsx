'use client'

import { useState, useEffect, useRef } from 'react'
import { Sprout, MapPin, Snowflake, Search, X, Loader2, RotateCcw } from 'lucide-react'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatFrostDate(dateObj) {
  if (!dateObj) return 'Unknown'
  return `${MONTH_NAMES[dateObj.month - 1]} ${dateObj.day}`
}

export default function Header({ location, onZipSubmit, onClearLocation, loading, error }) {
  const [inputZip, setInputZip] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef(null)

  // Pre-fill input with current zip when location changes
  useEffect(() => {
    if (location.zip && !isEditing) {
      setInputZip(location.zip)
    }
  }, [location.zip, isEditing])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (inputZip.trim().length === 5) {
      onZipSubmit(inputZip.trim())
      setIsEditing(false)
    }
  }

  const handleClear = () => {
    setInputZip('')
    setIsEditing(false)
    onClearLocation?.()
  }

  const handleEditClick = () => {
    setIsEditing(true)
    setInputZip(location.zip || '')
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const handleInputFocus = () => {
    setIsEditing(true)
    // Select all text on focus for easy replacement
    if (inputRef.current) {
      inputRef.current.select()
    }
  }

  const locationDisplay = location.zip
    ? `${location.city}${location.state ? `, ${location.state}` : ''}`
    : location.city

  const hasCustomZip = !!location.zip
  const lastFrostDisplay = formatFrostDate(location.lastFrost)
  const firstFrostDisplay = formatFrostDate(location.firstFrost)

  return (
    <header className="bg-emerald-900 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#ADE883] rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight leading-none">RootCause</h1>
            <p className="text-emerald-300 text-xs mt-0.5">Beginner Gardening Assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm">
          {/* Zip code form */}
          <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={inputZip}
                onChange={(e) => {
                  setInputZip(e.target.value.replace(/\D/g, '').slice(0, 5))
                  setIsEditing(true)
                }}
                onFocus={handleInputFocus}
                placeholder="Zip code"
                className="w-24 bg-emerald-800 text-white placeholder-emerald-400 border border-emerald-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ADE883] focus:border-transparent"
              />
              {inputZip && (
                <button
                  type="button"
                  onClick={() => { setInputZip(''); setIsEditing(true) }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 hover:bg-emerald-700 rounded"
                >
                  <X className="w-3 h-3 text-emerald-400" />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={inputZip.length !== 5 || loading}
              className="bg-[#ADE883] text-emerald-900 p-1.5 rounded-lg hover:bg-[#8BC34A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </button>
          </form>

          {error && (
            <div className="text-red-300 text-xs max-w-56 bg-red-900/50 px-2 py-1 rounded">
              {error}
            </div>
          )}

          {/* Location badge - clickable to edit */}
          <div
            className="flex items-center gap-1.5 bg-emerald-800 rounded-lg px-3 py-1.5 cursor-pointer hover:bg-emerald-700 transition-colors group"
            onClick={handleEditClick}
            title="Click to change location"
          >
            <MapPin className="w-3.5 h-3.5 text-[#ADE883]" />
            <span className="text-emerald-100 font-medium text-xs sm:text-sm">{locationDisplay}</span>
            <span className="text-emerald-400 mx-0.5 hidden sm:inline">·</span>
            <span className="text-[#ADE883] font-bold hidden sm:inline">Zone {location.zone}</span>

            {/* Reset button - only show for custom locations */}
            {hasCustomZip && onClearLocation && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleClear()
                }}
                className="ml-1 p-0.5 hover:bg-emerald-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                title="Reset to default location"
              >
                <RotateCcw className="w-3 h-3 text-emerald-300" />
              </button>
            )}
          </div>

          {/* Frost dates - hidden on small screens */}
          <div className="hidden lg:flex items-center gap-1.5 bg-emerald-800 rounded-lg px-3 py-1.5">
            <Snowflake className="w-3.5 h-3.5 text-blue-300" />
            <span className="text-emerald-200 text-xs">
              Last frost <span className="font-semibold text-white">{lastFrostDisplay}</span>
              <span className="text-emerald-400 mx-1.5">—</span>
              First frost <span className="font-semibold text-white">{firstFrostDisplay}</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
