import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { RiskLevel } from './api/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format TON amount
export function formatTon(nanoton: string | number): string {
  const amount = typeof nanoton === 'string' ? BigInt(nanoton) : BigInt(nanoton);
  const ton = Number(amount) / 1e9;
  return ton.toFixed(4);
}

// Convert TON to nanoton
export function tonToNanoton(ton: string | number): string {
  const amount = typeof ton === 'string' ? parseFloat(ton) : ton;
  return Math.floor(amount * 1e9).toString();
}

// Validate TON address format
export function isValidTonAddress(address: string): boolean {
  // Basic validation: should be base64-like string
  const tonAddressRegex = /^[A-Za-z0-9_-]{48}$/;
  const ufAddressRegex = /^[UE]Q[A-Za-z0-9_-]{46}$/;
  return tonAddressRegex.test(address) || ufAddressRegex.test(address);
}

// Validate URL format or Telegram username
export function isValidUrl(url: string): boolean {
  // Принимаем Telegram username форматы:
  // @notcoin_bot
  // notcoin_bot
  // t.me/notcoin_bot
  // https://t.me/notcoin_bot
  if (url.startsWith('@') || url.match(/^[a-zA-Z0-9_]{5,32}$/)) {
    return true; // Telegram username
  }
  
  if (url.startsWith('t.me/')) {
    return true; // Short Telegram link
  }
  
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

// Normalize URL/username to full Telegram URL
export function normalizeUrl(input: string): string {
  // Если начинается с @, убираем @ и делаем t.me ссылку
  if (input.startsWith('@')) {
    return `https://t.me/${input.slice(1)}`;
  }
  
  // Если только username (без протокола и домена)
  if (input.match(/^[a-zA-Z0-9_]{5,32}$/)) {
    return `https://t.me/${input}`;
  }
  
  // Если короткая t.me ссылка
  if (input.startsWith('t.me/')) {
    return `https://${input}`;
  }
  
  // Иначе возвращаем как есть (уже полный URL)
  return input;
}

// Get risk level color
export function getRiskColor(riskLevel: RiskLevel): {
  bg: string;
  text: string;
  border: string;
} {
  switch (riskLevel) {
    case 'SAFE':
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-300',
      };
    case 'WARNING':
      return {
        bg: 'bg-amber-100',
        text: 'text-amber-800',
        border: 'border-amber-300',
      };
    case 'CRITICAL':
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-300',
      };
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-300',
      };
  }
}

// Get risk level icon
export function getRiskIcon(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case 'SAFE':
      return '✅';
    case 'WARNING':
      return '⚠️';
    case 'CRITICAL':
      return '🚨';
    default:
      return '❓';
  }
}

// Format date
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

// Shorten address for display
export function shortenAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

// Get percentage color
export function getPercentageColor(percentage: number): string {
  if (percentage >= 80) return 'text-green-600';
  if (percentage >= 40) return 'text-amber-600';
  return 'text-red-600';
}
