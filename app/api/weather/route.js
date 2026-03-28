export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export async function GET() {
  try {
    const url =
      'https://api.open-meteo.com/v1/forecast' +
      '?latitude=37.3688&longitude=-122.0363' +
      '&daily=temperature_2m_max,temperature_2m_min,weathercode' +
      '&current=temperature_2m' +
      '&temperature_unit=fahrenheit' +
      '&forecast_days=10' +
      '&timezone=America%2FLos_Angeles'

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
