export const dynamic = 'force-dynamic'

export async function GET(request) {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY
  const { searchParams } = new URL(request.url)
  const zip = searchParams.get('zip')

  if (!apiKey) {
    return Response.json(
      { error: 'OPENWEATHERMAP_API_KEY is not set.' },
      { status: 500 }
    )
  }

  if (!zip) {
    return Response.json(
      { error: 'Zip code is required.' },
      { status: 400 }
    )
  }

  try {
    const url = `https://api.openweathermap.org/geo/1.0/zip?zip=${zip},US&appid=${apiKey}`
    const res = await fetch(url)

    if (!res.ok) {
      if (res.status === 404) {
        return Response.json(
          { error: 'Zip code not found. Please enter a valid US zip code.' },
          { status: 404 }
        )
      }
      const body = await res.json().catch(() => ({}))
      return Response.json(
        { error: body.message || `Geocoding error (${res.status})` },
        { status: res.status }
      )
    }

    const data = await res.json()
    return Response.json({
      lat: data.lat,
      lon: data.lon,
      city: data.name || data.local_names?.en || 'Unknown',
      state: data.state || '',
    })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
