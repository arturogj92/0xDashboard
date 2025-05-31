#!/bin/bash

# Script para verificar que el deploy automático está bien configurado

echo "🔍 Verificando configuración de deploy automático..."
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar archivos necesarios
echo "1️⃣ Verificando archivos..."

if [ -f ".github/workflows/deploy-vps.yml" ]; then
    echo -e "${GREEN}✅ Workflow de GitHub Actions existe${NC}"
else
    echo -e "${RED}❌ Falta .github/workflows/deploy-vps.yml${NC}"
fi

if [ -f "middleware.vps.ts" ]; then
    echo -e "${GREEN}✅ Middleware VPS existe${NC}"
else
    echo -e "${RED}❌ Falta middleware.vps.ts${NC}"
fi

echo ""
echo "2️⃣ Verificando secretos de GitHub..."
echo -e "${YELLOW}⚠️  Necesitas configurar estos secretos en GitHub:${NC}"
echo "   - VPS_HOST (IP del VPS)"
echo "   - VPS_USER (normalmente 'root')"
echo "   - VPS_SSH_KEY (clave privada SSH)"
echo ""
echo "   Ve a: Settings → Secrets and variables → Actions"

echo ""
echo "3️⃣ Comandos para el VPS..."
echo "Ejecuta estos comandos en tu VPS:"
echo ""
echo "# Verificar que existe el directorio"
echo "ls -la /var/www/landings"
echo ""
echo "# Verificar PM2"
echo "pm2 list"
echo ""
echo "# Si no existe la app 'landings', créala:"
echo "cd /var/www/landings && pm2 start npm --name landings -- start"

echo ""
echo "4️⃣ Para probar el deploy:"
echo "git add ."
echo "git commit -m 'test: deploy automático'"
echo "git push origin main"
echo ""
echo "Luego ve a GitHub → Actions para ver el progreso"

echo ""
echo "📚 Documentación completa en: DEPLOY_SETUP.md"