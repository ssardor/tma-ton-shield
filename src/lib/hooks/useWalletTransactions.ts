'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';
import { TransactionHistoryResponse } from '../api/types';

export function useWalletTransactions(address: string | null, limit: number = 10) {
  const [transactions, setTransactions] = useState<TransactionHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!address) {
      setTransactions(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.getTransactionHistory(address, limit);
      setTransactions(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load transactions';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [address, limit]);

  const loadMore = useCallback(async () => {
    if (!address || !transactions?.next_from) return;

    setIsLoading(true);
    try {
      const data = await apiClient.getTransactionHistory(
        address,
        limit,
        transactions.next_from
      );
      setTransactions({
        ...data,
        events: [...transactions.events, ...data.events],
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load more';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [address, limit, transactions]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    isLoading,
    error,
    refresh: fetchTransactions,
    loadMore,
    hasMore: !!transactions?.next_from,
  };
}
