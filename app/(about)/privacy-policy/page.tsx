// app/privacy-policy/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | RailThailand',
  description: 'Privacy Policy for RailThailand - Your trusted source for Thailand train schedules and travel information',
}

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-4">Last updated: {new Date().getFullYear()}</p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
        <p className="mb-4">
          We collect information that you provide directly to us, such as when you use our services, 
          subscribe to our newsletter, or contact us. The types of information we may collect include:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Contact information (name, email address, etc.)</li>
          <li>Usage data and analytics</li>
          <li>Cookies and similar tracking technologies</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
        <p className="mb-4">We use the information we collect to:</p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Provide, maintain, and improve our services</li>
          <li>Respond to your comments, questions, and requests</li>
          <li>Send you technical notices and support messages</li>
          <li>Monitor and analyze trends and usage</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. Data Security</h2>
        <p className="mb-4">
          We implement appropriate security measures to protect against unauthorized access, 
          alteration, disclosure, or destruction of your personal information.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Changes to This Policy</h2>
        <p>
          We may update our Privacy Policy from time to time. We will notify you of any changes 
          by posting the new Privacy Policy on this page and updating the Last updated date.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">5. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at{' '}
          <Link href="mailto:privacy@railthailand.com" className="text-blue-600 hover:underline">
            privacy@railthailand.com
          </Link>
        </p>
      </section>
    </div>
  )
}