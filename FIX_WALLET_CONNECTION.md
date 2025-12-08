# ⚠️ ПРОБЛЕМА: Не могу подключить Telegram Wallet

## Причина
**Localhost не работает в Telegram!**

Telegram Mini Apps требуют **публичный HTTPS URL** для:
- Загрузки приложения
- Подключения TON Connect кошелька
- Работы всех функций

## ✅ РЕШЕНИЕ

### Шаг 1: Установите cloudflared

Откройте **новый терминал** и выполните:

```bash
# Если у вас есть Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Затем установите cloudflared
brew install cloudflared
```

**ИЛИ** скачайте напрямую:
- macOS Intel: https://github.com/cloudflare/cloudflared/releases/download/2024.11.1/cloudflared-darwin-amd64.tgz
- macOS ARM (M1/M2): https://github.com/cloudflare/cloudflared/releases/download/2024.11.1/cloudflared-darwin-arm64.tgz

### Шаг 2: Запустите Dev Server

В **первом терминале**:
```bash
cd "/Users/apple/VS projects/Ton Shield/ton-shield-tma"
npm run dev
```

Дождитесь: `✓ Ready in XXXms`

### Шаг 3: Создайте публичный туннель

В **втором терминале**:
```bash
cloudflared tunnel --url http://localhost:3000
```

Вы получите URL типа:
```
https://random-word-1234.trycloudflare.com
```

**СКОПИРУЙТЕ ЭТОТ URL!**

### Шаг 4: Обновите конфигурацию

1. Откройте `.env.local` и измените:
```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_TON_MANIFEST_URL=https://YOUR-TUNNEL-URL.trycloudflare.com/tonconnect-manifest.json
```

2. Откройте `public/tonconnect-manifest.json` и измените:
```json
{
  "url": "https://YOUR-TUNNEL-URL.trycloudflare.com",
  "name": "TON Shield AI",
  "iconUrl": "https://YOUR-TUNNEL-URL.trycloudflare.com/icon.svg",
  "termsOfUseUrl": "https://YOUR-TUNNEL-URL.trycloudflare.com/terms",
  "privacyPolicyUrl": "https://YOUR-TUNNEL-URL.trycloudflare.com/privacy"
}
```

Замените `YOUR-TUNNEL-URL.trycloudflare.com` на ваш реальный URL!

### Шаг 5: Перезапустите приложение

Остановите `npm run dev` (Ctrl+C) и запустите снова:
```bash
npm run dev
```

### Шаг 6: Откройте в Telegram

Откройте ваш tunnel URL в **Telegram Web** или создайте Mini App:

**Telegram Web:**
```
https://web.telegram.org
```

Затем откройте URL из cloudflared

**ИЛИ создайте Mini App через @BotFather:**
```
/newapp
- Выберите бота (или создайте /newbot)
- Название: TON Shield AI  
- Описание: Security scanner for TON
- URL: https://YOUR-TUNNEL-URL.trycloudflare.com
- Short name: tonshield
```

## 🎉 Теперь TON Connect заработает!

После этих шагов вы сможете:
- ✅ Подключить Tonkeeper
- ✅ Подключить Telegram Wallet
- ✅ Подключить MyTonWallet
- ✅ Использовать все функции приложения

## 🆘 Альтернативные решения

### Вариант 2: ngrok
```bash
# Установите
brew install ngrok

# Запустите (нужна регистрация на ngrok.com)
ngrok http 3000
```

### Вариант 3: Deploy на Vercel
```bash
# 1. Push на GitHub
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR-REPO-URL
git push -u origin main

# 2. Перейдите на vercel.com
# 3. Import проект
# 4. Deploy автоматически
```

## 📞 Нужна помощь?

Если что-то не работает:
1. Проверьте что dev server запущен: `http://localhost:3000`
2. Проверьте что tunnel работает: откройте tunnel URL в браузере
3. Проверьте манифест: `https://YOUR-URL/tonconnect-manifest.json`
4. Убедитесь что используете HTTPS, а не HTTP

---

**Коротко:**
1. Установите cloudflared
2. Запустите: `cloudflared tunnel --url http://localhost:3000`
3. Обновите URLs в .env.local и tonconnect-manifest.json
4. Перезапустите npm run dev
5. Откройте tunnel URL в Telegram

Готово! 🚀
