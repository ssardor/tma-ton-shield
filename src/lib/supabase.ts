import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  telegram_id: number;
  username?: string;
  created_at: string;
};

export type SkiplistItem = {
  id: string;
  user_id: string | null;
  type: 'domain' | 'address';
  value: string;
  status: 'trusted' | 'scam' | 'suspicious';
  comment?: string;
  is_global: boolean;
  created_at: string;
};

export type SyncCode = {
  code: string;
  user_id: string | null;
  expires_at: string;
};
