# TON Connect Setup - Development Mode

## ✅ Исправлено

### 1. TON Connect Manifest
- Создан локальный манифест: `http://localhost:3000/tonconnect-manifest.json`
- Добавлена иконка: `/public/icon.svg`
- Созданы страницы Terms и Privacy

### 2. Mock API для разработки
Все API endpoints работают локально:
- `GET /api/v1/analyze/address/[address]` ✅
- `POST /api/v1/analyze/transaction` ✅
- `GET /api/v1/analyze/jetton/[address]` ✅
- `POST /api/v1/analyze/link` ✅
- `GET /api/v1/dashboard/[userId]` ✅
- `GET /api/v1/history/[userId]` ✅

### 3. Environment Configuration
```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_TON_MANIFEST_URL=http://localhost:3000/tonconnect-manifest.json
```

## 🔗 Подключение кошелька в Development

### Telegram Desktop/Web
1. Откройте приложение через: `http://localhost:3000`
2. TON Connect будет работать с локальным манифестом
3. Можно подключить Tonkeeper, MyTonWallet и другие кошельки

### Telegram Mini App (тестирование)
Для тестирования в реальном Telegram Mini App нужно:

1. **Использовать ngrok или cloudflared** для публичного URL:
   ```bash
   # Установить cloudflared
   brew install cloudflare/cloudflare/cloudflared
   
   # Создать tunnel
   cloudflared tunnel --url http://localhost:3000
   ```

2. **Обновить .env.local** с публичным URL:
   ```env
   NEXT_PUBLIC_API_URL=
   NEXT_PUBLIC_TON_MANIFEST_URL=https://your-tunnel-url.trycloudflare.com/tonconnect-manifest.json
   ```

3. **Обновить manifest** в `public/tonconnect-manifest.json`:
   ```json
   {
     "url": "https://your-tunnel-url.trycloudflare.com",
     "name": "TON Shield AI",
     "iconUrl": "https://your-tunnel-url.trycloudflare.com/icon.svg",
     "termsOfUseUrl": "https://your-tunnel-url.trycloudflare.com/terms",
     "privacyPolicyUrl": "https://your-tunnel-url.trycloudflare.com/privacy"
   }
   ```

4. **Создать Mini App в BotFather**:
   ```
   /newapp
   - Choose bot
   - Enter app title: TON Shield AI
   - Enter description
   - Enter photo (512x512)
   - Enter Web App URL: https://your-tunnel-url.trycloudflare.com
   - Enter short name: tonshield
   ```

## 🚀 Production Deploy

Для production на Render/Vercel:

1. Обновите `tonconnect-manifest.json` с production URL
2. Установите переменные окружения:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.com
   NEXT_PUBLIC_TON_MANIFEST_URL=https://your-app.com/tonconnect-manifest.json
   ```

## 📝 Доступные страницы

- `/` - Home (Scanner)
- `/check/link` - Link Scanner
- `/check/transaction` - Transaction Check
- `/check/address` - Address Check ✅ WORKING
- `/check/jetton` - Jetton Analysis
- `/dashboard` - Dashboard
- `/settings` - Settings
- `/terms` - Terms of Service ✅ NEW
- `/privacy` - Privacy Policy ✅ NEW

## 🧪 Тестирование

1. **Проверка адреса**:
   - Откройте http://localhost:3000/check/address
   - Введите любой TON адрес
   - Должен появиться результат с mock данными

2. **TON Connect**:
   - На главной странице нажмите TON Connect button
   - Выберите кошелек
   - Подтвердите подключение

3. **API endpoints**:
   ```bash
   # Test address check
   curl http://localhost:3000/api/v1/analyze/address/UQCnPGfxWK7jT5M1TgT8orWK6nSNPp9HMmQ7hYmpthpNN_fLB
   
   # Test manifest
   curl http://localhost:3000/tonconnect-manifest.json
   ```

## ✅ Что работает

- ✅ Mock API для всех endpoints
- ✅ TON Connect манифест
- ✅ Иконка приложения
- ✅ Terms и Privacy страницы
- ✅ Haptic feedback (с error handling)
- ✅ UI/UX с правильными цветами
- ✅ Все 7+ страниц приложения
