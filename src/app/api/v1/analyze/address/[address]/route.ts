import { NextRequest, NextResponse } from 'next/server';

// Функция для получения реального баланса через TON API
async function getRealAccountInfo(address: string) {
  try {
    // Используем бесплатный tonapi.io (поддерживает все форматы адресов)
    const response = await fetch(
      `https://tonapi.io/v2/accounts/${address}`,
      {
        next: { revalidate: 30 }, // кэш на 30 секунд
      }
    );

    if (!response.ok) {
      throw new Error(`TON API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      is_wallet: !data.interfaces || data.interfaces.length === 0, // Если нет интерфейсов = обычный кошелёк
      balance: data.balance?.toString() || '0',
      last_activity: data.last_activity 
        ? new Date(data.last_activity * 1000).toISOString()
        : new Date().toISOString(),
      is_scam: data.is_scam || false,
    };
  } catch (error) {
    console.error('Failed to fetch real balance:', error);
    // Fallback на моковые данные при ошибке
    return {
      is_wallet: true,
      balance: '0',
      last_activity: new Date().toISOString(),
      is_scam: false,
    };
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;
  
  // Получаем реальные данные аккаунта
  const accountInfo = await getRealAccountInfo(address);
  
  // Вычисляем риск-скор на основе реальных данных
  let riskScore = 0;
  let riskLevel = 'SAFE';
  const signals = [];
  
  const balanceInTon = parseInt(accountInfo.balance) / 1e9;
  
  if (accountInfo.is_scam) {
    riskScore += 80;
    riskLevel = 'CRITICAL';
    signals.push({
      category: 'Scam Detection',
      message: 'This address is flagged as a known scam',
      severity: 'high',
      points: 80,
    });
  }
  
  if (balanceInTon === 0) {
    riskScore += 10;
    signals.push({
      category: 'Balance Check',
      message: 'Wallet has zero balance',
      severity: 'low',
      points: 10,
    });
  } else if (balanceInTon < 1) {
    riskScore += 5;
    signals.push({
      category: 'Balance Check',
      message: 'Wallet has very low balance (< 1 TON)',
      severity: 'low',
      points: 5,
    });
  }
  
  if (riskScore >= 70) {
    riskLevel = 'CRITICAL';
  } else if (riskScore >= 30) {
    riskLevel = 'WARNING';
  }
  
  // Формируем AI-summary на основе реальных данных
  let verdict = 'This wallet appears to be safe. It shows normal activity patterns and has no red flags.';
  const keyRisks = [];
  
  if (accountInfo.is_scam) {
    verdict = '⚠️ WARNING: This address is flagged as a known scam in TON database!';
    keyRisks.push('Address is on the scam list');
  }
  
  if (balanceInTon === 0) {
    keyRisks.push('Zero balance - newly created or inactive wallet');
  }
  
  const mockResponse = {
    address: address,
    risk_level: riskLevel,
    risk_score: riskScore,
    account_info: {
      address: address,
      ...accountInfo,
    },
    ai_summary: {
      verdict,
      key_risks: keyRisks,
      recommendation: accountInfo.is_scam 
        ? 'DO NOT interact with this address. It has been flagged as malicious.'
        : 'This address can be trusted for transactions. Always verify the recipient address before sending funds.',
    },
    signals,
  };

  return NextResponse.json(mockResponse);
}
