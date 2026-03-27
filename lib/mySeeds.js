// My Garden seed list — sourced from the "Seeds" Google Sheet (G:\My Drive\Seeds.gsheet)
// This is the ONLY source for the My Garden feature.
// Each entry maps a seed name (as listed in the spreadsheet) to a plant ID in plantData.js.

export const MY_SEEDS = [
  { seedName: 'Thyme',                                    plantId: 'thyme' },
  { seedName: 'Parsley',                                  plantId: 'parsley' },
  { seedName: 'Radishes',                                 plantId: 'radishes' },
  { seedName: 'Long day onions',                          plantId: 'onions' },
  { seedName: 'Carrots - Cosmic Purple',                  plantId: 'carrots' },
  { seedName: 'Poblano peppers',                          plantId: 'poblano-pepper' },
  { seedName: 'Shishito peppers',                         plantId: 'shishito-pepper' },
  { seedName: 'Thai chilis',                              plantId: 'thai-chili' },
  { seedName: 'Long purple eggplants',                    plantId: 'eggplant' },
  { seedName: 'Summer squash',                            plantId: 'summer-squash' },
  { seedName: 'Black zucchini',                           plantId: 'zucchini' },
  { seedName: 'Poinsett 76 cucumbers',                    plantId: 'cucumber' },
  { seedName: 'Zinnias (Salmon Queen and multicolor)',     plantId: 'zinnias' },
  { seedName: 'Petite Violas Fairyland',                   plantId: 'violas' },
  { seedName: 'French Alouette',                           plantId: 'french-alouette' },
  { seedName: 'Fernleaf lavender',                         plantId: 'lavender' },
  { seedName: 'Marigolds',                                 plantId: 'marigolds' },
  { seedName: 'Calabrian chilis',                          plantId: 'calabrian-chili' },
  { seedName: 'Bok choy',                                  plantId: 'bok-choy' },
  { seedName: 'Habanero',                                  plantId: 'habanero' },
  { seedName: 'Lettuce (buttercrunch and a leaf blend)',    plantId: 'lettuce' },
  { seedName: 'Peas',                                      plantId: 'peas' },
  { seedName: 'Roma tomatoes',                             plantId: 'tomato' },
]

// Pre-computed array of plant IDs for My Garden initialization
export const MY_SEED_IDS = MY_SEEDS.map((s) => s.plantId)
