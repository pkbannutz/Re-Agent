import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

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

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `${packageType.charAt(0).toUpperCase() + packageType.slice(1)} Package - ${project.name}`,
              description: `AI image processing for ${packageType} package`,
            },
            unit_amount: amount * 100, // in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/payment/${projectId}`,
      metadata: {
        projectId,
        userId: user.id,
        package: packageType,
      },
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
        stripe_payment_intent_id: session.id, // Using session id for now
        amount: amount * 100, // in cents
        currency: 'eur',
        status: 'pending',
      })

    return NextResponse.json({
      url: session.url,
    })

  } catch (error: any) {
    console.error('Create checkout session error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
