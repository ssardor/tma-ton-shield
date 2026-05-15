'use client';

import { useState } from 'react';
import apiClient from '../api/client';
import {
  TransactionRequest,
  TransactionResponse,
  AddressResponse,
  JettonResponse,
  LinkResponse,
} from '../api/types';

// Minimum delay to show the beautiful scanning animation
const ARTIFICIAL_DELAY_MS = 2800;
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useAnalyze() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeTransaction = async (
    data: TransactionRequest
  ): Promise<TransactionResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const [result] = await Promise.all([
        apiClient.analyzeTransaction(data),
        delay(ARTIFICIAL_DELAY_MS),
      ]);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze transaction';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeAddress = async (address: string): Promise<AddressResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const [result] = await Promise.all([
        apiClient.analyzeAddress(address),
        delay(ARTIFICIAL_DELAY_MS),
      ]);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze address';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeJetton = async (address: string): Promise<JettonResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const [result] = await Promise.all([
        apiClient.analyzeJetton(address),
        delay(ARTIFICIAL_DELAY_MS),
      ]);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze jetton';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeLink = async (url: string): Promise<LinkResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const [result] = await Promise.all([
        apiClient.analyzeLink(url),
        delay(ARTIFICIAL_DELAY_MS),
      ]);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze link';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    analyzeTransaction,
    analyzeAddress,
    analyzeJetton,
    analyzeLink,
    isLoading,
    error,
  };
}

