'use client';

import { ReactNode, useEffect } from 'react';
import { useTelegram } from '@/lib/hooks/useTelegram';
import apiClient from '@/lib/api/client';

export function TelegramProvider({ children }: { children: ReactNode }) {
  const { user, isReady } = useTelegram();

  useEffect(() => {
    if (isReady && user) {
      // Set user ID for API calls
      apiClient.setUserId(user.id.toString());
    }
  }, [isReady, user]);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-pulse text-gray-600">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
