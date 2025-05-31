/**
 * Middleware para manejar dominios personalizados en el VPS
 * Este middleware verifica si un dominio entrante es un dominio personalizado
 * configurado por un usuario y lo redirige a la landing correspondiente
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for server-side operations
const supabase = createClient(supabaseUrl, supabaseKey);

// Cache para dominios activos (evitar consultas frecuentes a la DB)
const domainCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Middleware para detectar y manejar dominios personalizados
 */
const customDomainHandler = () => {
  return async (req, res, next) => {
    try {
      const hostname = req.hostname || req.headers.host?.split(':')[0] || '';
      
      console.log(`Processing request for hostname: ${hostname}`);

      // Verificar si es un dominio de creator0x (*.creator0x.com)
      if (hostname.endsWith('.creator0x.com') || hostname === 'creator0x.com') {
        console.log('Creator0x domain detected, continuing normal flow');
        return next();
      }

      // Verificar si es localhost o dominio de desarrollo
      if (hostname === 'localhost' || hostname.includes('ngrok') || hostname.includes('vercel.app')) {
        console.log('Development domain detected, continuing normal flow');
        return next();
      }

      // Verificar en cache primero
      const cacheKey = hostname;
      const cached = domainCache.get(cacheKey);
      
      if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        console.log(`Using cached domain info for: ${hostname}`);
        if (cached.data) {
          return handleCustomDomain(req, res, cached.data);
        } else {
          // Cached negative result (domain not found)
          return handleUnknownDomain(req, res);
        }
      }

      // Consultar base de datos para verificar si es un dominio personalizado
      console.log(`Checking database for custom domain: ${hostname}`);
      
      const { data: customDomain, error } = await supabase
        .from('custom_domains')
        .select(`
          *,
          landings(id, slug, name, user_id, theme_id, configurations, avatar_url)
        `)
        .eq('domain', hostname)
        .eq('status', 'active')
        .single();

      // Actualizar cache
      if (error) {
        console.log(`Domain ${hostname} not found in custom domains:`, error.message);
        domainCache.set(cacheKey, { data: null, timestamp: Date.now() });
        return handleUnknownDomain(req, res);
      }

      console.log(`Custom domain found:`, customDomain);
      domainCache.set(cacheKey, { data: customDomain, timestamp: Date.now() });
      
      return handleCustomDomain(req, res, customDomain);

    } catch (error) {
      console.error('Error in customDomainHandler:', error);
      // En caso de error, continuar con el flujo normal
      return next();
    }
  };
};

/**
 * Maneja la respuesta para dominios personalizados válidos
 */
async function handleCustomDomain(req, res, customDomain) {
  try {
    const landing = customDomain.landings;
    
    if (!landing) {
      console.error('Landing not found for custom domain:', customDomain.domain);
      return res.status(404).send('Landing page not found');
    }

    console.log(`Serving custom domain ${customDomain.domain} -> landing ${landing.slug}`);

    // Obtener datos completos de la landing (links, sections, etc.)
    const [linksResult, sectionsResult, socialLinksResult] = await Promise.all([
      supabase
        .from('links')
        .select('*')
        .eq('landing_id', landing.id)
        .eq('active', true)
        .order('order_index'),
      
      supabase
        .from('sections')
        .select('*')
        .eq('landing_id', landing.id)
        .order('order_index'),
      
      supabase
        .from('social_links')
        .select('*')
        .eq('landing_id', landing.id)
        .order('order_index')
    ]);

    const landingData = {
      ...landing,
      links: linksResult.data || [],
      sections: sectionsResult.data || [],
      socialLinks: socialLinksResult.data || []
    };

    // Renderizar la landing page
    // Aquí necesitamos integrar con Next.js para renderizar la página
    // Por ahora, redirigimos a la URL de creator0x como fallback
    const fallbackUrl = `https://${landing.user_id}.creator0x.com`;
    
    console.log(`Redirecting ${customDomain.domain} to ${fallbackUrl}`);
    return res.redirect(301, fallbackUrl);

  } catch (error) {
    console.error('Error handling custom domain:', error);
    return res.status(500).send('Internal server error');
  }
}

/**
 * Maneja dominios desconocidos (no configurados)
 */
function handleUnknownDomain(req, res) {
  console.log(`Unknown domain: ${req.hostname}, returning 404`);
  
  // Responder con página de error personalizada
  return res.status(404).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Domain Not Found</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          text-align: center; 
          padding: 50px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          margin: 0;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
        }
        .container {
          background: rgba(255,255,255,0.1);
          padding: 40px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }
        h1 { font-size: 3em; margin-bottom: 20px; }
        p { font-size: 1.2em; margin-bottom: 30px; }
        .cta {
          background: #4CAF50;
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 10px;
          font-weight: bold;
          transition: background 0.3s;
        }
        .cta:hover { background: #45a049; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🌐 Domain Not Found</h1>
        <p>This domain (${req.hostname}) is not configured with Creator0x.</p>
        <p>Want to connect your domain to a landing page?</p>
        <a href="https://creator0x.com" class="cta">Get Started with Creator0x</a>
      </div>
    </body>
    </html>
  `);
}

/**
 * Middleware para limpiar cache periódicamente
 */
const cleanupCache = () => {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of domainCache.entries()) {
      if (now - value.timestamp > CACHE_TTL) {
        domainCache.delete(key);
      }
    }
  }, CACHE_TTL);
};

// Inicializar limpieza de cache
cleanupCache();

module.exports = customDomainHandler;