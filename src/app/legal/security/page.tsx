import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 p-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center text-sm text-zinc-500 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold text-white mb-8">Security</h1>
        
        <div className="space-y-6 text-sm leading-relaxed">
          <p>
            Security is one of our top priorities. We are committed to protecting your data and ensuring 
            that our platform remains secure and reliable.
          </p>
          
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. Data Encryption</h2>
          <p>
            All data transmitted between your browser and our servers is encrypted using Transport Layer Security (TLS) 1.2 or newer. 
            Data at rest is encrypted using industry-standard AES-256 encryption.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. Secure Infrastructure</h2>
          <p>
            Our infrastructure is hosted on world-class cloud providers (AWS/Vercel) that maintain rigorous security standards 
            (ISO 27001, SOC 2 Type II). We employ firewalls, intrusion detection systems, and regular security audits.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. Payment Security</h2>
          <p>
            We do not store your credit card information. All payments are processed securely by Stripe, a PCI-DSS Level 1 compliant payment processor.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">4. Access Control</h2>
          <p>
            Access to production data is strictly limited to authorized personnel and is governed by the principle of least privilege. 
            Multi-factor authentication (MFA) is required for all administrative access.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">5. Reporting Vulnerabilities</h2>
          <p>
            If you believe you have found a security vulnerability in Re-Agent, please report it to us immediately at security@re-agent.com. 
            We appreciate your help in keeping our platform secure.
          </p>
        </div>
      </div>
    </div>
  )
}
