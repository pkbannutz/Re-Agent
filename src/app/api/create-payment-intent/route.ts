import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createPaymentIntent } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    // Create Supabase server client
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

    // Parse request body
    const { projectId, package: packageType } = await request.json()

    if (!projectId || !packageType) {
      return NextResponse.json({ error: 'Missing projectId or package' }, { status: 400 })
    }

    // Verify project belongs to user and is in draft status
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name, package, status')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .eq('status', 'draft')
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found or not accessible' }, { status: 404 })
    }

    // Calculate amount based on package
    const packagePrices = {
      starter: 50,
      pro: 250,
    }

    const amount = packagePrices[packageType as keyof typeof packagePrices]
    if (!amount) {
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 })
    }

    // Create payment intent
    const paymentIntent = await createPaymentIntent(amount * 100, 'eur', {
      projectId,
      userId: user.id,
      package: packageType,
    })

    // Update project status to 'paid' (this will be confirmed by webhook)
    await supabase
      .from('projects')
      .update({ status: 'paid' })
      .eq('id', projectId)

    // Log the billing attempt
    await supabase
      .from('billing_log')
      .insert({
        user_id: user.id,
        project_id: projectId,
        stripe_payment_intent_id: paymentIntent.id,
        amount: amount * 100, // in cents
        currency: 'eur',
        status: 'pending',
      })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })

  } catch (error: any) {
    console.error('Create payment intent error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
