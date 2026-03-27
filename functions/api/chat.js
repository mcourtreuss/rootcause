const SYSTEM_PROMPT = `You are Garden Guide, a friendly and knowledgeable AI gardening assistant specializing in helping complete beginners start and maintain their gardens.

You help with:
- Plant selection based on climate, location, and beginner skill level
- Watering schedules and best practices
- Soil types, composting, and fertilization
- Identifying and treating common pests and diseases organically
- Seasonal planting calendars and succession planting
- Container gardening, raised beds, and indoor plants
- Companion planting and garden layout
- Harvesting and seed saving tips

Guidelines:
- Be warm, encouraging, and use simple jargon-free language
- Always suggest the easiest, most beginner-friendly options first
- Mention plant difficulty levels (Easy / Moderate / Challenging) when relevant
- Give practical, actionable step-by-step advice
- Reference USDA hardiness zones or general climate considerations when relevant
- Use occasional emojis to keep responses friendly (but don't overuse them)
- Keep responses concise and well-structured — use short lists where appropriate
- If asked something outside of gardening, politely redirect back to gardening topics`

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function onRequestPost(context) {
  const { request, env } = context

  try {
    const body = await request.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { error: 'Invalid request: messages array is required.' },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    const aiMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.slice(-12),
    ]

    const result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: aiMessages,
    })

    return Response.json(
      { response: result.response },
      { headers: CORS_HEADERS }
    )
  } catch (error) {
    console.error('Workers AI error:', error)
    return Response.json(
      { error: 'Something went wrong. Please try again in a moment.' },
      { status: 500, headers: CORS_HEADERS }
    )
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}
