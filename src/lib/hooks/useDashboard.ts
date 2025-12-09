'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';
import {
  DashboardResponse,
  HistoryResponse,
  HistoryParams,
  StatsResponse,
} from '../api/types';
import { getHistory, getHistoryStats } from '../storage/history';

export function useDashboard(userId: string | null) {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);
    try {
      // Get stats from localStorage
      const stats = getHistoryStats(userId);
      const history = getHistory(userId);
      
      // Get recent critical items
      const recentCritical = history
        .filter(item => item.risk_level === 'CRITICAL')
        .slice(0, 5)
        .map(item => ({
          id: item.id,
          type: item.type,
          target: item.target,
          risk_level: item.risk_level,
          risk_score: item.risk_score,
          created_at: item.timestamp,
          summary: item.result_summary,
        }));
      
      setDashboard({
        user_id: userId,
        stats: {
          total_checks: stats.total,
          checks_today: 0, // Can be calculated if needed
          safe_count: stats.safe,
          warning_count: stats.warning,
          critical_count: stats.critical,
          safe_percentage: stats.total > 0 ? (stats.safe / stats.total) * 100 : 0,
          warning_percentage: stats.total > 0 ? (stats.warning / stats.total) * 100 : 0,
          critical_percentage: stats.total > 0 ? (stats.critical / stats.total) * 100 : 0,
        },
        recent_critical: recentCritical,
        risk_timeline: [], // Can be calculated from history if needed
      });
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
      // Get history from localStorage
      const localHistory = getHistory(userId);
      
      // Apply filters
      let filteredItems = localHistory;
      if (params?.type) {
        filteredItems = filteredItems.filter(item => item.type === params.type);
      }
      if (params?.risk_level) {
        filteredItems = filteredItems.filter(item => item.risk_level === params.risk_level);
      }
      
      // Apply pagination
      const limit = params?.limit || 20;
      const offset = params?.offset || 0;
      const paginatedItems = filteredItems.slice(offset, offset + limit);
      
      setHistory({
        items: paginatedItems.map(item => ({
          id: item.id,
          type: item.type,
          target: item.target,
          risk_level: item.risk_level,
          risk_score: item.risk_score,
          created_at: item.timestamp,
          summary: item.result_summary,
        })),
        total: filteredItems.length,
        limit,
        offset,
      });
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
      // Get history from localStorage
      const localHistory = getHistory(userId);
      
      // Apply filters
      let filteredItems = localHistory;
      if (params?.type) {
        filteredItems = filteredItems.filter(item => item.type === params.type);
      }
      if (params?.risk_level) {
        filteredItems = filteredItems.filter(item => item.risk_level === params.risk_level);
      }
      
      const limit = params?.limit || 20;
      const paginatedItems = filteredItems.slice(nextOffset, nextOffset + limit);
      
      setHistory({
        items: [
          ...history.items,
          ...paginatedItems.map(item => ({
            id: item.id,
            type: item.type,
            target: item.target,
            risk_level: item.risk_level,
            risk_score: item.risk_score,
            created_at: item.timestamp,
            summary: item.result_summary,
          }))
        ],
        total: filteredItems.length,
        limit,
        offset: nextOffset,
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
