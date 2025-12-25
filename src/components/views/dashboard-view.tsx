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
      case 'completed': return 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
      case 'reviewing': return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
      case 'filming': return 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
      case 'failed': return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
      case 'paid': return 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
      default: return 'bg-muted text-muted-foreground border border-border'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.email?.split('@')[0]}
          </p>
        </div>
        <button
          onClick={onNewProject}
          className="inline-flex items-center px-4 py-2 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
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
          className="bg-card p-6 rounded-3xl border border-border shadow-lg hover:shadow-xl transition-all hover:border-primary-200 dark:hover:border-primary-800"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary-100 dark:bg-primary-900 text-primary-600 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-3xl font-bold text-card-foreground">{projects.length}</span>
          </div>
          <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card p-6 rounded-3xl border border-border shadow-lg hover:shadow-xl transition-all hover:border-primary-200 dark:hover:border-primary-800"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900 text-emerald-600 rounded-xl">
              <CheckCircle className="w-6 h-6" />
            </div>
            <span className="text-3xl font-bold text-card-foreground">
              {projects.filter(p => p.status === 'completed').length}
            </span>
          </div>
          <p className="text-sm font-medium text-muted-foreground">Completed</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card p-6 rounded-3xl border border-border shadow-lg hover:shadow-xl transition-all hover:border-primary-200 dark:hover:border-primary-800"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 text-purple-600 rounded-xl">
              <Video className="w-6 h-6" />
            </div>
            <span className="text-3xl font-bold text-card-foreground">
              {projects.filter(p => p.package !== 'starter' && p.status === 'completed').length}
            </span>
          </div>
          <p className="text-sm font-medium text-muted-foreground">Videos Created</p>
        </motion.div>
      </div>

      {/* Projects Grid */}
      <div>
        <h2 className="text-lg font-semibold text-card-foreground mb-6">Recent Projects</h2>

        {projects.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-3xl border border-border border-dashed">
            <div className="mb-4">
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto text-muted-foreground">
                <Play className="w-8 h-8 ml-1" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-card-foreground mb-1">No projects yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Start your first project to transform your property photos with AI.
            </p>
            <button
              onClick={onNewProject}
              className="inline-flex items-center px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors font-bold shadow-lg"
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
                className="group relative bg-card rounded-3xl p-6 border border-border hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(project.status)}`}>
                    {project.status}
                  </div>
                  <button
                    onClick={(e) => deleteProject(e, project.id, project.name)}
                    className="text-muted-foreground hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-xl font-bold text-card-foreground mb-2 group-hover:text-primary-600 transition-colors line-clamp-1">
                  {project.name}
                </h3>

                <div className="flex items-center text-muted-foreground text-sm mb-6">
                  <MapPin className="w-4 h-4 mr-1.5" />
                  <span className="truncate">{project.address || 'No address added'}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
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
