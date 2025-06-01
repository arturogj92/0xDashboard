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
  try {
    // Verificar que estamos en el VPS
    if (!isVPSEnvironment()) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Verificar autorización
    if (!isAuthorized(request)) {
      console.log(`[VPS-SSL] Unauthorized removal attempt`);
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { domain } = await request.json();
    
    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    console.log(`[VPS-SSL] Removing SSL certificate for: ${domain}`);

    // Ejecutar script manage_ssl.sh remove
    const scriptPath = '/var/www/landings/scripts/manage_ssl.sh';
    const { stdout, stderr } = await execAsync(`sudo bash ${scriptPath} remove ${domain}`);
    
    console.log(`[VPS-SSL] SSL removal output for ${domain}:`, stdout);
    
    if (stderr) {
      console.error(`[VPS-SSL] SSL removal stderr for ${domain}:`, stderr);
      
      // No fallar si el certificado ya no existe o el dominio no está configurado
      if (!stderr.includes('No such file or directory') && 
          !stderr.includes('not found') && 
          !stderr.includes('does not exist') &&
          stderr.includes('error')) {
        throw new Error(`SSL removal script failed: ${stderr}`);
      }
    }

    console.log(`[VPS-SSL] SSL certificate removed successfully for ${domain}`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'SSL certificate removed successfully',
      domain,
      output: stdout,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`[VPS-SSL] SSL removal failed:`, error);
    
    return NextResponse.json({ 
      error: 'SSL removal failed', 
      details: (error as Error).message 
    }, { status: 500 });
  }
}