'use client'

import { useEffect, useState, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { EditableText } from '@/components/ui/editable-text'
import { Clock, CheckCircle, Video, Play, MapPin, MoreVertical, Trash2, Plus } from 'lucide-react'

interface Project {
  id: string
  name: string
  status: string
  package: string
  created_at: string
  address?: string
  video_url?: string
}

interface DashboardViewProps {
  onProjectSelect: (projectId: string) => void
  onNewProject: () => void
}

export function DashboardView({ onProjectSelect, onNewProject }: DashboardViewProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    getUser()
    getProjects()
  }, [])

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
    onProjectSelect(projectId)
  }

  const deleteProject = async (e: React.MouseEvent, projectId: string, projectName: string) => {
    e.stopPropagation()

    // Use the use-two-step-delete hook for better UX
    const shouldDelete = await new Promise<boolean>((resolve) => {
      const confirmed = confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)
      resolve(confirmed)
    })

    if (!shouldDelete) return

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
      // For now, keep alert but could be improved with toast notification
      alert('Failed to delete project: ' + error.message)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
      case 'reviewing': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
      case 'filming': return 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
      case 'failed': return 'bg-red-500/10 text-red-400 border border-red-500/20'
      case 'paid': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
      default: return 'bg-zinc-800 text-zinc-400 border border-zinc-700'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
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
          onClick={onNewProject}
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
              onClick={onNewProject}
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
    </div>
  )
}
