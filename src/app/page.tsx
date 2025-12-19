'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Play, Wand2, Image as ImageIcon, Video, Star } from 'lucide-react'
import { InteractiveDemo } from '@/components/ui/interactive-demo'

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          router.push('/dashboard')
        } else {
          setIsLoading(false)
        }
      } catch (error) {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden font-sans">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="text-xl font-bold tracking-tight">Re-Agent</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">Features</Link>
              <Link href="#pricing" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">Pricing</Link>
              <Link href="#how-it-works" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">How It Works</Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/auth/login" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-zinc-200 transition-all shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-fade-to-black">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -z-10 opacity-60" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-8">
              Transform Property Photos <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-emerald-400 via-emerald-600 to-emerald-950/80">
                Into Cinematic Experiences
              </span>
            </h1>
            <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Upload raw property photos and receive publication-ready visuals plus stunning cinematic videos powered by AI.
            </p>
          </motion.div>

          {/* Hero Visual - Always Visible */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20 relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8"
          >
            <InteractiveDemo />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-5xl font-bold mb-6">Pro-Grade Results</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Everything you need to market properties like a top-tier agency.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#0f0f0f] p-8 rounded-3xl border border-white/15 hover:border-emerald-500/30 transition-all hover:shadow-[0_8px_30px_-4px_rgba(16,185,129,0.1)] group text-center">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors mx-auto">
                <Wand2 className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Enhancement</h3>
              <p className="text-zinc-400 leading-relaxed">
                Automatically correct lighting, color, and composition. Turn amateur shots into professional photography instantly.
              </p>
            </div>

            <div className="bg-[#0f0f0f] p-8 rounded-3xl border border-white/15 hover:border-emerald-500/30 transition-all hover:shadow-[0_8px_30px_-4px_rgba(16,185,129,0.1)] group text-center">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors mx-auto">
                <Video className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Cinematic Video</h3>
              <p className="text-zinc-400 leading-relaxed">
                Generate smooth, slow-motion dolly videos from your still images. Complete with music and branding.
              </p>
            </div>

            <div className="bg-[#0f0f0f] p-8 rounded-3xl border border-white/15 hover:border-emerald-500/30 transition-all hover:shadow-[0_8px_30px_-4px_rgba(16,185,129,0.1)] group text-center">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors mx-auto">
                <Star className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Instant Delivery</h3>
              <p className="text-zinc-400 leading-relaxed">
                No more waiting days for edits. Get your marketing assets in minutes, ready for social media and listings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#111] to-[#0a0a0a]" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-5xl font-bold mb-6">Simple Pricing</h2>
            <p className="text-zinc-400 text-lg">Pay per project or subscribe for volume.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="bg-[#0f0f0f] p-8 rounded-3xl border border-emerald-500/20 flex flex-col hover:border-emerald-500/30 transition-colors shadow-lg shadow-black/20 text-center">
              <h3 className="text-xl font-bold text-zinc-300 mb-2">Starter</h3>
              <div className="text-4xl font-bold mb-1">€50</div>
              <p className="text-zinc-500 text-sm mb-8">One-time payment</p>

              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center justify-center text-zinc-300">
                  <Check className="w-5 h-5 text-zinc-500 mr-3" /> 6 images
                </li>
                <li className="flex items-center justify-center text-zinc-300">
                  <Check className="w-5 h-5 text-zinc-500 mr-3" /> Basic enhancement
                </li>
              </ul>

              <Link href="/auth/signup" className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-center font-bold transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5 relative overflow-hidden group">
                <span className="relative z-10">Try for Free Today</span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-300 via-teal-400 to-emerald-500 opacity-50 animate-pulse"></div>
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-[#0f0f0f] p-8 rounded-3xl border border-emerald-500/20 flex flex-col hover:border-emerald-500/30 transition-colors shadow-lg shadow-black/20 text-center">
              <h3 className="text-xl font-bold text-zinc-300 mb-2">Pro</h3>
              <div className="text-4xl font-bold mb-1">€250</div>
              <p className="text-zinc-500 text-sm mb-8">One-time payment</p>

              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center justify-center text-zinc-300">
                  <Check className="w-5 h-5 text-zinc-500 mr-3" /> 30 images
                </li>
                <li className="flex items-center justify-center text-zinc-300">
                  <Check className="w-5 h-5 text-zinc-500 mr-3" /> Cinematic Video
                </li>
                <li className="flex items-center justify-center text-zinc-300">
                  <Check className="w-5 h-5 text-zinc-500 mr-3" /> Priority Processing
                </li>
              </ul>

              <Link href="/auth/signup" className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-xl text-center font-bold transition-colors border border-white/5">
                Get Started
              </Link>
            </div>

            {/* Unlimited */}
            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-8 rounded-3xl border border-emerald-500/20 flex flex-col relative shadow-[0_0_40px_-10px_rgba(16,185,129,0.25)] text-center">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-black px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg shadow-emerald-500/20">
                Most Popular
              </div>

              <h3 className="text-xl font-bold text-white mb-2">Unlimited</h3>
              <div className="text-4xl font-bold mb-1">€2,500</div>
              <p className="text-zinc-500 text-sm mb-4">Per year</p>

              <ul className="space-y-4 mb-4 flex-1">
                <li className="flex items-center justify-center text-zinc-300">
                  <Check className="w-5 h-5 text-emerald-500 mr-3" /> 30 projects / year
                </li>
                <li className="flex items-center justify-center text-zinc-300">
                  <Check className="w-5 h-5 text-emerald-500 mr-3" /> Priority Support
                </li>
                <li className="flex items-center justify-center text-zinc-300">
                  <Check className="w-5 h-5 text-emerald-500 mr-3" /> Custom Branding
                </li>
              </ul>

              <p className="text-xs text-zinc-400 mb-6">
                Additional properties: $70 per package (30 images + video)
              </p>

              <Link href="/auth/signup" className="w-full py-4 bg-white text-black rounded-xl text-center font-bold hover:bg-zinc-200 transition-colors shadow-lg shadow-white/5">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-[#020202]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-md" />
                <span className="font-bold text-lg">Re-Agent</span>
              </div>
              <p className="text-zinc-500 text-sm">
                Next-generation real estate marketing powered by artificial intelligence.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/auth/signup" className="hover:text-white transition-colors">New Project</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li><Link href="/support" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/support" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/status" className="hover:text-white transition-colors">System Status</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li><Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/legal/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/legal/security" className="hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/5 pt-8 text-center text-sm text-zinc-600">
            &copy; 2025 Re-Agent. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
