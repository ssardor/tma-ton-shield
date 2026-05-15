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
    const result = await this.request<TransactionResponse>('/api/v1/analyze/transaction', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { ...result, created_at: result.created_at || new Date().toISOString() };
  }

  // Address Check — now powered by real TON API Risk Engine
  async analyzeAddress(address: string): Promise<AddressResponse> {
    const result = await this.request<AddressResponse>(
      `/api/v1/analyze/address/${encodeURIComponent(address)}`
    );
    return { ...result, created_at: result.created_at || new Date().toISOString() };
  }

  // Jetton Analysis — real holder concentration + anti-rugpull
  async analyzeJetton(address: string): Promise<JettonResponse> {
    const result = await this.request<JettonResponse>(
      `/api/v1/analyze/jetton/${encodeURIComponent(address)}`
    );
    return { ...result, created_at: result.created_at || new Date().toISOString() };
  }

  // Link Scanner — keyword analysis + typosquatting detection
  async analyzeLink(url: string): Promise<LinkResponse> {
    const result = await this.request<LinkResponse>('/api/v1/analyze/link', {
      method: 'POST',
      body: JSON.stringify({ url } as LinkRequest),
    });
    return { ...result, created_at: result.created_at || new Date().toISOString() };
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

  // Wallet Connections (domains, jettons, NFTs) — via server-side route with auth
  async getWalletConnections(address: string): Promise<WalletConnectionsResponse> {
    try {
      const result = await this.request<WalletConnectionsResponse>(
        `/api/v1/connections/${encodeURIComponent(address)}`
      );
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
