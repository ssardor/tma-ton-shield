'use client';

import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { ReactNode, useMemo } from 'react';

const FALLBACK_APP_URL = process.env.NEXT_PUBLIC_APP_URL || '';

const resolveManifestUrl = () => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api/tonconnect/manifest`;
  }

  if (FALLBACK_APP_URL) {
    return `${FALLBACK_APP_URL}/api/tonconnect/manifest`;
  }

  return '/api/tonconnect/manifest';
};

export function TonConnectProvider({ children }: { children: ReactNode }) {
  const manifestUrl = useMemo(() => resolveManifestUrl(), []);

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      {children}
    </TonConnectUIProvider>
  );
}
