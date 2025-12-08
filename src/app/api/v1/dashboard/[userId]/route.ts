import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  
  const mockResponse = {
    stats: {
      total_checks: 42,
      checks_today: 5,
      safe_count: 30,
      warning_count: 10,
      critical_count: 2,
      safe_percentage: 71.4,
      warning_percentage: 23.8,
      critical_percentage: 4.8,
    },
    risk_timeline: [
      { date: '2025-11-27', safe: 3, warning: 1, critical: 0 },
      { date: '2025-11-28', safe: 5, warning: 2, critical: 0 },
      { date: '2025-11-29', safe: 4, warning: 1, critical: 1 },
      { date: '2025-11-30', safe: 6, warning: 2, critical: 0 },
      { date: '2025-12-01', safe: 5, warning: 2, critical: 1 },
      { date: '2025-12-02', safe: 4, warning: 1, critical: 0 },
      { date: '2025-12-03', safe: 3, warning: 1, critical: 0 },
    ],
    recent_critical: [
      {
        type: 'address',
        target: 'EQBadScamAddress123...',
        risk_score: 95,
        timestamp: '2025-12-01T10:30:00Z',
      },
      {
        type: 'link',
        target: 'https://phishing-site.com',
        risk_score: 98,
        timestamp: '2025-11-29T14:20:00Z',
      },
    ],
  };

  return NextResponse.json(mockResponse);
}
