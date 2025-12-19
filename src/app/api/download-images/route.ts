import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import JSZip from 'jszip'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
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

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId } = await request.json()

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name, status')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
    }

    // Get all completed project images
    const { data: images, error: imagesError } = await supabase
      .from('project_images')
      .select('original_filename, processed_url')
      .eq('project_id', projectId)
      .eq('processing_status', 'completed')
      .not('processed_url', 'is', null)

    if (imagesError) {
      console.error('Error fetching images:', imagesError)
      return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 })
    }

    if (!images || images.length === 0) {
      return NextResponse.json({ error: 'No completed images found' }, { status: 404 })
    }

    // Create ZIP file
    const zip = new JSZip()
    const folderName = `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_images`

    // Download each image and add to ZIP
    for (let i = 0; i < images.length; i++) {
      const image = images[i]
      try {
        // Download image from Supabase Storage
        const { data, error } = await supabase.storage
          .from('project-images')
          .download(`processed/${image.processed_url}`)

        if (error || !data) {
          console.error(`Failed to download image ${image.original_filename}:`, error)
          continue // Skip this image but continue with others
        }

        // Convert blob to array buffer
        const arrayBuffer = await data.arrayBuffer()

        // Add to ZIP with a clean filename
        const fileName = `image_${String(i + 1).padStart(2, '0')}.jpg`
        zip.file(`${folderName}/${fileName}`, arrayBuffer)

      } catch (error) {
        console.error(`Error processing image ${image.original_filename}:`, error)
        continue // Skip this image but continue with others
      }
    }

    // Generate ZIP file
    const zipContent = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    })

    // Return ZIP file as response
    const zipFileName = `${folderName}.zip`

    return new NextResponse(zipContent, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${zipFileName}"`,
        'Content-Length': zipContent.length.toString(),
      },
    })

  } catch (error: any) {
    console.error('Bulk download error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
