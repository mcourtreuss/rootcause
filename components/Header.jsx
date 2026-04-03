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

  useEffect(() => {
    if (location?.zip && !isEditing) {
      setInputZip(location.zip)
    }
  }, [location?.zip, isEditing])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (inputZip.trim().length === 5) {
      onZipSubmit?.(inputZip.trim())
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
    setInputZip(location?.zip || '')
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const locationDisplay = location?.zip
    ? `${location.city}${location.state ? `, ${location.state}` : ''}`
    : location?.city || 'Sunnyvale, CA'

  const hasCustomZip = !!location?.zip
  const lastFrostDisplay = formatFrostDate(location?.lastFrost)
  const firstFrostDisplay = formatFrostDate(location?.firstFrost)

  return (
    <header className="bg-gradient-to-r from-forest to-forest-light text-white shadow-warm-lg">
      <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-mint rounded-2xl flex items-center justify-center shadow-warm">
            <Sprout className="w-6 h-6 text-forest" />
          </div>
          <div>
            <h1 className="font-serif text-2xl tracking-tight leading-none">RootCause</h1>
            <p className="text-mint text-xs mt-0.5 italic">Your Garden Companion</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm">
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
                onFocus={() => {
                  setIsEditing(true)
                  inputRef.current?.select()
                }}
                placeholder="Zip code"
                className="w-24 bg-white/10 text-white placeholder-white/40 border border-white/20 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-mint focus:border-transparent backdrop-blur-sm"
              />
              {inputZip && (
                <button
                  type="button"
                  onClick={() => { setInputZip(''); setIsEditing(true) }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 hover:bg-white/10 rounded"
                >
                  <X className="w-3 h-3 text-white/60" />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={inputZip.length !== 5 || loading}
              className="bg-mint text-forest p-1.5 rounded-xl hover:bg-mint-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </button>
          </form>

          {error && (
            <div className="text-red-200 text-xs max-w-56 bg-red-900/30 px-2 py-1 rounded-lg">
              {error}
            </div>
          )}

          <div
            className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-1.5 cursor-pointer hover:bg-white/15 transition-colors group border border-white/10"
            onClick={handleEditClick}
            title="Click to change location"
          >
            <MapPin className="w-3.5 h-3.5 text-mint" />
            <span className="text-white/90 font-medium text-xs sm:text-sm">{locationDisplay}</span>
            <span className="text-white/30 mx-0.5 hidden sm:inline">·</span>
            <span className="text-mint font-bold hidden sm:inline">Zone {location?.zone || '9b'}</span>

            {hasCustomZip && onClearLocation && (
              <button
                onClick={(e) => { e.stopPropagation(); handleClear() }}
                className="ml-1 p-0.5 hover:bg-white/10 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                title="Reset to default location"
              >
                <RotateCcw className="w-3 h-3 text-white/60" />
              </button>
            )}
          </div>

          <div className="hidden lg:flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-white/10">
            <Snowflake className="w-3.5 h-3.5 text-blue-200" />
            <span className="text-white/70 text-xs">
              Last frost <span className="font-semibold text-white">{lastFrostDisplay}</span>
              <span className="text-white/30 mx-1.5">—</span>
              First frost <span className="font-semibold text-white">{firstFrostDisplay}</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
