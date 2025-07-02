# Configuración de Nginx para 0xreplyer-frontend

## 🚨 IMPORTANTE: Headers críticos para Next.js

Esta aplicación Next.js con modo `standalone` requiere una configuración específica de nginx para funcionar correctamente con múltiples dominios.

### ⚡ TL;DR - Configuración esencial

```nginx
location / {
    proxy_pass http://localhost:3002;
    proxy_set_header Host localhost;              # CRÍTICO: Debe ser 'localhost', NO '$host'
    proxy_set_header X-Forwarded-Host $host;      # Preserva el dominio original
    proxy_set_header X-Forwarded-Proto $scheme;   # Preserva HTTP/HTTPS
}
```

## 🔍 ¿Por qué `Host localhost`?

Cuando Next.js está configurado con `output: 'standalone'`:

1. **Next.js espera servir desde un único host** - Al recibir diferentes valores de `Host`, Next.js no puede resolver correctamente las rutas de los archivos estáticos
2. **Los chunks devuelven error 400** - Si nginx envía `Host: elcaminodelprogramador.com`, Next.js busca los archivos en un contexto que no existe
3. **El middleware detecta el dominio real** - Usamos `X-Forwarded-Host` para que el middleware pueda identificar el dominio original

## 📋 Configuración completa

### Para dominios personalizados

```nginx
server {
    listen 443 ssl http2;
    server_name ejemplo.com www.ejemplo.com;

    ssl_certificate     /etc/letsencrypt/live/ejemplo.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ejemplo.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3002;
        
        # Headers obligatorios
        proxy_set_header Host localhost;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # Optimización
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }
}
```

## 🛠️ Scripts automatizados

### manage_ssl.sh

El script `scripts/manage_ssl.sh` genera automáticamente las configuraciones correctas:

```bash
# Agregar nuevo dominio con SSL
sudo ./scripts/manage_ssl.sh custom midominiopersonalizado.com

# Eliminar dominio
sudo ./scripts/manage_ssl.sh remove midominiopersonalizado.com
```

### GitHub Actions

El workflow `.github/workflows/deploy-vps.yml` incluye verificación automática:
- Detecta configuraciones antiguas con `Host $host`
- Las actualiza automáticamente a `Host localhost`
- Agrega headers faltantes
- Hace backup antes de modificar

## 🔧 Solución de problemas

### Error 400 en chunks

Si ves errores como:
```
Failed to load resource: the server responded with a status of 400 ()
/_next/static/chunks/8600-234e88986a51d7a6.js
```

**Verificar en el VPS:**
```bash
# 1. Revisar configuración actual
grep "proxy_set_header Host" /etc/nginx/sites-available/*.conf

# 2. Si encuentras "Host $host", actualizar manualmente:
sudo nano /etc/nginx/sites-available/[dominio].conf
# Cambiar: proxy_set_header Host $host;
# Por:     proxy_set_header Host localhost;

# 3. Verificar y recargar
sudo nginx -t
sudo nginx -s reload
```

### Verificar headers

Para debug, puedes verificar qué headers está recibiendo Next.js:

```bash
# Desde el VPS
curl -I -H "Host: ejemplo.com" http://localhost:3002/_next/static/chunks/webpack-*.js
```

## 📚 Referencias

- [Next.js Standalone Mode](https://nextjs.org/docs/advanced-features/output-file-tracing)
- [Nginx Proxy Headers](http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_set_header)
- Plantilla completa: `/nginx/site-template.conf`