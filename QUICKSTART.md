# TON Shield TMA - Quick Start Guide

## ✅ Что было создано

Полноценный **Telegram Mini App** для TON Shield с следующими компонентами:

### 📱 Страницы (Phase 1 MVP - Complete)

1. **Home Page** (`/`) - Scanner с quick actions
2. **Link Scanner** (`/check/link`) - Проверка URL
3. **Transaction Check** (`/check/transaction`) - Анализ транзакций
4. **Address Check** (`/check/address`) - Проверка адресов
5. **Jetton Analysis** (`/check/jetton`) - Анализ токенов
6. **Dashboard** (`/dashboard`) - Статистика и история
7. **Settings** (`/settings`) - Настройки пользователя

### 🎯 Компоненты

- `RiskBadge` - Отображение уровня риска
- `HistoryList` - Список истории проверок
- `StatsOverview` - Обзор статистики
- `Navigation` - Нижняя навигация

### 🔧 Инфраструктура

- **API Client** (`lib/api/client.ts`) - Типизированный клиент для backend API
- **Types** (`lib/api/types.ts`) - TypeScript типы для всех API endpoints
- **Hooks**:
  - `useTelegram` - Интеграция с Telegram WebApp
  - `useAnalyze` - Хуки для анализа (link, transaction, address, jetton)
  - `useDashboard` - Хуки для dashboard и истории
- **Providers**:
  - `TonConnectProvider` - TON Connect интеграция
  - `TelegramProvider` - Telegram WebApp провайдер
- **Utils** (`lib/utils.ts`) - Вспомогательные функции

---

## 🚀 Как запустить

### 1. Backend API (должен быть запущен)

В отдельном терминале:
```bash
cd "/Users/apple/VS projects/Ton Shield"
npm run dev
```

Backend должен работать на `http://localhost:3000`

### 2. Frontend (уже запущен)

```bash
cd "/Users/apple/VS projects/Ton Shield/ton-shield-tma"
npm run dev
```

Открыть: **http://localhost:3000**

---

## 🧪 Тестирование

### Локальное тестирование (в браузере)

1. Откройте http://localhost:3000
2. **Важно**: Telegram WebApp API не будет работать в обычном браузере
3. Для тестирования без Telegram:
   - Раскомментируйте mock данные в `TelegramProvider`
   - Или используйте ngrok + Telegram Bot

### Тестирование в Telegram

1. **Установите ngrok** (если ещё нет):
```bash
brew install ngrok
# или
npm install -g ngrok
```

2. **Запустите ngrok**:
```bash
ngrok http 3000
```

Вы получите URL типа: `https://abc123.ngrok.io`

