#!/bin/bash

# Script para preparar el build del VPS
# Este build solo sirve landings

echo "🚀 Preparando build para VPS (solo landings)..."

# 1. Crear/actualizar .env.production.local para el VPS
cat > .env.production.local << EOF
# Configuración VPS
NEXT_PUBLIC_IS_VPS=true
NEXT_PUBLIC_API_URL=${API_URL:-https://api.creator0x.com}

# Deshabilitar telemetría en producción
NEXT_TELEMETRY_DISABLED=1
EOF

echo "✅ Variables de entorno configuradas"

# 2. Build de producción
echo "🏗️ Construyendo aplicación..."
NEXT_PUBLIC_IS_VPS=true npm run build

echo "✅ Build para VPS completado"
echo ""
echo "📦 Para desplegar:"
echo "1. Sube los archivos al VPS"
echo "2. Ejecuta: npm start"
echo "3. O usa PM2: pm2 start npm --name 'creator0x-landings' -- start"