import { ZONE_CONFIG } from './constants'

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000
const MS_PER_DAY = 24 * 60 * 60 * 1000

function getLastFrost(year) {
  return new Date(year, ZONE_CONFIG.lastFrost.month - 1, ZONE_CONFIG.lastFrost.day)
}

function getFirstFrost(year) {
  return new Date(year, ZONE_CONFIG.firstFrost.month - 1, ZONE_CONFIG.firstFrost.day)
}

export function getPlantStatus(plant, today = new Date(), forecastLows = []) {
  const year = today.getFullYear()
  const lastFrost = getLastFrost(year)
  const firstFrost = getFirstFrost(year)

  const weeksToLastFrost = (lastFrost - today) / MS_PER_WEEK
  const weeksSinceLastFrost = (today - lastFrost) / MS_PER_WEEK
  const minForecast = forecastLows.length > 0 ? Math.min(...forecastLows) : null

  // Start Indoors window: [indoorStartWeeks] before last frost
  if (plant.indoorStartWeeks && weeksToLastFrost > 0 && weeksToLastFrost <= plant.indoorStartWeeks) {
    const daysLeft = Math.ceil(weeksToLastFrost * 7)
    return {
      status: 'Start Indoors',
      color: 'amber',
      detail: `${daysLeft} days until last frost. Start seeds indoors now — transplant outside after March 1.`,
    }
  }

  if (plant.type === 'warm') {
    // Before last frost — too cold for warm season
    if (today < lastFrost) {
      if (plant.indoorStartWeeks) {
        return {
          status: 'Start Indoors',
          color: 'amber',
          detail: `Too early to plant outside. Start seeds indoors ${plant.indoorStartWeeks} weeks before March 1.`,
        }
      }
      return {
        status: 'Too Cold',
        color: 'blue',
        detail: `Wait until after last frost (March 1) to direct sow outdoors.`,
      }
    }

    // After first frost — late in the year
    if (today > firstFrost) {
      return {
        status: 'Too Cold',
        color: 'blue',
        detail: `Frost season. Wait until next spring after March 1.`,
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

export function getNotifications(today = new Date(), forecastDays = []) {
  const year = today.getFullYear()
  const lastFrost = getLastFrost(year)
  const notifications = []

  // "Start Tomatoes Indoors" — if exactly 6 weeks before March 1
  const sixWeeksBefore = new Date(lastFrost.getTime() - 6 * MS_PER_WEEK)
  const daysToLastFrost = Math.ceil((lastFrost - today) / MS_PER_DAY)

  if (today >= sixWeeksBefore && today <= lastFrost && daysToLastFrost > 0) {
    notifications.push({
      id: 'start-indoors',
      type: 'info',
      icon: 'Sprout',
      title: 'Start Tomatoes Indoors',
      message: `Last frost is ${daysToLastFrost} day(s) away (March 1). Start tomato and pepper seeds indoors now.`,
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

    if (maxHigh > 85) {
      frequencyDays = Math.max(1, frequencyDays - 1)
      weatherAdjustments.push({
        type: 'heat',
        icon: 'Thermometer',
        text: `Heat up to ${maxHigh}°F this week — water more frequently and check soil daily.`,
      })
    }

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

    if (minLow < 40) {
      frequencyDays = frequencyDays + 1
      weatherAdjustments.push({
        type: 'cold',
        icon: 'Snowflake',
        text: `Cold snap to ${minLow}°F — reduce watering. Cold, wet roots are vulnerable to rot.`,
      })
    }

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
