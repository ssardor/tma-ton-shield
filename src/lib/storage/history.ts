/**
 * Local storage for user history
 * Saves check results (link, address, jetton) to localStorage
 */

import { RiskLevel } from '../api/types';

export interface HistoryItem {
  id: string;
  type: 'link' | 'address' | 'jetton';
  target: string; // URL, address, or jetton address
  risk_level: RiskLevel;
  risk_score: number;
  timestamp: string;
  result_summary?: string; // AI verdict or summary
}

const HISTORY_KEY = 'ton_shield_history';
const MAX_HISTORY_ITEMS = 100; // Keep last 100 items

/**
 * Get user history from localStorage
 */
export function getHistory(userId: string): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const key = `${HISTORY_KEY}_${userId}`;
    const data = localStorage.getItem(key);
    if (!data) return [];
    
    const history: HistoryItem[] = JSON.parse(data);
    return history.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    console.error('Failed to load history:', error);
    return [];
  }
}

/**
 * Save new item to history
 */
export function saveToHistory(userId: string, item: Omit<HistoryItem, 'id' | 'timestamp'>): void {
  if (typeof window === 'undefined') return;
  
  try {
    const history = getHistory(userId);
    
    const newItem: HistoryItem = {
      ...item,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };
    
    // Add to beginning
    history.unshift(newItem);
    
    // Keep only MAX_HISTORY_ITEMS
    const trimmedHistory = history.slice(0, MAX_HISTORY_ITEMS);
    
    const key = `${HISTORY_KEY}_${userId}`;
    localStorage.setItem(key, JSON.stringify(trimmedHistory));
    
    console.log('Saved to history:', newItem);
  } catch (error) {
    console.error('Failed to save to history:', error);
  }
}

/**
 * Clear user history
 */
export function clearHistory(userId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const key = `${HISTORY_KEY}_${userId}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear history:', error);
  }
}

/**
 * Get history stats
 */
export function getHistoryStats(userId: string) {
  const history = getHistory(userId);
  
  return {
    total: history.length,
    safe: history.filter(item => item.risk_level === 'SAFE').length,
    warning: history.filter(item => item.risk_level === 'WARNING').length,
    critical: history.filter(item => item.risk_level === 'CRITICAL').length,
  };
}
