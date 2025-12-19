export function PrivacyView() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
      </div>

      <div className="bg-[#111] border border-white/5 rounded-2xl p-8 shadow-sm">
        <div className="space-y-6 text-sm leading-relaxed text-zinc-300">
          <p>Last updated: December 2025</p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">1. Introduction</h2>
          <p>
            Welcome to Re-Agent. We respect your privacy and are committed to protecting your personal data.
            This privacy policy will inform you as to how we look after your personal data when you visit our website
            and tell you about your privacy rights and how the law protects you.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">2. Data We Collect</h2>
          <p>
            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Identity Data includes first name, last name, username or similar identifier.</li>
            <li>Contact Data includes billing address, delivery address, email address and telephone numbers.</li>
            <li>Financial Data includes bank account and payment card details.</li>
            <li>Transaction Data includes details about payments to and from you and other details of products and services you have purchased from us.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">3. How We Use Your Data</h2>
          <p>
            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
            <li>Where we need to comply with a legal or regulatory obligation.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">4. Data Security</h2>
          <p>
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed.
          </p>
        </div>
      </div>
    </div>
  )
}
