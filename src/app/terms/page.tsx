export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
        
        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using TON Shield AI ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Use License</h2>
            <p>
              Permission is granted to use TON Shield AI for security analysis of TON blockchain transactions, addresses, tokens, and links. This is the grant of a license, not a transfer of title.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Disclaimer</h2>
            <p>
              The Service provides security analysis based on AI and available data. While we strive for accuracy, we do not guarantee that all risks will be detected. Users should exercise their own judgment and perform additional due diligence.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Limitations</h2>
            <p>
              TON Shield AI and its team shall not be held liable for any losses, damages, or issues arising from the use of this Service. Users are responsible for their own decisions and transactions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Privacy</h2>
            <p>
              Your use of TON Shield AI is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the Service after changes constitutes acceptance of the modified terms.
            </p>
          </section>

          <div className="pt-6 border-t border-gray-200 mt-8">
            <p className="text-sm text-gray-600">
              Last updated: December 3, 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