3. **Создайте Telegram Bot**:
   - Откройте [@BotFather](https://t.me/BotFather)
   - Создайте бота: `/newbot`
   - Настройте Web App: `/newapp`
   - Укажите ngrok URL как Web App URL

4. **Обновите manifest**:
   
   В `public/tonconnect-manifest.json` замените:
   ```json
   {
     "url": "https://abc123.ngrok.io",
     "name": "TON Shield AI",
     "iconUrl": "https://abc123.ngrok.io/icon.png"
   }
   ```

5. **Откройте бота в Telegram** и запустите Web App

---

## 📝 Конфигурация

### Environment Variables (`.env.local`)

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3000

# TON Connect Manifest URL (обновите для production)
NEXT_PUBLIC_TON_MANIFEST_URL=https://yourapp.com/tonconnect-manifest.json
```

### TON Connect Manifest (`public/tonconnect-manifest.json`)

Перед production деплоем обновите:
- `url` - ваш production URL
- `iconUrl` - URL иконки приложения (192x192px PNG)
- `termsOfUseUrl` - ссылка на Terms of Service
- `privacyPolicyUrl` - ссылка на Privacy Policy

---

## 🎨 Функционал по страницам

### Home (`/`)
- ✅ Quick action cards (Link, Transaction, Address, Jetton)
- ✅ TON Connect wallet button
- ✅ Recent activity (последние 3 проверки)
- ✅ Telegram user info display

### Link Scanner (`/check/link`)
- ✅ URL input с валидацией
- ✅ Scan button с loading state
- ✅ Risk level badge
- ✅ AI summary
- ✅ Risk signals list
- ✅ Share результата (Telegram)
- ✅ Haptic feedback

### Transaction Check (`/check/transaction`)
- ✅ Auto-fill user wallet (TON Connect)
- ✅ Target address input
- ✅ Amount input (TON)
- ✅ Origin domain (optional)
- ✅ Risk assessment
- ✅ Target account info
- ✅ Proceed/Cancel buttons

### Address Check (`/check/address`)
- ✅ Address input с валидацией
- ✅ Account info (type, balance, activity)
- ✅ Scam flag warning
- ✅ AI analysis
- ✅ Risk signals

### Jetton Analysis (`/check/jetton`)
- ✅ Jetton address input
- ✅ Popular tokens quick buttons (USDT, NOT)
- ✅ Metadata display (name, symbol, image)
- ✅ Stats (supply, holders)
- ✅ Admin address
- ✅ AI analysis

### Dashboard (`/dashboard`)
- ✅ Stats overview (total, safe, warning, critical)
- ✅ Risk timeline chart (30 days)
- ✅ Recent critical findings
- ✅ Filters (type, risk level)
- ✅ History list
- ✅ Refresh button

### Settings (`/settings`)
- ✅ User info (Telegram)
- ✅ Connected wallet
- ✅ Disconnect wallet button
- ✅ About info
- ✅ Version display

---

## 🔌 API Integration

Все API вызовы автоматически включают:
- `X-User-ID` header (из Telegram user.id)
- Content-Type: application/json
- Error handling

### Примеры API вызовов:

```typescript
import apiClient from '@/lib/api/client';

// Link scan
const result = await apiClient.analyzeLink('https://example.com');

// Transaction check
const txResult = await apiClient.analyzeTransaction({
  user_wallet: 'EQD...',
  target_address: 'EQD...',
  amount_nanoton: '1000000000' // 1 TON
});

// Dashboard
const dashboard = await apiClient.getDashboard(userId);

// History
const history = await apiClient.getHistory(userId, {
  limit: 20,
  offset: 0,
  type: 'link',
  risk_level: 'CRITICAL'
});
```

---

## 🎯 Следующие шаги (Phase 2 & 3)

### Phase 2 - Extended Features
- [ ] QR Scanner для адресов
- [ ] Deep links (tg://resolve?domain=tonshield&start=...)
- [ ] Watchlist (сохранение адресов)
- [ ] Pull-to-refresh
- [ ] Infinite scroll в History
- [ ] Search в History

### Phase 3 - Polish
- [ ] Animations (framer-motion)
- [ ] Error boundaries
- [ ] Loading skeletons
- [ ] Offline support (Service Worker)
- [ ] Analytics integration
- [ ] Multi-language (i18n)
- [ ] Dark mode
- [ ] Push notifications

---

## 🐛 Известные ограничения

1. **Telegram WebApp API**:
   - Не работает в обычном браузере
   - Требуется запуск через Telegram Bot
   - Для локальной разработки используйте ngrok

2. **TON Connect**:
   - Manifest URL должен быть HTTPS в production
   - Локально работает через ngrok

3. **API Client**:
   - User ID берётся из Telegram
   - Без Telegram нужно mock user ID

---

## 📦 Деплой

### Vercel (рекомендуется)

1. Push в GitHub:
```bash
cd "/Users/apple/VS projects/Ton Shield/ton-shield-tma"
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_REPO_URL
git push -u origin main
```

2. В [Vercel](https://vercel.com):
   - Import GitHub repository
   - Добавить Environment Variables:
     - `NEXT_PUBLIC_API_URL`
     - `NEXT_PUBLIC_TON_MANIFEST_URL`
   - Deploy

3. Обновить Telegram Bot WebApp URL на Vercel URL

---

## 🔧 Troubleshooting

### Ошибка: "Cannot find module '@/...'"
- Проверьте `tsconfig.json` paths
- Перезапустите TypeScript server в VS Code
- `npm run dev` заново

### Telegram WebApp не загружается
- Проверьте URL в Bot Settings
- Убедитесь что ngrok запущен
- Проверьте HTTPS

### API ошибки 404
- Проверьте что backend запущен
- Проверьте `NEXT_PUBLIC_API_URL`
- Откройте Network tab в DevTools

### TON Connect не работает
- Обновите manifest URL
- Проверьте что URL доступен
- Очистите кэш браузера

---

## ✅ Checklist готовности к production

- [ ] Backend API задеплоен и доступен
- [ ] `NEXT_PUBLIC_API_URL` указывает на production API
- [ ] TON Connect manifest обновлён с production URL
- [ ] Icon 192x192 добавлен
- [ ] Terms of Service страница создана
- [ ] Privacy Policy страница создана
- [ ] Telegram Bot создан и настроен
- [ ] Web App URL установлен в боте
- [ ] Тестирование в Telegram пройдено
- [ ] Analytics настроен (optional)
- [ ] Error tracking настроен (optional)

---

## 📚 Документация

- **API Документация**: `/docs/FRONTEND_API_GUIDE.md` (в backend проекте)
- **Quick Reference**: `/docs/QUICK_REFERENCE.md` (в backend проекте)
- **Next.js Docs**: https://nextjs.org/docs
- **TON Connect**: https://docs.ton.org/develop/dapps/ton-connect
- **Telegram WebApp**: https://core.telegram.org/bots/webapps

---

## 🎉 Готово!

Ваш TON Shield Telegram Mini App полностью настроен и готов к использованию!

**Текущий статус:**
- ✅ Phase 1 (MVP) - Complete
- ⏳ Phase 2 (Extended) - Pending
- ⏳ Phase 3 (Polish) - Pending

**Запущено:**
- ✅ Backend API - http://localhost:3000
- ✅ Frontend App - http://localhost:3000

**Следующие действия:**
1. Откройте http://localhost:3000 в браузере
2. Для Telegram: настройте ngrok + Bot
3. Тестируйте функционал
4. Добавляйте фичи из Phase 2/3

---

**Made with ❤️ by GitHub Copilot**
