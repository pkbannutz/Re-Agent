export function SecurityView() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-8">Security Policy</h1>
      </div>

      <div className="bg-[#111] border border-white/5 rounded-2xl p-8 shadow-sm">
        <div className="space-y-6 text-sm leading-relaxed text-zinc-300">
          <p>Last updated: December 2025</p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. Security Overview</h2>
          <p>
            At Re-Agent, security is our top priority. We implement comprehensive security measures to protect your data,
            ensure privacy, and maintain the integrity of our services.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. Data Protection</h2>
          <p>
            We employ industry-standard encryption protocols to protect your data both in transit and at rest:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>All data transmission uses TLS 1.3 encryption</li>
            <li>Database storage is encrypted using AES-256 encryption</li>
            <li>File storage implements server-side encryption</li>
            <li>API communications are secured with JWT tokens</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. Access Control</h2>
          <p>
            We implement strict access controls to ensure only authorized personnel can access systems and data:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Multi-factor authentication required for all accounts</li>
            <li>Role-based access control (RBAC) system</li>
            <li>Regular access reviews and audits</li>
            <li>Principle of least privilege enforced</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">4. Infrastructure Security</h2>
          <p>
            Our infrastructure is hosted on secure, compliant cloud platforms with enterprise-grade security:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>SOC 2 Type II compliant hosting</li>
            <li>DDoS protection and monitoring</li>
            <li>Regular security updates and patches</li>
            <li>24/7 security monitoring and incident response</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">5. Payment Security</h2>
          <p>
            All payment processing is handled by Stripe, a PCI DSS Level 1 compliant payment processor.
            We never store credit card information on our servers.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">6. Incident Response</h2>
          <p>
            In the unlikely event of a security incident, we have established procedures to:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Respond quickly to contain and mitigate threats</li>
            <li>Notify affected users within 72 hours</li>
            <li>Conduct thorough post-incident analysis</li>
            <li>Implement preventive measures</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">7. Contact Us</h2>
          <p>
            If you have any security concerns or questions, please contact us at{' '}
            <a href="mailto:security@re-agent.com" className="text-emerald-400 hover:text-emerald-300 underline">
              security@re-agent.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
