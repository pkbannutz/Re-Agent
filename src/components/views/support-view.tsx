'use client'

import { MessageCircle, FileText, Mail, ChevronRight } from 'lucide-react'

export function SupportView() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-card-foreground tracking-tight mb-2">
          Support & Help
        </h1>
        <p className="text-muted-foreground">
          Find answers to your questions or get in touch with our team.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Help */}
        <div className="bg-card p-6 rounded-2xl border border-border hover:border-primary-200 dark:hover:border-primary-800 transition-colors cursor-pointer group shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary-500 transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-card-foreground mb-2">Documentation</h3>
          <p className="text-muted-foreground text-sm">
            Read our guides on how to get the best results from your AI generations.
          </p>
        </div>

        {/* Contact Support */}
        <div className="bg-card p-6 rounded-2xl border border-border hover:border-primary-200 dark:hover:border-primary-800 transition-colors cursor-pointer group shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <MessageCircle className="w-6 h-6" />
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-card-foreground mb-2">Chat with Support</h3>
          <p className="text-muted-foreground text-sm">
            Start a live chat with our support team for immediate assistance.
          </p>
        </div>
      </div>

      {/* FAQs */}
      <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-card-foreground mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-card-foreground mb-2">How long does image processing take?</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Most images are processed within 30-60 seconds. During high volume periods, it might take up to 2-3 minutes.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-card-foreground mb-2">Can I cancel my subscription?</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Yes, you can cancel your subscription at any time from the Settings page. You'll retain access until the end of your billing period.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-card-foreground mb-2">What if I'm not happy with the results?</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              You can use the tweak feature to adjust specific parts of an image. If you're still not satisfied, please contact our support team.
            </p>
          </div>
        </div>
      </div>

      {/* Email Contact */}
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">Still have questions?</p>
        <a href="mailto:support@re-agent.com" className="inline-flex items-center justify-center px-6 py-3 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors">
          <Mail className="w-4 h-4 mr-2" />
          Email Support
        </a>
      </div>
    </div>
  )
}
