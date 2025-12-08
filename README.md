# TON Shield Telegram Mini App

AI-powered security scanner for TON blockchain - Telegram Mini App frontend.

## 🚀 Features

- **Link Scanner** - Check URL safety with AI analysis
- **Transaction Check** - Analyze TON transfers before sending
- **Address Verification** - Check wallet/contract safety
- **Jetton Analysis** - Verify token safety and metadata
- **Dashboard** - View statistics and history
- **TON Connect** - Seamless wallet integration
- **Telegram Native** - Full Telegram WebApp integration

## 🛠️ Tech Stack

- **Next.js 14** (App Router)
- **TypeScript** (Strict mode)
- **Tailwind CSS** (Styling)
- **@tonconnect/ui-react** (TON wallet integration)
- **@twa-dev/sdk** (Telegram WebApp API)
- **Recharts** (Charts & graphs)
- **Lucide React** (Icons)

## 📋 Prerequisites

- Node.js 18+ installed
- Backend API running (see backend documentation)
- Telegram Bot Token (for testing)

## 🔧 Installation & Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   NEXT_PUBLIC_TON_MANIFEST_URL=https://yourapp.com/tonconnect-manifest.json
   ```

3. Start dev server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000

## 📱 Project Structure

See full documentation in the project for detailed structure and API integration.

Built with ❤️ for TON Community
