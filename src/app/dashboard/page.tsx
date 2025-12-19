'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { AppShell } from '@/components/layout/app-shell'
import { EditableText } from '@/components/ui/editable-text'
import { Clock, CheckCircle, Video, Play, MapPin, MoreVertical, Trash2, Plus, Upload, X, Check, Wand2, ArrowLeft } from 'lucide-react'

interface Project {
  id: string
  name: string
  status: string
  package: string
  created_at: string
  address?: string
  video_url?: string
}

interface UserStats {
  totalProjects: number
  completedProjects: number
  videosCreated: number
  freeTrialUsed: boolean
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    getUser()
    getProjects()
  }, [])

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showNewProjectModal) {
        setShowNewProjectModal(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showNewProjectModal])

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const getProjects = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error)
    } else {
      setProjects(data || [])
    }
    setLoading(false)
  }

  const viewProject = (projectId: string) => {
    router.push(`/project/${projectId}`)
  }

  const deleteProject = async (e: React.MouseEvent, projectId: string, projectName: string) => {
    e.stopPropagation()
    if (!confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user?.id)

      if (error) throw error

      getProjects()
    } catch (error: any) {
      console.error('Delete error:', error)
      alert('Failed to delete project: ' + error.message)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
      case 'reviewing': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
      case 'filming': return 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
      case 'failed': return 'bg-red-500/10 text-red-400 border border-red-500/20'
      case 'paid': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
      default: return 'bg-zinc-800 text-zinc-400 border border-zinc-700'
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
              Dashboard
            </h1>
            <p className="text-zinc-400">
              Welcome back, {user?.email?.split('@')[0]}
            </p>
          </div>
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="inline-flex items-center px-4 py-2 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all shadow-lg shadow-white/5 hover:shadow-white/10 hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0f0f0f] p-6 rounded-3xl border border-white/10 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)] hover:border-white/20 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
              <span className="text-3xl font-bold text-white">{projects.length}</span>
            </div>
            <p className="text-sm font-medium text-zinc-500">Total Projects</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#0f0f0f] p-6 rounded-3xl border border-white/10 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)] hover:border-white/20 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <CheckCircle className="w-6 h-6" />
              </div>
              <span className="text-3xl font-bold text-white">
                {projects.filter(p => p.status === 'completed').length}
              </span>
            </div>
            <p className="text-sm font-medium text-zinc-500">Completed</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#0f0f0f] p-6 rounded-3xl border border-white/10 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)] hover:border-white/20 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
                <Video className="w-6 h-6" />
              </div>
              <span className="text-3xl font-bold text-white">
                {projects.filter(p => p.package !== 'starter' && p.status === 'completed').length}
              </span>
            </div>
            <p className="text-sm font-medium text-zinc-500">Videos Created</p>
          </motion.div>
        </div>

        {/* Projects Grid */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-6">Recent Projects</h2>
          
          {projects.length === 0 ? (
            <div className="text-center py-20 bg-[#0f0f0f] rounded-3xl border border-white/10 border-dashed">
              <div className="mb-4">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-zinc-500">
                  <Play className="w-8 h-8 ml-1" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-white mb-1">No projects yet</h3>
              <p className="text-zinc-500 mb-6 max-w-sm mx-auto">
                Start your first project to transform your property photos with AI.
              </p>
              <button
                onClick={() => setShowNewProjectModal(true)}
                className="inline-flex items-center px-6 py-3 bg-white text-black rounded-xl hover:bg-zinc-200 transition-colors font-bold shadow-lg shadow-white/5"
              >
                Create Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 + 0.4 }}
                  onClick={() => viewProject(project.id)}
                  className="group relative bg-[#0f0f0f] rounded-3xl p-6 border border-white/10 hover:border-emerald-500/30 transition-all duration-300 cursor-pointer shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)] hover:shadow-[0_8px_30px_-4px_rgba(16,185,129,0.1)]"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(project.status)}`}>
                      {project.status}
                    </div>
                    <button
                      onClick={(e) => deleteProject(e, project.id, project.name)}
                      className="text-zinc-600 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-500/10 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {project.name}
                  </h3>
                  
                  <div className="flex items-center text-zinc-500 text-sm mb-6">
                    <MapPin className="w-4 h-4 mr-1.5" />
                    <span className="truncate">{project.address || 'No address added'}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-600 pt-4 border-t border-white/5">
                    <span className="capitalize">{project.package} Package</span>
                    <span>{new Date(project.created_at).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* New Project Modal - Exact Upload Page Content */}
        <AnimatePresence>
          {showNewProjectModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowNewProjectModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-[#050505] rounded-3xl border border-white/10 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setShowNewProjectModal(false)}
                  className="absolute top-6 right-6 w-8 h-8 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Upload Page Content - Pixel Perfect */}
                <div className="p-8">
                  <div className="max-w-4xl mx-auto space-y-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <Link
                          href="/dashboard"
                          className="inline-flex items-center text-sm text-zinc-400 hover:text-white transition-colors mb-2"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Create New Project</h1>
                      </div>
                    </div>

                    <div className="grid gap-8">
                      {/* Project Details */}
                      <div className="bg-[#111] p-6 rounded-2xl border border-white/5 space-y-6">
                        <h2 className="text-xl font-semibold text-white">Project Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Project Name *</label>
                            <input
                              type="text"
                              className="w-full px-4 py-3 bg-black border border-white/10 text-white rounded-xl focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all placeholder:text-zinc-700 outline-none"
                              placeholder="e.g., Landbrook Estate"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Property Address</label>
                            <input
                              type="text"
                              className="w-full px-4 py-3 bg-black border border-white/10 text-white rounded-xl focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all placeholder:text-zinc-700 outline-none"
                              placeholder="Optional: 123 Main St, London"
                            />
                          </div>
                        </div>

                      </div>

                      {/* Package Selection */}
                      <div className="bg-[#111] p-6 rounded-2xl border border-white/5 space-y-6">
                        <h2 className="text-xl font-semibold text-white">Choose Package</h2>

                        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-emerald-400">🎁 Free Trial Available!</h3>
                            <p className="text-emerald-500/80 text-sm">Get your first Starter project completely free (€50 value)</p>
                          </div>
                          <button className="px-4 py-2 rounded-lg font-medium text-sm transition-colors bg-emerald-500 text-black shadow-lg shadow-emerald-500/20">
                            Claim Free Trial
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="relative border rounded-2xl p-6 cursor-pointer transition-all duration-200 border-primary-500 bg-primary-500/10">
                            <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                              <Check className="w-5 h-5" />
                            </div>

                            <div className="mb-4">
                              <h3 className="text-xl font-bold text-white mb-1">Starter</h3>
                              <div className="flex items-baseline">
                                <span className="text-3xl font-bold text-white">€50</span>
                                <span className="text-zinc-500 ml-1 text-sm">one-time</span>
                              </div>
                            </div>

                            <ul className="space-y-3">
                              <li className="flex items-center text-sm text-zinc-400">
                                <Check className="w-4 h-4 text-emerald-500 mr-3 flex-shrink-0" />
                                6 high-quality images
                              </li>
                              <li className="flex items-center text-sm text-zinc-400">
                                <Check className="w-4 h-4 text-emerald-500 mr-3 flex-shrink-0" />
                                AI-powered enhancement
                              </li>
                              <li className="flex items-center text-sm text-zinc-400">
                                <Check className="w-4 h-4 mr-3 flex-shrink-0 text-zinc-700" />
                                No video included
                              </li>
                            </ul>
                          </div>

                          <div className="relative border rounded-2xl p-6 cursor-pointer transition-all duration-200 border-white/5 hover:border-white/10 bg-black">
                            <div className="mb-4">
                              <h3 className="text-xl font-bold text-white mb-1">Pro</h3>
                              <div className="flex items-baseline">
                                <span className="text-3xl font-bold text-white">€250</span>
                                <span className="text-zinc-500 ml-1 text-sm">one-time</span>
                              </div>
                            </div>

                            <ul className="space-y-3">
                              <li className="flex items-center text-sm text-zinc-400">
                                <Check className="w-4 h-4 text-emerald-500 mr-3 flex-shrink-0" />
                                30 high-quality images
                              </li>
                              <li className="flex items-center text-sm text-zinc-400">
                                <Check className="w-4 h-4 text-emerald-500 mr-3 flex-shrink-0" />
                                AI-powered enhancement
                              </li>
                              <li className="flex items-center text-sm text-zinc-400">
                                <Check className="w-4 h-4 mr-3 flex-shrink-0 text-emerald-500" />
                                60-second cinematic video
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* File Upload */}
                      <div className="bg-[#111] p-6 rounded-2xl border border-white/5 space-y-6">
                        <h2 className="text-xl font-semibold text-white">
                          Upload Images <span className="text-zinc-500 font-normal ml-2">0/6</span>
                        </h2>

                        <div className="border-2 border-dashed border-white/10 rounded-2xl p-12 text-center hover:border-white/20 hover:bg-white/5 transition-all cursor-pointer group">
                          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <Upload className="w-8 h-8 text-zinc-500 group-hover:text-white transition-colors" />
                          </div>
                          <p className="text-white font-medium mb-1">
                            Drag and drop images here, or <span className="text-primary-400 cursor-pointer">browse files</span>
                          </p>
                          <p className="text-sm text-zinc-500">
                            Maximum 6 images (Starter package), 10MB each
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <button className="bg-white text-black px-8 py-4 rounded-xl font-bold hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-white/5 hover:shadow-white/10 hover:-translate-y-0.5 flex items-center">
                          Create Project
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  )
}
