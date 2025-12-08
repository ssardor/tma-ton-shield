import { NextRequest, NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export async function GET(request: NextRequest) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    
    if (!appUrl) {
      return NextResponse.json({
        error: 'NEXT_PUBLIC_APP_URL not set. Please set it to your tunnel or deployed URL.',
        example: 'NEXT_PUBLIC_APP_URL=https://your-tunnel.trycloudflare.com'
      }, { status: 400 });
    }

    const results: any = {
      app_url: appUrl,
      bot_token: TELEGRAM_BOT_TOKEN ? '✅ Set' : '❌ Not set',
      steps: []
    };

    // Step 1: Set bot commands
    const commandsResponse = await fetch(`${TELEGRAM_API}/setMyCommands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        commands: [
          { command: 'start', description: '🚀 Launch TON Shield' },
          { command: 'help', description: '❓ Get help and info' }
        ]
      })
    });
    const commandsData = await commandsResponse.json();
    results.steps.push({
      step: 1,
      name: 'Set Bot Commands',
      success: commandsData.ok,
      data: commandsData
    });

    // Step 2: Set webhook
    const webhookUrl = `${appUrl}/api/telegram/webhook`;
    const webhookResponse = await fetch(`${TELEGRAM_API}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        url: webhookUrl,
        allowed_updates: ['message', 'callback_query']
      })
    });
    const webhookData = await webhookResponse.json();
    results.steps.push({
      step: 2,
      name: 'Set Webhook',
      webhook_url: webhookUrl,
      success: webhookData.ok,
      data: webhookData
    });

    // Step 3: Set bot menu button (Mini App)
    const menuButtonResponse = await fetch(`${TELEGRAM_API}/setChatMenuButton`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        menu_button: {
          type: 'web_app',
          text: '🛡️ TON Shield',
          web_app: { url: appUrl }
        }
      })
    });
    const menuButtonData = await menuButtonResponse.json();
    results.steps.push({
      step: 3,
      name: 'Set Menu Button (Mini App)',
      success: menuButtonData.ok,
      data: menuButtonData
    });

    // Step 4: Get bot info
    const botInfoResponse = await fetch(`${TELEGRAM_API}/getMe`);
    const botInfo = await botInfoResponse.json();
    results.bot_info = botInfo.result;

    // Step 5: Get webhook info
    const webhookInfoResponse = await fetch(`${TELEGRAM_API}/getWebhookInfo`);
    const webhookInfo = await webhookInfoResponse.json();
    results.webhook_info = webhookInfo.result;

    results.success = results.steps.every((s: any) => s.success);
    results.message = results.success 
      ? '✅ Bot successfully configured! Open your bot and tap /start'
      : '⚠️ Some steps failed. Check the details above.';

    return NextResponse.json(results, { status: results.success ? 200 : 500 });
  } catch (error: any) {
    console.error('Setup error:', error);
    return NextResponse.json({ 
      error: 'Failed to setup bot',
      details: error.message 
    }, { status: 500 });
  }
}
