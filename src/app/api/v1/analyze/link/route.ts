import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { url } = body;
  
  const mockResponse = {
    url: url,
    domain: new URL(url).hostname,
    is_phishing: false,
    risk_level: 'SAFE',
    risk_score: 20,
    ai_summary: {
      verdict: 'This URL appears to be safe. No phishing or malicious indicators detected.',
      key_risks: [],
      recommendation: 'Safe to visit. Always verify the URL matches the expected domain.',
    },
    signals: [
      {
        category: 'Domain Age',
        message: 'Domain has been registered for a significant time',
        severity: 'low',
        points: 10,
      },
      {
        category: 'SSL Certificate',
        message: 'Valid SSL certificate detected',
        severity: 'low',
        points: 5,
      },
      {
        category: 'Reputation',
        message: 'No negative reports found',
        severity: 'low',
        points: 5,
      },
    ],
  };

  return NextResponse.json(mockResponse);
}
