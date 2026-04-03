export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat') || '37.3688'
    const lon = searchParams.get('lon') || '-122.0363'

    const url =
      'https://api.open-meteo.com/v1/forecast' +
      `?latitude=${lat}&longitude=${lon}` +
      '&daily=temperature_2m_max,temperature_2m_min,weathercode' +
      '&current=temperature_2m' +
      '&temperature_unit=fahrenheit' +
      '&forecast_days=10' +
      '&timezone=auto'

    const res = await fetch(url)

    if (!res.ok) {
      return Response.json(
        { error: `Open-Meteo error (${res.status})` },
        { status: res.status }
      )
    }

    const data = await res.json()
    return Response.json(data)
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
