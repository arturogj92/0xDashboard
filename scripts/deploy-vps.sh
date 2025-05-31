#!/bin/bash

# Script de deploy para VPS con sobrescritura forzada
# Este script fuerza la actualización desde GitHub, descartando cambios locales

PM2_APP="landings"
APP_DIR="/var/www/landings"

echo "🚀 Deploy automático desde GitHub"

# 1. Ir al directorio de la aplicación
cd $APP_DIR || exit 1

# 2. Descartar todos los cambios locales y forzar actualización
echo "🔄 Descartando cambios locales y actualizando código..."
git fetch origin main
git reset --hard origin/main
git clean -fd

# 3. Verificar si las dependencias cambiaron
echo "📦 Verificando dependencias..."
if git diff HEAD@{1} --name-only | grep -q "package-lock.json"; then
    echo "📦 Instalando dependencias..."
    npm ci --production
fi

# 4. Asegurar que las variables de entorno del VPS estén configuradas
echo "🔧 Configurando variables de entorno VPS..."
export NEXT_PUBLIC_IS_VPS=true

# 5. Build de producción con memoria limitada
echo "🏗️ Building..."
export NODE_OPTIONS="--max-old-space-size=768"
export NEXT_TELEMETRY_DISABLED=1
npm run build

# 6. Reiniciar con PM2
pm2 restart $PM2_APP --update-env
pm2 save

echo "✅ Deploy completado"