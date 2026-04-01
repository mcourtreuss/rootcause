export const dynamic = 'force-dynamic'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const zip = searchParams.get('zip')

  if (!zip) {
    return Response.json(
      { error: 'Zip code is required.' },
      { status: 400 }
    )
  }

  const { getZoneForZip } = await import('@/lib/frostDateLookup')
  const zoneData = getZoneForZip(zip)

  if (!zoneData) {
    return Response.json(
      { error: 'Could not determine zone for this zip code.' },
      { status: 404 }
    )
  }

  return Response.json({
    zone: zoneData.zone,
    lastFrost: zoneData.lastFrost,
    firstFrost: zoneData.firstFrost,
  })
}
