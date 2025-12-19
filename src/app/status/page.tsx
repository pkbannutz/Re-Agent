'use client'

import { AppShell } from '@/components/layout/app-shell'
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react'

export default function StatusPage() {
  const systems = [
    { name: 'API Services', status: 'operational' },
    { name: 'Image Processing Engine', status: 'operational' },
    { name: 'Video Rendering Cluster', status: 'operational' },
    { name: 'Payment Gateway', status: 'operational' },
    { name: 'Database & Storage', status: 'operational' },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return <CheckCircle className="w-5 h-5 text-emerald-500" />
      case 'degraded': return <AlertTriangle className="w-5 h-5 text-amber-500" />
      case 'down': return <XCircle className="w-5 h-5 text-red-500" />
      default: return <CheckCircle className="w-5 h-5 text-zinc-500" />
    }
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
            System Status
          </h1>
          <p className="text-zinc-400">
            Real-time status of our services and infrastructure.
          </p>
        </div>

        <div className="bg-[#111] border border-white/5 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center mb-8 bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
            <CheckCircle className="w-6 h-6 text-emerald-500 mr-3" />
            <h2 className="text-lg font-semibold text-emerald-400">All Systems Operational</h2>
          </div>

          <div className="space-y-4">
            {systems.map((system) => (
              <div key={system.name} className="flex items-center justify-between p-4 bg-black rounded-xl border border-white/5">
                <span className="font-medium text-white">{system.name}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-zinc-400 capitalize">{system.status}</span>
                  {getStatusIcon(system.status)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
