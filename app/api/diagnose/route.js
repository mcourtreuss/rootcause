import { NextResponse } from 'next/server'

export async function POST(request) {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'OpenAI API key not configured. Add OPENAI_API_KEY to .env.local' },
      { status: 500 }
    )
  }

  try {
    const { image } = await request.json()

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert plant pathologist and horticulturist. Analyze the provided plant photo and return a JSON diagnosis. Be specific, practical, and beginner-friendly.

Return ONLY valid JSON in this exact format (no markdown fences):
{
  "plantName": "identified plant species or 'Unknown'",
  "overallHealth": "Healthy" | "Mild Issues" | "Moderate Issues" | "Severe Issues" | "Critical",
  "healthScore": 1-10,
  "issues": [
    {
      "name": "issue name",
      "severity": "Low" | "Medium" | "High",
      "description": "what you observe",
      "cause": "likely cause",
      "treatment": "step-by-step treatment advice"
    }
  ],
  "positives": ["list of healthy aspects observed"],
  "careTips": ["3-5 actionable care tips specific to this plant"],
  "wateringAdvice": "specific watering recommendation",
  "sunlightAdvice": "specific sunlight recommendation"
}

If the image is not a plant, set plantName to "Not a plant" and healthScore to 0 with an appropriate message in issues.`,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please analyze this plant photo for health issues, diseases, nutrient deficiencies, pest damage, or any other problems. Provide a thorough diagnosis.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: image,
                  detail: 'high',
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      console.error('OpenAI API error:', err)
      return NextResponse.json(
        { error: err.error?.message || 'Failed to analyze image' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 })
    }

    // Parse the JSON response, stripping any markdown fences if present
    const cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    const diagnosis = JSON.parse(cleaned)

    return NextResponse.json(diagnosis)
  } catch (err) {
    console.error('Diagnosis error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to process diagnosis' },
      { status: 500 }
    )
  }
}
