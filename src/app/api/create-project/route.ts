import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Create Supabase server client for authentication
    const cookieStore = await cookies()
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create Supabase server client with service role for database operations
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const { projectName, address, globalInstructions, selectedPackage, uploadedFiles, imageInstructions, isFreeTrial, aiDescription, projectId, isAddingToExisting, preUploadedImages } = await request.json()

    // If adding to existing project, validate differently
    if (isAddingToExisting) {
      if (!projectId) {
        return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
      }
      if (!uploadedFiles || uploadedFiles.length === 0) {
        return NextResponse.json({ error: 'At least one image is required' }, { status: 400 })
      }
    } else {
      // Creating new project
      if (!projectName?.trim()) {
        return NextResponse.json({ error: 'Project name is required' }, { status: 400 })
      }
      // Allow creating projects without images
    }

    // Ensure user profile exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existingUser) {
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
        })

      if (userError) {
        console.error('Error creating user profile:', userError)
        return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 })
      }
    }

    let project

    if (isAddingToExisting) {
      console.log('Adding to existing project:', projectId, 'User:', user.id)

      // Verify user owns the project
      const { data: existingProject, error: verifyError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single()

      console.log('Project verification result:', { existingProject, verifyError })

      if (verifyError || !existingProject) {
        console.error('Project verification failed:', verifyError)
        return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
      }

      project = existingProject
    } else {
      // Create new project
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: projectName,
          address: address || null,
          global_instructions: globalInstructions || null,
          package: selectedPackage,
          status: 'draft',
          ai_description: aiDescription || null
        })
        .select()
        .single()

      if (projectError) {
        console.error('Project creation error:', projectError)
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
      }

      project = newProject
    }

    // Get existing image count for filename numbering
    const { data: existingImages } = await supabase
      .from('project_images')
      .select('id')
      .eq('project_id', project.id)

    const existingImageCount = existingImages?.length || 0

    let uploadResults = []

    // Handle pre-uploaded images (from immediate upload flow)
    if (preUploadedImages && preUploadedImages.length > 0) {
      console.log(`Processing ${preUploadedImages.length} pre-uploaded images for project ${project.id}`)
      for (let i = 0; i < preUploadedImages.length; i++) {
        try {
          const preUploadedImage = preUploadedImages[i]
          // Extract filename from the URL or use the provided filename
          const urlParts = preUploadedImage.url.split('/')
          const fileName = preUploadedImage.filename || urlParts[urlParts.length - 1]

          console.log(`Processing pre-uploaded image ${i + 1}: ${fileName}`)

          // Create project_images record for the pre-uploaded image
          const { data: imageRecord, error: imageError } = await supabase
            .from('project_images')
            .insert({
              project_id: project.id,
              original_filename: fileName,
              attempt_number: 1,
              tweak_history: ['']
            })
            .select()
            .single()

          if (imageError) {
            console.error('Project image creation error:', imageError)
            uploadResults.push({ fileName, success: false, error: imageError.message })
            continue
          }

          console.log(`Database record created for pre-uploaded image:`, imageRecord)
          uploadResults.push({ fileName, success: true })
        } catch (error) {
          console.error(`Error processing pre-uploaded image ${i}:`, error)
          uploadResults.push({
            fileName: preUploadedImages[i].filename || `image-${i + 1}`,
            success: false,
            error: error instanceof Error ? error.message : String(error)
          })
        }
      }
    }
    // Process file uploads and create project_images records (legacy base64 upload)
    else if (uploadedFiles && uploadedFiles.length > 0) {
      console.log(`Processing ${uploadedFiles.length} files for project ${project.id}`)
      for (let i = 0; i < uploadedFiles.length; i++) {
        try {
          const fileData = uploadedFiles[i]
          const sequenceNumber = existingImageCount + i + 1
          const fileName = `${(projectName || project.name).replace(/[^a-zA-Z0-9]/g, '_')}_${String(sequenceNumber).padStart(2, '0')}.${fileData.name.split('.').pop()}`

          console.log(`Processing file ${i + 1}: ${fileName}`)

          // Convert base64 to blob for upload
          const base64Data = fileData.data.split(',')[1]
          const binaryData = atob(base64Data)
          const bytes = new Uint8Array(binaryData.length)
          for (let j = 0; j < binaryData.length; j++) {
            bytes[j] = binaryData.charCodeAt(j)
          }
          const blob = new Blob([bytes], { type: fileData.type })

          console.log(`Blob created, size: ${blob.size} bytes`)

          // Upload to Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from('project-images')
            .upload(`original/${fileName}`, blob)

          if (uploadError) {
            console.error('Storage upload error:', uploadError)
            uploadResults.push({ fileName, success: false, error: uploadError.message })
            continue // Skip this file but continue with others
          }

          console.log(`Storage upload successful for ${fileName}`)

          // Create project_images record
          const { data: imageRecord, error: imageError } = await supabase
            .from('project_images')
            .insert({
              project_id: project.id,
              original_filename: fileName,
              attempt_number: 1,
              tweak_history: [imageInstructions[i] || '']
            })
            .select()
            .single()

          if (imageError) {
            console.error('Project image creation error:', imageError)
            uploadResults.push({ fileName, success: false, error: imageError.message })
            continue
          }

          console.log(`Database record created:`, imageRecord)
          uploadResults.push({ fileName, success: true })
        } catch (error) {
          console.error(`Error processing file ${i}:`, error)
          uploadResults.push({ fileName: uploadedFiles[i].name, success: false, error: error instanceof Error ? error.message : String(error) })
        }
      }
    }

    console.log(`Upload results:`, uploadResults)

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        package: project.package
      },
      uploads: uploadResults
    })

  } catch (error: any) {
    console.error('Create project API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
