'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';
import {
  DashboardResponse,
  HistoryResponse,
  HistoryParams,
  StatsResponse,
} from '../api/types';

export function useDashboard(userId: string | null) {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.getDashboard(userId);
      setDashboard(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    dashboard,
    isLoading,
    error,
    refresh: fetchDashboard,
  };
}

export function useHistory(userId: string | null, params?: HistoryParams) {
  const [history, setHistory] = useState<HistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.getHistory(userId, params);
      setHistory(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load history';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [userId, params]);

  const loadMore = useCallback(async () => {
    if (!userId || !history) return;

    const nextOffset = (history.offset || 0) + (history.limit || 20);
    setIsLoading(true);
    try {
      const data = await apiClient.getHistory(userId, {
        ...params,
        offset: nextOffset,
      });
      setHistory({
        ...data,
        items: [...history.items, ...data.items],
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load more';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [userId, history, params]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    isLoading,
    error,
    refresh: fetchHistory,
    loadMore,
    hasMore: history ? history.items.length < history.total : false,
  };
}

export function useStats(userId: string | null) {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.getStats(userId);
      setStats(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load stats';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refresh: fetchStats,
  };
}
