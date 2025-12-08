# 🛡️ TON Shield - Telegram Bot Integration

Ваш бот **@Ton_shield_ai_bot** успешно настроен и подключен к Mini App!

## ✅ Статус настройки

- **Bot Token**: ✅ Установлен
- **Webhook**: ✅ Активен
- **Menu Button**: ✅ Mini App добавлена
- **Commands**: ✅ /start, /help

## 🤖 Информация о боте

- **Username**: @Ton_shield_ai_bot
- **ID**: 8405351343
- **Name**: Ton shield

## 🚀 Как использовать

### 1. Откройте бота в Telegram
```
https://t.me/Ton_shield_ai_bot
```

### 2. Нажмите /start
Бот отправит приветственное сообщение с кнопкой для запуска Mini App

### 3. Нажмите "🛡️ TON Shield"
Откроется Mini App с полным функционалом:
- 🔍 Анализ адресов
- 💰 Проверка токенов (Jettons)
- 🔗 Сканирование ссылок
- 📊 Проверка транзакций

## 📱 Доступные команды

- `/start` - Запустить бота и открыть Mini App
- `/help` - Получить справку

## 🔧 Технические детали

### Webhook URL
```
https://manufacturers-corporate-iowa-bid.trycloudflare.com/api/telegram/webhook
```

### API Endpoints

#### Setup Bot (автоматическая настройка)
```bash
GET https://manufacturers-corporate-iowa-bid.trycloudflare.com/api/telegram/setup
```

#### Webhook Actions
```bash
# Проверить webhook
GET /api/telegram/webhook?action=info

# Установить webhook
GET /api/telegram/webhook?action=set

# Удалить webhook
GET /api/telegram/webhook?action=delete

# Установить команды
GET /api/telegram/webhook?action=commands
```

## 🌐 Текущие URL

- **Mini App**: https://manufacturers-corporate-iowa-bid.trycloudflare.com
- **Backend API**: https://ton-shield.onrender.com
- **Local Dev**: http://localhost:3001

## ⚙️ Настройка (.env.local)

```bash
NEXT_PUBLIC_API_URL=https://ton-shield.onrender.com
NEXT_PUBLIC_APP_URL=https://manufacturers-corporate-iowa-bid.trycloudflare.com
TELEGRAM_BOT_TOKEN=8405351343:AAHqlFzCWv2PRNXcZVunZhw-6Ths05xPyos
```

## 🔄 Перезапуск туннеля

При перезапуске cloudflared URL туннеля меняется. Нужно:

1. Получить новый URL из логов:
```bash
cat /tmp/cloudflared.log | grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' | head -1
```

2. Обновить `.env.local`:
```bash
NEXT_PUBLIC_APP_URL=<новый_url>
```

3. Перенастроить бота:
```bash
curl https://<новый_url>/api/telegram/setup
```

## 📝 Примечания

- Cloudflare туннель без аккаунта не гарантирует uptime
- Для production рекомендуется deploy на Vercel/Render
- Webhook автоматически обрабатывает команды /start и /help
- Mini App открывается через Menu Button (кнопка слева от поля ввода)

## 🎯 Следующие шаги

1. ✅ Откройте @Ton_shield_ai_bot в Telegram
2. ✅ Нажмите /start
3. ✅ Используйте Mini App для анализа

---

**Bot configured successfully!** 🚀
