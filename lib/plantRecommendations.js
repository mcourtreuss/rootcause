import { PLANTS } from './plantData'

// Plant categories for pattern detection
const CATEGORIES = {
  'Culinary Herbs': ['basil', 'thyme', 'parsley'],
  'Hot Peppers': ['thai-chili', 'habanero', 'calabrian-chili'],
  'Sweet Peppers': ['bell-pepper', 'poblano-pepper', 'shishito-pepper'],
  'Leafy Greens': ['lettuce', 'kale', 'swiss-chard', 'bok-choy'],
  'Root Vegetables': ['carrots', 'radishes', 'onions'],
  'Squash & Cucumbers': ['zucchini', 'summer-squash', 'cucumber'],
  'Legumes': ['bush-beans', 'sugar-snaps', 'peas'],
  'Flowers': ['zinnias', 'violas', 'french-alouette', 'lavender', 'marigolds'],
  'Nightshades': ['tomato', 'eggplant', 'bell-pepper', 'poblano-pepper'],
}

// Recommendations: plants NOT in the catalog that we suggest based on what user grows
// Each has: name, emoji, reason, categories it's recommended for, sources
// Sourced from Old Farmer's Almanac companion planting guide, UMN Extension, Gardening Know How
const EXTERNAL_RECOMMENDATIONS = [
  {
    name: 'Mint',
    emoji: '🌿',
    categories: ['Culinary Herbs', 'Leafy Greens'],
    reason: 'Great companion to your herbs — deters aphids and flea beetles. Grow in a container to prevent spreading.',
    tips: 'Easy to grow in pots. Harvest frequently to keep bushy.',
    sources: [
      { name: 'Old Farmer\'s Almanac', url: 'https://www.almanac.com/companion-planting-guide-vegetables' },
    ],
  },
  {
    name: 'Cilantro',
    emoji: '🌿',
    categories: ['Culinary Herbs', 'Hot Peppers', 'Sweet Peppers', 'Nightshades'],
    reason: 'Complements your pepper and herb collection — attracts beneficial insects and improves flavor of neighboring crops.',
    tips: 'Bolts quickly in heat. Sow every 2-3 weeks for continuous harvest. Let some bolt for coriander seeds.',
    sources: [
      { name: 'Old Farmer\'s Almanac', url: 'https://www.almanac.com/plant/cilantro' },
    ],
  },
  {
    name: 'Dill',
    emoji: '🌿',
    categories: ['Culinary Herbs', 'Squash & Cucumbers', 'Leafy Greens'],
    reason: 'Attracts ladybugs and parasitic wasps that protect your cucumbers and greens from pests.',
    tips: 'Direct sow in cool weather. Great near cucumbers but keep away from mature carrots.',
    sources: [
      { name: 'Old Farmer\'s Almanac', url: 'https://www.almanac.com/plant/dill' },
      { name: 'UMN Extension', url: 'https://extension.umn.edu/vegetables/growing-dill' },
    ],
  },
  {
    name: 'Rosemary',
    emoji: '🌿',
    categories: ['Culinary Herbs', 'Nightshades', 'Legumes', 'Root Vegetables'],
    reason: 'Repels bean beetles, carrot flies, and cabbage moths — a powerful pest deterrent for your garden.',
    tips: 'Perennial in Zone 8+. Prefers well-drained soil and full sun. Drought-tolerant once established.',
    sources: [
      { name: 'Old Farmer\'s Almanac', url: 'https://www.almanac.com/plant/rosemary' },
    ],
  },
  {
    name: 'Sage',
    emoji: '🌿',
    categories: ['Culinary Herbs', 'Root Vegetables', 'Nightshades'],
    reason: 'Reduces pest egg-laying near carrots and cabbage family plants. Pairs well with your herb garden.',
    tips: 'Perennial herb. Thrives in full sun with well-drained soil. Prune after flowering to keep compact.',
    sources: [
      { name: 'Old Farmer\'s Almanac', url: 'https://www.almanac.com/plant/sage' },
      { name: 'Gardening Know How', url: 'https://www.gardeningknowhow.com/edible/herbs/sage/growing-sage.htm' },
    ],
  },
  {
    name: 'Chives',
    emoji: '🌿',
    categories: ['Culinary Herbs', 'Root Vegetables', 'Nightshades', 'Leafy Greens'],
    reason: 'Masks scent and deters pests from carrots, lettuce, and tomatoes. Edible flowers attract pollinators.',
    tips: 'Perennial — plant once and harvest for years. Cut back to 2 inches to encourage regrowth.',
    sources: [
      { name: 'Old Farmer\'s Almanac', url: 'https://www.almanac.com/plant/chives' },
    ],
  },
  {
    name: 'Oregano',
    emoji: '🌿',
    categories: ['Culinary Herbs', 'Hot Peppers', 'Sweet Peppers', 'Squash & Cucumbers'],
    reason: 'Excellent companion for peppers and squash — repels aphids and provides ground cover to retain soil moisture.',
    tips: 'Vigorous grower. Harvest before flowers open for best flavor. Hardy perennial in most zones.',
    sources: [
      { name: 'Gardening Know How', url: 'https://www.gardeningknowhow.com/edible/herbs/oregano/growing-oregano.htm' },
    ],
  },
  {
    name: 'Strawberries',
    emoji: '🍓',
    categories: ['Legumes', 'Leafy Greens', 'Culinary Herbs', 'Flowers'],
    reason: 'Pairs well with beans, lettuce, and herbs. Borage and thyme are excellent strawberry companions.',
    tips: 'June-bearing or everbearing varieties. Mulch with straw to keep fruit clean. Runners spread to fill beds.',
    sources: [
      { name: 'Old Farmer\'s Almanac', url: 'https://www.almanac.com/plant/strawberries' },
    ],
  },
  {
    name: 'Sunflowers',
    emoji: '🌻',
    categories: ['Squash & Cucumbers', 'Legumes', 'Nightshades'],
    reason: 'Natural trellis for climbing beans and cucumbers. Attracts pollinators that boost your squash and tomato yields.',
    tips: 'Direct sow after last frost. Choose dwarf varieties for small spaces. Seeds are edible!',
    sources: [
      { name: 'Old Farmer\'s Almanac', url: 'https://www.almanac.com/plant/sunflowers' },
    ],
  },
  {
    name: 'Nasturtiums',
    emoji: '🌺',
    categories: ['Squash & Cucumbers', 'Legumes', 'Nightshades', 'Leafy Greens'],
    reason: 'Acts as a trap crop, drawing aphids and beetles away from your beans, squash, and tomatoes.',
    tips: 'Edible flowers and leaves with a peppery taste. Thrives in poor soil. Direct sow after frost.',
    sources: [
      { name: 'Old Farmer\'s Almanac', url: 'https://www.almanac.com/plant/nasturtium' },
      { name: 'Gardening Know How', url: 'https://www.gardeningknowhow.com/ornamental/flowers/nasturtium/growing-nasturtiums.htm' },
    ],
  },
  {
    name: 'Borage',
    emoji: '💙',
    categories: ['Nightshades', 'Squash & Cucumbers', 'Flowers'],
    reason: 'Attracts bees and beneficial insects to your tomatoes and squash. Improves growth and flavor of nearby plants.',
    tips: 'Self-seeds freely. Beautiful blue edible flowers. Plant once and enjoy for years.',
    sources: [
      { name: 'Old Farmer\'s Almanac', url: 'https://www.almanac.com/plant/borage' },
    ],
  },
  {
    name: 'Sweet Potatoes',
    emoji: '🍠',
    categories: ['Root Vegetables', 'Legumes', 'Hot Peppers'],
    reason: 'Complements your root vegetables and peppers. Dense vines act as living mulch, suppressing weeds.',
    tips: 'Needs warm soil (65°F+). Start slips 8 weeks before planting. Long growing season (90-120 days).',
    sources: [
      { name: 'Old Farmer\'s Almanac', url: 'https://www.almanac.com/plant/sweet-potatoes' },
    ],
  },
  {
    name: 'Celery',
    emoji: '🥬',
    categories: ['Nightshades', 'Legumes', 'Leafy Greens'],
    reason: 'Good companion for tomatoes and beans — its strong scent helps deter pests in your vegetable garden.',
    tips: 'Long growing season (130-140 days). Start indoors early. Needs consistent moisture and cool temps.',
    sources: [
      { name: 'Old Farmer\'s Almanac', url: 'https://www.almanac.com/plant/celery' },
    ],
  },
  {
    name: 'Alyssum',
    emoji: '🤍',
    categories: ['Leafy Greens', 'Legumes', 'Root Vegetables', 'Flowers'],
    reason: 'Attracts hoverflies that eat aphids attacking your lettuce and greens. USDA-recommended companion.',
    tips: 'Low-growing annual. Plant as a border around garden beds. Self-seeds in mild climates.',
    sources: [
      { name: 'Old Farmer\'s Almanac', url: 'https://www.almanac.com/companion-planting-guide-vegetables' },
    ],
  },
  {
    name: 'Garlic',
    emoji: '🧄',
    categories: ['Nightshades', 'Root Vegetables', 'Leafy Greens', 'Flowers'],
    reason: 'Repels aphids, spider mites, and beetles. Improves disease resistance when planted near tomatoes and roses.',
    tips: 'Plant cloves in fall for summer harvest. Easy to grow. Cure bulbs for 2-3 weeks before storing.',
    sources: [
      { name: 'Old Farmer\'s Almanac', url: 'https://www.almanac.com/plant/garlic' },
      { name: 'Gardening Know How', url: 'https://www.gardeningknowhow.com/edible/vegetables/garlic/growing-garlic.htm' },
    ],
  },
  {
    name: 'Chamomile',
    emoji: '🌼',
    categories: ['Culinary Herbs', 'Leafy Greens', 'Root Vegetables'],
    reason: 'Improves growth and flavor of nearby herbs and vegetables. Makes a soothing tea from your own garden.',
    tips: 'German chamomile is annual; Roman is perennial. Self-seeds readily. Harvest flowers when fully open.',
    sources: [
      { name: 'Gardening Know How', url: 'https://www.gardeningknowhow.com/edible/herbs/chamomile/growing-chamomile.htm' },
    ],
  },
]

