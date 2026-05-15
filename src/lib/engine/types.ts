// ============================================================
// TON Shield Risk Engine — Internal Types
// ============================================================

// ---------- TON API Response Types ----------

export interface TonApiAccount {
  address: string;
  balance: number;
  last_activity: number; // unix timestamp
  status: 'active' | 'uninit' | 'frozen' | 'nonexist';
  interfaces?: string[];
  name?: string;
  is_scam: boolean;
  is_wallet: boolean;
  memo_required?: boolean;
  get_methods?: string[];
  icon?: string;
}

export interface TonApiJetton {
  mintable: boolean;
  total_supply: string;
  admin?: {
    address: string;
    is_scam: boolean;
    is_wallet: boolean;
    name?: string;
  } | null;
  metadata: {
    address: string;
    name: string;
    symbol: string;
    decimals: string;
    image?: string;
    description?: string;
  };
  preview?: string;
  verification: 'whitelist' | 'blacklist' | 'none';
  holders_count: number;
  interfaces?: string[];
}

export interface TonApiHolder {
  address: string;
  owner: {
    address: string;
    name?: string;
    is_scam: boolean;
    is_wallet: boolean;
    icon?: string;
  };
  balance: string;
}

export interface TonApiHoldersResponse {
  addresses: TonApiHolder[];
  total: number;
}

export interface TonApiEvent {
  event_id: string;
  timestamp: number;
  actions: TonApiAction[];
  is_scam: boolean;
  lt: number;
  in_progress: boolean;
}

export interface TonApiAction {
  type: string;
  status: string;
  simple_preview: {
    name: string;
    description: string;
    accounts?: Array<{
      address: string;
      is_scam: boolean;
      is_wallet: boolean;
      name?: string;
    }>;
  };
  TonTransfer?: {
    sender: TonApiAccountRef;
    recipient: TonApiAccountRef;
    amount: number;
    comment?: string;
  };
  JettonTransfer?: {
    sender: TonApiAccountRef;
    recipient: TonApiAccountRef;
    amount: string;
    jetton: {
      address: string;
      name: string;
      symbol: string;
      decimals: number;
      image?: string;
    };
  };
}

export interface TonApiAccountRef {
  address: string;
  name?: string;
  is_scam: boolean;
  is_wallet: boolean;
}

export interface TonApiEventsResponse {
  events: TonApiEvent[];
  next_from?: number;
}

export interface TonApiRatesResponse {
  rates: Record<string, {
    prices?: Record<string, number>;
  }>;
}

// ---------- Risk Engine Types ----------

export interface RiskFactor {
  id: string;
  category: string;
  message: string;
  weight: number;       // 0..1 (multiplier)
  triggered: boolean;   // ri = 0 or 1
  severity: 'low' | 'medium' | 'high';
}

export interface RiskResult {
  score: number;        // 0..100
  level: 'SAFE' | 'WARNING' | 'CRITICAL';
  signals: RiskSignalOutput[];
  factors: RiskFactor[];
}

export interface RiskSignalOutput {
  category: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  points: number;
}

export interface FeedbackResult {
  verdict: string;
  key_risks: string[];
  recommendation: string;
}

// ---------- Analysis Result Types ----------

export interface RecentTransaction {
  event_id: string;
  timestamp: number;
  type: string;       // 'TonTransfer', 'JettonTransfer', etc.
  direction: 'in' | 'out';
  amount?: string;
  counterparty?: {
    address: string;
    name?: string;
    is_scam: boolean;
  };
  description: string;
}

export interface TopHolder {
  address: string;
  name?: string;
  balance: string;
  percentage: number;
  is_dex: boolean;
}
