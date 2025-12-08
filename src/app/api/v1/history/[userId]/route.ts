import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const { searchParams } = new URL(request.url);
  
  const limit = parseInt(searchParams.get('limit') || '20');
  
  const mockItems = [
    {
      id: '1',
      user_id: userId,
      type: 'address',
      target: 'UQCnPGfxWK7jT5M1TgT8orWK6nSNPp9HMmQ7hYmpthpNN_fLB',
      risk_level: 'SAFE',
      risk_score: 15,
      created_at: '2025-12-03T00:15:00Z',
    },
    {
      id: '2',
      user_id: userId,
      type: 'transaction',
      target: 'EQD7vN3...',
      risk_level: 'WARNING',
      risk_score: 45,
      created_at: '2025-12-02T22:30:00Z',
    },
    {
      id: '3',
      user_id: userId,
      type: 'jetton',
      target: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
      risk_level: 'SAFE',
      risk_score: 10,
      created_at: '2025-12-02T20:10:00Z',
    },
    {
      id: '4',
      user_id: userId,
      type: 'link',
      target: 'https://example.com',
      risk_level: 'SAFE',
      risk_score: 20,
      created_at: '2025-12-02T18:45:00Z',
    },
  ];

  const mockResponse = {
    items: mockItems.slice(0, limit),
    total: mockItems.length,
    limit: limit,
    offset: 0,
  };

  return NextResponse.json(mockResponse);
}
