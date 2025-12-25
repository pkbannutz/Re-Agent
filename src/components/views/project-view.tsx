'use client'

import { useEffect, useState, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { AppShell } from '@/components/layout/app-shell'
import { EditableText } from '@/components/ui/editable-text'
import { DeleteButton } from '@/components/ui/delete-button'
import { ArrowLeft, Trash2, Download, Video, MapPin, Grid, List, Wand2, Upload, X, Check } from 'lucide-react'

interface Image {
  id: string
  original_filename: string
  processed_url: string | null
  aspect_ratio: string | null
  attempt_number: number
  processing_status: string
  tweak_history: string[]
}

interface Project {
  id: string
  name: string
  address: string | null
  global_instructions: string | null
  status: string
  package: string
  created_at: string
  ai_description?: string
  video_url?: string
  video_status?: string
  selected_images?: any[]
  processing_progress?: number
  owner_name?: string | null
  phone?: string | null
  project_images: Image[]
}

interface ProjectViewProps {
  projectId: string
  onBackToDashboard: () => void
  onNewProject: () => void
}

export function ProjectView({ projectId, onBackToDashboard, onNewProject }: ProjectViewProps) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({})
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [tweakingImage, setTweakingImage] = useState<string | null>(null)
  const [tweakInstruction, setTweakInstruction] = useState('')
  const [generatingTweak, setGeneratingTweak] = useState(false)
  const [showVideoConfirm, setShowVideoConfirm] = useState(false)
  const [generatingVideo, setGeneratingVideo] = useState(false)
  const [fullSizeImage, setFullSizeImage] = useState<string | null>(null)
  const [modalTweakInstruction, setModalTweakInstruction] = useState('')
  const [modalTweakingImage, setModalTweakingImage] = useState<string | null>(null)
  const [generatingModalTweak, setGeneratingModalTweak] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, { progress: number; speed: number; status: 'uploading' | 'completed' | 'error' }>>({})
  const [fadingFiles, setFadingFiles] = useState<Set<string>>(new Set())
  const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'error', message: string} | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [uploadErrors, setUploadErrors] = useState<string[]>([])
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    getUser()
    getProject()

    const projectSubscription = supabase
      .channel(`project_${projectId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'projects',
        filter: `id=eq.${projectId}`
      }, (payload) => {
        setProject(prev => prev ? { ...prev, ...payload.new } : null)
      })
      .subscribe()

    const imagesSubscription = supabase
      .channel(`project_images_${projectId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'project_images',
        filter: `project_id=eq.${projectId}`
      }, (payload) => {
        setProject(prev => {
          if (!prev) return prev
          const updatedImages = prev.project_images.map(img =>
            img.id === payload.new.id ? { ...img, ...payload.new } : img
          )
          return { ...prev, project_images: updatedImages }
        })
      })
      .subscribe()

    // Keyboard event listener for modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fullSizeImage) {
        closeModal()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      projectSubscription.unsubscribe()
      imagesSubscription.unsubscribe()
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [projectId, fullSizeImage])

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
      setStatusMessage({ type: 'error', message: 'Project not found or access denied' })
      setTimeout(() => onBackToDashboard(), 2000) // Give user time to see the message
      return
    }

    const { data: imagesData } = await supabase
      .from('project_images')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })

    const projectWithImages = {
      ...projectData,
      project_images: imagesData || []
    }

    setProject(projectWithImages)

    if (imagesData && imagesData.length > 0) {
      const urls: Record<string, string> = {}
      for (const image of imagesData) {
        const { data } = await supabase.storage
          .from('project-images')
          .createSignedUrl(`original/${image.original_filename}`, 3600)
        if (data?.signedUrl) {
          urls[image.id] = data.signedUrl
        }
      }
      setImageUrls(urls)
    }

    setLoading(false)
  }

  const handleUpdateProject = async (field: string, value: string) => {
    if (!project) return

    try {
      const updateData = { [field]: value }
      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', projectId)
        .eq('user_id', user.id)

      if (error) throw error

      setProject(prev => prev ? { ...prev, ...updateData } : null)
      setStatusMessage({ type: 'success', message: 'Project updated successfully!' })
    } catch (error: any) {
      console.error('Update error:', error)
      setStatusMessage({ type: 'error', message: 'Failed to update project: ' + error.message })
    }
  }

  const handleDeleteProject = () => {
    setShowDeleteConfirm(true)
  }

  const confirmDeleteProject = async () => {
    setShowDeleteConfirm(false)

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id)

      if (error) throw error

      setStatusMessage({ type: 'success', message: 'Project deleted successfully!' })
      setTimeout(() => onBackToDashboard(), 1500)
    } catch (error: any) {
      setStatusMessage({ type: 'error', message: 'Failed to delete project: ' + error.message })
    }
  }

  const handleGenerateTweak = async (imageId: string) => {
    if (!tweakInstruction.trim()) return

    const image = project?.project_images.find(img => img.id === imageId)
    if (!image || image.attempt_number >= 5) return

    // Check payment status for non-free-trial projects
    if (project?.status === 'draft' && project?.package !== 'starter') {
      router.push(`/payment/${projectId}`)
      return
    }

    setGeneratingTweak(true)

    try {
      await supabase
        .from('processing_queue')
        .insert({
          project_id: projectId,
          image_id: imageId,
          operation_type: 'tweak',
          payload: {
            instruction: tweakInstruction,
            attempt_number: image.attempt_number + 1
          }
        })

      await supabase
        .from('project_images')
        .update({
          attempt_number: image.attempt_number + 1,
          tweak_history: [...(image.tweak_history || []), tweakInstruction],
          processing_status: 'pending'
        })
        .eq('id', imageId)

      await getProject()
      setTweakingImage(null)
      setTweakInstruction('')
    } catch (error: any) {
      setStatusMessage({ type: 'error', message: 'Failed to submit tweak request: ' + error.message })
    } finally {
      setGeneratingTweak(false)
    }
  }

  const handleGenerateVideo = async () => {
    // Check payment status for non-free-trial projects
    if (project?.status === 'draft' && project?.package !== 'starter') {
      setShowVideoConfirm(false)
      router.push(`/payment/${projectId}`)
      return
    }

    setGeneratingVideo(true)
    setShowVideoConfirm(false)

    try {
      await supabase
        .from('projects')
        .update({ status: 'filming', video_status: 'processing' })
        .eq('id', projectId)

      await supabase
        .from('processing_queue')
        .insert({
          project_id: projectId,
          operation_type: 'video_generation',
          payload: {
            package: project?.package,
            image_count: project?.project_images.length,
            project_name: project?.name
          }
        })

      await getProject()
    } catch (error: any) {
      setStatusMessage({ type: 'error', message: 'Failed to start video generation: ' + error.message })
    } finally {
      setGeneratingVideo(false)
    }
  }

  const handleGenerateAllImages = async () => {
    if (!project?.project_images.length) {
      setStatusMessage({ type: 'error', message: 'No images to process' })
      return
    }

    // Check payment status for non-free-trial projects
    if (project?.status === 'draft' && project?.package !== 'starter') {
      router.push(`/payment/${projectId}`)
      return
    }

    try {
      // Submit all images for processing with global instructions
      const processingRequests = project.project_images.map(image => ({
        project_id: projectId,
        image_id: image.id,
        operation_type: 'initial_processing',
        payload: {
          global_instructions: project.global_instructions || '',
          attempt_number: image.attempt_number + 1
        }
      }))

      await supabase
        .from('processing_queue')
        .insert(processingRequests)

      // Update project status
      await supabase
        .from('projects')
        .update({ status: 'processing' })
        .eq('id', projectId)

      // Update all images to pending status
      await supabase
        .from('project_images')
        .update({ processing_status: 'pending' })
        .eq('project_id', projectId)

      setStatusMessage({ type: 'success', message: `Started processing ${project.project_images.length} images` })
      await getProject()
    } catch (error: any) {
      setStatusMessage({ type: 'error', message: 'Failed to start image generation: ' + error.message })
    }
  }

  const handleBulkDownload = async () => {
    try {
      const response = await fetch('/api/download-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      })

      if (!response.ok) throw new Error('Download failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${project?.name.replace(/[^a-zA-Z0-9]/g, '_')}_images.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error: any) {
      setStatusMessage({ type: 'error', message: 'Failed to download images: ' + error.message })
    }
  }

  const handleDeleteImage = async (imageId: string, filename: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('project-images')
        .remove([`original/${filename}`])

      if (storageError) {
        console.error('Storage deletion error:', storageError)
        // Continue with database deletion even if storage fails
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('project_images')
        .delete()
        .eq('id', imageId)
        .eq('project_id', projectId)

      if (dbError) throw dbError

      // Update local state
      setProject(prev => prev ? {
        ...prev,
        project_images: prev.project_images.filter(img => img.id !== imageId)
      } : null)

      // Remove from imageUrls
      setImageUrls(prev => {
        const newUrls = { ...prev }
        delete newUrls[imageId]
        return newUrls
      })

    } catch (error: any) {
      console.error('Delete error:', error)
      setStatusMessage({ type: 'error', message: 'Failed to delete image: ' + error.message })
    }
  }

  const getPackageImageLimit = (packageType: string) => {
    const limits = { starter: 6, pro: 30, unlimited: 30 }
    return limits[packageType as keyof typeof limits] || 6
  }

  const getPackageDisplayName = (packageType: string) => {
    const names = { starter: 'Starter', pro: 'Pro', unlimited: 'Unlimited' }
    return names[packageType as keyof typeof names] || 'Starter'
  }

  const uploadFileWithProgress = async (file: File, index: number) => {
    const fileId = `${file.name}-${Date.now()}`

    // Initialize progress state - show as uploading immediately
    setUploadingFiles(prev => ({
      ...prev,
      [fileId]: { progress: 0, speed: 0, status: 'uploading' as const }
    }))

    try {
      // Get existing image count for filename numbering
      const { data: existingImages } = await supabase
        .from('project_images')
        .select('id')
        .eq('project_id', projectId)

      const existingImageCount = existingImages?.length || 0
      const sequenceNumber = existingImageCount + index + 1
      const fileName = `${project?.name.replace(/[^a-zA-Z0-9]/g, '_')}_${String(sequenceNumber).padStart(2, '0')}.${file.name.split('.').pop()}`

      console.log(`Starting direct upload for ${fileName}`)

      // Update progress to 50% - starting upload
      setUploadingFiles(prev => ({
        ...prev,
        [fileId]: { progress: 50, speed: 0, status: 'uploading' as const }
      }))

      // Direct upload to Supabase Storage (works with INSERT policy)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(`original/${fileName}`, file, {
          upsert: false
        })

      if (uploadError) {
        console.error('Direct upload error:', uploadError)

        // Provide helpful error messages
        if (uploadError.message?.includes('Object not found')) {
          throw new Error('Storage bucket not found. Please ensure "project-images" bucket exists in Supabase dashboard.')
        }
        if (uploadError.message?.includes('permission')) {
          throw new Error('Upload permission denied. Please check your Supabase storage policies.')
        }

        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      console.log('Direct upload successful:', uploadData)

      // Update progress to 75% - upload complete, creating database record
      setUploadingFiles(prev => ({
        ...prev,
        [fileId]: { progress: 75, speed: 0, status: 'uploading' as const }
      }))

      // Create project_images record
      const { data: imageRecord, error: imageError } = await supabase
        .from('project_images')
        .insert({
          project_id: projectId,
          original_filename: fileName,
          attempt_number: 1,
          tweak_history: ['']
        })
        .select()
        .single()

      if (imageError) {
        console.error('Database record creation error:', imageError)
        throw new Error('Failed to create database record')
      }

      // Update progress to completed
      setUploadingFiles(prev => ({
        ...prev,
        [fileId]: { progress: 100, speed: 0, status: 'completed' as const }
      }))

      // Mark for fade out after a delay
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
        }, 500) // Wait for fade animation
      }, 2000) // Show completed state for 2 seconds

      // Refresh project data to show the new image
      await getProject()

      console.log(`Upload completed for ${fileName}`)
    } catch (error) {
      console.error('Upload error:', error)
      setUploadingFiles(prev => ({
        ...prev,
        [fileId]: { progress: 0, speed: 0, status: 'error' as const }
      }))
      throw error
    }
  }

  const handleFileUpload = useCallback(async (files: FileList) => {
    const newFiles = Array.from(files)

    // Validate file types and sizes
    const validationErrors: string[] = []
    const validFiles = newFiles.filter(file => {
      if (!file.type.startsWith('image/')) {
        validationErrors.push(`${file.name} is not an image file`)
        return false
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        validationErrors.push(`${file.name} is larger than 10MB`)
        return false
      }
      return true
    })

    if (validationErrors.length > 0) {
      setUploadErrors(validationErrors)
      setStatusMessage({ type: 'error', message: `Upload failed: ${validationErrors.join(', ')}` })
    }

    const maxImages = getPackageImageLimit(project?.package || 'starter')
    const currentImageCount = project?.project_images.length || 0
    const totalFiles = currentImageCount + validFiles.length

    if (totalFiles > maxImages) {
      // No alert - upload area is disabled when at limit
      return
    }

    // Start uploading files immediately
    validFiles.forEach((file, index) => {
      uploadFileWithProgress(file, index)
    })

  }, [project?.package, project?.project_images.length, project?.name, projectId])

  const openModal = (imageId: string) => {
    setFullSizeImage(imageId)
  }

  const closeModal = () => {
    setFullSizeImage(null)
    setModalTweakingImage(null)
    setModalTweakInstruction('')
  }

  const handleModalTweak = async () => {
    if (!modalTweakInstruction.trim() || !fullSizeImage) return

    const image = project?.project_images.find(img => img.id === fullSizeImage)
    if (!image || image.attempt_number >= 5) return

    // Check payment status for non-free-trial projects
    if (project?.status === 'draft' && project?.package !== 'starter') {
      closeModal()
      router.push(`/payment/${projectId}`)
      return
    }

    setGeneratingModalTweak(true)

    try {
      await supabase
        .from('processing_queue')
        .insert({
          project_id: projectId,
          image_id: fullSizeImage,
          operation_type: 'tweak',
          payload: {
            instruction: modalTweakInstruction,
            attempt_number: image.attempt_number + 1
          }
        })

      await supabase
        .from('project_images')
        .update({
          attempt_number: image.attempt_number + 1,
          tweak_history: [...(image.tweak_history || []), modalTweakInstruction],
          processing_status: 'pending'
        })
        .eq('id', fullSizeImage)

      await getProject()
      closeModal()
    } catch (error: any) {
      setStatusMessage({ type: 'error', message: 'Failed to submit tweak request: ' + error.message })
    } finally {
      setGeneratingModalTweak(false)
    }
  }

  if (loading || !project) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Status Message */}
      {statusMessage && (
        <div className={`p-4 rounded-xl border ${
          statusMessage.type === 'success'
            ? 'bg-emerald-100 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
            : 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
        }`}>
          {statusMessage.message}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-1 bg-card p-1 rounded-xl border border-border">
          <button
            onClick={onBackToDashboard}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg transition-colors"
          >
            Dashboard
          </button>
          <div className="w-px h-4 bg-border" />
          <div className="px-4 py-2 text-sm font-medium text-card-foreground bg-muted rounded-lg border border-border">
            {project.name}
          </div>
        </div>
      </div>

      {/* Project Info Card */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-3xl border border-border shadow-lg hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-300 overflow-hidden">
          {/* Header */}
          <div className="p-8 pb-6 border-b border-border">
            <div className="text-center">
              <EditableText
                as="h1"
                initialValue={project.name}
                onSave={(val) => handleUpdateProject('name', val)}
                className="text-4xl md:text-5xl font-bold text-card-foreground tracking-tight leading-tight text-center cursor-pointer hover:text-primary-600 transition-colors"
                placeholder="Project Name"
              />
            </div>

            <div className="flex justify-center mt-4">
              <span className="inline-flex items-center px-6 py-2 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 text-sm font-bold rounded-xl">
                {getPackageDisplayName(project.package)} Pack • {getPackageImageLimit(project.package)} Images
              </span>
            </div>
          </div>

          {/* Property Details */}
          <div className="p-8 space-y-6">
            {/* Address Row */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground font-medium">Property Address</div>
                  <EditableText
                    initialValue={project.address || ''}
                    onSave={(val) => handleUpdateProject('address', val)}
                    className="text-card-foreground font-medium mt-1"
                    placeholder="Add property address"
                  />
                </div>
              </div>
            </div>

            {/* Owner & Phone Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Owner Name */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">P</span>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground font-medium">Property Owner</div>
                    <EditableText
                      initialValue={project.owner_name || ''}
                      onSave={(val) => handleUpdateProject('owner_name', val)}
                      className="text-card-foreground font-medium mt-1"
                      placeholder="Owner name"
                    />
                  </div>
                </div>
              </div>

              {/* Phone Number */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">#</span>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground font-medium">Phone Number</div>
                    <EditableText
                      initialValue={project.phone || ''}
                      onSave={(val) => handleUpdateProject('phone', val)}
                      className="text-card-foreground font-medium mt-1"
                      placeholder="Phone number"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center space-x-4">
        {project.status === 'completed' && (
          <button
            onClick={handleBulkDownload}
            className="inline-flex items-center px-6 py-3 bg-card border border-border text-card-foreground font-medium rounded-xl hover:bg-muted transition-colors shadow-sm"
          >
            <Download className="w-5 h-5 mr-2" />
            Download Images
          </button>
        )}

        {project.package !== 'starter' && (
          <button
            onClick={() => setShowVideoConfirm(true)}
            className="inline-flex items-center px-6 py-3 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <Video className="w-5 h-5 mr-2" />
            Generate Video
          </button>
        )}
      </div>


      {/* Project Description */}
      <div className="bg-card p-6 rounded-2xl border border-border space-y-4">
        <label className="block text-sm font-medium text-muted-foreground mb-2">Project Description</label>
        <EditableText
          multiline
          initialValue={project.ai_description || ''}
          onSave={(val) => handleUpdateProject('ai_description', val)}
          className="text-card-foreground leading-relaxed min-h-[120px]"
          placeholder="Add project description..."
        />
      </div>

      {/* Images Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-card-foreground">
            Property Images <span className="text-muted-foreground font-normal ml-2">{project.project_images.length}/{getPackageImageLimit(project.package)}</span>
          </h2>
        </div>

        {/* Existing Images Grid - Above Upload Area */}
        {project.project_images.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">Current Images ({project.project_images.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence>
                {project.project_images.map((image, index) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
                  >
                    <div className="relative bg-muted rounded-t-2xl overflow-hidden cursor-pointer" onClick={() => openModal(image.id)}>
                      {imageUrls[image.id] ? (
                        <img
                          src={imageUrls[image.id]}
                          alt={`Property image ${index + 1}`}
                          className="w-full h-auto max-h-64 object-contain hover:opacity-90 transition-opacity"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground min-h-[200px]">
                          <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}

                      <div className="absolute top-2 right-2 flex items-center space-x-2">
                        <DeleteButton
                          onDelete={() => handleDeleteImage(image.id, image.original_filename)}
                        />
                        <span className="bg-background/80 backdrop-blur-md text-card-foreground text-xs font-medium px-2 py-1 rounded-full border border-border">
                          {image.attempt_number === 1 ? 'Original' : `Attempt ${image.attempt_number}`}
                        </span>
                      </div>
                    </div>

                    {/* Individual Image Instructions */}
                    <div className="p-4 border-t border-border">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-card-foreground">Image {index + 1}</h3>
                        {image.aspect_ratio && (
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md border border-border">
                            {image.aspect_ratio}
                          </span>
                        )}
                      </div>

                      {tweakingImage === image.id ? (
                        <div className="space-y-3">
                          <textarea
                            value={tweakInstruction}
                            onChange={(e) => setTweakInstruction(e.target.value)}
                            placeholder="Describe changes for this image..."
                            className="w-full text-sm p-3 bg-background rounded-xl border border-border focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none text-card-foreground placeholder:text-muted-foreground outline-none transition-all"
                            rows={2}
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleGenerateTweak(image.id)}
                              disabled={generatingTweak || !tweakInstruction.trim()}
                              className="flex-1 bg-primary-500 text-white text-sm font-bold py-2 rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
                            >
                              {generatingTweak ? 'Generating...' : 'Generate Tweak'}
                            </button>
                            <button
                              onClick={() => setTweakingImage(null)}
                              className="px-4 py-2 text-sm text-muted-foreground hover:text-card-foreground hover:bg-muted rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setTweakingImage(image.id)}
                          disabled={image.attempt_number >= 5}
                          className="w-full flex items-center justify-center py-2 text-sm font-medium text-muted-foreground bg-muted/50 hover:bg-muted hover:text-card-foreground rounded-xl transition-colors disabled:opacity-50 border border-transparent hover:border-border"
                        >
                          <Wand2 className="w-4 h-4 mr-2" />
                          {image.attempt_number >= 5 ? 'Max Attempts Reached' : 'Add Specific Instructions For This Image'}
                        </button>
                      )}

                      {image.tweak_history?.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-xs text-muted-foreground mb-1">Previous tweaks:</p>
                          <div className="space-y-1">
                            {image.tweak_history.slice(-2).map((tweak, i) => (
                              <p key={i} className="text-xs text-muted-foreground italic">"{tweak}"</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Generate All Images Button - Only shown when there are images and project is draft */}
            {project.status === 'draft' && project.project_images.length > 0 && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleGenerateAllImages}
                  className="bg-primary-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  <Wand2 className="w-5 h-5 mr-2" />
                  Generate All Images
                </button>
              </div>
            )}

            {/* Global Instructions - After Images, Before Upload */}
            <div className="bg-card p-6 rounded-2xl border border-border space-y-4">
              <label className="block text-sm font-medium text-muted-foreground mb-2">Global Instructions for All Images</label>
              <EditableText
                multiline
                initialValue={project.global_instructions || ''}
                onSave={(val) => handleUpdateProject('global_instructions', val)}
                className="text-card-foreground leading-relaxed min-h-[100px]"
                placeholder="Describe the style for all images: e.g., Make it sunny, Scandinavian furniture, luxury kitchen"
              />
            </div>
          </div>
        )}

        {/* Drag & Drop Upload Area */}
        {project.project_images.length >= getPackageImageLimit(project.package) ? (
          <div className="border-2 border-dashed border-muted-foreground/50 rounded-2xl p-16 text-center bg-muted/30 min-h-[300px] flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Upload className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium mb-2 text-lg">
              Upload limit reached
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Maximum {getPackageImageLimit(project.package)} images for {getPackageDisplayName(project.package)} package
            </p>
          </div>
        ) : (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              const files = e.dataTransfer.files
              if (files.length > 0) {
                handleFileUpload(files)
              }
            }}
            onClick={() => document.getElementById('project-file-input')?.click()}
            className="border-2 border-dashed border-border rounded-2xl p-16 text-center hover:border-primary-300 dark:hover:border-primary-700 hover:bg-muted/50 transition-all cursor-pointer group min-h-[300px] flex flex-col items-center justify-center"
          >
            <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Upload className="w-10 h-10 text-muted-foreground group-hover:text-primary-500 transition-colors" />
            </div>
            <p className="text-card-foreground font-medium mb-2 text-lg">
              Drag and drop images here, or <span className="text-primary-500 cursor-pointer">browse files</span>
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Maximum {getPackageImageLimit(project.package)} images, 10MB each • No minimum required
            </p>
            <input
              id="project-file-input"
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="hidden"
            />
          </div>
        )}

        {/* Upload Progress */}
        {Object.keys(uploadingFiles).length > 0 && (
          <div className="bg-card p-6 rounded-2xl border border-border space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground">Uploading Images</h3>
            <div className="space-y-4">
              {Object.entries(uploadingFiles).map(([fileId, uploadState]) => {
                const fileName = fileId.split('-')[0] // Extract filename from ID
                const isFading = fadingFiles.has(fileId)
                return (
                  <div
                    key={fileId}
                    className={`space-y-2 transition-opacity duration-500 ease-out ${
                      isFading ? 'opacity-0' : 'opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-card-foreground truncate max-w-[200px]">{fileName}</span>
                      <div className="flex items-center space-x-2">
                        {uploadState.status === 'uploading' && uploadState.speed > 0 && (
                          <span className="text-muted-foreground text-xs">{uploadState.speed} MB/s</span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          uploadState.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300' :
                          uploadState.status === 'error' ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' :
                          'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                        }`}>
                          {uploadState.status === 'completed' ? 'Complete' :
                           uploadState.status === 'error' ? 'Failed' :
                           `${uploadState.progress}%`}
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
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
      </div>

      {/* Delete Project Button */}
      <div className="flex justify-center pt-8">
        <button
          onClick={handleDeleteProject}
          className="inline-flex items-center px-8 py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 hover:shadow-red-600/30"
        >
          <Trash2 className="w-5 h-5 mr-3" />
          Delete Project
        </button>
      </div>

      {/* Video Generation Modal */}
      {showVideoConfirm && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-3xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary-600">
                <Video className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-card-foreground mb-2">Generate Video</h3>
              <p className="text-muted-foreground">Create a cinematic 60-second tour using your processed images.</p>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex items-center p-3 bg-muted/50 rounded-xl text-sm text-card-foreground border border-border">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3" />
                Slow-motion dolly effects
              </div>
              <div className="flex items-center p-3 bg-muted/50 rounded-xl text-sm text-card-foreground border border-border">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3" />
                Professional background music
              </div>
              <div className="flex items-center p-3 bg-muted/50 rounded-xl text-sm text-card-foreground border border-border">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3" />
                High-resolution 1080p output
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowVideoConfirm(false)}
                className="flex-1 py-3 text-muted-foreground font-medium hover:text-card-foreground hover:bg-muted rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateVideo}
                disabled={generatingVideo}
                className="flex-1 py-3 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50"
              >
                {generatingVideo ? 'Starting...' : 'Start Generation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Image Modal */}
      <AnimatePresence>
        {fullSizeImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 dark:bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute -top-12 right-0 w-8 h-8 bg-muted hover:bg-muted/80 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Image */}
              <div className="bg-muted rounded-2xl overflow-hidden shadow-2xl">
                {imageUrls[fullSizeImage] && (
                  <img
                    src={imageUrls[fullSizeImage]}
                    alt="Full size image"
                    className="w-full h-auto max-h-[70vh] object-contain"
                  />
                )}
              </div>

              {/* Tweak Controls */}
              <div className="mt-6 bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-card-foreground">Add Specific Instructions For This Image</h3>
                  <span className="text-sm text-muted-foreground">
                    {project && fullSizeImage ? project.project_images.find(img => img.id === fullSizeImage)?.attempt_number || 1 : 1}/5 attempts
                  </span>
                </div>

                {modalTweakingImage === fullSizeImage ? (
                  <div className="space-y-4">
                    <textarea
                      value={modalTweakInstruction}
                      onChange={(e) => setModalTweakInstruction(e.target.value)}
                      placeholder="Describe specific changes you want for this image..."
                      className="w-full text-sm p-4 bg-background rounded-xl border border-border focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none text-card-foreground placeholder:text-muted-foreground outline-none transition-all min-h-[120px]"
                      autoFocus
                    />
                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => setModalTweakingImage(null)}
                        className="px-6 py-2 text-sm text-muted-foreground hover:text-card-foreground hover:bg-muted rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleModalTweak}
                        disabled={generatingModalTweak || !modalTweakInstruction.trim()}
                        className="px-6 py-2 bg-primary-500 text-white text-sm font-bold rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors flex items-center"
                      >
                        {generatingModalTweak && (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                        )}
                        {generatingModalTweak ? 'Generating...' : 'Generate Tweak'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setModalTweakingImage(fullSizeImage)}
                    disabled={project && fullSizeImage ? (project.project_images.find(img => img.id === fullSizeImage)?.attempt_number || 0) >= 5 : false}
                    className="w-full flex items-center justify-center py-3 text-sm font-medium text-primary-600 bg-primary-100 dark:bg-primary-900/20 hover:bg-primary-200 dark:hover:bg-primary-800 rounded-xl transition-colors disabled:opacity-50 border border-primary-200 dark:border-primary-800"
                  >
                    <Wand2 className="w-5 h-5 mr-3" />
                    {project && fullSizeImage && (project.project_images.find(img => img.id === fullSizeImage)?.attempt_number || 0) >= 5
                      ? 'Max Attempts Reached'
                      : 'Add Specific Instructions For This Image'
                    }
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Project Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-3xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-card-foreground mb-2">Delete Project</h3>
              <p className="text-muted-foreground">
                Are you sure you want to permanently delete <strong>"{project?.name}"</strong>?
                This action cannot be undone.
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-300">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-3" />
                All project images will be permanently deleted
              </div>
              <div className="flex items-center p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-300">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-3" />
                All processing history will be lost
              </div>
              <div className="flex items-center p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-300">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-3" />
                This action cannot be reversed
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 text-muted-foreground font-medium hover:text-card-foreground hover:bg-muted rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteProject}
                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
