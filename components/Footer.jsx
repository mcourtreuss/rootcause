'use client'

import { Sprout } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-forest to-forest-light text-white mt-12">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-mint/30 rounded-xl flex items-center justify-center">
              <Sprout className="w-4 h-4 text-mint" />
            </div>
            <div>
              <span className="font-serif text-lg">RootCause</span>
              <p className="text-mint/70 text-xs">Made with care for beginner gardeners</p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-2">
            <div className="flex flex-wrap gap-3 text-xs">
              <span className="text-white/50">Data sourced from:</span>
              <a href="https://www.almanac.com/gardening/growing-guides" target="_blank" rel="noopener noreferrer" className="text-mint/80 hover:text-mint transition-colors">
                Old Farmer's Almanac
              </a>
              <a href="https://extension.umn.edu/yard-and-garden/vegetables" target="_blank" rel="noopener noreferrer" className="text-mint/80 hover:text-mint transition-colors">
                UMN Extension
              </a>
              <a href="https://www.gardeningknowhow.com" target="_blank" rel="noopener noreferrer" className="text-mint/80 hover:text-mint transition-colors">
                Gardening Know How
              </a>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/30">
              <span>Weather by Open-Meteo</span>
              <span>·</span>
              <span>Geocoding by Zippopotam.us</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
