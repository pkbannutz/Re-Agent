'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter, useParams } from 'next/navigation'

interface Project {
  id: string
  name: string
  package: string
  global_instructions: string | null
  project_images: { id: string }[]
}

const packages = {
  starter: { name: 'Starter', price: 50, images: 6, video: false },
  pro: { name: 'Pro', price: 250, images: 30, video: true },
}

export default function PaymentPage() {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [processingPayment, setProcessingPayment] = useState(false)
  const router = useRouter()
  const params = useParams()
  const projectId = params.projectId as string

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    loadProject()
  }, [projectId])

  const loadProject = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data, error } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          package,
          global_instructions,
          project_images (
            id
          )
        `)
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single()

      if (error) throw error

      setProject(data)
    } catch (error) {
      console.error('Error loading project:', error)
      alert('Project not found or access denied')
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!project) return

    setProcessingPayment(true)

    try {
      // Create checkout session via API route
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: project.id,
          package: project.package,
        }),
      })

      const { url, error } = await response.json()

      if (error) throw new Error(error)

      // Redirect to Stripe Checkout
      window.location.href = url

    } catch (error: any) {
      console.error('Payment error:', error)
      alert('Payment failed: ' + error.message)
      setProcessingPayment(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Project not found</p>
      </div>
    )
  }

  const pkg = packages[project.package as keyof typeof packages]
  const imageCount = project.project_images?.length || 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Complete Your Payment</h1>

            {/* Project Summary */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Project Summary</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                    <p className="text-gray-600">{pkg.name} Package</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">€{pkg.price}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Images uploaded:</span>
                    <span>{imageCount}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Package includes:</span>
                    <span>Up to {pkg.images} images</span>
                  </div>
                  {pkg.video && (
                    <div className="flex justify-between text-sm mb-2">
                      <span>Video generation:</span>
                      <span>Included</span>
                    </div>
                  )}
                  {project.global_instructions && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">
                        <strong>Instructions:</strong> {project.global_instructions}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <div className="flex justify-center">
              <button
                onClick={handlePayment}
                disabled={processingPayment}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-12 py-4 rounded-md text-lg font-medium disabled:cursor-not-allowed flex items-center"
              >
                {processingPayment ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Processing...
                  </>
                ) : (
                  `Pay €${pkg.price} & Start Processing`
                )}
              </button>
            </div>

            <div className="mt-6 text-center text-sm text-gray-600">
              <p>Secure payment powered by Stripe</p>
              <p className="mt-1">Your images will be processed automatically after payment</p>
            </div>

            {/* Back Button */}
            <div className="mt-8 text-center">
              <button
                onClick={() => router.back()}
                className="text-blue-600 hover:text-blue-500 text-sm"
              >
                ← Back to project
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
