import {
  TransactionRequest,
  TransactionResponse,
  AddressResponse,
  JettonResponse,
  LinkRequest,
  LinkResponse,
  DashboardResponse,
  HistoryParams,
  HistoryResponse,
  StatsResponse,
  TransactionHistoryResponse,
  WalletConnectionsResponse,
  ApiError,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

class ApiClient {
  private baseUrl: string;
  private userId: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    // In development, use relative URLs to hit Next.js API routes
    // In production, use the full backend URL
    this.baseUrl = baseUrl || '';
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add user ID header if available
    if (this.userId) {
      headers['X-User-ID'] = this.userId;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          error: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred',
        }));

        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const json = await response.json();
      
      // Если бэкенд возвращает {status: "ok", data: {...}}, извлекаем data
      if (json.status === 'ok' && json.data) {
        return json.data as T;
      }
      
      return json as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network request failed');
    }
  }

  // Transaction Analysis
  async analyzeTransaction(data: TransactionRequest): Promise<TransactionResponse> {
    console.log('API: Analyzing transaction', data);
    const result = await this.request<any>('/analyze/transaction', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    console.log('API: Transaction result', result);
    
    // Адаптируем ответ бэкенда к ожидаемому формату
    return {
      risk_level: result.risk_level,
      risk_score: result.risk_score,
      target_account_info: {
        address: result.target_address || data.target_address,
        is_wallet: result.target_account?.interfaces?.length === 0,
        balance: result.target_account?.balance_nanoton?.toString() || '0',
        is_scam: false,
      },
      signals: (result.signals || []).map((sig: string) => ({
        category: 'Risk Signal',
        message: sig,
        severity: 'medium' as const,
        points: 10,
      })),
      ai_summary: {
        verdict: result.ai_explanation || 'No analysis available',
        key_risks: result.signals || [],
        recommendation: result.risk_level === 'CRITICAL' ? 'Do not proceed with this transaction' : 'Proceed with caution',
      },
      created_at: new Date().toISOString(),
    };
  }

  // Address Check
  async analyzeAddress(address: string): Promise<AddressResponse> {
    console.log('API: Analyzing address', address);
    const result = await this.request<any>(`/analyze/address/${encodeURIComponent(address)}`);
    console.log('API: Address result', result);
    
    // Адаптируем ответ бэкенда
    return {
      risk_level: result.risk_level,
      risk_score: result.risk_score,
      account_info: {
        address: result.address,
        is_wallet: result.account?.interfaces?.length === 0,
        is_scam: false,
        balance: result.account?.balance_nanoton?.toString() || '0',
        last_activity: new Date().toISOString(),
      },
      signals: (result.signals || []).map((sig: string) => ({
        category: 'Risk Signal',
        message: sig,
        severity: 'medium' as const,
        points: 10,
      })),
      ai_summary: {
        verdict: result.ai_explanation || 'No analysis available',
        key_risks: result.signals || [],
        recommendation: result.risk_level === 'CRITICAL' ? 'Do not interact with this address' : 'Safe to interact',
      },
      created_at: new Date().toISOString(),
    };
  }

  // Jetton Analysis
  async analyzeJetton(address: string): Promise<JettonResponse> {
    console.log('API: Analyzing jetton', address);
    const result = await this.request<any>(`/analyze/jetton/${encodeURIComponent(address)}`);
    console.log('API: Jetton result', result);
    
    // Адаптируем ответ бэкенда
    return {
      metadata: {
        name: result.metadata?.name || 'Unknown',
        symbol: result.metadata?.symbol || '???',
        decimals: parseInt(result.metadata?.decimals || '9'),
        image: result.metadata?.image,
        description: result.metadata?.description,
      },
      total_supply: result.metadata?.total_supply,
      holder_count: result.holder_count,
      admin_address: result.admin_address,
      risk_level: result.risk_level,
      risk_score: result.risk_score,
      signals: (result.signals || []).map((sig: string) => ({
        category: 'Risk Signal',
        message: sig,
        severity: result.risk_score > 50 ? 'high' as const : 'medium' as const,
        points: 10,
      })),
      ai_summary: {
        verdict: result.ai_verdict || 'No analysis available',
        key_risks: result.signals || [],
        recommendation: result.is_honeypot_suspected 
          ? 'Potential honeypot detected - avoid interaction'
          : result.risk_level === 'WARNING' 
            ? 'Proceed with caution'
            : 'Safe to interact',
      },
      created_at: new Date().toISOString(),
    };
  }

  // Link Scanner
  async analyzeLink(url: string): Promise<LinkResponse> {
    console.log('API: Analyzing link', url);
    const result = await this.request<any>('/analyze/link', {
      method: 'POST',
      body: JSON.stringify({ url } as LinkRequest),
    });
    console.log('API: Link result', result);
    
    // Адаптируем ответ бэкенда
    return {
      url: result.url,
      domain: result.domain,
      risk_level: result.risk_level,
      risk_score: result.risk_score,
      is_phishing: result.risk_level === 'CRITICAL',
      is_telegram_link: result.is_telegram_link,
      bot_username: result.bot_username,
      telegram_analysis: result.telegram_analysis,
      signals: (result.signals || []).map((sig: string) => ({
        category: 'Risk Signal',
        message: sig,
        severity: 'medium' as const,
        points: 10,
      })),
      ai_summary: {
        verdict: result.ai_summary || 'No analysis available',
        key_risks: result.signals || [],
        recommendation: result.risk_level === 'CRITICAL' 
          ? 'Do not visit this link - likely phishing'
          : 'Proceed with caution',
      },
      created_at: new Date().toISOString(),
    };
  }

  // Dashboard
  async getDashboard(userId: string): Promise<DashboardResponse> {
    return this.request<DashboardResponse>(`/api/v1/dashboard/${userId}`);
  }

  // History
  async getHistory(userId: string, params?: HistoryParams): Promise<HistoryResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.risk_level) queryParams.append('risk_level', params.risk_level);

    const queryString = queryParams.toString();
    const endpoint = `/api/v1/history/${userId}${queryString ? `?${queryString}` : ''}`;

    return this.request<HistoryResponse>(endpoint);
  }

  // Stats
  async getStats(userId: string): Promise<StatsResponse> {
    return this.request<StatsResponse>(`/api/v1/stats/${userId}`);
  }

  // Transaction History from TON API
  async getTransactionHistory(
    address: string, 
    limit: number = 20, 
    beforeLt?: number
  ): Promise<TransactionHistoryResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
    });
    
    if (beforeLt) {
      params.append('before_lt', beforeLt.toString());
    }

    const response = await fetch(
      `https://tonapi.io/v2/accounts/${address}/events?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch transaction history: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      events: data.events || [],
      next_from: data.next_from,
      total_events: data.events?.length || 0,
    };
  }

  // Wallet Connections (domains, jettons, NFTs)
  async getWalletConnections(address: string): Promise<WalletConnectionsResponse> {
    try {
      console.log('Fetching wallet connections for:', address);
      
      const fetchWithFallback = async (url: string, fallbackData: any) => {
        try {
          console.log('Fetching:', url);
          const response = await fetch(url);
          console.log('Response status:', response.status, 'for', url);
          
          if (!response.ok) {
            console.warn(`API returned ${response.status} for ${url}`);
            return fallbackData;
          }
          
          const data = await response.json();
          console.log('Data received for', url, ':', data);
          return data;
        } catch (error) {
          console.error('Fetch failed for', url, ':', error);
          return fallbackData;
        }
      };

      const [domainsData, jettonsData, nftsData] = await Promise.all([
        fetchWithFallback(`https://tonapi.io/v2/accounts/${address}/dns/backresolve`, { domains: [] }),
        fetchWithFallback(`https://tonapi.io/v2/accounts/${address}/jettons?limit=100`, { balances: [] }),
        fetchWithFallback(`https://tonapi.io/v2/accounts/${address}/nfts?limit=100`, { nft_items: [] }),
      ]);

      const result = {
        domains: domainsData.domains || [],
        jettons: jettonsData.balances || [],
        nfts: nftsData.nft_items || [],
        total_jettons: jettonsData.balances?.length || 0,
        total_nfts: nftsData.nft_items?.length || 0,
      };
      
      console.log('Final connections data:', result);
      return result;
    } catch (error) {
      console.error('Failed to fetch wallet connections:', error);
      return {
        domains: [],
        jettons: [],
        nfts: [],
        total_jettons: 0,
        total_nfts: 0,
      };
    }
  }
}

export const apiClient = new ApiClient();
export default apiClient;
