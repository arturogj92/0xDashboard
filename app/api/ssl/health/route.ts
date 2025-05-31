import { NextRequest, NextResponse } from 'next/server';

// Health check para verificar que el VPS SSL API está funcionando
export async function GET(request: NextRequest) {
  const isVPS = process.env.NODE_ENV === 'production' && 
                process.env.VPS_ENVIRONMENT === 'true';
  
  return NextResponse.json({ 
    status: 'ok', 
    service: 'vps-ssl-api',
    environment: isVPS ? 'vps' : 'development',
    timestamp: new Date().toISOString(),
    available: isVPS
  });
}