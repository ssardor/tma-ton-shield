import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;
  
  const mockResponse = {
    address: address,
    risk_level: 'SAFE',
    risk_score: 10,
    metadata: {
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
      description: 'Tether USDT on TON blockchain - stablecoin pegged to USD',
      image: 'https://cache.tonapi.io/imgproxy/T3PB4s7oprNVaJkwqbGg54nexKE0zzKhcrPv8jcWYzU/rs:fill:200:200:1/g:no/aHR0cHM6Ly90ZXRoZXIudG8vaW1hZ2VzL2xvZ29DaXJjbGUucG5n.webp',
    },
    total_supply: '1000000000000000',
    holder_count: 150000,
    admin_address: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
    ai_summary: {
      verdict: 'This is a legitimate and verified jetton (token). USDT is a well-known stablecoin.',
      key_risks: [],
      recommendation: 'Safe to interact with. This is an official Tether USDT token on TON.',
    },
    signals: [
      {
        category: 'Verification',
        message: 'Token is verified and well-known',
        severity: 'low',
        points: 5,
      },
      {
        category: 'Holders',
        message: 'Large number of holders indicates legitimacy',
        severity: 'low',
        points: 5,
      },
    ],
  };

  return NextResponse.json(mockResponse);
}
