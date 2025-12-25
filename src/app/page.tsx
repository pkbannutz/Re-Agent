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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="text-xl font-bold text-foreground tracking-tight">Re-Agent</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">Features</Link>
              <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">Pricing</Link>
              <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">How It Works</Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/auth/login" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary-600 transition-all shadow-lg hover:shadow-xl"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-muted/30">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary-500/5 rounded-full blur-[120px] -z-10" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-8 text-foreground">
              Transform Property Photos <br />
              <span className="text-primary-600">
                Into Cinematic Experiences
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
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
      <section id="features" className="py-32 bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-5xl font-bold mb-6 text-foreground">Pro-Grade Results</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to market properties like a top-tier agency.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-3xl border border-border hover:border-primary-200 dark:hover:border-primary-800 transition-all hover:shadow-lg group text-center">
              <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-200 dark:group-hover:bg-primary-800 transition-colors mx-auto">
                <Wand2 className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-card-foreground">AI Enhancement</h3>
              <p className="text-muted-foreground leading-relaxed">
                Automatically correct lighting, color, and composition. Turn amateur shots into professional photography instantly.
              </p>
            </div>

            <div className="bg-card p-8 rounded-3xl border border-border hover:border-primary-200 dark:hover:border-primary-800 transition-all hover:shadow-lg group text-center">
              <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-200 dark:group-hover:bg-primary-800 transition-colors mx-auto">
                <Video className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-card-foreground">Cinematic Video</h3>
              <p className="text-muted-foreground leading-relaxed">
                Generate smooth, slow-motion dolly videos from your still images. Complete with music and branding.
              </p>
            </div>

            <div className="bg-card p-8 rounded-3xl border border-border hover:border-primary-200 dark:hover:border-primary-800 transition-all hover:shadow-lg group text-center">
              <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-200 dark:group-hover:bg-primary-800 transition-colors mx-auto">
                <Star className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-card-foreground">Instant Delivery</h3>
              <p className="text-muted-foreground leading-relaxed">
                No more waiting days for edits. Get your marketing assets in minutes, ready for social media and listings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 relative overflow-hidden bg-muted/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-5xl font-bold mb-6 text-foreground">Simple Pricing</h2>
            <p className="text-muted-foreground text-lg">Pay per project or subscribe for volume.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="bg-card p-8 rounded-3xl border border-primary-200 dark:border-primary-800 flex flex-col hover:border-primary-300 dark:hover:border-primary-700 transition-colors shadow-lg text-center">
              <h3 className="text-xl font-bold text-card-foreground mb-2">Starter</h3>
              <div className="text-4xl font-bold mb-1 text-card-foreground">€50</div>
              <p className="text-muted-foreground text-sm mb-8">One-time payment</p>

              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center justify-center text-card-foreground">
                  <Check className="w-5 h-5 text-primary-500 mr-3" /> 6 images
                </li>
                <li className="flex items-center justify-center text-card-foreground">
                  <Check className="w-5 h-5 text-primary-500 mr-3" /> Basic enhancement
                </li>
              </ul>

              <Link href="/auth/signup" className="w-full py-4 bg-primary-500 text-white rounded-xl text-center font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                Try for Free Today
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-card p-8 rounded-3xl border border-primary-200 dark:border-primary-800 flex flex-col hover:border-primary-300 dark:hover:border-primary-700 transition-colors shadow-lg text-center">
              <h3 className="text-xl font-bold text-card-foreground mb-2">Pro</h3>
              <div className="text-4xl font-bold mb-1 text-card-foreground">€250</div>
              <p className="text-muted-foreground text-sm mb-8">One-time payment</p>

              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center justify-center text-card-foreground">
                  <Check className="w-5 h-5 text-primary-500 mr-3" /> 30 images
                </li>
                <li className="flex items-center justify-center text-card-foreground">
                  <Check className="w-5 h-5 text-primary-500 mr-3" /> Cinematic Video
                </li>
                <li className="flex items-center justify-center text-card-foreground">
                  <Check className="w-5 h-5 text-primary-500 mr-3" /> Priority Processing
                </li>
              </ul>

              <Link href="/auth/signup" className="w-full py-4 bg-muted hover:bg-muted/80 rounded-xl text-center font-bold transition-colors border border-border text-card-foreground">
                Get Started
              </Link>
            </div>

            {/* Unlimited */}
            <div className="bg-card p-8 rounded-3xl border border-primary-500 flex flex-col relative shadow-lg text-center">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg">
                Most Popular
              </div>

              <h3 className="text-xl font-bold text-card-foreground mb-2">Unlimited</h3>
              <div className="text-4xl font-bold mb-1 text-card-foreground">€2,500</div>
              <p className="text-muted-foreground text-sm mb-4">Per year</p>

              <ul className="space-y-4 mb-4 flex-1">
                <li className="flex items-center justify-center text-card-foreground">
                  <Check className="w-5 h-5 text-primary-500 mr-3" /> 30 projects / year
                </li>
                <li className="flex items-center justify-center text-card-foreground">
                  <Check className="w-5 h-5 text-primary-500 mr-3" /> Priority Support
                </li>
                <li className="flex items-center justify-center text-card-foreground">
                  <Check className="w-5 h-5 text-primary-500 mr-3" /> Custom Branding
                </li>
              </ul>

              <p className="text-xs text-muted-foreground mb-6">
                Additional properties: $70 per package (30 images + video)
              </p>

              <Link href="/auth/signup" className="w-full py-4 bg-card text-card-foreground rounded-xl text-center font-bold hover:bg-muted transition-colors shadow-lg border border-border">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-primary-500 rounded-md" />
                <span className="font-bold text-lg text-card-foreground">Re-Agent</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Next-generation real estate marketing powered by artificial intelligence.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-card-foreground">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-card-foreground transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-card-foreground transition-colors">Pricing</Link></li>
                <li><Link href="/auth/signup" className="hover:text-card-foreground transition-colors">New Project</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-card-foreground">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/support" className="hover:text-card-foreground transition-colors">Help Center</Link></li>
                <li><Link href="/support" className="hover:text-card-foreground transition-colors">Contact</Link></li>
                <li><Link href="/status" className="hover:text-card-foreground transition-colors">System Status</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-card-foreground">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/legal/privacy" className="hover:text-card-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="/legal/terms" className="hover:text-card-foreground transition-colors">Terms of Service</Link></li>
                <li><Link href="/legal/security" className="hover:text-card-foreground transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            &copy; 2025 Re-Agent. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
