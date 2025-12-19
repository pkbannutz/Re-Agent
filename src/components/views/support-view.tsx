'use client'

import { MessageCircle, FileText, Mail, ChevronRight } from 'lucide-react'

export function SupportView() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
          Support & Help
        </h1>
        <p className="text-zinc-400">
          Find answers to your questions or get in touch with our team.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Help */}
        <div className="bg-[#111] p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors cursor-pointer group shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-blue-400 transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Documentation</h3>
          <p className="text-zinc-500 text-sm">
            Read our guides on how to get the best results from your AI generations.
          </p>
        </div>

        {/* Contact Support */}
        <div className="bg-[#111] p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors cursor-pointer group shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <MessageCircle className="w-6 h-6" />
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Chat with Support</h3>
          <p className="text-zinc-500 text-sm">
            Start a live chat with our support team for immediate assistance.
          </p>
        </div>
      </div>

      {/* FAQs */}
      <div className="bg-[#111] rounded-2xl border border-white/5 p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-white mb-2">How long does image processing take?</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Most images are processed within 30-60 seconds. During high volume periods, it might take up to 2-3 minutes.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-white mb-2">Can I cancel my subscription?</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Yes, you can cancel your subscription at any time from the Settings page. You'll retain access until the end of your billing period.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-white mb-2">What if I'm not happy with the results?</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">
              You can use the tweak feature to adjust specific parts of an image. If you're still not satisfied, please contact our support team.
            </p>
          </div>
        </div>
      </div>

      {/* Email Contact */}
      <div className="text-center py-8">
        <p className="text-zinc-500 mb-4">Still have questions?</p>
        <a href="mailto:support@re-agent.com" className="inline-flex items-center justify-center px-6 py-3 bg-white text-black font-medium rounded-xl hover:bg-zinc-200 transition-colors">
          <Mail className="w-4 h-4 mr-2" />
          Email Support
        </a>
      </div>
    </div>
  )
}
