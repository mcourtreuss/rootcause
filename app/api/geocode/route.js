export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const zip = searchParams.get('zip')

  if (!zip) {
    return Response.json({ error: 'Zip code is required.' }, { status: 400 })
  }

  try {
    // Use Open-Meteo geocoding API (free, no key needed)
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${zip}&count=5&language=en&format=json`
    const res = await fetch(url)

    if (!res.ok) {
      return Response.json(
        { error: `Geocoding error (${res.status})` },
        { status: res.status }
      )
    }

    const data = await res.json()

    // Open-Meteo geocoding searches by name, not zip. For US zips, use a different approach:
    // Use the Zippopotamus free API for zip -> lat/lon
    const zipRes = await fetch(`https://api.zippopotam.us/us/${zip}`)

    if (!zipRes.ok) {
      if (zipRes.status === 404) {
        return Response.json(
          { error: 'Zip code not found. Please enter a valid US zip code.' },
          { status: 404 }
        )
      }
      return Response.json(
        { error: `Zip lookup error (${zipRes.status})` },
        { status: zipRes.status }
      )
    }

    const zipData = await zipRes.json()
    const place = zipData.places?.[0]

    if (!place) {
      return Response.json({ error: 'Zip code not found.' }, { status: 404 })
    }

    return Response.json({
      lat: parseFloat(place.latitude),
      lon: parseFloat(place.longitude),
      city: place['place name'] || 'Unknown',
      state: place['state abbreviation'] || '',
    })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
