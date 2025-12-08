export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        
        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
            <p className="mb-3">We collect the following information:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Telegram user ID (for service functionality)</li>
              <li>Wallet addresses you connect (via TON Connect)</li>
              <li>Addresses, transactions, and links you analyze</li>
              <li>Analysis results and risk scores</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
            <p className="mb-3">Your information is used to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide security analysis services</li>
              <li>Maintain your history and statistics</li>
              <li>Improve our AI models and detection algorithms</li>
              <li>Prevent fraud and abuse of the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Data Storage</h2>
            <p>
              Your data is stored securely and is only accessible to you through your Telegram account. We implement industry-standard security measures to protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Data Sharing</h2>
            <p>
              We do not sell or share your personal information with third parties. Analysis results may be used in aggregate form (anonymized) to improve our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Wallet Connection</h2>
            <p>
              When you connect your wallet via TON Connect, we only receive your wallet address. We never have access to your private keys or ability to perform transactions on your behalf.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Access your data</li>
              <li>Request deletion of your data</li>
              <li>Disconnect your wallet at any time</li>
              <li>Stop using the service at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Cookies and Tracking</h2>
            <p>
              We use minimal tracking necessary for service functionality. We do not use third-party advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Changes to Privacy Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify users of any material changes through the Telegram Mini App.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us through our Telegram support channel.
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
