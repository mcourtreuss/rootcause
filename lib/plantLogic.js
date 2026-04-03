import { ZONE_CONFIG } from './constants'

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000
const MS_PER_DAY = 24 * 60 * 60 * 1000

function getLastFrost(year, lastFrostConfig = null) {
  const config = lastFrostConfig || ZONE_CONFIG.lastFrost
  return new Date(year, config.month - 1, config.day)
}

function getFirstFrost(year, firstFrostConfig = null) {
  const config = firstFrostConfig || ZONE_CONFIG.firstFrost
  return new Date(year, config.month - 1, config.day)
}

function formatFrostDate(dateObj) {
  if (!dateObj) return 'Mar 1'
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[dateObj.month - 1]} ${dateObj.day}`
}

export function getPlantStatus(plant, today = new Date(), forecastLows = [], lastFrostConfig = null, firstFrostConfig = null) {
  const year = today.getFullYear()
  const lastFrost = getLastFrost(year, lastFrostConfig)
  const firstFrost = getFirstFrost(year, firstFrostConfig)
  const lastFrostLabel = formatFrostDate(lastFrostConfig)

  const weeksToLastFrost = (lastFrost - today) / MS_PER_WEEK
  const weeksSinceLastFrost = (today - lastFrost) / MS_PER_WEEK
  const minForecast = forecastLows.length > 0 ? Math.min(...forecastLows) : null

  // Start Indoors window: [indoorStartWeeks] before last frost
  if (plant.indoorStartWeeks && weeksToLastFrost > 0 && weeksToLastFrost <= plant.indoorStartWeeks) {
    const daysLeft = Math.ceil(weeksToLastFrost * 7)
    return {
      status: 'Start Indoors',
      color: 'amber',
      detail: `${daysLeft} days until last frost. Start seeds indoors now — transplant outside after ${lastFrostLabel}.`,
    }
  }

  if (plant.type === 'warm') {
    // Before last frost — too cold for warm season
    if (today < lastFrost) {
      if (plant.indoorStartWeeks) {
        return {
          status: 'Start Indoors',
          color: 'amber',
          detail: `Too early to plant outside. Start seeds indoors ${plant.indoorStartWeeks} weeks before ${lastFrostLabel}.`,
        }
      }
      return {
        status: 'Too Cold',
        color: 'blue',
        detail: `Wait until after last frost (${lastFrostLabel}) to direct sow outdoors.`,
      }
    }

    // After first frost — late in the year
    if (today > firstFrost) {
      return {
        status: 'Too Cold',
        color: 'blue',
        detail: `Frost season. Wait until next spring after ${lastFrostLabel}.`,
      }
    }

    // In warm season (March 1 – November 15)
    if (minForecast !== null && minForecast < plant.minTempF) {
      return {
        status: 'Too Cold',
        color: 'blue',
        detail: `Forecast low of ${minForecast}°F is below ${plant.name}'s minimum of ${plant.minTempF}°F.`,
      }
    }

    const waitWeeks = plant.weeksAfterLastFrost || 2
    if (weeksSinceLastFrost < waitWeeks) {
      const daysLeft = Math.ceil((waitWeeks - weeksSinceLastFrost) * 7)
      return {
        status: 'Almost Ready',
        color: 'amber',
        detail: `${daysLeft} more day(s) after last frost recommended before transplanting outside.`,
      }
    }

    return {
      status: 'Ideal',
      color: 'green',
      detail: `Conditions look great — plant outdoors now!`,
    }
  }

  if (plant.type === 'cool') {
    const springCutoff = new Date(year, 4, 31)  // May 31
    const fallStart = new Date(year, 7, 15)      // Aug 15

    if (today > springCutoff && today < fallStart) {
      return {
        status: 'Too Hot',
        color: 'orange',
        detail: `Summer heat causes bolting. Wait for the fall window starting mid-August.`,
      }
    }

    if (minForecast !== null && minForecast < plant.minTempF) {
      return {
        status: 'Too Cold',
        color: 'blue',
        detail: `Forecast low of ${minForecast}°F is below ${plant.name}'s minimum of ${plant.minTempF}°F.`,
      }
    }

    return {
      status: 'Ideal',
      color: 'green',
      detail: `Perfect cool-season conditions for ${plant.name}!`,
    }
  }

  return { status: 'Unknown', color: 'gray', detail: '' }
}

