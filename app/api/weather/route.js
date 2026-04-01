export const dynamic = 'force-dynamic'

export async function GET(request) {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat') || '37.3688'
  const lon = searchParams.get('lon') || '-122.0363'

  if (!apiKey) {
    return Response.json(
      { error: 'OPENWEATHERMAP_API_KEY is not set. Copy .env.local.example to .env.local and add your key.' },
      { status: 500 }
    )
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial&cnt=40`
    const res = await fetch(url, { next: { revalidate: 1800 } })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      return Response.json(
        { error: body.message || `OpenWeatherMap error (${res.status})` },
        { status: res.status }
      )
    }

    const data = await res.json()
    return Response.json(data)
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
