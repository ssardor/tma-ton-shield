# 🚀 Инструкция по деплою TON Shield Mini App

## Вариант 1: Деплой через Vercel Dashboard (БЕЗ Git) - САМЫЙ ПРОСТОЙ

### Шаг 1: Подготовка проекта
1. Убедитесь что проект собирается локально:
```bash
cd "/Users/apple/VS projects/Ton Shield/ton-shield-tma"
npm run build
```

2. Если сборка успешна, переходите к шагу 2

### Шаг 2: Создайте аккаунт на Vercel
1. Откройте https://vercel.com
2. Нажмите "Sign Up" (или "Login" если есть аккаунт)
3. Войдите через GitHub, GitLab или email

### Шаг 3: Деплой через Vercel CLI
1. Установите Vercel CLI (если ещё не установлен):
```bash
npm install -g vercel
```

2. Войдите в Vercel:
```bash
vercel login
```
- Откроется браузер для подтверждения
- Или введите email и подтвердите через письмо

3. Задеплойте проект:
```bash
cd "/Users/apple/VS projects/Ton Shield/ton-shield-tma"
vercel
```

4. Ответьте на вопросы:
   - Set up and deploy? → **Y** (Yes)
   - Which scope? → Выберите ваш аккаунт
   - Link to existing project? → **N** (No)
   - What's your project's name? → **ton-shield-tma** (или другое имя)
   - In which directory is your code located? → **./** (оставьте пустым)
   - Want to override the settings? → **N** (No)

5. Дождитесь завершения деплоя. Вы получите URL вида:
   ```
   https://ton-shield-tma-xxxx.vercel.app
   ```

6. Для production деплоя выполните:
```bash
vercel --prod
```

### Шаг 4: Настройте переменные окружения в Vercel
1. Откройте https://vercel.com/dashboard
2. Найдите ваш проект "ton-shield-tma"
3. Перейдите в Settings → Environment Variables
4. Добавьте переменные:

**ОБЯЗАТЕЛЬНЫЕ:**
- `NEXT_PUBLIC_API_URL` = `https://ton-shield.onrender.com`
- `TELEGRAM_BOT_TOKEN` = `8405351343:AAHqlFzCWv2PRNXcZVunZhw-6Ths05xPyos`

**ОПЦИОНАЛЬНЫЕ:**
- `NEXT_PUBLIC_APP_URL` = (автоматически определится Vercel)

5. Нажмите "Save"
6. Сделайте redeploy:
```bash
vercel --prod
```

---

## Вариант 2: Деплой через GitHub + Vercel (РЕКОМЕНДУЕТСЯ)

### Шаг 1: Инициализируйте Git репозиторий
```bash
cd "/Users/apple/VS projects/Ton Shield/ton-shield-tma"
git init
git add .
git commit -m "Initial commit: TON Shield Mini App"
```

### Шаг 2: Создайте репозиторий на GitHub
1. Откройте https://github.com/new
2. Назовите репозиторий: **ton-shield-tma**
3. Сделайте его **Private** (для безопасности токенов)
4. НЕ добавляйте README, .gitignore, license
5. Нажмите "Create repository"

### Шаг 3: Загрузите код на GitHub
```bash
git remote add origin https://github.com/ВАШ_USERNAME/ton-shield-tma.git
git branch -M main
git push -u origin main
```

### Шаг 4: Подключите Vercel к GitHub
1. Откройте https://vercel.com/new
2. Нажмите "Import Git Repository"
3. Выберите "Import from GitHub"
4. Найдите репозиторий **ton-shield-tma**
5. Нажмите "Import"

### Шаг 5: Настройте проект в Vercel
1. **Project Name:** ton-shield-tma
2. **Framework Preset:** Next.js (автоопределение)
3. **Root Directory:** ./
4. **Build Command:** npm run build
5. **Output Directory:** .next
6. **Install Command:** npm install

### Шаг 6: Добавьте переменные окружения
В разделе "Environment Variables":
- `NEXT_PUBLIC_API_URL` = `https://ton-shield.onrender.com`
- `TELEGRAM_BOT_TOKEN` = `8405351343:AAHqlFzCWv2PRNXcZVunZhw-6Ths05xPyos`

### Шаг 7: Нажмите "Deploy"
Дождитесь завершения деплоя (2-5 минут)

---

## Этап 2: Настройка Telegram Bot

После успешного деплоя на Vercel, вы получите URL:
```
https://ton-shield-tma-xxxx.vercel.app
```

### Шаг 1: Обновите webhook Telegram Bot
```bash
curl -X POST "https://api.telegram.org/bot8405351343:AAHqlFzCWv2PRNXcZVunZhw-6Ths05xPyos/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://ВАШ_ДОМЕН.vercel.app/api/telegram/webhook",
    "allowed_updates": ["message", "callback_query"]
  }'
```

Замените `ВАШ_ДОМЕН.vercel.app` на реальный домен от Vercel.

### Шаг 2: Настройте Mini App в @BotFather
1. Откройте Telegram → найдите @BotFather
2. Отправьте команду: `/mybots`
3. Выберите бота: **@Ton_shield_ai_bot**
4. Нажмите "Bot Settings" → "Menu Button"
5. Выберите "Configure Menu Button"
6. Введите URL: `https://ВАШ_ДОМЕН.vercel.app`
7. Введите текст кнопки: "🛡️ Open Shield"

### Шаг 3: Проверьте настройку
```bash
curl "https://api.telegram.org/bot8405351343:AAHqlFzCWv2PRNXcZVunZhw-6Ths05xPyos/getWebhookInfo"
```

Ответ должен показывать:
```json
{
  "ok": true,
  "result": {
    "url": "https://ВАШ_ДОМЕН.vercel.app/api/telegram/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

---

## Этап 3: Тестирование

### Шаг 1: Откройте бота в Telegram
1. Найдите @Ton_shield_ai_bot
2. Нажмите "Start"
3. Нажмите кнопку меню или используйте inline кнопку "🚀 Launch Mini App"

### Шаг 2: Проверьте функциональность
- ✅ Главная страница загружается
- ✅ Подключение кошелька работает
- ✅ Сканирование работает
- ✅ История транзакций загружается
- ✅ Wallet Connections показывают данные

### Шаг 3: Поделитесь ботом
Дайте другим людям ссылку:
```
https://t.me/Ton_shield_ai_bot
```

---

## Этап 4: Мониторинг и Отладка

### Просмотр логов Vercel
```bash
vercel logs https://ВАШ_ДОМЕН.vercel.app --follow
```

Или в Dashboard:
1. Откройте https://vercel.com/dashboard
2. Выберите проект → Deployments → Latest → View Function Logs

### Проверка статуса API
```bash
curl https://ВАШ_ДОМЕН.vercel.app/api/health
```

### Проверка манифеста
```bash
curl https://ВАШ_ДОМЕН.vercel.app/tonconnect-manifest.json
```

---

## 🔧 Возможные проблемы и решения

### Проблема 1: "Build failed"
**Решение:** Проверьте логи сборки в Vercel Dashboard
```bash
npm run build
```
Исправьте ошибки TypeScript/ESLint локально, затем задеплойте снова.

### Проблема 2: "ENV variables not working"
**Решение:** 
1. Проверьте что переменные добавлены в Vercel Dashboard
2. Переменные должны начинаться с `NEXT_PUBLIC_` для доступа в браузере
3. После добавления переменных сделайте redeploy

### Проблема 3: "Telegram webhook не работает"
**Решение:**
```bash
# Удалите webhook
curl -X POST "https://api.telegram.org/bot8405351343:AAHqlFzCWv2PRNXcZVunZhw-6Ths05xPyos/deleteWebhook"

# Установите заново
curl -X POST "https://api.telegram.org/bot8405351343:AAHqlFzCWv2PRNXcZVunZhw-6Ths05xPyos/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://ВАШ_ДОМЕН.vercel.app/api/telegram/webhook"}'
```

### Проблема 4: "CORS errors"
**Решение:** Убедитесь что в `next.config.ts` настроены правильные headers.

### Проблема 5: "Mini App не открывается в Telegram"
**Решение:**
1. Проверьте что URL в BotFather корректный
2. URL должен быть HTTPS (Vercel автоматически добавляет SSL)
3. Проверьте манифест: https://ВАШ_ДОМЕН.vercel.app/tonconnect-manifest.json

---

## 📝 Checklist для деплоя

- [ ] Проект собирается локально (`npm run build`)
- [ ] Создан аккаунт на Vercel
- [ ] Код загружен на GitHub (опционально)
- [ ] Проект задеплоен на Vercel
- [ ] Переменные окружения добавлены в Vercel
- [ ] Получен production URL от Vercel
- [ ] Telegram webhook обновлён на production URL
- [ ] BotFather настроен с production URL
- [ ] Mini App тестируется в Telegram
- [ ] Функции работают корректно
- [ ] Поделились ссылкой с тестерами

---

## 🎉 Готово!

Теперь любой человек может:
1. Открыть https://t.me/Ton_shield_ai_bot
2. Нажать "Start"
3. Запустить Mini App
4. Протестировать все функции TON Shield

**Production URL:** https://ВАШ_ДОМЕН.vercel.app
**Bot Link:** https://t.me/Ton_shield_ai_bot
