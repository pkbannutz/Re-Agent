import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { SupportView } from '@/components/views/support-view'

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 p-8">
      <div className="max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center text-sm text-zinc-500 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        <SupportView />
      </div>
    </div>
  )
}
