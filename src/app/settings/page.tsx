'use client'

import { AppShell } from '@/components/layout/app-shell'
import { EditableText } from '@/components/ui/editable-text'
import { User, CreditCard, Bell, Shield } from 'lucide-react'

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
            Settings
          </h1>
          <p className="text-zinc-400">
            Manage your account, subscription, and preferences.
          </p>
        </div>

        <div className="grid gap-6">
          {/* Profile Section */}
          <div className="bg-[#111] p-6 rounded-2xl border border-white/5 shadow-sm">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg mr-4">
                <User className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold text-white">Profile</h2>
            </div>
            
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Full Name</label>
                <div className="p-3 bg-black border border-white/10 rounded-xl text-white">
                  John Doe
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Email Address</label>
                <div className="p-3 bg-black border border-white/10 rounded-xl text-white">
                  john@example.com
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Section */}
          <div className="bg-[#111] p-6 rounded-2xl border border-white/5 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg mr-4">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-semibold text-white">Subscription</h2>
              </div>
              <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 text-sm font-medium rounded-full">
                Active
              </span>
            </div>
            
            <div className="p-4 bg-black border border-white/10 rounded-xl mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-white">Pro Plan</p>
                  <p className="text-sm text-zinc-500">Next billing date: Jan 1, 2026</p>
                </div>
                <button className="text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors">
                  Manage
                </button>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="bg-[#111] p-6 rounded-2xl border border-white/5 shadow-sm">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg mr-4">
                <Bell className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold text-white">Notifications</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">Email Notifications</p>
                  <p className="text-sm text-zinc-500">Receive updates about your projects</p>
                </div>
                <div className="w-11 h-6 bg-emerald-600 rounded-full relative cursor-pointer">
                  <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
