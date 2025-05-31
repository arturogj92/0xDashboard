#!/usr/bin/env node

/**
 * Webhook receiver para auto-deploy en VPS
 * Se ejecuta en el VPS y escucha push events de GitHub
 */

const http = require('http');
const crypto = require('crypto');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Configuración
const PORT = process.env.WEBHOOK_PORT || 9000;
const SECRET = process.env.WEBHOOK_SECRET || 'tu-secret-aqui';
const APP_DIR = '/var/www/landings';

// Verificar firma de GitHub
function verifySignature(payload, signature) {
  const hmac = crypto.createHmac('sha256', SECRET);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

// Ejecutar deploy
async function deploy() {
  console.log('🚀 Iniciando deploy...');
  
  try {
    // Pull cambios
    await execAsync(`cd ${APP_DIR} && git pull origin main`);
    console.log('✅ Código actualizado');
    
    // Instalar dependencias si cambiaron
    const { stdout } = await execAsync(`cd ${APP_DIR} && git diff HEAD@{1} --name-only`);
    if (stdout.includes('package-lock.json')) {
      await execAsync(`cd ${APP_DIR} && npm ci --production`);
      console.log('✅ Dependencias actualizadas');
    }
    
    // Build con middleware VPS
    await execAsync(`cd ${APP_DIR} && cp middleware.vps.ts middleware.ts 2>/dev/null || true`);
    await execAsync(`cd ${APP_DIR} && npm run build`);
    console.log('✅ Build completado');
    
    // Reiniciar PM2
    await execAsync('pm2 restart landings --update-env');
    console.log('✅ Aplicación reiniciada');
    
    return { success: true, message: 'Deploy completado' };
  } catch (error) {
    console.error('❌ Error en deploy:', error.message);
    return { success: false, message: error.message };
  }
}

// Servidor webhook
const server = http.createServer(async (req, res) => {
  if (req.method !== 'POST' || req.url !== '/webhook') {
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  
  let body = '';
  req.on('data', chunk => body += chunk);
  
  req.on('end', async () => {
    // Verificar firma
    const signature = req.headers['x-hub-signature-256'];
    if (!signature || !verifySignature(body, signature)) {
      res.writeHead(401);
      res.end('Unauthorized');
      return;
    }
    
    // Parsear evento
    try {
      const payload = JSON.parse(body);
      
      // Solo deploy en push a main
      if (payload.ref === 'refs/heads/main') {
        console.log(`📨 Push recibido de ${payload.pusher.name}`);
        
        // Responder inmediatamente
        res.writeHead(200);
        res.end('Deploy iniciado');
        
        // Ejecutar deploy async
        const result = await deploy();
        console.log(result.success ? '✅ Deploy exitoso' : '❌ Deploy falló');
      } else {
        res.writeHead(200);
        res.end('Ignorado - no es main branch');
      }
    } catch (error) {
      res.writeHead(400);
      res.end('Bad request');
    }
  });
});

server.listen(PORT, () => {
  console.log(`🎣 Webhook escuchando en puerto ${PORT}`);
  console.log('📝 Configura en GitHub:');
  console.log(`   URL: http://tu-vps:${PORT}/webhook`);
  console.log(`   Secret: ${SECRET}`);
  console.log('   Content type: application/json');
  console.log('   Events: Push');
});

// Manejo de errores
process.on('uncaughtException', (err) => {
  console.error('Error no capturado:', err);
});

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Servidor webhook cerrado');
    process.exit(0);
  });
});