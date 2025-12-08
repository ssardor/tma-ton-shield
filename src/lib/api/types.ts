// API Types based on FRONTEND_API_GUIDE.md

export type RiskLevel = 'SAFE' | 'WARNING' | 'CRITICAL';
export type AssessmentType = 'transaction' | 'jetton' | 'address' | 'link';

// Common interfaces
export interface RiskSignal {
  category: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  points: number;
}

export interface AiSummary {
  verdict: string;
  key_risks: string[];
  recommendation: string;
}

// Transaction Analysis
export interface TransactionRequest {
  user_wallet: string;
  target_address: string;
  amount_nanoton?: string;
  payload_boc?: string;
  origin_domain?: string;
}

export interface TransactionResponse {
  risk_level: RiskLevel;
  risk_score: number;
  signals: RiskSignal[];
  ai_summary: AiSummary;
  target_account_info: {
    address: string;
    is_scam: boolean;
    is_wallet: boolean;
    balance?: string;
  };
  created_at: string;
}

// Address Check
export interface AddressResponse {
  risk_level: RiskLevel;
  risk_score: number;
  signals: RiskSignal[];
  ai_summary: AiSummary;
  account_info: {
    address: string;
    is_scam: boolean;
    is_wallet: boolean;
    balance?: string;
    last_activity?: string;
  };
  created_at: string;
}

// Jetton Analysis
export interface JettonResponse {
  risk_level: RiskLevel;
  risk_score: number;
  signals: RiskSignal[];
  ai_summary: AiSummary;
  metadata: {
    name: string;
    symbol: string;
    decimals: number;
    description?: string;
    image?: string;
  };
  admin_address?: string;
  total_supply?: string;
  holder_count?: number;
  created_at: string;
}

// Link Scanner
export interface LinkRequest {
  url: string;
}

export interface TelegramAnalysis {
  is_mini_app: boolean;
  is_official_bot: boolean;
  official_brand: string | null;
  brands_detected: string[];
  app_domain: string | null;
  permissions_requested: string[];
  linked_wallets: string[];
}

export interface LinkResponse {
  risk_level: RiskLevel;
  risk_score: number;
  signals: RiskSignal[];
  ai_summary: AiSummary;
  url: string;
  domain: string;
  is_phishing: boolean;
  is_telegram_link: boolean;
  bot_username?: string;
  telegram_analysis?: TelegramAnalysis;
  created_at: string;
}

// Transaction History
export interface TransactionEvent {
  event_id: string;
  timestamp: number;
  actions: TransactionAction[];
  is_scam: boolean;
  lt: number;
  in_progress: boolean;
  fee?: number;
}

export interface TransactionAction {
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
    sender: AccountInfo;
    recipient: AccountInfo;
    amount: number;
    comment?: string;
  };
  JettonTransfer?: {
    sender: AccountInfo;
    recipient: AccountInfo;
    amount: string;
    jetton: {
      address: string;
      name: string;
      symbol: string;
      decimals: number;
      image?: string;
    };
  };
  SmartContractExec?: {
    executor: AccountInfo;
    contract: AccountInfo;
    ton_attached: number;
    operation: string;
  };
  NftItemTransfer?: {
    sender: AccountInfo;
    recipient: AccountInfo;
    nft: string;
  };
}

export interface AccountInfo {
  address: string;
  name?: string;
  is_scam: boolean;
  is_wallet: boolean;
}

export interface TransactionHistoryResponse {
  events: TransactionEvent[];
  next_from?: number;
  total_events?: number;
}

// Wallet Connections
export interface WalletConnectionsResponse {
  domains: string[];
  jettons: JettonBalance[];
  nfts: NFTItem[];
  total_jettons: number;
  total_nfts: number;
}

export interface JettonBalance {
  balance: string;
  wallet_address: {
    address: string;
    is_scam: boolean;
  };
  jetton: {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    image?: string;
    verification: 'whitelist' | 'blacklist' | 'none';
  };
}

export interface NFTItem {
  address: string;
  index: number;
  collection?: {
    address: string;
    name: string;
    description?: string;
  };
  verified: boolean;
  metadata: {
    name?: string;
    description?: string;
    image?: string;
  };
  previews?: Array<{
    resolution: string;
    url: string;
  }>;
  dns?: string;
  trust: 'whitelist' | 'blacklist' | 'none';
}

// Dashboard
export interface DashboardStats {
  total_checks: number;
  checks_today: number;
  safe_count: number;
  warning_count: number;
  critical_count: number;
  safe_percentage: number;
  warning_percentage: number;
  critical_percentage: number;
}

export interface RecentCritical {
  type: AssessmentType;
  target: string;
  risk_score: number;
  created_at: string;
}

export interface RiskTimelinePoint {
  date: string;
  safe: number;
  warning: number;
  critical: number;
}

export interface DashboardResponse {
  user_id: string;
  stats: DashboardStats;
  recent_critical: RecentCritical[];
  risk_timeline: RiskTimelinePoint[];
}

// History
export interface HistoryParams {
  limit?: number;
  offset?: number;
  type?: AssessmentType;
  risk_level?: RiskLevel;
}

export interface HistoryItem {
  id: string;
  type: AssessmentType;
  target: string;
  risk_level: RiskLevel;
  risk_score: number;
  created_at: string;
}

export interface HistoryResponse {
  items: HistoryItem[];
  total: number;
  limit: number;
  offset: number;
}

// Stats
export interface StatsResponse {
  user_id: string;
  total_checks: number;
  checks_today: number;
  checks_this_week: number;
  checks_this_month: number;
  safe_count: number;
  warning_count: number;
  critical_count: number;
  safe_percentage: number;
  warning_percentage: number;
  critical_percentage: number;
  most_checked_type: AssessmentType;
  last_check_at?: string;
  created_at: string;
}

// Error Response
export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, string[]>;
}
