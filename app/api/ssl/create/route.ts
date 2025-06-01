import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Middleware de seguridad - Solo en VPS
function isVPSEnvironment() {
  return process.env.NODE_ENV === 'production' && 
         process.env.VPS_ENVIRONMENT === 'true';
}

function isAuthorized(request: NextRequest) {
  const vpsSecret = request.headers.get('x-vps-secret');
  const expectedSecret = process.env.VPS_SECRET;
  
  return vpsSecret === expectedSecret;
}

export async function POST(request: NextRequest) {
  let domain: string = '';
  
  try {
    // Verificar que estamos en el VPS
    if (!isVPSEnvironment()) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Verificar autorización
    if (!isAuthorized(request)) {
      console.log(`[VPS-SSL] Unauthorized access attempt`);
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const requestBody = await request.json();
    domain = requestBody.domain;
    
    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    console.log(`[VPS-SSL] Creating SSL certificate for: ${domain}`);

    // Ejecutar script manage_ssl.sh custom
    const scriptPath = '/var/www/landings/scripts/manage_ssl.sh';
    const { stdout, stderr } = await execAsync(`sudo bash ${scriptPath} custom ${domain}`);
    
    console.log(`[VPS-SSL] SSL script output for ${domain}:`, stdout);
    
    if (stderr) {
      console.error(`[VPS-SSL] SSL script stderr for ${domain}:`, stderr);
      
      // Detectar rate limit de Let's Encrypt y extraer fecha
      if (stderr.includes('too many certificates') || stderr.includes('rate limit')) {
        // Extraer la fecha de reinicio del rate limit
        const retryMatch = stderr.match(/retry after (\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) UTC/);
        const retryDate = retryMatch ? retryMatch[1] : null;
        throw new Error(`RATE_LIMIT_EXCEEDED|${retryDate}`);
      }
      
      // Detectar instancia de Certbot ya ejecutándose
      if (stderr.includes('Another instance of Certbot is already running')) {
        throw new Error('CERTBOT_ALREADY_RUNNING');
      }
      
      // Otros errores de SSL
      if (stderr.includes('error') || stderr.includes('failed')) {
        throw new Error(`SSL script failed: ${stderr}`);
      }
    }

    console.log(`[VPS-SSL] SSL certificate created successfully for ${domain}`);
    
    // Notificar al backend que el SSL se completó exitosamente
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://0xreplyer-production.up.railway.app';
      console.log(`[VPS-SSL] Notifying backend about SSL completion: ${backendUrl}/api/custom-domains/ssl-complete`);
      
      const notifyResponse = await fetch(`${backendUrl}/api/custom-domains/ssl-complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-VPS-Secret': process.env.VPS_SECRET || ''
        },
        body: JSON.stringify({ 
          domain,
          success: true,
          timestamp: new Date().toISOString()
        })
      });
      
      if (notifyResponse.ok) {
        console.log(`[VPS-SSL] Backend notified successfully for ${domain}`);
      } else {
        console.error(`[VPS-SSL] Failed to notify backend for ${domain}:`, notifyResponse.status);
      }
    } catch (notifyError) {
      console.error(`[VPS-SSL] Error notifying backend for ${domain}:`, notifyError);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'SSL certificate created successfully',
      domain,
      output: stdout,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`[VPS-SSL] SSL creation failed:`, error);
    
    // Notificar al backend sobre el error
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://0xreplyer-production.up.railway.app';
      console.log(`[VPS-SSL] Notifying backend about SSL error: ${backendUrl}/api/custom-domains/ssl-complete`);
      
      const notifyResponse = await fetch(`${backendUrl}/api/custom-domains/ssl-complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-VPS-Secret': process.env.VPS_SECRET || ''
        },
        body: JSON.stringify({ 
          domain: domain,
          success: false,
          error: (error as Error).message,
          timestamp: new Date().toISOString()
        })
      });
      
      if (notifyResponse.ok) {
        console.log(`[VPS-SSL] Backend notified about error for ${domain}`);
      } else {
        console.error(`[VPS-SSL] Failed to notify backend about error for ${domain}:`, notifyResponse.status);
      }
    } catch (notifyError) {
      console.error(`[VPS-SSL] Error notifying backend about error for ${domain}:`, notifyError);
    }
    
    return NextResponse.json({ 
      error: 'SSL creation failed', 
      details: (error as Error).message 
    }, { status: 500 });
  }
}