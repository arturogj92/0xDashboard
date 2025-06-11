import { NextRequest, NextResponse } from 'next/server';
import { API_URL } from '@/lib/api';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug') || 'user';

  try {
    console.log(`[Debug] Checking landing for slug: ${slug}`);
    console.log(`[Debug] API_URL: ${API_URL}`);
    console.log(`[Debug] Full URL: ${API_URL}/api/landings/slug/${slug}`);

    const res = await fetch(`${API_URL}/api/landings/slug/${slug}`, { 
      cache: 'no-store',
      headers: {
        'User-Agent': 'Frontend-Debug/1.0'
      }
    });

    const responseText = await res.text();
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    return NextResponse.json({
      success: true,
      debug: {
        slug,
        apiUrl: API_URL,
        fullUrl: `${API_URL}/api/landings/slug/${slug}`,
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        response: responseData
      }
    });

  } catch (error) {
    console.error('[Debug] Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        slug,
        apiUrl: API_URL,
        fullUrl: `${API_URL}/api/landings/slug/${slug}`
      }
    }, { status: 500 });
  }
}