/**
 * Get recommendations based on the user's garden plants.
 * Returns an array of recommendation objects sorted by relevance (match count).
 */
export function getRecommendations(gardenPlantIds = []) {
  if (gardenPlantIds.length === 0) return []

  // Detect which categories the user's garden covers
  const userCategories = new Map() // category -> count of plants in that category
  for (const [category, plantIds] of Object.entries(CATEGORIES)) {
    const count = plantIds.filter(id => gardenPlantIds.includes(id)).length
    if (count > 0) {
      userCategories.set(category, count)
    }
  }

  if (userCategories.size === 0) return []

  // Also collect the user's existing catalog plant names to avoid recommending duplicates
  const existingNames = new Set(
    PLANTS.filter(p => gardenPlantIds.includes(p.id)).map(p => p.name.toLowerCase())
  )

  // Score each recommendation
  const scored = EXTERNAL_RECOMMENDATIONS
    .filter(rec => !existingNames.has(rec.name.toLowerCase()))
    .map(rec => {
      let score = 0
      const matchedCategories = []

      for (const cat of rec.categories) {
        const count = userCategories.get(cat)
        if (count) {
          score += count // More plants in that category = higher relevance
          matchedCategories.push(cat)
        }
      }

      return { ...rec, score, matchedCategories }
    })
    .filter(rec => rec.score > 0)
    .sort((a, b) => b.score - a.score)

  return scored
}
