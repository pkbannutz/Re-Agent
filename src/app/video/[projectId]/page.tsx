'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { AppShell } from '@/components/layout/app-shell'
import { ArrowLeft, Download, Share2, Maximize, Minimize, AlertCircle } from 'lucide-react'

interface Project {
  id: string
  name: string
  address: string | null
  video_url: string | null
  video_status: string
  package: string
  created_at: string
}

export default function VideoDeliveryPage() {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const router = useRouter()
  const params = useParams()
  const projectId = params.projectId as string

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    getUser()
    getProject()
  }, [projectId])

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const getProject = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (projectError) {
      console.error('Error fetching project:', projectError)
      alert('Project not found or access denied')
      router.push('/dashboard')
      return
    }

    // Check if video is available
    if (!projectData.video_url || projectData.status !== 'completed') {
      alert('Video is not yet available. Please check back later.')
      router.push(`/project/${projectId}`)
      return
    }

    setProject(projectData)
    setLoading(false)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const downloadVideo = async () => {
    if (!project?.video_url) return

    try {
      // Create a link to download the video
      const link = document.createElement('a')
      link.href = project.video_url
      link.download = `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_cinematic_video.mp4`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download video')
    }
  }

  const shareVideo = async () => {
    if (!project?.video_url) return

    const shareUrl = `${window.location.origin}/shared/video/${projectId}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${project.name} - Cinematic Video`,
          text: 'Check out this stunning cinematic video created with Re-Agent!',
          url: shareUrl
        })
      } catch (error) {
        // User cancelled share
        copyToClipboard(shareUrl)
      }
    } else {
      copyToClipboard(shareUrl)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Share link copied to clipboard!')
    }).catch(() => {
      alert('Failed to copy link')
    })
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

  if (!project || !project.video_url) {
    return (
      <AppShell>
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Video Not Available</h2>
          <p className="text-zinc-400 mb-8">Your video is still being processed. Please check back later.</p>
          <Link
            href={`/project/${projectId}`}
            className="inline-flex items-center px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors"
          >
            Back to Project
          </Link>
        </div>
      </AppShell>
    )
  }

  const content = (
    <div className={`relative ${isFullscreen ? 'h-screen fixed inset-0 z-50 bg-black' : 'max-w-5xl mx-auto'}`}>
      <div className={`relative bg-black rounded-2xl overflow-hidden shadow-2xl ${isFullscreen ? 'h-full rounded-none' : 'aspect-video'}`}>
        {/* Video Element */}
        <video
          src={project.video_url}
          controls={!isFullscreen}
          autoPlay={false}
          className="w-full h-full object-contain"
          poster="/video-poster.jpg"
        >
          Your browser does not support the video tag.
        </video>

        {/* Overlay Controls */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300">
          {/* Top Controls */}
          <div className="absolute top-6 left-6 right-6 flex justify-between items-center pointer-events-auto">
            <div className="text-white">
              <h2 className="text-xl font-bold tracking-tight">{project.name}</h2>
              <p className="text-sm text-gray-300 font-medium">Cinematic Video</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={shareVideo}
                className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all hover:scale-105"
                title="Share Video"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={downloadVideo}
                className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all hover:scale-105"
                title="Download Video"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all hover:scale-105"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Bottom Info */}
          <div className="absolute bottom-6 left-6 right-6 pointer-events-auto">
            <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between text-white text-sm">
                <div>
                  <p className="font-semibold">Created with Re-Agent</p>
                  <p className="text-gray-300 text-xs mt-0.5">Professional cinematic video generation</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 bg-white/10 rounded-lg text-xs font-medium">
                    {project.package} Package
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (isFullscreen) {
    return content
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link 
            href={`/project/${projectId}`}
            className="inline-flex items-center text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Project
          </Link>
        </div>

        {content}

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={downloadVideo}
            className="flex items-center justify-center px-6 py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <Download className="w-5 h-5 mr-2" />
            Download Video
          </button>

          <button
            onClick={shareVideo}
            className="flex items-center justify-center px-6 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Share Video
          </button>
        </div>
      </div>
    </AppShell>
  )
}
