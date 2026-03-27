export const ZONE_CONFIG = {
  city: 'Sunnyvale, CA',
  zone: '9b',
  lat: 37.3688,
  lon: -122.0363,
  lastFrost: { month: 3, day: 1 },   // March 1  (month is 1-indexed)
  firstFrost: { month: 11, day: 15 }, // November 15
}

export const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

export const MONTH_NAMES_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export const WARM_SEASON_MONTHS = [3, 4, 5, 6, 7, 8, 9, 10, 11]  // 1-indexed
export const COOL_SEASON_MONTHS = [1, 2, 12]

export const WEATHER_CACHE_KEY = 'rootcause_weather'
export const WEATHER_CACHE_TIME_KEY = 'rootcause_weather_time'
export const WEATHER_CACHE_DURATION = 60 * 60 * 1000 // 1 hour
export const MY_PLANTS_KEY = 'rootcause_my_plants'
export const ACTIVE_TAB_KEY = 'rootcause_active_tab'
export const IGNORED_PLANTS_KEY = 'rootcause_ignored_plants'
