// app/terms-of-service/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service | RailThailand',
  description: 'Terms of Service for RailThailand - Your trusted source for Thailand train schedules and travel information',
}

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="mb-8">Last updated: {new Date().getFullYear()}</p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
        <p className="mb-4">
          By accessing or using the RailThailand website, you agree to be bound by these Terms of 
          Service and our Privacy Policy. If you do not agree to these terms, please do not use our services.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. Use of Service</h2>
        <p className="mb-4">You agree to use our services only for lawful purposes and in accordance with these Terms.</p>
        <p className="mb-4">You agree not to:</p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Use our services in any way that violates any applicable laws or regulations</li>
          <li>Attempt to gain unauthorized access to any part of our services</li>
          <li>Use our services to transmit any viruses or harmful code</li>
          <li>Use our services for any commercial purposes without our express written consent</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. Intellectual Property</h2>
        <p className="mb-4">
          The content, features, and functionality of our services are owned by RailThailand and 
          are protected by copyright, trademark, and other intellectual property laws.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Limitation of Liability</h2>
        <p className="mb-4">
          RailThailand is not responsible for any inaccuracies in the train schedule information 
          provided on our website. We recommend that you verify all information with the official 
          State Railway of Thailand before making travel plans.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Changes to Terms</h2>
        <p className="mb-4">
          We reserve the right to modify these terms at any time. We will provide notice of any 
          changes by updating the Last updated date of these Terms of Service.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">6. Contact Us</h2>
        <p>
          If you have any questions about these Terms of Service, please contact us at{' '}
          <Link href="mailto:legal@railthailand.com" className="text-blue-600 hover:underline">
            legal@railthailand.com
          </Link>
        </p>
      </section>
    </div>
  )
}