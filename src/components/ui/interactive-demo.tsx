'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Wand2, Play, Loader2 } from 'lucide-react'
import { ImageComparisonSlider } from './image-comparison-slider'

type DemoState = 'show-before' | 'generating-images' | 'images-ready' | 'generating-video' | 'video-ready'

interface InteractiveDemoProps {
  onDemoStart?: () => void
}

export function InteractiveDemo({ onDemoStart }: InteractiveDemoProps) {
  const [demoState, setDemoState] = useState<DemoState>('show-before')

  const handleGenerateImages = () => {
    setDemoState('generating-images')
    onDemoStart?.()

    // Simulate processing time
    setTimeout(() => {
      setDemoState('images-ready')
    }, 2000)
  }

  const handleGenerateVideo = () => {
    setDemoState('generating-video')

    // Simulate video generation time (1 second as requested)
    setTimeout(() => {
      setDemoState('video-ready')
    }, 1000)
  }

  return (
    <div className="relative">
      {/* Image Selling Point - Always visible after demo starts */}
      {true && (
        <div className="text-center mb-8">
          <h3 className="text-2xl sm:text-3xl font-bold mb-2">
            Transform your picture{' '}
            <span className="text-emerald-400">from night to day</span>,{' '}
            <span className="text-emerald-400">from messy to clean</span>
          </h3>
          <p className="text-zinc-400 text-lg">
            See the magic happen in real-time
          </p>
        </div>
      )}

      {/* Images Section */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Image 1 */}
        <div className="relative">
          {demoState !== 'show-before' && demoState !== 'generating-images' ? (
            <ImageComparisonSlider
              beforeImage="/demo-assets/before-image-1.jpg"
              afterImage="/demo-assets/after-image-1.jpg"
              alt="Property enhancement comparison 1"
            />
          ) : (
            <div className="aspect-[4/3] bg-[#0a0a0a] rounded-2xl border border-white/10 overflow-hidden relative">
              <Image
                src="/demo-assets/before-image-1.jpg"
                alt="Before enhancement - Property Image 1"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {/* Loading Overlay */}
              {demoState === 'generating-images' && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
                  <div className="text-center text-white">
                    <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
                    <p className="text-sm font-medium">Enhancing...</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Image 2 */}
        <div className="relative">
          {demoState !== 'show-before' && demoState !== 'generating-images' ? (
            <ImageComparisonSlider
              beforeImage="/demo-assets/before-image-2.jpg"
              afterImage="/demo-assets/after-image-2.jpg"
              alt="Property enhancement comparison 2"
            />
          ) : (
            <div className="aspect-[4/3] bg-[#0a0a0a] rounded-2xl border border-white/10 overflow-hidden relative">
              <Image
                src="/demo-assets/before-image-2.jpg"
                alt="Before enhancement - Property Image 2"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {/* Loading Overlay */}
              {demoState === 'generating-images' && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
                  <div className="text-center text-white">
                    <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
                    <p className="text-sm font-medium">Enhancing...</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Generate Images Button */}
      <AnimatePresence>
        {demoState === 'show-before' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex justify-center mb-8"
          >
            <button
              onClick={handleGenerateImages}
              className="bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              Generate Enhanced Images
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Selling Point - Appears after images are generated */}
      <AnimatePresence>
        {demoState === 'images-ready' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center mb-8"
          >
            <h3 className="text-2xl sm:text-3xl font-bold mb-2">
              Take your{' '}
              <span className="text-emerald-400">grandma images</span>{' '}
              and turn them into a{' '}
              <span className="text-emerald-400">real world cinema experience</span>
            </h3>
            <p className="text-zinc-400 text-lg">
              Experience the transformation like never before
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generate Video Button */}
      <AnimatePresence>
        {demoState === 'images-ready' && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className="flex justify-center mb-8"
          >
            <button
              onClick={handleGenerateVideo}
              className="bg-emerald-500 hover:bg-emerald-400 text-black px-12 py-6 rounded-2xl font-bold text-2xl transition-all hover:scale-105 shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:shadow-[0_0_40px_rgba(16,185,129,0.7)] animate-pulse"
            >
              Generate Video
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Section */}
      <AnimatePresence>
        {(demoState === 'generating-video' || demoState === 'video-ready') && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="flex justify-center"
          >
            <div className="w-full max-w-4xl">
              {demoState === 'generating-video' ? (
                <div className="aspect-video bg-[#0a0a0a] rounded-2xl border border-white/10 flex items-center justify-center">
                  <div className="text-center text-emerald-400">
                    <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" />
                    <p className="text-lg font-medium">Generating cinematic video...</p>
                  </div>
                </div>
              ) : (
                <video
                  controls
                  className="w-full aspect-video rounded-2xl border border-white/10"
                  poster="/demo-assets/video-thumbnail.jpg"
                >
                  <source src="/demo-assets/demo-video.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
