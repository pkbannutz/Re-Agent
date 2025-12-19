'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      setMessage('Check your email for the magic link! Your account will be created automatically.')
    } catch (error: any) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 relative overflow-hidden bg-fade-to-black">
      {/* Background Gradients */}
      <div className="absolute top-0 right-1/2 translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] -z-10 opacity-50" />

      <Link
        href="/"
        className="absolute top-8 left-8 flex items-center space-x-2 text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to home</span>
      </Link>

      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Re-Agent</span>
          </Link>
        </div>

        <div className="bg-[#0a0a0a] rounded-3xl border border-white/10 p-8 shadow-2xl hover:border-emerald-500/30 transition-colors">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Get started
            </h2>
            <p className="text-zinc-400">
              Create your account and start transforming property photos with AI
            </p>
          </div>

          {/* Free trial highlight */}
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-emerald-300 font-semibold">Free trial included: 6 professional images</span>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSignup}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-zinc-700"
                placeholder="Enter your email address"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-3 px-6 rounded-xl font-bold hover:bg-zinc-200 transition-all shadow-lg shadow-white/5 hover:shadow-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent mr-2"></div>
                  Creating account...
                </div>
              ) : (
                'Create Account & Start Free Trial'
              )}
            </button>

            {message && (
              <div className={`p-4 rounded-xl text-center text-sm font-medium border ${
                message.includes('Check')
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>
                {message}
              </div>
            )}
          </form>

          <div className="mt-8 text-center">
            <p className="text-zinc-500">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="text-white hover:text-emerald-400 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center text-zinc-600 text-sm">
          <p>By creating an account, you agree to our{' '}
            <Link href="/legal/terms" className="text-zinc-400 hover:text-white transition-colors">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/legal/privacy" className="text-zinc-400 hover:text-white transition-colors">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
