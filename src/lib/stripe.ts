import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY!

export const stripe = new Stripe(stripeSecretKey)

// Helper function to create payment intent
export const createPaymentIntent = async (amount: number, currency: string = 'eur', metadata?: Record<string, string>) => {
  return await stripe.paymentIntents.create({
    amount,
    currency,
    metadata,
  })
}

// Helper function to create customer
export const createCustomer = async (email: string, name?: string) => {
  return await stripe.customers.create({
    email,
    name,
  })
}
