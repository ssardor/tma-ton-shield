#!/bin/bash

echo "🔧 TON Shield - Quick Tunnel Setup"
echo "=================================="
echo ""

# Проверяем запущен ли dev server
if ! lsof -i:3000 > /dev/null 2>&1; then
    echo "❌ Dev server не запущен на порту 3000"
    echo "Запустите: npm run dev"
    exit 1
fi

echo "✅ Dev server работает на localhost:3000"
echo ""

# Получаем локальный IP
LOCAL_IP=$(ipconfig getifaddr en0 || ipconfig getifaddr en1)
if [ -z "$LOCAL_IP" ]; then
    echo "⚠️  Не удалось определить локальный IP"
    LOCAL_IP="localhost"
fi

echo "📱 Варианты доступа:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Локально в браузере:"
echo "   http://localhost:3000"
echo ""
echo "2. Из других устройств в той же сети:"
echo "   http://$LOCAL_IP:3000"
echo ""
echo "⚠️  ВАЖНО: Для Telegram Mini App нужен HTTPS URL!"
echo ""
echo "3. Для Telegram используйте один из вариантов:"
echo ""
echo "   А) Cloudflare Tunnel (бесплатно, без регистрации):"
echo "      Установите: brew install cloudflared"
echo "      Запустите: cloudflared tunnel --url http://localhost:3000"
echo ""
echo "   Б) ngrok (требует регистрацию):"
echo "      Установите: brew install ngrok"
echo "      Запустите: ngrok http 3000"
echo ""
echo "   В) Deploy на Vercel (production):"
echo "      1. Push на GitHub"
echo "      2. Импортируйте на vercel.com"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📖 Подробная инструкция: TELEGRAM_WALLET_CONNECT.md"
echo ""
