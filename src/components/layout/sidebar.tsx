'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { LayoutDashboard, Plus, Settings, LifeBuoy, LogOut } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface SidebarProps {
  onNewProject?: () => void
  onViewChange?: (view: string) => void
}

export function Sidebar({ onNewProject, onViewChange }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const mainNavItems = [
    { name: 'Dashboard', view: 'dashboard', icon: LayoutDashboard },
  ]

  const footerNavItems = [
    { name: 'Settings', view: 'settings', icon: Settings },
    { name: 'Support', view: 'support', icon: LifeBuoy },
  ]

  return (
    <div className="w-64 h-screen bg-card border-r border-border flex flex-col fixed left-0 top-0 z-50">
      {/* Brand */}
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center space-x-3 group">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <span className="text-xl font-bold text-card-foreground tracking-tight">Re-Agent</span>
        </Link>
      </div>

      {/* New Project Action */}
      <div className="px-6 mb-8">
        <button
          onClick={onNewProject}
          className="flex items-center justify-center w-full py-3 px-4 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 font-bold text-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </button>
      </div>

      {/* Main Navigation - Dashboard */}
      <nav className="px-4 mb-8">
        {mainNavItems.map((item) => {
          const isActive = pathname.includes(item.view) || (item.view === 'dashboard' && pathname === '/dashboard')
          return (
            <button
              key={item.name}
              onClick={() => onViewChange?.(item.view)}
              className={cn(
                "flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                isActive
                  ? "text-card-foreground font-medium"
                  : "text-muted-foreground hover:text-card-foreground hover:bg-muted"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-primary-100 dark:bg-primary-900 rounded-xl -z-10"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon className={cn(
                "w-5 h-5 mr-3 transition-colors",
                isActive ? "text-primary-500" : "text-muted-foreground group-hover:text-card-foreground"
              )} />
              {item.name}
            </button>
          )
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1"></div>

      {/* User / Footer */}
      <div className="p-4 border-t border-border mx-4 mb-4 space-y-1">
        {/* Footer Navigation - Settings & Support */}
        <nav className="space-y-1">
          {footerNavItems.map((item) => {
            const isActive = pathname.includes(item.view) || (item.view === 'dashboard' && pathname === '/dashboard')
            return (
              <button
                key={item.name}
                onClick={() => onViewChange?.(item.view)}
                className={cn(
                  "flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                  isActive
                    ? "text-card-foreground font-medium"
                    : "text-muted-foreground hover:text-card-foreground hover:bg-muted"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-primary-100 dark:bg-primary-900 rounded-xl -z-10"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className={cn(
                  "w-5 h-5 mr-3 transition-colors",
                  isActive ? "text-primary-500" : "text-muted-foreground group-hover:text-card-foreground"
                )} />
                {item.name}
              </button>
            )
          })}
        </nav>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="flex items-center w-full px-4 py-3 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-xl transition-all duration-200 text-sm font-medium"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
