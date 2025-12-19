import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    // Create Supabase server client
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectName, address, globalInstructions, imageCount } = await request.json()

    if (!projectName) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 })
    }

    // Generate AI description using Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `Generate a compelling real estate listing description for a property called "${projectName}"${address ? ` located at ${address}` : ''}.

Key details:
- Property name: ${projectName}
${address ? `- Address: ${address}` : ''}
${globalInstructions ? `- Style preferences: ${globalInstructions}` : ''}
- Number of images: ${imageCount || 'multiple'}

Please write a professional, engaging real estate listing description (1500-2000 characters) that would appeal to potential buyers or renters. Focus on the property's appeal, lifestyle benefits, and key selling points. Make it suitable for platforms like Rightmove, Zoopla, or similar real estate listing sites.

The description should be written in a natural, professional tone that real estate agents would use.`

    const result = await model.generateContent(prompt)
    const description = result.response.text()

    return NextResponse.json({
      success: true,
      description: description.trim()
    })

  } catch (error: any) {
    console.error('AI Description generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate description' },
      { status: 500 }
    )
  }
}
