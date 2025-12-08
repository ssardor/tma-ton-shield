# 🔗 Как подключить Telegram Wallet

## ⚠️ Важно!

**Localhost НЕ РАБОТАЕТ для TON Connect в Telegram Mini App!**

Telegram требует **публичный HTTPS URL** для подключения кошелька.

## 🚀 Решения

### Вариант 1: Используйте Cloudflare Tunnel (Рекомендуется)

1. **Установите cloudflared:**
   ```bash
   brew install cloudflare/cloudflare/cloudflared
   ```

2. **Запустите туннель:**
   ```bash
   cloudflared tunnel --url http://localhost:3000
   ```
   
   Вы получите URL вида: `https://random-name.trycloudflare.com`

3. **Обновите `.env.local`:**
   ```env
   NEXT_PUBLIC_API_URL=
   NEXT_PUBLIC_TON_MANIFEST_URL=https://your-tunnel-url.trycloudflare.com/tonconnect-manifest.json
   ```

4. **Обновите `public/tonconnect-manifest.json`:**
   ```json
   {
     "url": "https://your-tunnel-url.trycloudflare.com",
     "name": "TON Shield AI",
     "iconUrl": "https://your-tunnel-url.trycloudflare.com/icon.svg",
     "termsOfUseUrl": "https://your-tunnel-url.trycloudflare.com/terms",
     "privacyPolicyUrl": "https://your-tunnel-url.trycloudflare.com/privacy"
   }
   ```

5. **Перезапустите dev server:**
   ```bash
   npm run dev
   ```

6. **Откройте приложение** через tunnel URL в Telegram Web

### Вариант 2: Используйте ngrok

1. **Установите ngrok:**
   ```bash
   brew install ngrok
   ```

2. **Запустите туннель:**
   ```bash
   ngrok http 3000
   ```

3. **Используйте HTTPS URL** из ngrok (например: `https://abc123.ngrok.io`)

4. **Обновите манифест и .env** как в варианте 1

### Вариант 3: Deploy на Vercel (Production)

1. **Push код на GitHub:**
   ```bash
   git init
   git add .
   git commit -m "TON Shield TMA"
   git push
   ```

2. **Deploy на Vercel:**
   - Зайдите на vercel.com
   - Import проект из GitHub
   - Добавьте переменные окружения:
     ```
     NEXT_PUBLIC_API_URL=
     NEXT_PUBLIC_TON_MANIFEST_URL=https://your-app.vercel.app/tonconnect-manifest.json
     ```

3. **Обновите манифест** с production URL

4. **Создайте Telegram Mini App** через @BotFather

## 📱 Создание Telegram Mini App

После того как у вас есть публичный URL:

1. **Откройте @BotFather в Telegram**

2. **Создайте новое приложение:**
   ```
   /newapp
   ```

3. **Заполните информацию:**
   - Выберите вашего бота (или создайте нового)
   - Название: `TON Shield AI`
   - Описание: `AI-powered security scanner for TON blockchain`
   - Фото: Загрузите иконку 512x512
   - Web App URL: `https://your-public-url.com`
   - Short name: `tonshield`

4. **Откройте Mini App:**
   ```
   https://t.me/your_bot/tonshield
   ```

## 🧪 Быстрое тестирование

**Пока у вас нет публичного URL, вы можете:**

1. ✅ Тестировать UI в браузере: `http://localhost:3000`
2. ✅ Проверять работу API с mock данными
3. ✅ Тестировать все страницы
4. ❌ НО кошелек подключить НЕ получится (нужен HTTPS)

## 🔧 Текущие настройки

**Для локальной разработки (localhost:3000):**
- Mock API работает ✅
- UI/UX работает ✅
- Все страницы доступны ✅
- TON Connect работает только в браузере (не в Telegram) ⚠️

**Для работы в Telegram:**
- Нужен публичный HTTPS URL 🔒
- Обновить манифест и .env
- Создать Mini App через @BotFather

## 💡 Рекомендация

**Для быстрого старта:**
```bash
# 1. Установите cloudflared
brew install cloudflare/cloudflare/cloudflared

# 2. В одном терминале запустите dev server
npm run dev

# 3. В другом терминале запустите tunnel
cloudflared tunnel --url http://localhost:3000

# 4. Скопируйте полученный URL (https://xxx.trycloudflare.com)

# 5. Обновите файлы (см. выше)

# 6. Перезапустите npm run dev

# 7. Откройте tunnel URL в Telegram Web
```

Теперь TON Connect будет работать! 🎉
