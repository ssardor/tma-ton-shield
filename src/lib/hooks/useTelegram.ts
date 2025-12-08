'use client';

import { useEffect, useState } from 'react';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

export interface UseTelegramResult {
  user: TelegramUser | null;
  webApp: any | null;
  isReady: boolean;
  showMainButton: (text: string, onClick: () => void) => void;
  hideMainButton: () => void;
  showBackButton: (onClick: () => void) => void;
  hideBackButton: () => void;
  hapticFeedback: (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => void;
  share: (url: string, text?: string) => void;
}

export function useTelegram(): UseTelegramResult {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [webApp, setWebApp] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Динамический импорт только на клиенте
      import('@twa-dev/sdk').then((WebAppModule) => {
        const WebApp = WebAppModule.default;
        setWebApp(WebApp);
        
        WebApp.ready();
        WebApp.expand();
        
        // Get user data
        const initDataUnsafe = WebApp.initDataUnsafe;
        if (initDataUnsafe.user) {
          setUser(initDataUnsafe.user as TelegramUser);
        }

        setIsReady(true);
      });
    }
  }, []);

  const showMainButton = (text: string, onClick: () => void) => {
    if (!webApp) return;
    webApp.MainButton.setText(text);
    webApp.MainButton.onClick(onClick);
    webApp.MainButton.show();
  };

  const hideMainButton = () => {
    if (!webApp) return;
    webApp.MainButton.hide();
  };

  const showBackButton = (onClick: () => void) => {
    if (!webApp) return;
    webApp.BackButton.onClick(onClick);
    webApp.BackButton.show();
  };

  const hideBackButton = () => {
    if (!webApp) return;
    webApp.BackButton.hide();
  };

  const hapticFeedback = (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => {
    if (!webApp || !webApp.HapticFeedback) return;
    
    try {
      if (type === 'light' || type === 'medium' || type === 'heavy') {
        if (webApp.HapticFeedback.impactOccurred) {
          webApp.HapticFeedback.impactOccurred(type);
        }
      } else {
        if (webApp.HapticFeedback.notificationOccurred) {
          webApp.HapticFeedback.notificationOccurred(
            type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'error'
          );
        }
      }
    } catch (error) {
      // Haptic feedback not supported in this version
      console.debug('Haptic feedback not supported');
    }
  };

  const share = (url: string, text?: string) => {
    if (!webApp) return;
    const shareUrl = text 
      ? `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
      : `https://t.me/share/url?url=${encodeURIComponent(url)}`;
    webApp.openTelegramLink(shareUrl);
  };

  return {
    user,
    webApp,
    isReady,
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
    hapticFeedback,
    share,
  };
}
