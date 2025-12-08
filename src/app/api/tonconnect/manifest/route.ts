import { NextRequest, NextResponse } from 'next/server';

const FALLBACK_NAME = 'TON Shield AI';
const FALLBACK_DESCRIPTION = 'AI-powered security scanner for TON blockchain';
const FALLBACK_ICON_PATH = '/icon.svg';
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1']);

const resolveOrigin = (request: NextRequest) => {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto');

  if (forwardedHost) {
    const host = forwardedHost.split(',')[0]?.trim();
    const hostnameOnly = host?.split(':')[0]?.toLowerCase();
    if (host && hostnameOnly && !LOCAL_HOSTNAMES.has(hostnameOnly)) {
      const proto = forwardedProto?.split(',')[0]?.trim() || 'https';
      return `${proto}://${host}`;
    }
  }

  const originUrl = new URL(request.nextUrl.origin);
  if (!LOCAL_HOSTNAMES.has(originUrl.hostname.toLowerCase())) {
    return originUrl.origin;
  }

  const hostHeader = request.headers.get('host');
  if (hostHeader) {
    const hostnameOnly = hostHeader.split(':')[0]?.toLowerCase();
    if (hostnameOnly && !LOCAL_HOSTNAMES.has(hostnameOnly)) {
      const proto = forwardedProto?.split(',')[0]?.trim() || 'https';
      return `${proto}://${hostHeader}`;
    }
  }

  return originUrl.origin;
};

export async function GET(request: NextRequest) {
  const derivedOrigin = resolveOrigin(request);
  const publicUrl = process.env.NEXT_PUBLIC_APP_URL || derivedOrigin;

  const manifest = {
    url: publicUrl,
    name: FALLBACK_NAME,
    iconUrl: `${publicUrl}${FALLBACK_ICON_PATH}`,
    termsOfUseUrl: `${publicUrl}/terms`,
    privacyPolicyUrl: `${publicUrl}/privacy`,
    description: FALLBACK_DESCRIPTION,
  };

  return NextResponse.json(manifest, {
    headers: {
      'Cache-Control': 'public, max-age=600, stale-while-revalidate=86400',
    },
  });
}
