'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'

interface ImageComparisonSliderProps {
  beforeImage: string
  afterImage: string
  alt?: string
  className?: string
  onClick?: () => void
}

export function ImageComparisonSlider({
  beforeImage,
  afterImage,
  alt = "Before and after comparison",
  className = "",
  onClick
}: ImageComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(75)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const recentlyDragged = useRef(false)

  const handleMouseDown = useCallback(() => {
    isDragging.current = true
  }, [])

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
    // Mark as recently dragged to prevent accidental fullscreen opens
    recentlyDragged.current = true
    // Clear the flag after a short delay
    setTimeout(() => {
      recentlyDragged.current = false
    }, 300)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = Math.min(Math.max((x / rect.width) * 100, 0), 100)
    setSliderPosition(percentage)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.touches[0].clientX - rect.left
    const percentage = Math.min(Math.max((x / rect.width) * 100, 0), 100)
    setSliderPosition(percentage)
  }, [])

  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    // Only trigger click if not currently dragging and not recently dragged (to avoid accidental opens during slider use)
    if (!isDragging.current && !recentlyDragged.current && onClick) {
      onClick()
    }
  }, [onClick])

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 cursor-col-resize select-none ${className}`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
      onClick={handleContainerClick}
    >
      {/* Before Image (Left side, always visible) */}
      <div className="absolute inset-0">
        <Image
          src={beforeImage}
          alt={`${alt} - Before`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* After Image (Right side, revealed by slider) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          clipPath: `polygon(${sliderPosition}% 0%, 100% 0%, 100% 100%, ${sliderPosition}% 100%)`
        }}
      >
        <Image
          src={afterImage}
          alt={`${alt} - After`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Large Hit Area (transparent, covers more area) */}
      <div
        className="absolute top-0 bottom-0 w-8 -ml-4 z-20 cursor-col-resize"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      />

      {/* Slider Handle (above everything, not affected by clip-path) */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg z-30 pointer-events-none"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        {/* Handle indicator */}
        <div className="absolute top-1/2 left-1/2 w-6 h-6 bg-white rounded-full shadow-lg border-2 border-emerald-500 transform -translate-x-1/2 -translate-y-1/2">
          <div className="absolute inset-1 bg-emerald-500 rounded-full"></div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium z-10">
        Before
      </div>
      <div className="absolute top-4 right-4 bg-emerald-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium z-10">
        After
      </div>
    </div>
  )
}
