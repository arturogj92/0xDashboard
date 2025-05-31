# Configuración de GitHub Secrets para Deploy Automático

## Secretos necesarios en GitHub

Ve a Settings → Secrets and variables → Actions y añade:

### 1. VPS_HOST
```
Valor: IP de tu VPS o dominio
Ejemplo: 45.123.456.789
```

### 2. VPS_USER
```
Valor: Usuario SSH (normalmente root)
Ejemplo: root
```

### 3. VPS_SSH_KEY
```
Valor: Clave privada SSH completa
```

Para obtener la clave SSH:
```bash
# En tu máquina local
cat ~/.ssh/id_rsa

# O si usas ed25519
cat ~/.ssh/id_ed25519
```

Copia TODO el contenido incluyendo:
```
-----BEGIN RSA PRIVATE KEY-----
[... contenido ...]
-----END RSA PRIVATE KEY-----
```

## Verificar que funciona

1. Haz un cambio pequeño
2. Push a main
3. Ve a Actions en GitHub
4. Deberías ver:
   - ✅ Vercel (automático)
   - ✅ Deploy to VPS (nuestro workflow)

## Troubleshooting

Si falla el deploy al VPS:

1. **Permission denied**: Verifica que la clave SSH es correcta
2. **Host not found**: Verifica VPS_HOST
3. **npm not found**: Asegúrate que Node está instalado en el VPS
4. **PM2 not found**: Ejecuta `npm install -g pm2` en el VPS