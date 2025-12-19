'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function AuthCallbackPage() {
  const [message, setMessage] = useState('Verifying your magic link...')
  const router = useRouter()

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) throw error

        if (data.session) {
          setMessage('Success! Redirecting to dashboard...')
          // Create user profile in our database
          await createUserProfile(data.session.user)
          setTimeout(() => router.push('/dashboard'), 2000)
        } else {
          setMessage('No active session found. Please try logging in again.')
          setTimeout(() => router.push('/auth/login'), 3000)
        }
      } catch (error: any) {
        console.error('Auth callback error:', error)
        setMessage('Authentication failed. Please try again.')
        setTimeout(() => router.push('/auth/login'), 3000)
      }
    }

    handleAuthCallback()
  }, [router])

  const createUserProfile = async (user: any) => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Check if user profile exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existingUser) {
      // Create user profile
      const { error } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
        })

      if (error) {
        console.error('Error creating user profile:', error)
      }

      // Create free trial project for new users
      await createFreeTrial(user.id)
    }
  }

  const createFreeTrial = async (userId: string) => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Create a free trial project
    const { error } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        name: 'Free Trial Project',
        status: 'draft',
        package: 'starter',
      })

    if (error) {
      console.error('Error creating free trial:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow text-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Authenticating...</h2>
          <p className="mt-2 text-gray-600">{message}</p>
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  )
}
