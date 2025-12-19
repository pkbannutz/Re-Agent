'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function PaymentSuccessPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (!sessionId) {
      setStatus('error')
      setMessage('No session ID found')
      return
    }

    // In a real app, you might verify the session with Stripe
    // For now, just show success and redirect
    setStatus('success')
    setMessage('Payment successful! Your images are now being processed.')

    // Redirect to dashboard after 3 seconds
    setTimeout(() => {
      router.push('/dashboard')
    }, 3000)
  }, [sessionId, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h2 className="text-2xl font-bold text-gray-900">Verifying Payment...</h2>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Payment Successful!</h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-4">
              Redirecting to dashboard in a few seconds...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Payment Error</h2>
            <p className="text-gray-600">{message}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  )
}
