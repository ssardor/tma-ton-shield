import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle incoming updates from Telegram
    if (body.message) {
      const chatId = body.message.chat.id;
      const text = body.message.text;
      const from = body.message.from;

      // Handle /start command with potential auth token
      if (text && text.startsWith('/start')) {
        const parts = text.split(' ');
        const authToken = parts.length > 1 ? parts[1] : null;

        let profileId = null;

        // 1. Create or get user profile
        if (from) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .upsert(
              { 
                telegram_id: from.id, 
                username: from.username || from.first_name || 'user' 
              }, 
              { onConflict: 'telegram_id' }
            )
            .select()
            .single();

          if (!profileError && profile) {
            profileId = profile.id;
          } else {
            console.error('Profile upsert error:', profileError);
          }
        }

        // 2. If auth token exists, link it to the user
        if (authToken && authToken.startsWith('auth_') && profileId) {
          const { error: syncError } = await supabase
            .from('sync_codes')
            .update({ user_id: profileId })
            .eq('code', authToken);

          if (!syncError) {
            await fetch(`${TELEGRAM_API}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                text: '✅ **Magic Sync Successful!**\n\nYour browser extension has been linked to your Telegram account. You can now close this chat and return to the extension.',
                parse_mode: 'Markdown'
              })
            });
          } else {
            console.error('Sync update error:', syncError);
            await fetch(`${TELEGRAM_API}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                text: '❌ **Sync Failed**\n\nThe sync token is invalid or has expired. Please try again from the extension.'
              })
            });
          }
        } else {
          // Default start message
          await fetch(`${TELEGRAM_API}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: '🛡️ **Welcome to TON Shield!**\n\nYour AI-powered security scanner for TON blockchain.\n\n🔹 Analyze addresses\n🔹 Check transactions\n🔹 Verify tokens\n🔹 Scan links\n\nTap the button below to open the app! 👇',
              parse_mode: 'Markdown',
              reply_markup: {
                inline_keyboard: [[
                  {
                    text: '🚀 Open TON Shield',
                    web_app: { url: process.env.NEXT_PUBLIC_APP_URL || 'https://your-app-url.com' }
                  }
                ]]
              }
            })
          });
        }
      }

      // Handle /help command
      if (text === '/help') {
        await fetch(`${TELEGRAM_API}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: '🛡️ TON Shield Help\n\n' +
                  '📱 Use /start to open the app\n' +
                  '🔍 Analyze TON addresses, transactions, tokens, and links\n' +
                  '🤖 AI-powered scam detection\n' +
                  '⚡ Real-time blockchain data\n\n' +
                  'Stay safe in the TON ecosystem!'
          })
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// GET endpoint to set webhook
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    if (action === 'set') {
      // Set webhook URL
      const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/telegram/webhook`;
      
      const response = await fetch(`${TELEGRAM_API}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: webhookUrl })
      });

      const data = await response.json();
      return NextResponse.json(data);
    }

    if (action === 'info') {
      // Get webhook info
      const response = await fetch(`${TELEGRAM_API}/getWebhookInfo`);
      const data = await response.json();
      return NextResponse.json(data);
    }

    if (action === 'delete') {
      // Delete webhook
      const response = await fetch(`${TELEGRAM_API}/deleteWebhook`);
      const data = await response.json();
      return NextResponse.json(data);
    }

    if (action === 'commands') {
      // Set bot commands
      const response = await fetch(`${TELEGRAM_API}/setMyCommands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commands: [
            { command: 'start', description: '🚀 Launch TON Shield' },
            { command: 'help', description: '❓ Get help' }
          ]
        })
      });

      const data = await response.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ 
      message: 'TON Shield Telegram Bot API',
      available_actions: ['set', 'info', 'delete', 'commands']
    });
  } catch (error) {
    console.error('Telegram API error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
