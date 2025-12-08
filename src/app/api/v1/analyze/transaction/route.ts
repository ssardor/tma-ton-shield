import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const mockResponse = {
    user_wallet: body.user_wallet,
    target_address: body.target_address,
    amount_nanoton: body.amount_nanoton,
    risk_level: 'WARNING',
    risk_score: 45,
    target_account_info: {
      address: body.target_address,
      is_wallet: true,
      is_scam: false,
      balance: '50000000000', // 50 TON
    },
    ai_summary: {
      verdict: 'This transaction has some risk factors. Please review the signals before proceeding.',
      key_risks: [
        'Target address is relatively new',
        'Low transaction history',
      ],
      recommendation: 'Proceed with caution. Consider sending a small test amount first.',
    },
    signals: [
      {
        category: 'Account Age',
        message: 'Target account created recently (less than 30 days)',
        severity: 'medium',
        points: 20,
      },
      {
        category: 'Transaction Volume',
        message: 'Low transaction count detected',
        severity: 'medium',
        points: 15,
      },
      {
        category: 'Amount Check',
        message: 'Transaction amount is within normal range',
        severity: 'low',
        points: 10,
      },
    ],
  };

  return NextResponse.json(mockResponse);
}