export function getNotifications(today = new Date(), forecastDays = [], lastFrostConfig = null) {
  const year = today.getFullYear()
  const lastFrost = getLastFrost(year, lastFrostConfig)
  const lastFrostLabel = formatFrostDate(lastFrostConfig)
  const notifications = []

  // "Start Tomatoes Indoors" — if exactly 6 weeks before last frost
  const sixWeeksBefore = new Date(lastFrost.getTime() - 6 * MS_PER_WEEK)
  const daysToLastFrost = Math.ceil((lastFrost - today) / MS_PER_DAY)

  if (today >= sixWeeksBefore && today <= lastFrost && daysToLastFrost > 0) {
    notifications.push({
      id: 'start-indoors',
      type: 'info',
      icon: 'Sprout',
      title: 'Start Tomatoes Indoors',
      message: `Last frost is ${daysToLastFrost} day(s) away (${lastFrostLabel}). Start tomato and pepper seeds indoors now.`,
    })
  }

  // Heat alert — any day in forecast exceeds 85°F
  if (forecastDays.length > 0) {
    const maxHigh = Math.max(...forecastDays.map((d) => d.high))
    if (maxHigh > 85) {
      notifications.push({
        id: 'heat-alert',
        type: 'warning',
        icon: 'Thermometer',
        title: 'Heat Alert — Water More',
        message: `Temps up to ${maxHigh}°F expected this week. Water plants deeply in the early morning and check soil daily.`,
      })
    }

    // Frost alert — any day drops below 32°F
    const minLow = Math.min(...forecastDays.map((d) => d.low))
    if (minLow < 32) {
      notifications.push({
        id: 'frost-alert',
        type: 'danger',
        icon: 'Snowflake',
        title: 'Frost Warning',
        message: `Forecast low of ${minLow}°F. Cover tender plants tonight or bring containers indoors.`,
      })
    }
  }

  return notifications
}

export function isSafePlantingWindow(forecastLows, minTempF) {
  if (!forecastLows || forecastLows.length === 0) return null
  return Math.min(...forecastLows) >= minTempF
}

export function getWateringAdvice(plant, maturityStage = 'established', dailyForecast = []) {
  if (!plant.watering) {
    return {
      frequencyDays: 2,
      depthInches: 1,
      notes: 'Water when top inch of soil is dry.',
      method: 'Water at the base of the plant.',
      weatherAdjustments: [],
      sources: [],
    }
  }

  const stage = plant.watering[maturityStage] || plant.watering.established
  let { frequencyDays, depthInches, notes } = stage
  const weatherAdjustments = []

  if (dailyForecast.length > 0) {
    const maxHigh = Math.max(...dailyForecast.map(d => d.high))
    const minLow = Math.min(...dailyForecast.map(d => d.low))
    const rainyDays = dailyForecast.filter(d =>
      d.condition === 'Rain' || d.condition === 'Drizzle' || d.condition === 'Thunderstorm'
    )
    const hasRain = rainyDays.length > 0

    // Heat adjustment: reduce frequency by 1 day (min 1)
    if (maxHigh > 85) {
      frequencyDays = Math.max(1, frequencyDays - 1)
      weatherAdjustments.push({
        type: 'heat',
        icon: 'Thermometer',
        text: `Heat up to ${maxHigh}°F this week — water more frequently and check soil daily.`,
      })
    }

    // Rain adjustment: note to check soil
    if (hasRain) {
      const rainDayNames = rainyDays.map(d => {
        const date = new Date(d.date + 'T12:00:00')
        return date.toLocaleDateString('en-US', { weekday: 'short' })
      })
      weatherAdjustments.push({
        type: 'rain',
        icon: 'CloudRain',
        text: `Rain expected ${rainDayNames.join(', ')} — check soil moisture before watering.`,
      })
    }

    // Cold adjustment: increase frequency by 1 day
    if (minLow < 40) {
      frequencyDays = frequencyDays + 1
      weatherAdjustments.push({
        type: 'cold',
        icon: 'Snowflake',
        text: `Cold snap to ${minLow}°F — reduce watering. Cold, wet roots are vulnerable to rot.`,
      })
    }

    // Container note for hot weather
    const isContainer = plant.vessel.toLowerCase().includes('container') ||
                        plant.vessel.toLowerCase().includes('pot') ||
                        plant.vessel.toLowerCase().includes('window box')
    if (isContainer && maxHigh > 85) {
      weatherAdjustments.push({
        type: 'container',
        icon: 'Package',
        text: 'Container plants may need daily watering in this heat — check soil morning and evening.',
      })
    }
  }

  return {
    frequencyDays,
    depthInches,
    notes,
    method: plant.watering.method || 'Water at the base of the plant.',
    mulchAdvice: plant.watering.mulchAdvice || '',
    containerNote: plant.watering.containerNote || '',
    weatherAdjustments,
    sources: plant.watering.sources || [],
  }
}

