'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Sidebar } from './sidebar'
import { DashboardView } from '@/components/views/dashboard-view'
import { ProjectView } from '@/components/views/project-view'
import { SettingsView } from '@/components/views/settings-view'
import { SupportView } from '@/components/views/support-view'
import { StatusView } from '@/components/views/status-view'
import { PrivacyView } from '@/components/views/privacy-view'
import { TermsView } from '@/components/views/terms-view'
import { SecurityView } from '@/components/views/security-view'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { EditableText } from '@/components/ui/editable-text'
import { Upload, X, Check, ArrowLeft } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

type ViewState = 'dashboard' |
  { type: 'project'; projectId: string } |
  'settings' | 'support' | 'status' |
  'privacy' | 'terms' | 'security'

export function AppShell({ children }: { children: React.ReactNode }) {
  // Modal and view state
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [currentView, setCurrentView] = useState<ViewState>('dashboard')

  // Upload modal state
  const [projectName, setProjectName] = useState('')
  const [address, setAddress] = useState('')
  const [globalInstructions, setGlobalInstructions] = useState('')
  const [selectedPackage, setSelectedPackage] = useState('starter')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [hasFreeTrial, setHasFreeTrial] = useState(false)
  const [isCheckingTrial, setIsCheckingTrial] = useState(true)
  const [aiDescription, setAiDescription] = useState('')
  const [generatingDescription, setGeneratingDescription] = useState(false)
  const [descriptionGenerated, setDescriptionGenerated] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<any[]>([])
  const [failedUploads, setFailedUploads] = useState<{id: string, filename: string, error: string}[]>([])
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, { progress: number; speed: number; status: 'uploading' | 'completed' | 'error' }>>({})
  const [fadingFiles, setFadingFiles] = useState<Set<string>>(new Set())
  const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'error', message: string} | null>(null)

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()

  // Package data
  const packages = {
    starter: { name: 'Starter', price: 50, images: 6, video: false },
    pro: { name: 'Pro', price: 250, images: 30, video: true },
    unlimited: { name: 'Unlimited', price: 2500, images: 30, video: true },
  }

  // Check user and trial status when modal opens
  useEffect(() => {
    if (showNewProjectModal && !user) {
      checkUserAndTrial()
    }
  }, [showNewProjectModal])

  // Reset modal state when closed
  useEffect(() => {
    if (!showNewProjectModal) {
      setProjectName('')
      setAddress('')
      setGlobalInstructions('')
      setSelectedPackage('starter')
      setUploadedImages([])
      setFailedUploads([])
      setUploadingFiles({})
      setFadingFiles(new Set())
      setStatusMessage(null)
      setAiDescription('')
      setDescriptionGenerated(false)
    }
  }, [showNewProjectModal])

  const checkUserAndTrial = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)

    if (user) {
      const { data: userData } = await supabase
        .from('users')
        .select('free_trial_used')
        .eq('id', user.id)
        .single()

      setHasFreeTrial(!userData?.free_trial_used)
    }

    setIsCheckingTrial(false)
  }

  const uploadFileWithProgress = async (file: File, index: number) => {
    const fileId = `${file.name}-${Date.now()}`

    setUploadingFiles(prev => ({
      ...prev,
      [fileId]: { progress: 0, speed: 0, status: 'uploading' as const }
    }))

    try {
      const fileName = `${projectName.replace(/[^a-zA-Z0-9]/g, '_')}_${String(uploadedImages.length + index + 1).padStart(2, '0')}.${file.name.split('.').pop()}`

      setUploadingFiles(prev => ({
        ...prev,
        [fileId]: { progress: 50, speed: 0, status: 'uploading' as const }
      }))

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(`original/${fileName}`, file, { upsert: false })

      if (uploadError) {
        if (uploadError.message?.includes('Object not found')) {
          throw new Error('Storage bucket not found. Please ensure "project-images" bucket exists in Supabase dashboard.')
        }
        if (uploadError.message?.includes('permission')) {
          throw new Error('Upload permission denied. Please check your Supabase storage policies.')
        }
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      setUploadingFiles(prev => ({
        ...prev,
        [fileId]: { progress: 75, speed: 0, status: 'uploading' as const }
      }))

      const { data: signedUrlData } = await supabase.storage
        .from('project-images')
        .createSignedUrl(`original/${fileName}`, 3600)

      setUploadedImages(prev => [...prev, {
        id: fileId,
        filename: fileName,
        url: signedUrlData?.signedUrl || ''
      }])

      setUploadingFiles(prev => ({
        ...prev,
        [fileId]: { progress: 100, speed: 0, status: 'completed' as const }
      }))

      setTimeout(() => {
        setFadingFiles(prev => new Set([...prev, fileId]))
        setTimeout(() => {
          setUploadingFiles(prev => {
            const newState = { ...prev }
            delete newState[fileId]
            return newState
          })
          setFadingFiles(prev => {
            const newSet = new Set(prev)
            newSet.delete(fileId)
            return newSet
          })
        }, 500)
      }, 2000)

    } catch (error) {
      console.error('Upload error:', error)
      setFailedUploads(prev => [...prev, {
        id: fileId,
        filename: file.name,
        error: error instanceof Error ? error.message : 'Upload failed'
      }])
      setUploadingFiles(prev => ({
        ...prev,
        [fileId]: { progress: 0, speed: 0, status: 'error' as const }
      }))
    }
  }

  const handleFileUpload = useCallback(async (files: FileList) => {
    const newFiles = Array.from(files)
    let hasErrors = false

    const validFiles = newFiles.filter(file => {
      if (!file.type.startsWith('image/')) {
        setStatusMessage({ type: 'error', message: `${file.name} is not an image file` })
        hasErrors = true
        return false
      }
      if (file.size > 10 * 1024 * 1024) {
        setStatusMessage({ type: 'error', message: `${file.name} is larger than 10MB` })
        hasErrors = true
        return false
      }
      return true
    })

    if (hasErrors) return

    const maxImages = packages[selectedPackage as keyof typeof packages]?.images || 6
    const totalFiles = uploadedImages.length + validFiles.length

    if (totalFiles > maxImages) {
      setStatusMessage({ type: 'error', message: `Maximum ${maxImages} images allowed for ${selectedPackage} package` })
      return
    }

    setStatusMessage(null)
    validFiles.forEach((file, index) => {
      uploadFileWithProgress(file, index)
    })
  }, [selectedPackage, uploadedImages.length, projectName, packages])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }, [handleFileUpload])

  const removeUploadedImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!projectName.trim()) {
      setStatusMessage({ type: 'error', message: 'Please enter a project name' })
      return
    }

    if (selectedPackage === 'free-trial') {
      if (!user) {
        setStatusMessage({ type: 'error', message: 'You must be logged in to use the free trial' })
        router.push('/auth/login')
        return
      }
      if (!hasFreeTrial) {
        setStatusMessage({ type: 'error', message: 'Free trial is not available' })
        return
      }
    }

    setLoading(true)
    setStatusMessage(null)

    try {
      const response = await fetch('/api/create-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName,
          address,
          globalInstructions,
          selectedPackage: selectedPackage === 'free-trial' ? 'starter' : selectedPackage,
          uploadedFiles: [],
          imageInstructions: {},
          isFreeTrial: selectedPackage === 'free-trial',
          aiDescription: aiDescription || null,
          preUploadedImages: uploadedImages
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create project')
      }

      if (result.success) {
        if (selectedPackage === 'free-trial') {
          await supabase
            .from('users')
            .update({ free_trial_used: true })
            .eq('id', user.id)
        }
        setStatusMessage({ type: 'success', message: 'Project created successfully!' })
        setTimeout(() => {
          setShowNewProjectModal(false)
          handleProjectSelect(result.project.id)
        }, 1000)
      } else {
        throw new Error('Project creation failed')
      }

    } catch (error: any) {
      console.error('Project creation error:', error)
      setStatusMessage({ type: 'error', message: 'Failed to create project: ' + error.message })
    } finally {
      setLoading(false)
    }
  }

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

  const handleProjectSelect = (projectId: string) => {
    setCurrentView({ type: 'project', projectId })
  }

  const handleBackToDashboard = () => {
    setCurrentView('dashboard')
  }

  const handleNewProject = () => {
    setShowNewProjectModal(true)
  }

  const handleViewChange = (view: string) => {
    setCurrentView(view as ViewState)
  }

  const renderCurrentView = () => {
    if (currentView === 'dashboard') {
      return (
        <DashboardView
          onProjectSelect={handleProjectSelect}
          onNewProject={handleNewProject}
        />
      )
    } else if (typeof currentView === 'object' && currentView.type === 'project') {
      return (
        <ProjectView
          projectId={currentView.projectId}
          onBackToDashboard={handleBackToDashboard}
          onNewProject={handleNewProject}
        />
      )
    } else if (currentView === 'settings') {
      return <SettingsView />
    } else if (currentView === 'support') {
      return <SupportView />
    } else if (currentView === 'status') {
      return <StatusView />
    } else if (currentView === 'privacy') {
      return <PrivacyView />
    } else if (currentView === 'terms') {
      return <TermsView />
    } else if (currentView === 'security') {
      return <SecurityView />
    }

    // Fallback to original children for pages like settings, etc.
    return children
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Sidebar onNewProject={handleNewProject} onViewChange={handleViewChange} />
      <main className="pl-64 min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView === 'dashboard' ? 'dashboard' :
                 (typeof currentView === 'object' && currentView.type === 'project') ? `project-${currentView.projectId}` :
                 String(currentView)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="p-8 max-w-7xl mx-auto"
          >
            {renderCurrentView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Global New Project Modal */}
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

              {/* Status Message */}
              {statusMessage && (
                <div className="mb-6 mx-8">
                  <div className={`p-4 rounded-xl border ${
                    statusMessage.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}>
                    {statusMessage.message}
                  </div>
                </div>
              )}

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
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            className="w-full px-4 py-3 bg-black border border-white/10 text-white rounded-xl focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all placeholder:text-zinc-700 outline-none"
                            placeholder="e.g., Landbrook Estate"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-2">Property Address</label>
                          <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full px-4 py-3 bg-black border border-white/10 text-white rounded-xl focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all placeholder:text-zinc-700 outline-none"
                            placeholder="Optional: 123 Main St, London"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Package Selection */}
                    <div className="bg-[#111] p-6 rounded-2xl border border-white/5 space-y-6">
                      <h2 className="text-xl font-semibold text-white">Choose Package</h2>

                      {hasFreeTrial && !isCheckingTrial && (
                        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-emerald-400">🎁 Free Trial Available!</h3>
                            <p className="text-emerald-500/80 text-sm">Get your first Starter project completely free (€50 value)</p>
                          </div>
                          <button
                            onClick={() => setSelectedPackage('free-trial')}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                              selectedPackage === 'free-trial'
                                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                                : 'bg-white/5 text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20'
                            }`}
                          >
                            Claim Free Trial
                          </button>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div
                          onClick={() => setSelectedPackage('starter')}
                          className={`relative border rounded-2xl p-6 cursor-pointer transition-all duration-200 ${
                            selectedPackage === 'starter'
                              ? 'border-primary-500 bg-primary-500/10'
                              : 'border-white/5 hover:border-white/10 bg-black'
                          }`}
                        >
                          {selectedPackage === 'starter' && (
                            <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                              <Check className="w-5 h-5" />
                            </div>
                          )}

                          <div className="mb-4">
                            <h3 className="text-xl font-bold text-white mb-1">Starter</h3>
                            <div className="flex items-baseline">
                              <span className="text-3xl font-bold text-white">€50</span>
                              <span className="text-zinc-500 ml-1 text-sm">one-time</span>
                            </div>
                          </div>

                          <ul className="space-y-3 mb-6">
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

                          <button className="w-full py-3 bg-white text-black rounded-xl text-center font-bold hover:bg-zinc-200 transition-colors shadow-lg shadow-white/5">
                            Try for Free Today
                          </button>
                        </div>

                        <div
                          onClick={() => setSelectedPackage('pro')}
                          className={`relative border rounded-2xl p-6 cursor-pointer transition-all duration-200 ${
                            selectedPackage === 'pro'
                              ? 'border-primary-500 bg-primary-500/10'
                              : 'border-white/5 hover:border-white/10 bg-black'
                          }`}
                        >
                          {selectedPackage === 'pro' && (
                            <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                              <Check className="w-5 h-5" />
                            </div>
                          )}

                          <div className="mb-4">
                            <h3 className="text-xl font-bold text-white mb-1">Pro</h3>
                            <div className="flex items-baseline">
                              <span className="text-3xl font-bold text-white">€250</span>
                              <span className="text-zinc-500 ml-1 text-sm">one-time</span>
                            </div>
                          </div>

                          <ul className="space-y-3 mb-6">
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

                          <button className="w-full py-3 bg-white text-black rounded-xl text-center font-bold hover:bg-zinc-200 transition-colors shadow-lg shadow-white/5">
                            Get Started
                          </button>
                        </div>

                        <div
                          onClick={() => setSelectedPackage('unlimited')}
                          className={`relative border rounded-2xl p-6 cursor-pointer transition-all duration-200 ${
                            selectedPackage === 'unlimited'
                              ? 'border-primary-500 bg-primary-500/10'
                              : 'border-white/5 hover:border-white/10 bg-gradient-to-br from-emerald-500/10 to-teal-500/10'
                          }`}
                        >
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-black px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg shadow-emerald-500/20">
                            Most Popular
                          </div>

                          {selectedPackage === 'unlimited' && (
                            <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                              <Check className="w-5 h-5" />
                            </div>
                          )}

                          <div className="mb-4">
                            <h3 className="text-xl font-bold text-white mb-1">Unlimited</h3>
                            <div className="flex items-baseline">
                              <span className="text-3xl font-bold text-white">€2,500</span>
                              <span className="text-zinc-500 ml-1 text-sm">per year</span>
                            </div>
                          </div>

                          <ul className="space-y-3 mb-4">
                            <li className="flex items-center text-sm text-zinc-400">
                              <Check className="w-4 h-4 text-emerald-500 mr-3 flex-shrink-0" />
                              30 projects per year
                            </li>
                            <li className="flex items-center text-sm text-zinc-400">
                              <Check className="w-4 h-4 text-emerald-500 mr-3 flex-shrink-0" />
                              Priority support
                            </li>
                            <li className="flex items-center text-sm text-zinc-400">
                              <Check className="w-4 h-4 text-emerald-500 mr-3 flex-shrink-0" />
                              Custom branding
                            </li>
                          </ul>

                          <p className="text-xs text-zinc-400 mb-4">
                            Additional properties: $70 per package (30 images + video)
                          </p>

                          <button className="w-full py-3 bg-white text-black rounded-xl text-center font-bold hover:bg-zinc-200 transition-colors shadow-lg shadow-white/5">
                            Get Started
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* File Upload */}
                    <div className="bg-[#111] p-6 rounded-2xl border border-white/5 space-y-6">
                      <h2 className="text-xl font-semibold text-white">
                        Upload Images <span className="text-zinc-500 font-normal ml-2">{uploadedImages.length}/{packages[selectedPackage as keyof typeof packages]?.images || 6}</span>
                      </h2>

                      {/* Uploaded Images Preview */}
                      {uploadedImages.length > 0 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-white">Uploaded Images ({uploadedImages.length})</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {uploadedImages.map((image, index) => (
                              <div key={image.id} className="relative group max-w-sm">
                                <div className="bg-black rounded-xl overflow-hidden border border-white/10">
                                  <img
                                    src={image.url}
                                    alt={`Uploaded image ${index + 1}`}
                                    className="w-full h-auto max-h-64 object-contain"
                                  />
                                </div>
                                <button
                                  onClick={() => removeUploadedImage(index)}
                                  className="absolute top-2 right-2 w-6 h-6 bg-red-500/20 backdrop-blur-md rounded-full flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* Create Project Button - Only shown after images are uploaded */}
                          <div className="flex justify-center pt-4">
                            <button
                              onClick={handleSubmit}
                              disabled={loading || !projectName.trim()}
                              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-bold hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {loading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />}
                              {loading ? 'Creating Project...' : 'Create Project & Generate Images'}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Upload Progress */}
                      {Object.keys(uploadingFiles).length > 0 && (
                        <div className="bg-[#111] p-4 rounded-xl border border-white/5 space-y-3">
                          <h3 className="text-sm font-semibold text-white">Uploading Images</h3>
                          <div className="space-y-3">
                            {Object.entries(uploadingFiles).map(([fileId, uploadState]) => {
                              const fileName = fileId.split('-')[0]
                              const isFading = fadingFiles.has(fileId)
                              return (
                                <div
                                  key={fileId}
                                  className={`space-y-2 transition-opacity duration-500 ease-out ${
                                    isFading ? 'opacity-0' : 'opacity-100'
                                  }`}
                                >
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-white truncate max-w-[200px]">{fileName}</span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                      uploadState.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                                      uploadState.status === 'error' ? 'bg-red-500/20 text-red-400' :
                                      'bg-primary-500/20 text-primary-400'
                                    }`}>
                                      {uploadState.status === 'completed' ? 'Complete' :
                                       uploadState.status === 'error' ? 'Failed' :
                                       `${uploadState.progress}%`}
                                    </span>
                                  </div>
                                  <div className="w-full bg-black rounded-full h-2 overflow-hidden">
                                    <div
                                      className={`h-full transition-all duration-300 ease-out ${
                                        uploadState.status === 'completed' ? 'bg-emerald-500' :
                                        uploadState.status === 'error' ? 'bg-red-500' :
                                        'bg-primary-500'
                                      }`}
                                      style={{ width: `${uploadState.progress}%` }}
                                    />
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Failed Uploads */}
                      {failedUploads.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="text-sm font-semibold text-red-400">Failed Uploads ({failedUploads.length})</h3>
                          <div className="grid grid-cols-1 gap-3">
                            {failedUploads.map((failed, index) => (
                              <div key={failed.id} className="relative p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-red-400 truncate">{failed.filename}</p>
                                    <p className="text-xs text-red-300/80 mt-1">{failed.error}</p>
                                  </div>
                                  <button
                                    onClick={() => setFailedUploads(prev => prev.filter((_, i) => i !== index))}
                                    className="ml-2 text-red-400 hover:text-red-300 transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-white/10 rounded-2xl p-12 text-center hover:border-white/20 hover:bg-white/5 transition-all cursor-pointer group"
                      >
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                          <Upload className="w-8 h-8 text-zinc-500 group-hover:text-white transition-colors" />
                        </div>
                        <p className="text-white font-medium mb-1">
                          Drag and drop images here, or <span className="text-primary-400 cursor-pointer">browse files</span>
                        </p>
                        <p className="text-sm text-zinc-500">
                          {selectedPackage === 'unlimited'
                            ? 'Maximum 30 images - Per Property'
                            : `Maximum ${packages[selectedPackage as keyof typeof packages]?.images || 6} images (${packages[selectedPackage as keyof typeof packages]?.name || 'Starter'} package), 10MB each`
                          }
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                          className="hidden"
                        />
                      </div>
                    </div>

                    {/* Create Project Button - Always visible at bottom */}
                    <div className="flex justify-end pt-4">
                      <button
                        onClick={handleSubmit}
                        disabled={loading || !projectName.trim()}
                        className="bg-white text-black px-8 py-4 rounded-xl font-bold hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-white/5 hover:shadow-white/10 hover:-translate-y-0.5 flex items-center"
                      >
                        {loading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent mr-2" />}
                        {loading ? 'Creating Project...' : 'Create Project'}
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
  )
}
