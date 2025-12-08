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

export function useAnalyze() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeTransaction = async (
    data: TransactionRequest
  ): Promise<TransactionResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiClient.analyzeTransaction(data);
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
      const result = await apiClient.analyzeAddress(address);
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
      const result = await apiClient.analyzeJetton(address);
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
      const result = await apiClient.analyzeLink(url);
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