export function getWateringUrgency(plant, maturityStage = 'established', dailyForecast = []) {
  const advice = getWateringAdvice(plant, maturityStage, dailyForecast)
  const hasHeat = advice.weatherAdjustments.some(a => a.type === 'heat')
  const hasRain = advice.weatherAdjustments.some(a => a.type === 'rain')

  if (advice.frequencyDays <= 1 || hasHeat) {
    return { urgency: 'today', label: 'Water Today', color: 'green' }
  }
  if (advice.frequencyDays <= 2) {
    return { urgency: 'soon', label: 'Water Soon', color: 'amber' }
  }
  if (hasRain) {
    return { urgency: 'check', label: 'Check Soil', color: 'blue' }
  }
  return { urgency: 'later', label: 'On Schedule', color: 'stone' }
}

const CONTAINER_SIZES = {
  'Small pot': true,
  'Medium container': true,
  'Shallow container': true,
  'Large container': true,
}

const POPULAR_BEGINNER_PLANTS = [
  'basil', 'zucchini', 'bush-beans', 'lettuce', 'kale',
  'radishes', 'sugar-snaps', 'swiss-chard', 'cucumber', 'zinnias',
  'marigolds', 'thyme', 'parsley', 'bok-choy', 'peas',
]

export function getRecommendations(plants, myPlants = [], forecastLows = [], lastFrost = null, firstFrost = null, ignoredPlants = []) {
  const today = new Date()
  const excludedIds = [...myPlants, ...ignoredPlants]
  
  const recommendations = plants
    .filter(p => !excludedIds.includes(p.id))
    .map(plant => {
      const { status } = getPlantStatus(plant, today, forecastLows, lastFrost, firstFrost)
      let score = 0
      const reasons = []
      const myPlantObjects = plants.filter(p => myPlants.includes(p.id))

      // 1. Forecast fit (40 pts max)
      if (status === 'Ideal') {
        score += 40
        reasons.push({ type: 'forecast', text: 'Ready to plant now', icon: 'check' })
      } else if (status === 'Almost Ready') {
        score += 25
        reasons.push({ type: 'forecast', text: 'Almost ready', icon: 'clock' })
      } else if (status === 'Start Indoors') {
        score += 15
        reasons.push({ type: 'forecast', text: 'Start indoors soon', icon: 'sprout' })
      }

      // 2. Companion bonus (30 pts max)
      let companionMatches = 0
      myPlantObjects.forEach(myPlant => {
        if (myPlant.companions.includes(plant.name)) {
          companionMatches++
          score += 10
        }
        if (plant.companions.includes(myPlant.name)) {
          companionMatches++
          score += 10
        }
      })
      if (companionMatches >= 2) {
        reasons.push({ type: 'companion', text: `Pairs great with ${plant.companions.find(c => myPlantObjects.some(mp => mp.name === c)) || 'your garden'}`, icon: 'heart' })
      } else if (companionMatches === 1) {
        reasons.push({ type: 'companion', text: 'Good garden companion', icon: 'heart' })
      }

      // 3. Beginner-friendly (20 pts max)
      const isContainerFriendly = Object.keys(CONTAINER_SIZES).some(size => 
        plant.vessel.toLowerCase().includes(size.toLowerCase())
      )
      if (plant.difficulty === 'Easy' && isContainerFriendly) {
        score += 20
        reasons.push({ type: 'beginner', text: 'Easy container grow', icon: 'star' })
      } else if (plant.difficulty === 'Easy') {
        score += 12
        reasons.push({ type: 'beginner', text: 'Easy to grow', icon: 'star' })
      } else if (isContainerFriendly) {
        score += 8
      }

      // 4. Quick harvest bonus (10 pts max)
      if (plant.daysToHarvest <= 30) {
        score += 10
        reasons.push({ type: 'harvest', text: `Quick harvest (${plant.daysToHarvest} days)`, icon: 'zap' })
      } else if (plant.daysToHarvest <= 60) {
        score += 5
      }

      // 5. Popular beginner plant bonus (5 pts)
      if (POPULAR_BEGINNER_PLANTS.includes(plant.id)) {
        score += 5
      }

      // Cap score at 100
      score = Math.min(score, 100)

      return {
        plant,
        score,
        reasons: reasons.slice(0, 2),
      }
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)

  return recommendations
}
