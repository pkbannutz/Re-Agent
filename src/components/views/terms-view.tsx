export function TermsView() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-card-foreground mb-8">Terms of Service</h1>
      </div>

      <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
        <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
          <p>Last updated: December 2025</p>

          <h2 className="text-xl font-semibold text-card-foreground mt-8 mb-4">1. Agreement to Terms</h2>
          <p>
            By accessing or using Re-Agent, you agree to be bound by these Terms of Service and all applicable laws and regulations.
            If you do not agree with any of these terms, you are prohibited from using or accessing this site.
          </p>

          <h2 className="text-xl font-semibold text-card-foreground mt-8 mb-4">2. Use License</h2>
          <p>
            Permission is granted to temporarily download one copy of the materials (information or software) on Re-Agent's website for personal,
            non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>modify or copy the materials;</li>
            <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
            <li>attempt to decompile or reverse engineer any software contained on Re-Agent's website;</li>
            <li>remove any copyright or other proprietary notations from the materials; or</li>
            <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
          </ul>

          <h2 className="text-xl font-semibold text-card-foreground mt-8 mb-4">3. Disclaimer</h2>
          <p>
            The materials on Re-Agent's website are provided on an 'as is' basis. Re-Agent makes no warranties, expressed or implied,
            and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability,
            fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>

          <h2 className="text-xl font-semibold text-card-foreground mt-8 mb-4">4. Limitations</h2>
          <p>
            In no event shall Re-Agent or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit,
            or due to business interruption) arising out of the use or inability to use the materials on Re-Agent's website.
          </p>
        </div>
      </div>
    </div>
  )
}
